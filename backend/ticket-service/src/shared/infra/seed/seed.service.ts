import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { DrizzleService } from '@shared/infra/database/drizzle.service';
import { providersSchema } from '@provider/infra/database/schemas/provider.schema';
import { ticketsSchema } from '@ticket/infra/database/schemas/ticket.schema';
import { maintenanceSchema } from '@maintenance/infra/database/schemas/maintenance.schema';
import { residentsSnapshotSchema } from '@shared/infra/database/schemas/resident-snapshot.schema';
import { condominiumsSnapshotSchema } from '@shared/infra/database/schemas/condominium-snapshot.schema';
import { apartmentsSnapshotSchema } from '@shared/infra/database/schemas/apartment-snapshot.schema';

// IDs espelhados do core-service
const SINDICO_ID   = 'f9714ea4-6c37-434f-87b3-1bacab49002e';
const JOAO_ID      = '24b8e62f-4c7a-4481-b07c-329664c9e194';
const MARIA_ID     = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
const CONDO_ID     = 'fe8692cb-8a62-4d2a-909b-124d60dac753';
const APT_101A_ID  = 'a9dd0e45-dbfb-4b34-a41e-3d12cfb1f1ce';
const APT_201A_ID  = 'b2c3d4e5-f6a7-8901-bcde-f12345678901';
const APT_102B_ID  = 'c3d4e5f6-a7b8-9012-cdef-012345678902';
const APT_202B_ID  = 'd4e5f6a7-b8c9-0123-def0-123456789012';

// IDs do ticket-service
const PROV_PLUMBER_ID      = 'e5f6a7b8-c9d0-1234-ef01-234567890123';
const PROV_ELECTRICIAN_ID  = 'f6a7b8c9-d0e1-2345-f012-345678901234';
const PROV_PAINTER_ID      = 'a7b8c9d0-e1f2-3456-0123-456789012345';
const TICKET_1_ID          = 'b8c9d0e1-f2a3-4567-1234-567890123456';
const TICKET_2_ID          = 'c9d0e1f2-a3b4-5678-2345-678901234567';
const TICKET_3_ID          = 'd0e1f2a3-b4c5-6789-3456-789012345678';
const MAINT_1_ID           = 'e1f2a3b4-c5d6-7890-4567-890123456789';
const MAINT_2_ID           = 'f2a3b4c5-d6e7-8901-5678-901234567890';
const MAINT_3_ID           = 'a3b4c5d6-e7f8-9012-6789-012345678901';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly drizzle: DrizzleService) {}

  async onApplicationBootstrap(): Promise<void> {
    if (process.env.SEED_DB !== 'true') return;

    const [{ count }] = await this.drizzle.db
      .select({ count: sql<number>`count(*)::int` })
      .from(providersSchema);

    if (count > 0) {
      this.logger.log('Seed ignorado: banco já possui dados.');
      return;
    }

    this.logger.log('Populando banco de dados com dados iniciais...');
    await this.seedSnapshots();
    await this.seedProviders();
    await this.seedTickets();
    await this.seedMaintenances();
    this.logger.log('Seed concluído com sucesso.');
  }

  private async seedSnapshots(): Promise<void> {
    await this.drizzle.db.insert(residentsSnapshotSchema).values([
      { id: SINDICO_ID, nome: 'Admin Síndico',  email: 'sindico@condogest.com', role: 'SINDICO' },
      { id: JOAO_ID,    nome: 'João Morador',   email: 'joao@condogest.com',    role: 'MORADOR' },
      { id: MARIA_ID,   nome: 'Maria Moradora', email: 'maria@condogest.com',   role: 'MORADOR' },
    ]).onConflictDoNothing();

    await this.drizzle.db.insert(condominiumsSnapshotSchema).values([
      {
        id: CONDO_ID,
        name: 'Residencial Aurora',
        address: 'Rua das Flores, 100 - Vila Madalena - São Paulo/SP',
        status: 'active',
      },
    ]).onConflictDoNothing();

    await this.drizzle.db.insert(apartmentsSnapshotSchema).values([
      { id: APT_101A_ID, number: '101', block: 'A', floor: 1, condominiumId: CONDO_ID },
      { id: APT_201A_ID, number: '201', block: 'A', floor: 2, condominiumId: CONDO_ID },
      { id: APT_102B_ID, number: '102', block: 'B', floor: 1, condominiumId: CONDO_ID },
      { id: APT_202B_ID, number: '202', block: 'B', floor: 2, condominiumId: CONDO_ID },
    ]).onConflictDoNothing();

    this.logger.log('  ✓ Snapshots inseridos (3 residentes, 1 condomínio, 4 apartamentos)');
  }

  private async seedProviders(): Promise<void> {
    await this.drizzle.db.insert(providersSchema).values([
      { id: PROV_PLUMBER_ID,     name: 'Encanamentos Total', phone: '(11) 98888-0001', specialty: 'PLUMBER'     },
      { id: PROV_ELECTRICIAN_ID, name: 'Elétrica Rápida',    phone: '(11) 98888-0002', specialty: 'ELECTRICIAN' },
      { id: PROV_PAINTER_ID,     name: 'Pintura & Arte',     phone: '(11) 98888-0003', specialty: 'PAINTER'     },
    ]).onConflictDoNothing();

    this.logger.log('  ✓ Prestadores inseridos (3)');
  }

  private async seedTickets(): Promise<void> {
    await this.drizzle.db.insert(ticketsSchema).values([
      {
        id: TICKET_1_ID,
        title: 'Vazamento na cozinha',
        description: 'Torneira com vazamento constante, água escorrendo pelo armário.',
        location: 'Cozinha',
        status: 'OPEN',
        residentId: JOAO_ID,
        apartmentId: APT_101A_ID,
      },
      {
        id: TICKET_2_ID,
        title: 'Curto circuito no quarto',
        description: 'Tomada do quarto está faiscando ao ligar qualquer aparelho.',
        location: 'Quarto principal',
        status: 'IN_PROGRESS',
        residentId: JOAO_ID,
        apartmentId: APT_201A_ID,
      },
      {
        id: TICKET_3_ID,
        title: 'Infiltração no teto da sala',
        description: 'Mancha de umidade crescendo após as chuvas da semana passada.',
        location: 'Sala de estar',
        status: 'RESOLVED',
        residentId: MARIA_ID,
        apartmentId: APT_102B_ID,
      },
    ]).onConflictDoNothing();

    this.logger.log('  ✓ Tickets inseridos (3)');
  }

  private async seedMaintenances(): Promise<void> {
    const now = new Date();
    await this.drizzle.db.insert(maintenanceSchema).values([
      {
        id: MAINT_1_ID,
        ticketId: TICKET_1_ID,
        providerId: PROV_PLUMBER_ID,
        status: 'SCHEDULED',
        value: '350.00',
        executionDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      },
      {
        id: MAINT_2_ID,
        ticketId: TICKET_2_ID,
        providerId: PROV_ELECTRICIAN_ID,
        status: 'IN_PROGRESS',
        value: '480.00',
        executionDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
      },
      {
        id: MAINT_3_ID,
        ticketId: TICKET_3_ID,
        providerId: PROV_ELECTRICIAN_ID,
        status: 'COMPLETED',
        value: '1200.50',
        executionDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      },
    ]).onConflictDoNothing();

    this.logger.log('  ✓ Manutenções inseridas (3)');
  }
}
