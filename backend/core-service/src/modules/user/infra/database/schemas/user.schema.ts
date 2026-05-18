import { pgTable, uuid, varchar, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';

// 1. Roles: 'SINDICO' e 'MORADOR'
export const roleEnum = pgEnum('role', ['SINDICO', 'MORADOR']);

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  nome: varchar('nome', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  senha: varchar('senha', { length: 255 }).notNull(),
  role: roleEnum('role').default('MORADOR').notNull(),
  fcmToken: text('fcm_token'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export { users as usersSchema };