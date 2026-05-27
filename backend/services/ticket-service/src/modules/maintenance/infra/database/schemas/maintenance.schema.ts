import { numeric, pgEnum, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";

export const maintenanceStatusEnum = pgEnum("maintenance_status", [
  "SCHEDULED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELED",
]);

export const maintenanceSchema = pgTable("maintenances", {
  id: uuid("id").primaryKey().defaultRandom(),
  ticketId: uuid("ticket_id").notNull(),
  providerId: uuid("provider_id").notNull(),
  status: maintenanceStatusEnum("status").default("SCHEDULED").notNull(),
  value: numeric("value", { precision: 10, scale: 2 }).notNull(),
  executionDate: timestamp("execution_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
