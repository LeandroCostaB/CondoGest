// ── Exchanges ────────────────────────────────────────────────────────────────
export const CORE_EXCHANGE = 'condogest.core';
export const TICKET_EXCHANGE = 'condogest.ticket';
export const MAINTENANCE_EXCHANGE = 'condogest.maintenance';
export const EXCHANGE_TYPE = 'direct';

// ── Routing keys / Queue names ───────────────────────────────────────────────
export const CORE_ROUTING_KEY = 'core.dados_cadastrais';
export const CORE_DATA_QUEUE = 'core.dados_cadastrais';
export const CORE_RESPONSE_QUEUE = 'core.resposta_dados';

export const TICKET_CREATED_KEY = 'ticket.criado';
export const TICKET_CREATED_QUEUE = 'ticket.criado';

export const TICKET_STATUS_CHANGED_KEY = 'ticket.status_alterado';
export const TICKET_STATUS_CHANGED_QUEUE = 'ticket.status_alterado';

export const MAINTENANCE_COMPLETED_KEY = 'manutencao.concluida';
export const MAINTENANCE_COMPLETED_QUEUE = 'manutencao.concluida';
