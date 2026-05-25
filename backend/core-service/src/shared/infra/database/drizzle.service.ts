import { apartmentsSchema } from '@apartment/infra/database/schemas/apartment.schema';
import { condominiumsSchema } from '@condominium/infra/database/schemas/condominium.schema';
import { usersSchema } from '@user/infra/database/schemas/user.schema';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import * as path from 'path';
import { Pool } from 'pg';

const schema = {
  apartmentsSchema,
  usersSchema,
  condominiumsSchema,
};

@Injectable()
export class DrizzleService implements OnModuleInit {
  public db!: NodePgDatabase<typeof schema>;

  async onModuleInit() {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    this.db = drizzle(pool, { schema });

    await migrate(this.db, { migrationsFolder: path.join(__dirname, 'drizzle') });

    console.log('✅ Drizzle conectado e migrations aplicadas com sucesso');
  }
}
