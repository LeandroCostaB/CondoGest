# CondoGest

Sistema de gestão de condomínios — NestJS (microserviços) + Flutter (mobile).

---

## Estrutura do repositório

```
CondoGest/
├── backend/
│   ├── core-service/        # Usuários, condomínios, apartamentos  (porta 3000)
│   ├── ticket-service/      # Tickets, manutenções, prestadores    (porta 3001)
│   ├── notification-service/# Push/email via FCM                   (porta 3002, desativado)
│   ├── docker/              # Scripts de init do PostgreSQL
│   └── docker-compose.yml
│
├── mobile_condogest/        # Aplicativo Flutter
│
└── README.md
```

---

## Backend

### Tecnologias
- **Runtime:** Node.js + NestJS
- **ORM:** Drizzle ORM
- **Banco:** PostgreSQL 16
- **Mensageria:** RabbitMQ 3.13
- **Auth:** JWT (Bearer token)
- **Documentação:** Swagger (`/api/docs` em cada serviço)

### Subir o ambiente

```bash
cd backend
docker-compose up -d
```

Serviços disponíveis após o start:

| Serviço | URL | Swagger |
|---------|-----|---------|
| core-service | http://localhost:3000 | http://localhost:3000/api/docs |
| ticket-service | http://localhost:3001 | http://localhost:3001/api/docs |
| PostgreSQL | localhost:5432 | — |
| RabbitMQ Management | http://localhost:15672 | — |
| Adminer (DB GUI) | http://localhost:8080 | — |

### Módulos do backend

**core-service** (porta 3000):
- `POST /auth/register` — Cadastro (body: `{ nome, email, senha, role? }`)
- `POST /auth/login` — Login (body: `{ email, senha }`) → retorna `{ access_token }`
- `GET /auth/me` — Usuário logado (requer Bearer)
- `GET|POST|PUT|DELETE /condominiums` — CRUD de condomínios
- `PATCH /condominiums/:id/activate|deactivate` — Ativar/desativar
- `GET|POST|PUT|DELETE /condominiums/:id/apartments` — CRUD de apartamentos

**ticket-service** (porta 3001):
- `GET|POST|PUT|DELETE /tickets` — CRUD de tickets (chamados)
- `GET /tickets/resident/:id` — Tickets por morador
- `GET /tickets/apartment/:id` — Tickets por apartamento
- `GET|POST|PUT|DELETE /maintenances` — CRUD de manutenções
- `GET /maintenances/ticket/:id` — Manutenções de um ticket
- `GET|POST|PUT|DELETE /providers` — CRUD de prestadores de serviço

### Padrão de resposta

**Lista paginada (HATEOAS):**
```json
{
  "data": [ { ...campos, "_links": { "self": {}, "update": {}, "delete": {} } } ],
  "meta": { "totalItems": 10, "itemsPerPage": 10, "currentPage": 1, "totalPages": 1 },
  "_links": { "self": {}, "next": null, "prev": null, "first": {}, "last": {}, "create": {} }
}
```

**Item único:** objeto direto com `_links` adicionado.

**Operações de escrita (PUT/PATCH/DELETE):** retornam 204 No Content.

### Autenticação e permissões

Todas as rotas (exceto `/auth/login` e `/auth/register`) exigem `Authorization: Bearer <token>`.

Roles disponíveis: `SINDICO` (admin), `MORADOR` (residente).

---

## Mobile (Flutter)

Documentação detalhada: [mobile_condogest/README.md](mobile_condogest/README.md)

### Tecnologias
- Flutter ^3.11.1 / Dart ^3.11.1
- Provider (state management)
- `package:http` (chamadas REST)
- SQLite via sqflite (cache local)
- SharedPreferences (token JWT)

### Configurar URL do backend

Edite `mobile_condogest/lib/core/network/api_endpoints.dart`:

```dart
// Android emulator → 10.0.2.2 aponta para localhost do host
static const String coreBase = 'http://10.0.2.2:3000';
static const String ticketBase = 'http://10.0.2.2:3001';

// iOS Simulator / dispositivo físico → use localhost ou IP da máquina
```

### Rodar o app

```bash
cd mobile_condogest
flutter pub get
flutter run
```

### Status de integração

| Módulo | Backend | Mobile (serviço HTTP) | Tela |
|--------|---------|----------------------|------|
| Auth | ✅ | ✅ | ✅ |
| Condomínios | ✅ | ✅ | ✅ |
| Apartamentos | ✅ | ✅ | ⚠️ parcial |
| Tickets | ✅ | ✅ | 🔴 a fazer |
| Manutenções | ✅ | ✅ | ⚠️ parcial |
| Prestadores | ✅ | ✅ | 🔴 a fazer |
| Notificações | ✅ (desativado) | 🔴 | 🔴 |
| Dashboard | — | 🔴 | 🔴 |

---

## Contribuindo

- Backend: ver [backend/CLAUDE.MD](backend/CLAUDE.MD) para convenções de código
- Mobile: ver [mobile_condogest/README.md](mobile_condogest/README.md) para arquitetura e mapeamento de endpoints
