import { Controller, Get, Param } from '@nestjs/common';
import { MessagingService } from '@messaging/application/services/messaging.service';
import { Public } from '@shared/infra/decorators/public.decorator';
import { CORE_DATA_QUEUE, CORE_RESPONSE_QUEUE, MAINTENANCE_COMPLETED_QUEUE, TICKET_CREATED_QUEUE, TICKET_STATUS_CHANGED_QUEUE } from '../../messaging.constants';

// Filas disponíveis para consumo via HTTP (uso administrativo/debug)
const ALLOWED_QUEUES = new Set([
  TICKET_CREATED_QUEUE,
  TICKET_STATUS_CHANGED_QUEUE,
  MAINTENANCE_COMPLETED_QUEUE,
  CORE_DATA_QUEUE,
  CORE_RESPONSE_QUEUE,
]);

@Controller('messaging')
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  @Get('consume/:queue')
  @Public()
  async consume(@Param('queue') queue: string) {
    if (!ALLOWED_QUEUES.has(queue)) {
      return { error: `Fila "${queue}" não existe neste serviço` };
    }
    return this.messagingService.consume(queue);
  }
}
