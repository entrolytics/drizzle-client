import { describe, expect, it } from 'vite-plus/test';

import { EntrolyticsDrizzleClient } from './EntrolyticsDrizzleClient';

describe('EntrolyticsDrizzleClient', () => {
  it('rejects malformed connection URLs before creating a client', () => {
    expect(() => new EntrolyticsDrizzleClient({ url: 'not-a-url' })).toThrow('Invalid URL');
  });

  it('executes independent batch operations without a database round-trip', async () => {
    const client = new EntrolyticsDrizzleClient({
      url: 'postgresql://user:password@db.example.test/database',
    });
    await expect(client.batch([async () => 1, async () => 2])).resolves.toEqual([1, 2]);
    await client.close();
  });
});
