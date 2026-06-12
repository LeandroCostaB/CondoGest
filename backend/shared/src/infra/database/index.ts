import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

let dbInstance: ReturnType<typeof drizzle> | null = null;

export type DB = ReturnType<typeof drizzle>;

export function getDb(): DB {
  if (!dbInstance) {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    dbInstance = drizzle(pool);
  }

  return dbInstance;
}

export { DrizzleService } from "./drizzle.service";
