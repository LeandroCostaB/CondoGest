import { Injectable, OnModuleInit } from '@nestjs/common';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

import { users } from '@user/infra/database/schemas/user.schema';

dotenv.config();

const schema = {
  users,
};

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