import { Injectable, type OnModuleDestroy } from "@nestjs/common";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { subjectsSchema } from "@shared/infra/database/schemas/subject.schema";
import { teachersSchema } from "@shared/infra/database/schemas/teacher.schema";
import {
  classOfferingStatusEnum,
  classOfferingsSchema,
} from "@class-offering/infra/database/schemas/class-offering.schema";

const schema = {
  subjectsSchema,
  teachersSchema,
  classOfferingsSchema,
  classOfferingStatusEnum,
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