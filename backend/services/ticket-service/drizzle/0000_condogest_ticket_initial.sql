-- Migration: condogest_ticket_initial

DO $$ BEGIN
  CREATE TYPE "provider_specialty" AS ENUM (
    'ELECTRICIAN', 'PLUMBER', 'PAINTER', 'CARPENTER', 'LOCKSMITH', 'GENERAL'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ticket_status" AS ENUM (
    'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'CANCELED'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "maintenance_status" AS ENUM (
    'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELED'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "providers" (
  "id"         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name"       VARCHAR(255) NOT NULL,
  "phone"      VARCHAR(20) NOT NULL,
  "specialty"  "provider_specialty" NOT NULL,
  "created_at" TIMESTAMP DEFAULT now() NOT NULL,
  "updated_at" TIMESTAMP DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "tickets" (
  "id"           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "title"        VARCHAR(255) NOT NULL,
  "description"  TEXT NOT NULL,
  "location"     VARCHAR(255) NOT NULL,
  "status"       "ticket_status" DEFAULT 'OPEN' NOT NULL,
  "resident_id"  UUID NOT NULL,
  "apartment_id" UUID NOT NULL,
  "created_at"   TIMESTAMP DEFAULT now() NOT NULL,
  "updated_at"   TIMESTAMP DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "maintenances" (
  "id"             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "ticket_id"      UUID NOT NULL,
  "provider_id"    UUID NOT NULL,
  "status"         "maintenance_status" DEFAULT 'SCHEDULED' NOT NULL,
  "value"          NUMERIC(10, 2) NOT NULL,
  "execution_date" TIMESTAMP NOT NULL,
  "created_at"     TIMESTAMP DEFAULT now() NOT NULL,
  "updated_at"     TIMESTAMP DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "resident_snapshots" (
  "id"        UUID PRIMARY KEY,
  "nome"      VARCHAR(255) NOT NULL,
  "email"     VARCHAR(255) NOT NULL,
  "role"      TEXT NOT NULL,
  "synced_at" TIMESTAMP DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "apartment_snapshots" (
  "id"             UUID PRIMARY KEY,
  "number"         VARCHAR(50) NOT NULL,
  "block"          VARCHAR(50),
  "floor"          INTEGER,
  "condominium_id" UUID NOT NULL,
  "synced_at"      TIMESTAMP DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "condominium_snapshots" (
  "id"        UUID PRIMARY KEY,
  "name"      VARCHAR(255) NOT NULL,
  "address"   TEXT NOT NULL,
  "status"    VARCHAR(50) NOT NULL,
  "synced_at" TIMESTAMP DEFAULT now() NOT NULL
);
