ALTER TABLE "maintenances"
  ADD COLUMN "type" text,
  ADD COLUMN "local" text,
  ADD COLUMN "priority" text,
  ADD COLUMN "provider_name" text,
  ADD COLUMN "provider_contact" text,
  ADD COLUMN "observation" text;
