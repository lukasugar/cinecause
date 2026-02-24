import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Lazy initialization to support builds without DATABASE_URL
let _sql: postgres.Sql | null = null;

function getSql() {
  if (!_sql) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is required');
    }
    _sql = postgres(process.env.DATABASE_URL, { prepare: false });
  }
  return _sql;
}

// Use a proxy to defer database initialization until first access
export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(target, prop) {
    const actualDb = drizzle(getSql(), { schema });
    return Reflect.get(actualDb, prop);
  },
});
