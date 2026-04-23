import { Injectable, type OnModuleDestroy, type OnModuleInit } from "@nestjs/common";
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from "pg";
import { condominiumsSchema } from "@condominium/infra/database/schemas/condominium.schema";
import { users } from '@user/infra/database/schemas/user.schema';
import * as dotenv from 'dotenv';

const schema = {
  users,
  condominiumsSchema,
}

dotenv.config();

@Injectable()
export class DrizzleService implements OnModuleInit {
  public db!: NodePgDatabase<typeof schema>;
  async onModuleInit() {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    this.db = drizzle(pool, { schema });
    
    console.log('✅ Drizzle conectado com sucesso ao PostgreSQL (Docker)');
  }
}