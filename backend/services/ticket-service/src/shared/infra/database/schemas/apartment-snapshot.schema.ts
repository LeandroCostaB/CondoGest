import { integer, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const apartmentsSnapshotSchema = pgTable('apartments_snapshot', {
  id: uuid('id').primaryKey(),
  number: text('number').notNull(),
  block: text('block'),
  floor: integer('floor'),
  condominiumId: uuid('condominium_id').notNull(),
  syncedAt: timestamp('synced_at').defaultNow().notNull(),
});
