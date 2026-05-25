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
