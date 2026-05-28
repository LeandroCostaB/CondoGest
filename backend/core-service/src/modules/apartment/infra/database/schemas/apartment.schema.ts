import { condominiumsSchema } from "@condominium/infra/database/schemas/condominium.schema";
import { usersSchema } from "@user/infra/database/schemas/user.schema";
import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const apartmentsSchema = pgTable(
  "apartment",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    number: text("number").notNull(),
    block: text("block"),
    floor: integer("floor"),
    condominiumId: uuid("condominium_id")
      .notNull()
      .references(() => condominiumsSchema.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .references(() => usersSchema.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (table) => [
    index("apartment_condominium_id_idx").on(table.condominiumId),
    uniqueIndex("apartment_condominium_number_block_unique").on(
      table.condominiumId,
      table.number,
      table.block,
    ),
    uniqueIndex("apartment_user_id_unique").on(table.userId),
  ],
);
