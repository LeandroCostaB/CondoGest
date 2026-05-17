import { usersSchema } from "@user/infra/database/schemas/user.schema";
import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const condominiumStatusEnum = pgEnum("condominium_status", [
  "active",
  "inactive",
]);

export const condominiumsSchema = pgTable("condominium", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersSchema.id),
  status: condominiumStatusEnum("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});
