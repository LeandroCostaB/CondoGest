import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const condominiumSnapshotSchema = pgTable("condominium_snapshots", {
  id: uuid("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address").notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  syncedAt: timestamp("synced_at").defaultNow().notNull(),
});
