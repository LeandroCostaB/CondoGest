import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const residentSnapshotSchema = pgTable("resident_snapshots", {
  id: uuid("id").primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  role: text("role").notNull(),
  syncedAt: timestamp("synced_at").defaultNow().notNull(),
});
