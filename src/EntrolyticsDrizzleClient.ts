import { neon } from '@neondatabase/serverless';
import debug from 'debug';
import { type AnyRelations, type EmptyRelations, sql } from 'drizzle-orm';
import { drizzle as drizzleNeonHttp, type NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { drizzle as drizzlePg, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool, type PoolClient } from 'pg';

export const log = debug('entrolytics:drizzle-client');

export type DatabaseType = 'neon' | 'postgres';
export type DrizzleDatabase<TRelations extends AnyRelations = EmptyRelations> =
  | NeonHttpDatabase<TRelations>
  | NodePgDatabase<TRelations>;
type NeonSqlClient = ReturnType<typeof neon<false, true>>;

export interface EntrolyticsDrizzleClientOptions<TRelations extends AnyRelations = EmptyRelations> {
  url: string;
  replicaUrl?: string;
  /**
   * Relational query metadata produced by drizzle's `defineRelations`.
   * Enables the relational query builder (`db.query.*`) on the underlying client.
   * Replaces the pre-1.0 `schema` option; the core query builder
   * (`select().from(table)`) works without it.
   */
  relations?: TRelations;
  logQuery?: boolean;
  queryLogger?: (query: string) => void;
  type?: DatabaseType;
  poolConfig?: {
    max?: number;
    idleTimeoutMillis?: number;
    connectionTimeoutMillis?: number;
  };
}

export interface TransactionOptions {
  isolationLevel?: 'read uncommitted' | 'read committed' | 'repeatable read' | 'serializable';
  accessMode?: 'read only' | 'read write';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasRowsResult(value: unknown): value is { rows: unknown[] } {
  return isRecord(value) && Array.isArray(value.rows);
}

export class EntrolyticsDrizzleClient<TRelations extends AnyRelations = EmptyRelations> {
  client: DrizzleDatabase<TRelations>;
  replicaClient: DrizzleDatabase<TRelations> | null;
  hasReplica: boolean;
  schema?: string;
  type: DatabaseType;
  private readonly relations?: TRelations;
  private pool: Pool | null = null;
  private replicaPool: Pool | null = null;
  private neonSql: NeonSqlClient | null = null;
  private replicaNeonSql: NeonSqlClient | null = null;

  constructor({
    url,
    replicaUrl,
    relations,
    logQuery,
    queryLogger,
    type = 'neon',
    poolConfig,
  }: EntrolyticsDrizzleClientOptions<TRelations>) {
    // Parse schema from URL if present
    const connectionUrl = new URL(url);
    const schemaName = connectionUrl.searchParams.get('schema') ?? undefined;

    this.type = type;
    this.schema = schemaName;
    this.relations = relations;
    this.hasReplica = !!replicaUrl;

    const logger = logQuery
      ? { logQuery: queryLogger || ((query: string) => log(query)) }
      : undefined;

    // Initialize based on database type
    if (type === 'neon') {
      const neonSql = neon(url, {
        fullResults: true,
        arrayMode: false,
      });
      this.neonSql = neonSql;

      this.client = drizzleNeonHttp<TRelations, NeonSqlClient>({
        client: neonSql,
        relations,
        logger,
      });

      if (replicaUrl) {
        const replicaNeonSql = neon(replicaUrl, {
          fullResults: true,
          arrayMode: false,
        });
        this.replicaNeonSql = replicaNeonSql;
        this.replicaClient = drizzleNeonHttp<TRelations, NeonSqlClient>({
          client: replicaNeonSql,
          relations,
          logger,
        });
      } else {
        this.replicaClient = null;
        this.replicaNeonSql = null;
      }
    } else {
      // Standard PostgreSQL with connection pooling
      const pool = new Pool({
        connectionString: url,
        max: poolConfig?.max ?? 10,
        idleTimeoutMillis: poolConfig?.idleTimeoutMillis ?? 30000,
        connectionTimeoutMillis: poolConfig?.connectionTimeoutMillis ?? 10000,
      });
      this.pool = pool;

      this.client = drizzlePg<TRelations>({
        client: pool,
        relations,
        logger,
      });

      if (replicaUrl) {
        const replicaPool = new Pool({
          connectionString: replicaUrl,
          max: poolConfig?.max ?? 10,
          idleTimeoutMillis: poolConfig?.idleTimeoutMillis ?? 30000,
          connectionTimeoutMillis: poolConfig?.connectionTimeoutMillis ?? 10000,
        });
        this.replicaPool = replicaPool;
        this.replicaClient = drizzlePg<TRelations>({
          client: replicaPool,
          relations,
          logger,
        });
      } else {
        this.replicaClient = null;
      }
    }

    log(`Drizzle initialized (type: ${type}, replica: ${this.hasReplica})`);
  }

  /**
   * Get the appropriate client for read operations
   * Uses replica if available, otherwise primary
   */
  getReadClient(): DrizzleDatabase<TRelations> {
    return this.replicaClient || this.client;
  }

  /**
   * Get the primary client for write operations
   */
  getWriteClient(): DrizzleDatabase<TRelations> {
    return this.client;
  }

  /**
   * Execute a raw SQL query
   * Automatically uses replica for SELECT queries if available
   */
  async rawQuery<T extends Record<string, unknown> = Record<string, unknown>>(
    query: string,
    _params: unknown[] = [],
  ): Promise<T[]> {
    const isReadQuery = query.trim().toUpperCase().startsWith('SELECT');
    const params = _params ?? [];

    if (this.type === 'neon' && this.neonSql) {
      const executor = isReadQuery && this.replicaNeonSql ? this.replicaNeonSql : this.neonSql;
      const result = await executor.query(query, params);

      const rows: unknown[] = hasRowsResult(result)
        ? result.rows
        : Array.isArray(result)
          ? result
          : [];

      return rows.filter((row): row is T => isRecord(row));
    }

    if (this.type === 'postgres') {
      const pool = isReadQuery && this.replicaPool ? this.replicaPool : this.pool;
      if (!pool) {
        throw new Error('Database pool not initialized');
      }
      const result = await pool.query(query, params);
      const rows: unknown[] = result.rows;
      return rows.filter((row): row is T => isRecord(row));
    }

    throw new Error('Unsupported database type for rawQuery');
  }

  /**
   * Execute a transaction with the primary database
   * Transactions always use the primary to ensure consistency
   */
  async transaction<T>(
    fn: (tx: DrizzleDatabase<TRelations>) => Promise<T>,
    options?: TransactionOptions,
  ): Promise<T> {
    // For Neon HTTP, transactions are limited
    // For node-postgres, full transaction support
    if (this.type === 'postgres' && this.pool) {
      const client = await this.pool.connect();
      try {
        if (options?.isolationLevel) {
          await client.query(
            `SET TRANSACTION ISOLATION LEVEL ${options.isolationLevel.toUpperCase()}`,
          );
        }
        if (options?.accessMode) {
          await client.query(`SET TRANSACTION ${options.accessMode.toUpperCase()}`);
        }

        await client.query('BEGIN');
        const txDb = drizzlePg<TRelations, PoolClient>({ client, relations: this.relations });
        const result = await fn(txDb);
        await client.query('COMMIT');
        return result;
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    }

    // For Neon HTTP, use the built-in transaction support
    // Note: Neon HTTP has limited transaction support
    return fn(this.client);
  }

  /**
   * Execute multiple queries in a batch
   * Useful for bulk operations
   */
  async batch<T>(queries: (() => Promise<T>)[]): Promise<T[]> {
    return Promise.all(queries.map(q => q()));
  }

  /**
   * Health check for the database connection
   */
  async healthCheck(): Promise<{ ok: boolean; latency: number; error?: string }> {
    const start = Date.now();
    try {
      await this.client.execute(sql`SELECT 1`);
      return { ok: true, latency: Date.now() - start };
    } catch (error) {
      return {
        ok: false,
        latency: Date.now() - start,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Close all database connections
   */
  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
    }
    if (this.replicaPool) {
      await this.replicaPool.end();
    }
    log('Database connections closed');
  }
}

export default EntrolyticsDrizzleClient;
