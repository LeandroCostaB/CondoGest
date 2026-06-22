export enum CondogestTicketExchangeName {
  TICKET_CREATED = "condogest.ticket.created.exchange",
  TICKET_STATUS_CHANGED = "condogest.ticket.status-changed.exchange",
  MAINTENANCE_COMPLETED = "condogest.maintenance.completed.exchange",
  MAINTENANCE_SCHEDULED = "condogest.maintenance.scheduled.exchange",
  MAINTENANCE_STATUS_CHANGED = "condogest.maintenance.status-changed.exchange",
}

export enum CondogestTicketRoutingKey {
  TICKET_CREATED = "ticket.created",
  TICKET_STATUS_CHANGED = "ticket.status-changed",
  MAINTENANCE_COMPLETED = "maintenance.completed",
  MAINTENANCE_SCHEDULED = "maintenance.scheduled",
  MAINTENANCE_STATUS_CHANGED = "maintenance.status-changed",
}
