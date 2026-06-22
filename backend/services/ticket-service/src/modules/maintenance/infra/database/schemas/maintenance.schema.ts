import { numeric, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const maintenanceStatusEnum = pgEnum("maintenance_status", [
  "SCHEDULED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELED",
]);

export const maintenanceSchema = pgTable("maintenances", {
  id: uuid("id").primaryKey().defaultRandom(),
  ticketId: uuid("ticket_id"),
  apartmentId: uuid("apartment_id"),
  condominiumId: uuid("condominium_id"),
  providerId: uuid("provider_id"),
  status: maintenanceStatusEnum("status").default("SCHEDULED").notNull(),
  value: numeric("value", { precision: 10, scale: 2 }).notNull(),
  executionDate: timestamp("execution_date").notNull(),
  type: text("type"),
  local: text("local"),
  priority: text("priority"),
  providerName: text("provider_name"),
  providerContact: text("provider_contact"),
  observation: text("observation"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
