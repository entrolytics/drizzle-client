# @entrolytics/drizzle-client

Drizzle ORM client wrapper with Neon serverless support, read replicas, and utilities for Entrolytics.

## Installation

```bash
pnpm add @entrolytics/drizzle-client
```

## Features

- **Neon Serverless Support**: Optimized for Neon PostgreSQL with HTTP connections
- **Read Replicas**: Automatic routing of read queries to replica databases
- **Transaction Support**: Full transaction support with isolation levels
- **Health Checks**: Built-in database health monitoring
- **Connection Pooling**: Configurable connection pooling for standard PostgreSQL
- **Debug Logging**: Optional query logging via `debug` package

## Usage

### Basic Setup

```typescript
import { EntrolyticsDrizzleClient } from '@entrolytics/drizzle-client';
import * as schema from './schema';

const db = new EntrolyticsDrizzleClient({
  url: process.env.DATABASE_URL,
  schema,
  logQuery: process.env.NODE_ENV === 'development',
});

// Use the client
const users = await db.client.select().from(schema.users);
```

### With Read Replica

```typescript
const db = new EntrolyticsDrizzleClient({
  url: process.env.DATABASE_URL,
  replicaUrl: process.env.DATABASE_REPLICA_URL,
  schema,
});

// Reads automatically use replica
const users = await db.getReadClient().select().from(schema.users);

// Writes always use primary
await db.getWriteClient().insert(schema.users).values({ name: 'John' });
```

### Transactions

```typescript
const result = await db.transaction(async (tx) => {
  const user = await tx.insert(schema.users).values({ name: 'John' }).returning();
  await tx.insert(schema.profiles).values({ userId: user[0].id });
  return user;
}, {
  isolationLevel: 'serializable',
});
```

### Raw Queries

```typescript
// Automatically routes to replica for SELECT queries
const result = await db.rawQuery<User>('SELECT * FROM users WHERE id = $1', [userId]);
```

### Health Check

```typescript
const health = await db.healthCheck();
// { ok: true, latency: 23 }
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `url` | `string` | required | Primary database connection URL |
| `replicaUrl` | `string` | - | Read replica connection URL |
| `schema` | `object` | - | Drizzle schema object |
| `logQuery` | `boolean` | `false` | Enable query logging |
| `queryLogger` | `function` | - | Custom query logger function |
| `type` | `'neon' \| 'postgres'` | `'neon'` | Database type |
| `poolConfig` | `object` | - | Connection pool configuration |

## License

MIT - Entrolytics
