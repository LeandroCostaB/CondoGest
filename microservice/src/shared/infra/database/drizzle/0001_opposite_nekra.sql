CREATE TABLE "apartment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"number" text NOT NULL,
	"block" text,
	"floor" integer,
	"condominium_id" uuid NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "apartment" ADD CONSTRAINT "apartment_condominium_id_condominium_id_fk" FOREIGN KEY ("condominium_id") REFERENCES "public"."condominium"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "apartment_condominium_id_idx" ON "apartment" USING btree ("condominium_id");--> statement-breakpoint
CREATE UNIQUE INDEX "apartment_condominium_number_block_unique" ON "apartment" USING btree ("condominium_id","number","block");