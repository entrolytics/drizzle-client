<div align="center">
  <img src="https://raw.githubusercontent.com/entrolytics/.github/main/media/entrov2.png" alt="Entrolytics" width="64" height="64">

  [![npm](https://img.shields.io/npm/v/@entrolytics/drizzle-client.svg?logo=npm)](https://www.npmjs.com/package/@entrolytics/drizzle-client)
  [![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

</div>

---

## Overview

**@entrolytics/drizzle-client** is the official Drizzle ORM client for Entrolytics - first-party growth analytics for the edge. Provides a type-safe database layer with built-in support for Neon serverless PostgreSQL and read replicas.

**Why use this client?**
- Neon serverless optimized with HTTP connections
- Automatic read/write replica routing
- Full transaction support with isolation levels
- Built-in health checks and connection pooling

## Key Features

<table>
<tr>
<td width="50%">

### Database Support
- Neon serverless PostgreSQL
- Standard PostgreSQL support
- Connection pooling
- Read replica routing

</td>
<td width="50%">

### Developer Experience
- Full TypeScript support
- Transaction isolation levels
- Health monitoring
- Debug query logging

</td>
</tr>
</table>

## Quick Start

<table>
<tr>
<td align="center" width="25%">
<img src="https://api.iconify.design/lucide:download.svg?color=%236366f1" width="48"><br>
<strong>1. Install</strong><br>
<code>pnpm add</code>
</td>
<td align="center" width="25%">
<img src="https://api.iconify.design/lucide:settings.svg?color=%236366f1" width="48"><br>
<strong>2. Configure</strong><br>
Database URL
</td>
<td align="center" width="25%">
<img src="https://api.iconify.design/lucide:database.svg?color=%236366f1" width="48"><br>
<strong>3. Initialize</strong><br>
Create client
</td>
<td align="center" width="25%">
<img src="https://api.iconify.design/lucide:zap.svg?color=%236366f1" width="48"><br>
<strong>4. Query</strong><br>
Start using
</td>
</tr>
</table>

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
