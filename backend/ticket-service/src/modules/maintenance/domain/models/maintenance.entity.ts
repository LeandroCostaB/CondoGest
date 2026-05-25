export class Maintenance {
    id!: string;
    title!: string;
    description!: string;
    status!: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELED';
    condominiumId!: string;
    apartmentId?: string; // Opcional
    createdAt!: Date;
    updatedAt!: Date;

    constructor(partial: Partial<Maintenance>) {
        Object.assign(this, partial);
    }
}