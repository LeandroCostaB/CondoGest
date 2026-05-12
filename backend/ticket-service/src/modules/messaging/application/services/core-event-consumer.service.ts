import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { RabbitMQService } from '@messaging/infra/rabbitmq/rabbitmq.service';
import { DrizzleService } from '@shared/infra/database/drizzle.service';
import { residentsSnapshotSchema } from '@shared/infra/database/schemas/resident-snapshot.schema';
import { apartmentsSnapshotSchema } from '@shared/infra/database/schemas/apartment-snapshot.schema';
import { condominiumsSnapshotSchema } from '@shared/infra/database/schemas/condominium-snapshot.schema';
import { CORE_DATA_QUEUE } from '../../messaging.constants';

type CoreEvent =
  | 'morador.criado'
  | 'morador.atualizado'
  | 'morador.deletado'
  | 'apartamento.criado'
  | 'apartamento.atualizado'
  | 'apartamento.deletado'
  | 'condominio.criado'
  | 'condominio.atualizado'
  | 'condominio.deletado';

interface CoreMessage {
  event: CoreEvent;
  payload: Record<string, unknown>;
}

@Injectable()
export class CoreEventConsumerService implements OnModuleInit {
  private readonly logger = new Logger(CoreEventConsumerService.name);

  constructor(
    private readonly rabbitMQService: RabbitMQService,
    private readonly drizzleService: DrizzleService,
  ) {}

  async onModuleInit(): Promise<void> {
    const channel = this.rabbitMQService.getChannel();

    await channel.consume(CORE_DATA_QUEUE, async (msg) => {
      if (!msg) return;
      try {
        const parsed: CoreMessage = JSON.parse(msg.content.toString());
        await this.handleEvent(parsed.event, parsed.payload);
        channel.ack(msg);
      } catch (err) {
        this.logger.error(`Erro ao processar evento do core: ${err}`);
        channel.nack(msg, false, false);
      }
    });

    this.logger.log(`Consumindo fila "${CORE_DATA_QUEUE}"`);
  }

  private async handleEvent(event: CoreEvent, payload: Record<string, unknown>): Promise<void> {
    switch (event) {
      case 'morador.criado':
      case 'morador.atualizado':
        await this.upsertResident(payload);
        break;
      case 'morador.deletado':
        await this.deleteResident(payload.id as string);
        break;
      case 'apartamento.criado':
      case 'apartamento.atualizado':
        await this.upsertApartment(payload);
        break;
      case 'apartamento.deletado':
        await this.deleteApartment(payload.id as string);
        break;
      case 'condominio.criado':
      case 'condominio.atualizado':
        await this.upsertCondominium(payload);
        break;
      case 'condominio.deletado':
        await this.deleteCondominium(payload.id as string);
        break;
      default:
        this.logger.warn(`Evento desconhecido: ${event}`);
    }
  }

  private async upsertResident(payload: Record<string, unknown>): Promise<void> {
    const values = {
      id: payload.id as string,
      nome: payload.nome as string,
      email: payload.email as string,
      role: payload.role as string,
      syncedAt: new Date(),
    };
    await this.drizzleService.db
      .insert(residentsSnapshotSchema)
      .values(values)
      .onConflictDoUpdate({
        target: residentsSnapshotSchema.id,
        set: { nome: values.nome, email: values.email, role: values.role, syncedAt: values.syncedAt },
      });
  }

  private async deleteResident(id: string): Promise<void> {
    await this.drizzleService.db
      .delete(residentsSnapshotSchema)
      .where(eq(residentsSnapshotSchema.id, id));
  }

  private async upsertApartment(payload: Record<string, unknown>): Promise<void> {
    const values = {
      id: payload.id as string,
      number: payload.number as string,
      block: (payload.block as string | null) ?? null,
      floor: (payload.floor as number | null) ?? null,
      condominiumId: payload.condominiumId as string,
      syncedAt: new Date(),
    };
    await this.drizzleService.db
      .insert(apartmentsSnapshotSchema)
      .values(values)
      .onConflictDoUpdate({
        target: apartmentsSnapshotSchema.id,
        set: { number: values.number, block: values.block, floor: values.floor, condominiumId: values.condominiumId, syncedAt: values.syncedAt },
      });
  }

  private async deleteApartment(id: string): Promise<void> {
    await this.drizzleService.db
      .delete(apartmentsSnapshotSchema)
      .where(eq(apartmentsSnapshotSchema.id, id));
  }

  private async upsertCondominium(payload: Record<string, unknown>): Promise<void> {
    const values = {
      id: payload.id as string,
      name: payload.name as string,
      address: payload.address as string,
      status: payload.status as string,
      syncedAt: new Date(),
    };
    await this.drizzleService.db
      .insert(condominiumsSnapshotSchema)
      .values(values)
      .onConflictDoUpdate({
        target: condominiumsSnapshotSchema.id,
        set: { name: values.name, address: values.address, status: values.status, syncedAt: values.syncedAt },
      });
  }

  private async deleteCondominium(id: string): Promise<void> {
    await this.drizzleService.db
      .delete(condominiumsSnapshotSchema)
      .where(eq(condominiumsSnapshotSchema.id, id));
  }
}
