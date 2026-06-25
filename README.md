# CondoGest

Sistema de gestão de condomínios composto por três camadas: **backend em microserviços NestJS**, **aplicação web Next.js** (painel do síndico) e **aplicativo mobile Flutter** (Android, iOS e Web).

---

## Arquitetura

```
CondoGest/
├── backend/
│   ├── services/
│   │   ├── core-service/          # Auth, usuários, condomínios, apartamentos  → :4001
│   │   ├── ticket-service/        # Tickets, manutenções, prestadores, relatórios → :4002
│   │   └── notification-service/  # Push (FCM) e e-mail via RabbitMQ            → :4003
│   ├── shared/                    # Guards, decorators, HATEOAS, mensageria
│   ├── docker-compose.yml
│   └── Dockerfile.service
│
├── web/                           # Painel web do síndico (Next.js 14)          → :3000
│
└── mobile_condogest/              # App Flutter (Android / iOS / Web)
```

**Stack:**
- Backend: Node.js 22 + NestJS 11 + Drizzle ORM + PostgreSQL 16 + RabbitMQ 3
- Web: Next.js 14 + TypeScript + Tailwind CSS
- Mobile: Flutter 3 + Provider + Firebase Messaging

**Comunicação:**
- Clientes → Serviços: HTTP/REST com JWT (`Authorization: Bearer <token>`)
- Entre serviços: eventos assíncronos via RabbitMQ
- Banco: um PostgreSQL por serviço (`condogest_core`, `condogest_ticket`)

---

## Pré-requisitos

| Ferramenta | Versão mínima | Para quê |
|---|---|---|
| Docker + Docker Compose | 24+ | Rodar o backend |
| Node.js | 20+ | Desenvolvimento da aplicação web |
| Flutter SDK | 3.x | App mobile |

---

## 1. Backend

Todo o backend sobe via Docker Compose: PostgreSQL, RabbitMQ e os três serviços NestJS.

### Subir o ambiente

```bash
cd backend
docker compose up -d
```

O primeiro start faz o build das imagens (~2–3 min). Nas próximas vezes é instantâneo.

Acompanhe os logs:
```bash
docker compose logs -f core-service ticket-service
```

### Serviços disponíveis

| Serviço | URL | Swagger |
|---|---|---|
| core-service | http://localhost:4001 | http://localhost:4001/docs |
| ticket-service | http://localhost:4002 | http://localhost:4002/docs |
| notification-service | http://localhost:4003 | — |
| Adminer (DB GUI) | http://localhost:8080 | — |
| RabbitMQ Management | http://localhost:15672 | login: `admin` / `admin` |

### Usuários de exemplo (seed)

Criados automaticamente no primeiro start (`SEED_DB=true` no `docker-compose.yml`):

| Nome | E-mail | Senha | Perfil |
|---|---|---|---|
| Admin Síndico | sindico@condogest.com | senha123 | SINDICO |
| João Morador | joao@condogest.com | senha123 | MORADOR |
| Maria Moradora | maria@condogest.com | senha123 | MORADOR |

Condomínio: **Residencial Aurora** com apartamentos 101-A, 201-A, 102-B e 202-B.

> **SINDICO** tem acesso a todos os endpoints.  
> **MORADOR** tem acesso somente a leitura de usuários/condomínios, e leitura/escrita em tickets e manutenções.

### Variáveis de ambiente

O arquivo `backend/.env` já está pronto para desenvolvimento local. Variáveis relevantes:

```env
JWT_SECRET=troque-em-producao
SEED_DB=true

# notification-service — deixe em branco para desabilitar notificações
GMAIL_USER=seu@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
FIREBASE_CREDENTIALS_PATH=./services/notification-service/firebase-credentials.json
```

### Parar / limpar

```bash
docker compose down          # para, mantém os dados
docker compose down -v       # para e apaga volumes (banco zerado)
```

### Desenvolver fora do Docker (hot-reload)

```bash
# Sobe apenas infra
docker compose up -d postgres rabbitmq

# Em terminais separados (da pasta backend/):
npm run start:core
npm run start:ticket
npm run start:notification
```

### Validar o backend com testes HTTP

