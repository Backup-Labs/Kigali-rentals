import { Pool } from 'pg';

declare global {
  // eslint-disable-next-line no-var
  var __kglPgPool: Pool | undefined;
  // eslint-disable-next-line no-var
  var __kglSchemaReady: Promise<void> | undefined;
}

function getCleanConnectionString(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl);
    parsed.searchParams.delete('sslmode');
    return parsed.toString();
  } catch {
    return rawUrl.replace(/[?&]sslmode=[^&]+/g, '');
  }
}

export function getPool(): Pool {
  if (!global.__kglPgPool) {
    const rawUrl = process.env.DATABASE_URL;
    if (!rawUrl) {
      throw new Error('DATABASE_URL is not defined in environment variables');
    }

    global.__kglPgPool = new Pool({
      connectionString: getCleanConnectionString(rawUrl),
      ssl: {
        rejectUnauthorized: false,
      },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 15000,
    });
  }
  return global.__kglPgPool;
}

export async function ensureSchema(): Promise<void> {
  if (!global.__kglSchemaReady) {
    global.__kglSchemaReady = (async () => {
      const pool = getPool();
      await pool.query(`
        CREATE TABLE IF NOT EXISTS kgl_listings (
          id TEXT PRIMARY KEY,
          type TEXT NOT NULL,
          title TEXT NOT NULL,
          neighborhood TEXT NOT NULL,
          price_per_day NUMERIC NOT NULL,
          featured BOOLEAN DEFAULT false,
          sort_order INT DEFAULT 0,
          data JSONB NOT NULL,
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS kgl_inventory (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          type TEXT NOT NULL,
          status TEXT NOT NULL,
          sort_order INT DEFAULT 0,
          data JSONB NOT NULL,
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS kgl_reservations (
          id TEXT PRIMARY KEY,
          asset_id TEXT NOT NULL,
          status TEXT NOT NULL,
          created_at TEXT NOT NULL,
          data JSONB NOT NULL,
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS kgl_admin_tasks (
          id TEXT PRIMARY KEY,
          asset_id TEXT NOT NULL,
          status TEXT NOT NULL,
          priority TEXT NOT NULL,
          sort_order INT DEFAULT 0,
          data JSONB NOT NULL,
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS kgl_condition_reports (
          id TEXT PRIMARY KEY,
          booking_id TEXT NOT NULL,
          asset_id TEXT NOT NULL,
          stage TEXT NOT NULL,
          data JSONB NOT NULL,
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS kgl_admins (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          name TEXT NOT NULL,
          role TEXT NOT NULL,
          badge_code TEXT NOT NULL,
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);
    })().catch((err) => {
      global.__kglSchemaReady = undefined;
      throw err;
    });
  }

  return global.__kglSchemaReady;
}

