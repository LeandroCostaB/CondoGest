import {
  index,
  integer,
  json,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const reportTypeEnum = pgEnum("report_type", ["MONTHLY", "CUSTOM"]);
export const reportStatusEnum = pgEnum("report_status", [
  "PENDING",
  "GENERATED",
  "EXPORTED",
]);

export const reportSchema = pgTable(
  "reports",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    condominiumId: uuid("condominium_id").notNull(),
    type: reportTypeEnum("type").notNull(),
    status: reportStatusEnum("status").default("PENDING").notNull(),
    month: integer("month"),
    year: integer("year"),
    startDate: timestamp("start_date"),
    endDate: timestamp("end_date"),
    data: json("data"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      condominiumIdIdx: index("reports_condominium_id_idx").on(
        table.condominiumId,
      ),
      monthYearIdx: index("reports_month_year_idx").on(table.month, table.year),
      statusIdx: index("reports_status_idx").on(table.status),
    };
  },
);
