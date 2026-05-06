import { pgTable, uuid, varchar, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';

// Pode adaptar os status 
export const maintenanceStatusEnum = pgEnum('maintenance_status', ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELED']);

export const maintenance = pgTable('maintenances', {
    id: uuid('id').primaryKey().defaultRandom(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description').notNull(),
    status: maintenanceStatusEnum('status').default('PENDING').notNull(),

    // Vínculos com Condomínios e Apartamentos
    condominiumId: uuid('condominium_id').notNull(),
    apartmentId: uuid('apartment_id'), // Opcional, para casos de manutenção em área comum

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});