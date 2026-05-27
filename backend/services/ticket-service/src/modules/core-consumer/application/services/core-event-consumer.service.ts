import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import { eq } from "drizzle-orm";
import {
  CondogestCoreExchangeName,
  CondogestCoreRoutingKey,
} from "@shared/contracts/events/condogest-core-events.enum";
import { DrizzleService } from "@shared/infra/database/drizzle.service";
import { RabbitMQService } from "@shared/infra/messaging/rabbitmq.service";
import { SharedMessagingService } from "@shared/infra/messaging/shared-messaging.service";
import { residentSnapshotSchema } from "@core-consumer/infra/database/schemas/resident-snapshot.schema";
import { apartmentSnapshotSchema } from "@core-consumer/infra/database/schemas/apartment-snapshot.schema";
import { condominiumSnapshotSchema } from "@core-consumer/infra/database/schemas/condominium-snapshot.schema";

@Injectable()
export class CoreEventConsumerService implements OnApplicationBootstrap {
  private readonly logger = new Logger(CoreEventConsumerService.name);
  private static readonly QUEUE = "condogest.ticket-service.core.queue";

  constructor(
    private readonly rabbitMQService: RabbitMQService,
    private readonly drizzleService: DrizzleService,
    private readonly sharedMessagingService: SharedMessagingService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await Promise.all([
      this.sharedMessagingService.assertExchange(CondogestCoreExchangeName.USER_CREATED),
      this.sharedMessagingService.assertExchange(CondogestCoreExchangeName.USER_UPDATED),
      this.sharedMessagingService.assertExchange(CondogestCoreExchangeName.USER_DELETED),
      this.sharedMessagingService.assertExchange(CondogestCoreExchangeName.APARTMENT_CREATED),
      this.sharedMessagingService.assertExchange(CondogestCoreExchangeName.APARTMENT_UPDATED),
      this.sharedMessagingService.assertExchange(CondogestCoreExchangeName.APARTMENT_DELETED),
      this.sharedMessagingService.assertExchange(CondogestCoreExchangeName.CONDOMINIUM_CREATED),
      this.sharedMessagingService.assertExchange(CondogestCoreExchangeName.CONDOMINIUM_UPDATED),
      this.sharedMessagingService.assertExchange(CondogestCoreExchangeName.CONDOMINIUM_DELETED),
    ]);

    const channel = this.rabbitMQService.getChannel();
    await channel.assertQueue(CoreEventConsumerService.QUEUE, { durable: true });

    await Promise.all([
      channel.bindQueue(CoreEventConsumerService.QUEUE, CondogestCoreExchangeName.USER_CREATED, CondogestCoreRoutingKey.USER_CREATED),
      channel.bindQueue(CoreEventConsumerService.QUEUE, CondogestCoreExchangeName.USER_UPDATED, CondogestCoreRoutingKey.USER_UPDATED),
      channel.bindQueue(CoreEventConsumerService.QUEUE, CondogestCoreExchangeName.USER_DELETED, CondogestCoreRoutingKey.USER_DELETED),
      channel.bindQueue(CoreEventConsumerService.QUEUE, CondogestCoreExchangeName.APARTMENT_CREATED, CondogestCoreRoutingKey.APARTMENT_CREATED),
      channel.bindQueue(CoreEventConsumerService.QUEUE, CondogestCoreExchangeName.APARTMENT_UPDATED, CondogestCoreRoutingKey.APARTMENT_UPDATED),
      channel.bindQueue(CoreEventConsumerService.QUEUE, CondogestCoreExchangeName.APARTMENT_DELETED, CondogestCoreRoutingKey.APARTMENT_DELETED),
      channel.bindQueue(CoreEventConsumerService.QUEUE, CondogestCoreExchangeName.CONDOMINIUM_CREATED, CondogestCoreRoutingKey.CONDOMINIUM_CREATED),
      channel.bindQueue(CoreEventConsumerService.QUEUE, CondogestCoreExchangeName.CONDOMINIUM_UPDATED, CondogestCoreRoutingKey.CONDOMINIUM_UPDATED),
      channel.bindQueue(CoreEventConsumerService.QUEUE, CondogestCoreExchangeName.CONDOMINIUM_DELETED, CondogestCoreRoutingKey.CONDOMINIUM_DELETED),
    ]);

    await channel.consume(CoreEventConsumerService.QUEUE, async (msg) => {
      if (!msg) return;
      try {
        const payload = JSON.parse(msg.content.toString()) as Record<string, unknown>;
        const routingKey = msg.fields.routingKey;
        await this.handleEvent(routingKey, payload);
        channel.ack(msg);
      } catch (err) {
        this.logger.error(`Failed to process core event: ${String(err)}`);
        channel.nack(msg, false, false);
      }
    });

    this.logger.log(`Consuming core events from queue "${CoreEventConsumerService.QUEUE}"`);
  }

  private async handleEvent(routingKey: string, payload: Record<string, unknown>): Promise<void> {
    switch (routingKey) {
      case CondogestCoreRoutingKey.USER_CREATED:
      case CondogestCoreRoutingKey.USER_UPDATED:
        await this.upsertResident(payload);
        break;
      case CondogestCoreRoutingKey.USER_DELETED:
        await this.deleteResident(payload.id as string);
        break;
      case CondogestCoreRoutingKey.APARTMENT_CREATED:
      case CondogestCoreRoutingKey.APARTMENT_UPDATED:
        await this.upsertApartment(payload);
        break;
      case CondogestCoreRoutingKey.APARTMENT_DELETED:
        await this.deleteApartment(payload.id as string);
        break;
      case CondogestCoreRoutingKey.CONDOMINIUM_CREATED:
      case CondogestCoreRoutingKey.CONDOMINIUM_UPDATED:
        await this.upsertCondominium(payload);
        break;
      case CondogestCoreRoutingKey.CONDOMINIUM_DELETED:
        await this.deleteCondominium(payload.id as string);
        break;
      default:
        this.logger.warn(`Unknown routing key: ${routingKey}`);
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
      .insert(residentSnapshotSchema)
      .values(values)
      .onConflictDoUpdate({
        target: residentSnapshotSchema.id,
        set: { nome: values.nome, email: values.email, role: values.role, syncedAt: values.syncedAt },
      });
  }

  private async deleteResident(id: string): Promise<void> {
    await this.drizzleService.db
      .delete(residentSnapshotSchema)
      .where(eq(residentSnapshotSchema.id, id));
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
      .insert(apartmentSnapshotSchema)
      .values(values)
      .onConflictDoUpdate({
        target: apartmentSnapshotSchema.id,
        set: {
          number: values.number,
          block: values.block,
          floor: values.floor,
          condominiumId: values.condominiumId,
          syncedAt: values.syncedAt,
        },
      });
  }

  private async deleteApartment(id: string): Promise<void> {
    await this.drizzleService.db
      .delete(apartmentSnapshotSchema)
      .where(eq(apartmentSnapshotSchema.id, id));
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
      .insert(condominiumSnapshotSchema)
      .values(values)
      .onConflictDoUpdate({
        target: condominiumSnapshotSchema.id,
        set: { name: values.name, address: values.address, status: values.status, syncedAt: values.syncedAt },
      });
  }

  private async deleteCondominium(id: string): Promise<void> {
    await this.drizzleService.db
      .delete(condominiumSnapshotSchema)
      .where(eq(condominiumSnapshotSchema.id, id));
  }
}
