export enum CondogestCoreExchangeName {
  USER_CREATED = "condogest.core.user.created.exchange",
  USER_UPDATED = "condogest.core.user.updated.exchange",
  USER_DELETED = "condogest.core.user.deleted.exchange",
  CONDOMINIUM_CREATED = "condogest.core.condominium.created.exchange",
  CONDOMINIUM_UPDATED = "condogest.core.condominium.updated.exchange",
  CONDOMINIUM_DELETED = "condogest.core.condominium.deleted.exchange",
  APARTMENT_CREATED = "condogest.core.apartment.created.exchange",
  APARTMENT_UPDATED = "condogest.core.apartment.updated.exchange",
  APARTMENT_DELETED = "condogest.core.apartment.deleted.exchange",
}

export enum CondogestCoreRoutingKey {
  USER_CREATED = "user.created",
  USER_UPDATED = "user.updated",
  USER_DELETED = "user.deleted",
  CONDOMINIUM_CREATED = "condominium.created",
  CONDOMINIUM_UPDATED = "condominium.updated",
  CONDOMINIUM_DELETED = "condominium.deleted",
  APARTMENT_CREATED = "apartment.created",
  APARTMENT_UPDATED = "apartment.updated",
  APARTMENT_DELETED = "apartment.deleted",
}