Com os serviços rodando, execute a bateria de 34 testes dos caminhos críticos:

```bash
cd backend
bash test-api.sh
```

---

## 2. Web (painel do síndico)

Aplicação Next.js com login exclusivo para o perfil **SINDICO**. Módulos: dashboard de estatísticas e relatórios (geração, listagem, exportação PDF/Excel).

### Configurar

```bash
cd web
cp .env.example .env.local
```

O `.env.example` já aponta para o Docker local:

```env
NEXT_PUBLIC_CORE_API_URL=http://localhost:4001/v1
NEXT_PUBLIC_TICKET_API_URL=http://localhost:4002/v1
```

### Rodar em desenvolvimento

```bash
cd web
npm install
npm run dev
```

Acesse **http://localhost:3000** e entre com `sindico@condogest.com / senha123`.

### Build para produção

```bash
npm run build
npm run start
```

---

## 3. Mobile (app Flutter)

App para **síndico e moradores**. Roda em Android, iOS e Flutter Web.

### Configurar a URL do backend

Edite `mobile_condogest/lib/core/network/api_endpoints.dart`:

```dart
static String get _host {
  if (kIsWeb) return 'localhost';          // Flutter Web → acessa direto
  // return '10.0.2.2';                   // Android Emulator → descomente esta
  // return '192.168.1.XXX';              // Dispositivo físico → IP da máquina
  return 'localhost';
}
```

### Rodar

```bash
cd mobile_condogest
flutter pub get

flutter run                  # Android/iOS (dispositivo ou emulador conectado)
flutter run -d chrome        # Flutter Web
flutter devices              # listar dispositivos disponíveis
```

### Funcionalidades

| Módulo | SINDICO | MORADOR |
|---|---|---|
| Login / cadastro | ✅ | ✅ |
| Dashboard | ✅ | — |
| Condomínios (CRUD) | ✅ | — |
| Apartamentos (CRUD) | ✅ | — |
| Tickets (chamados) | ✅ listar / editar | ✅ criar / listar |
| Manutenções | ✅ | ✅ visualizar |
| Prestadores | ✅ | — |
| Notificações push | ✅ Android/iOS | ✅ Android/iOS |

> **Notificações push no web/desktop:** FCM (Firebase Cloud Messaging) não tem suporte oficial para Flutter Web nem para Linux/Windows. O app desabilita o FCM automaticamente nessas plataformas.

---

## Estado atual do projeto

### Backend ✅ Concluído
- core-service: auth JWT, CRUD completo de condomínios e apartamentos, publicação de eventos RabbitMQ
- ticket-service: tickets, manutenções, prestadores, relatórios (PDF/Excel), dashboard de estatísticas, consumidor de snapshots do core
- notification-service: implementado, requer credenciais Firebase e Gmail para operar

### Web ✅ Concluído
- Autenticação (perfil SINDICO)
- Dashboard de estatísticas (tickets abertos, manutenções, etc.)
- Módulo de relatórios: geração mensal/customizada, listagem, exportação PDF e Excel

### Mobile ✅ Concluído
- Autenticação (SINDICO e MORADOR)
- Gestão de condomínios e apartamentos
- Tickets e manutenções (criação, listagem, detalhamento)
- Prestadores de serviço
- Notificações push (Android/iOS)

---

## Problemas conhecidos e soluções aplicadas.

| Problema | Causa | Status |
|---|---|---|
| core-service em crash loop ao subir | Migration `0001_add_user_id_to_apartments.sql` ausente no disco | ✅ Arquivo no-op criado em `drizzle/` |
| Tabela `reports` inexistente (500 em `/v1/reports/*`) | Migration `0007_condogest_ticket_reports.sql` não estava no journal | ✅ Adicionada ao journal, rebuild aplicado |
| `FirebaseException` no Flutter Web ao fazer login | `FirebaseMessaging.instance` chamado no construtor antes do guard `kIsWeb` | ✅ Campo `_fcm` marcado como `late` |
| Crash no dropdown de tickets do `MaintenanceFormView` | `_loadingTickets` inicializado como `false`, dropdown renderizava com lista vazia | ✅ Inicializado como `true` |
