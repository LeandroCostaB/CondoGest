import { Injectable, OnModuleInit } from "@nestjs/common";
import { maintenanceSchema } from "../../../modules/maintenance/infra/database/schemas/maintenance.schema";
import { providersSchema } from "../../../modules/provider/infra/database/schemas/provider.schema";
import { ticketsSchema } from "../../../modules/ticket/infra/database/schemas/ticket.schema";
import * as dotenv from "dotenv";
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

dotenv.config();

const schema = {
  maintenances: maintenanceSchema,
  providers: providersSchema,
  tickets: ticketsSchema,
};

@Injectable()
export class DrizzleService implements OnModuleInit {
  public db!: NodePgDatabase<typeof schema>;

  async onModuleInit() {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    this.db = drizzle(pool, { schema });

    console.log("✅ Drizzle conectado com sucesso ao PostgreSQL");
  }
}
