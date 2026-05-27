import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from "@nestjs/common";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import * as path from "path";
import { Pool } from "pg";

@Injectable()
export class DrizzleService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DrizzleService.name);
  private readonly pool: Pool;
  public readonly db;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    this.db = drizzle(this.pool);
  }

  async onModuleInit() {
    const migrationsFolder = path.join(process.cwd(), "drizzle");
    await migrate(this.db, { migrationsFolder });
    this.logger.log("✅ Migrations aplicadas com sucesso");
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
