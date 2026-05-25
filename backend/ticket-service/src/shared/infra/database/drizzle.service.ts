import { Injectable, OnModuleInit } from "@nestjs/common";
import { maintenanceSchema } from "../../../modules/maintenance/infra/database/schemas/maintenance.schema";
import { providersSchema } from "../../../modules/provider/infra/database/schemas/provider.schema";
import { ticketsSchema } from "../../../modules/ticket/infra/database/schemas/ticket.schema";
import { residentsSnapshotSchema } from "./schemas/resident-snapshot.schema";
import { apartmentsSnapshotSchema } from "./schemas/apartment-snapshot.schema";
import { condominiumsSnapshotSchema } from "./schemas/condominium-snapshot.schema";
import * as dotenv from "dotenv";
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import * as path from "path";
import { Pool } from "pg";

dotenv.config();

const schema = {
  maintenances: maintenanceSchema,
  providers: providersSchema,
  tickets: ticketsSchema,
  residentsSnapshot: residentsSnapshotSchema,
  apartmentsSnapshot: apartmentsSnapshotSchema,
  condominiumsSnapshot: condominiumsSnapshotSchema,
};

@Injectable()
export class DrizzleService implements OnModuleInit {
  public db!: NodePgDatabase<typeof schema>;

  async onModuleInit() {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    this.db = drizzle(pool, { schema });

    await migrate(this.db, { migrationsFolder: path.join(__dirname, "drizzle") });

    console.log("✅ Drizzle conectado e migrations aplicadas com sucesso");
  }
}
