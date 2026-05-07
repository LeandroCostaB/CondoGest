export enum Permission {
  // Usuários
  USERS_READ = 'users:read',
  USERS_WRITE = 'users:write',
  USERS_DELETE = 'users:delete',

  // Condomínios
  CONDOMINIUMS_READ = 'condominiums:read',
  CONDOMINIUMS_WRITE = 'condominiums:write',
  CONDOMINIUMS_DELETE = 'condominiums:delete',

  // Apartamentos / Unidades
  APARTMENTS_READ = 'apartments:read',
  APARTMENTS_WRITE = 'apartments:write',
  APARTMENTS_DELETE = 'apartments:delete',

  // Moradores (Residentes)
  RESIDENTS_READ = 'residents:read',
  RESIDENTS_WRITE = 'residents:write',
  RESIDENTS_DELETE = 'residents:delete',

  // Prestadores de serviço (ticket-service)
  PROVIDERS_READ = 'providers:read',
  PROVIDERS_WRITE = 'providers:write',
  PROVIDERS_DELETE = 'providers:delete',

  // Manutenções (ticket-service)
  MAINTENANCES_READ = 'maintenances:read',
  MAINTENANCES_WRITE = 'maintenances:write',
  MAINTENANCES_DELETE = 'maintenances:delete',
}
