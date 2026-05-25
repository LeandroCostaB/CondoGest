import { pgTable, uuid, text, varchar } from 'drizzle-orm/pg-core';

// Aqui nós declaramos apenas o mínimo necessário para ler a tabela.
export const externalUsers = pgTable('users', {
    id: uuid('id').primaryKey(),
    email: varchar('email', { length: 255 }),
    role: text('role'),
    fcmToken: text('fcm_token'),
});