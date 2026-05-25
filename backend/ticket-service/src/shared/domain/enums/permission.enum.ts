export enum Permission {
  // Moradores/Usuários
  USERS_READ = "users:read",
  USERS_WRITE = "users:write",
  USERS_DELETE = "users:delete",

  // Condomínio e Unidades (Apartamentos/Casas)
  CONDOMINIUMS_READ = "condominiums:read",
  CONDOMINIUMS_WRITE = "condominiums:write",
  CONDOMINIUMS_DELETE = "condominiums:delete",

  UNITS_READ = "units:read",
  UNITS_WRITE = "units:write",
  UNITS_DELETE = "units:delete",

  // Moradores (Residentes)
  RESIDENTS_READ = "residents:read",
  RESIDENTS_WRITE = "residents:write",
  RESIDENTS_DELETE = "residents:delete",

  // Prestadores de serviço
  PROVIDERS_READ = "providers:read",
  PROVIDERS_WRITE = "providers:write",
  PROVIDERS_DELETE = "providers:delete",

  // Manutenções
  MAINTENANCES_READ = "maintenances:read",
  MAINTENANCES_WRITE = "maintenances:write",
  MAINTENANCES_DELETE = "maintenances:delete",

  // Tickets
  TICKETS_READ = "tickets:read",
  TICKETS_WRITE = "tickets:write",
  TICKETS_DELETE = "tickets:delete",
}
