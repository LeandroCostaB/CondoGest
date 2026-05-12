import { pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const residentsSnapshotSchema = pgTable('residents_snapshot', {
  id: uuid('id').primaryKey(),
  nome: varchar('nome', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull(),
  syncedAt: timestamp('synced_at').defaultNow().notNull(),
});
