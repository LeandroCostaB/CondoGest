import { pgEnum, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const providerSpecialtyEnum = pgEnum("provider_specialty", [
  "ELECTRICIAN",
  "PLUMBER",
  "PAINTER",
  "CARPENTER",
  "LOCKSMITH",
  "GENERAL",
]);

export const providersSchema = pgTable("providers", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  specialty: providerSpecialtyEnum("specialty").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
