import { apartmentsSchema } from "@apartment/infra/database/schemas/apartment.schema";
import { condominiumsSchema } from "@condominium/infra/database/schemas/condominium.schema";
import { Injectable, type OnModuleDestroy } from "@nestjs/common";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { usersSchema } from "@user/infra/database/schemas/user.schema";

const schema = {
  apartmentsSchema,
  usersSchema,
  condominiumsSchema,
};

@Injectable()
export class DrizzleService implements OnModuleDestroy {
  private readonly pool: Pool;
  public readonly db;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    this.db = drizzle(this.pool, { schema });
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
