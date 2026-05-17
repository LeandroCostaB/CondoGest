// Re-exports from root shared contracts for backward compatibility within this service.
// Import directly from '@shared/contracts/events/messaging.constants' in new code.
export {
  CORE_EXCHANGE,
  TICKET_EXCHANGE,
  MAINTENANCE_EXCHANGE,
  EXCHANGE_TYPE,
  CORE_ROUTING_KEY,
  CORE_DATA_QUEUE,
  CORE_RESPONSE_QUEUE,
  TICKET_CREATED_KEY,
  TICKET_CREATED_QUEUE,
  TICKET_STATUS_CHANGED_KEY,
  TICKET_STATUS_CHANGED_QUEUE,
  MAINTENANCE_COMPLETED_KEY,
  MAINTENANCE_COMPLETED_QUEUE,
} from '@shared/contracts/events/messaging.constants';
