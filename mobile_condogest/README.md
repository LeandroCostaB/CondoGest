# CondoGest Mobile

Aplicativo Flutter para gestão de condomínios. Consome os microserviços do backend via REST.

---

## Stack

| Item | Versão |
|------|--------|
| Flutter SDK | ^3.11.1 |
| Dart | ^3.11.1 |
| State management | Provider |
| HTTP | `package:http` |
| Banco local | SQLite (sqflite) |
| Auth storage | shared_preferences |

---

## Arquitetura

Feature-first com Clean Architecture por feature:

```
lib/
├── core/
│   ├── database/
│   │   └── database_helper.dart      # SQLite local (cache offline)
│   ├── errors/
│   │   └── app_errors.dart
│   └── network/
│       ├── api_client.dart           # HTTP client singleton com injeção de JWT
│       └── api_endpoints.dart        # Todas as URLs e paths da API
│
├── features/
│   ├── auth/                         # Login, registro, sessão
│   ├── dashboard/                    # Visão geral (a implementar)
│   ├── profile/                      # Prestadores de serviço
│   ├── property_maintenance/         # Manutenções e manutenções recorrentes
│   ├── property_manager/             # Condomínios e apartamentos
│   └── ticket_manager/              # Tickets (chamados)
│
└── main.dart
```

Cada feature segue o padrão:
```
feature/
├── data/
│   ├── datasources/    # Interfaces (I*Service) + implementações HTTP
│   ├── models/         # Modelos com fromApiJson() / toApiJson()
│   └── repositories/
├── domain/
│   ├── entities/       # Entidades puras de domínio
│   └── repositories/
└── presentation/
    ├── pages/
    ├── viewmodels/     # ChangeNotifier
    └── widgets/
```

---

## Integração com o Backend

### URLs base (configuráveis em `lib/core/network/api_endpoints.dart`)

| Serviço | URL padrão (Android emulator) |
|---------|-------------------------------|
| core-service | `http://10.0.2.2:3000` |
| ticket-service | `http://10.0.2.2:3001` |

> **iOS Simulator / dispositivo físico:** troque `10.0.2.2` por `localhost` ou pelo IP da máquina host.

### Autenticação

O backend usa JWT. O fluxo é:
1. `POST /auth/login` → recebe `access_token`
2. Token salvo via `ApiClient.saveToken()` no SharedPreferences
3. Todas as requests seguintes injetam `Authorization: Bearer <token>` automaticamente

O campo de senha no body do login é `senha` (não `password`).

### Formato das respostas

**Listagens (HATEOAS paginado):**
```json
{
  "data": [ { ...item, "_links": {} } ],
  "meta": { "totalItems": 10, "itemsPerPage": 10, "currentPage": 1, "totalPages": 1 },
  "_links": { "self": {}, "next": null, "prev": null, "first": {}, "last": {}, "create": {} }
}
```
Leia via `data['data'] as List`.

**Item único:** retorna o objeto direto com `_links` adicionado.

**Delete / activate / deactivate:** retornam 204 No Content (body vazio).

---

## Endpoints mapeados

### core-service (porta 3000)

| Método | Path | Serviço Flutter |
|--------|------|-----------------|
| POST | `/auth/login` | `AuthService.login()` |
| POST | `/auth/register` | — (a implementar na UI) |
| GET | `/auth/me` | `AuthService.getCurrentUser()` |
| GET | `/condominiums` | `PropertyService.getAll()` |
| GET | `/condominiums/:id` | `PropertyService.getById()` |
| POST | `/condominiums` | `PropertyService.create()` |
| PUT | `/condominiums/:id` | `PropertyService.update()` |
| PATCH | `/condominiums/:id/activate` | `PropertyService.activate()` |
| PATCH | `/condominiums/:id/deactivate` | `PropertyService.deactivate()` |
| DELETE | `/condominiums/:id` | `PropertyService.delete()` |
| GET | `/condominiums/:cid/apartments` | `ApartmentService.getByCondominium()` |
| GET | `/condominiums/:cid/apartments/:aid` | `ApartmentService.getById()` |
| POST | `/condominiums/:cid/apartments` | `ApartmentService.create()` |
| PUT | `/condominiums/:cid/apartments/:aid` | `ApartmentService.update()` |
| DELETE | `/condominiums/:cid/apartments/:aid` | `ApartmentService.delete()` |

### ticket-service (porta 3001)

| Método | Path | Serviço Flutter |
|--------|------|-----------------|
| GET | `/tickets` | `TicketService.getAll()` |
| GET | `/tickets/:id` | `TicketService.getById()` |
| GET | `/tickets/resident/:id` | `TicketService.getByResident()` |
| GET | `/tickets/apartment/:id` | `TicketService.getByApartment()` |
| POST | `/tickets` | `TicketService.create()` |
| PUT | `/tickets/:id` | `TicketService.update()` |
| DELETE | `/tickets/:id` | `TicketService.delete()` |
| GET | `/maintenances` | `MaintenanceService.getAll()` |
| GET | `/maintenances/:id` | `MaintenanceService.getById()` |
| GET | `/maintenances/ticket/:id` | `MaintenanceService.getByTicket()` |
| POST | `/maintenances` | `MaintenanceService.create()` |
| PUT | `/maintenances/:id` | `MaintenanceService.update()` |
| DELETE | `/maintenances/:id` | `MaintenanceService.delete()` |
| GET | `/providers` | `ProviderService.getAll()` |
| GET | `/providers/:id` | `ProviderService.getById()` |
| POST | `/providers` | `ProviderService.create()` |
| PUT | `/providers/:id` | `ProviderService.update()` |
| DELETE | `/providers/:id` | `ProviderService.delete()` |

---

## DTOs do Backend (referência rápida)

### Login
```json
{ "email": "sindico@condo.com", "senha": "senha123" }
```
Resposta: `{ "access_token": "jwt..." }`

### Criar Condomínio
```json
{ "name": "Residencial X", "address": "Rua A, 100, Centro, SP" }
```

### Criar Apartamento
```json
{ "number": "101", "block": "A", "floor": 1 }
```

### Criar Ticket
```json
{ "title": "Vazamento", "description": "...", "location": "Cozinha", "residentId": "uuid", "apartmentId": "uuid" }
```

### Criar Manutenção
```json
{ "ticketId": "uuid", "providerId": "uuid", "value": 350.00, "executionDate": "2026-06-01T10:00:00.000Z" }
```

### Criar Prestador
```json
{ "name": "Encanamentos Total", "phone": "(11) 98888-0001", "specialty": "PLUMBER" }
```

Valores de `specialty`: `PLUMBER`, `ELECTRICIAN`, `PAINTER`, `MASON`, `OTHER` (verificar enum `ProviderSpecialty` no backend).

---

## Como rodar

```bash
# Certifique-se de que o backend está de pé:
cd ../backend && docker-compose up -d

# Rode o app no emulador Android:
flutter run
```

---

## Status dos módulos

| Módulo | Serviço HTTP | Tela | Observação |
|--------|-------------|------|------------|
| auth | ✅ | ✅ | Login funcional |
| property_manager | ✅ | ✅ | Condomínios e apartamentos integrados |
| property_maintenance | ✅ | ⚠️ | Serviço integrado, tela parcial |
| ticket_manager | ✅ | 🔴 | Serviço pronto, telas a implementar |
| profile (providers) | ✅ | 🔴 | Serviço pronto, telas a implementar |
| dashboard | 🔴 | 🔴 | A implementar completamente |
