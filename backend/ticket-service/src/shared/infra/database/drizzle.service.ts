import { Injectable, OnModuleInit } from "@nestjs/common";
import { maintenance } from "../../../modules/maintenance/infra/database/schemas/maintenance.schema";
import * as dotenv from "dotenv";
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

dotenv.config();

const schema = {
  maintenance: maintenance, 
};

@Injectable()
export class DrizzleService implements OnModuleInit {
  // 2. O Drizzle agora vai usar o schema atualizado
  public db!: NodePgDatabase<typeof schema>;

  async onModuleInit() {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    this.db = drizzle(pool, { schema });

    console.log("✅ Drizzle conectado com sucesso ao PostgreSQL");
  }
}