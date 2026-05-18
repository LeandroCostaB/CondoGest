import { apartmentsSchema } from "@apartment/infra/database/schemas/apartment.schema";
import { condominiumsSchema } from "@condominium/infra/database/schemas/condominium.schema";
import { Injectable, type OnModuleDestroy, type OnModuleInit } from "@nestjs/common";
import dotenv from "dotenv";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { usersSchema } from "@user/infra/database/schemas/user.schema";

const schema = {
  apartmentsSchema,
  usersSchema,
  condominiumsSchema,
};

dotenv.config();

@Injectable()
export class DrizzleService implements OnModuleInit, OnModuleDestroy {
  public db!: NodePgDatabase<typeof schema>;
  private pool!: Pool;

  async onModuleInit() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    this.db = drizzle(this.pool, { schema });
    
    console.log('✅ Drizzle conectado com sucesso ao PostgreSQL (Docker)');
  }

  async onModuleDestroy() {
    await this.pool?.end();
  }
}
