import { integer, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const apartmentSnapshotSchema = pgTable("apartment_snapshots", {
  id: uuid("id").primaryKey(),
  number: varchar("number", { length: 50 }).notNull(),
  block: varchar("block", { length: 50 }),
  floor: integer("floor"),
  condominiumId: uuid("condominium_id").notNull(),
  syncedAt: timestamp("synced_at").defaultNow().notNull(),
});
