-- Migration: Add reports table

DO $$ BEGIN
  CREATE TYPE "report_type" AS ENUM ('MONTHLY', 'CUSTOM');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "report_status" AS ENUM ('PENDING', 'GENERATED', 'EXPORTED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "reports" (
  "id"              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "condominium_id"  UUID NOT NULL,
  "type"            "report_type" NOT NULL,
  "status"          "report_status" DEFAULT 'PENDING' NOT NULL,
  "month"           INTEGER,
  "year"            INTEGER,
  "start_date"      TIMESTAMP,
  "end_date"        TIMESTAMP,
  "data"            JSONB,
  "created_at"      TIMESTAMP DEFAULT now() NOT NULL,
  "updated_at"      TIMESTAMP DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "reports_condominium_id_idx" ON "reports" ("condominium_id");
CREATE INDEX IF NOT EXISTS "reports_month_year_idx" ON "reports" ("month", "year");
CREATE INDEX IF NOT EXISTS "reports_status_idx" ON "reports" ("status");
