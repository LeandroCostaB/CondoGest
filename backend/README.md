# CondoGest — Monorepo de Microservicos

Projeto de gestao de condominios organizado como um monorepo com servicos NestJS independentes, bancos separados por contexto e comunicacao assincrona via RabbitMQ.

Cada micro-servico possui:

- API HTTP com prefixo global `/v1`
- documentacao Swagger em `/docs`
- banco PostgreSQL proprio (exceto `notification-service`, que e stateless)
- integracao por eventos para manter projecoes locais entre contextos
- autenticacao JWT e autorizacao por permissoes

## O que o projeto cobre

O dominio foi separado em tres contextos:

| Micro-servico | Porta padrao | Banco padrao | Responsabilidade principal |
| --- | --- | --- | --- |
| `core-service` | `4001` | `condogest_core` | Usuarios, condominios, apartamentos e autenticacao |
| `ticket-service` | `4002` | `condogest_ticket` | Chamados, manutencoes, prestadores e relatorios |
| `notification-service` | `4003` | — | Envio de e-mail (Gmail) e notificacoes push (Firebase) |

## Relacao entre os servicos

| Micro-servico | Publica eventos | Consome eventos |
| --- | --- | --- |
| `core-service` | `user.created/updated/deleted`, `condominium.created/updated/deleted`, `apartment.created/updated/deleted` | Nenhum |
| `ticket-service` | `ticket.created`, `ticket.status-changed`, `maintenance.completed/scheduled/status-changed` | Usuarios, condominios e apartamentos do `core-service` |
| `notification-service` | Nenhum | Eventos de ticket e manutencao do `ticket-service` |

O `ticket-service` mantem projecoes locais (snapshots) de usuarios, condominios e apartamentos consumindo os eventos do `core-service`. Por isso, o ideal e subir todos os servicos antes de comecar a cadastrar dados.

## Pre-requisitos

- Node.js com `npm`
- PostgreSQL
- RabbitMQ
- Docker e Docker Compose

Voce pode usar uma unica instancia do PostgreSQL com dois bancos criados:

- `condogest_core`
- `condogest_ticket`

## Variaveis de ambiente

### `core-service` (`services/core-service/.env.example`)

```env
PORT=4001
JWT_SECRET=super-secret
DATABASE_URL=postgres://condogest:condogest@localhost:5432/condogest_core
RABBITMQ_URL=amqp://guest:guest@localhost:5672
SEED_DB=false
```

### `ticket-service` (`services/ticket-service/.env.example`)

```env
PORT=4002
JWT_SECRET=super-secret
DATABASE_URL=postgres://condogest:condogest@localhost:5432/condogest_ticket
RABBITMQ_URL=amqp://guest:guest@localhost:5672
```

### `notification-service` (`services/notification-service/.env.example`)

```env
PORT=4003
RABBITMQ_URL=amqp://guest:guest@localhost:5672
GMAIL_USER=seu-email@gmail.com
GMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx
FIREBASE_CREDENTIALS_PATH=./firebase-credentials.json
```

Observacoes importantes:

- O `JWT_SECRET` deve ser o mesmo em todos os servicos.
- O `DATABASE_URL` muda de acordo com o banco de cada micro-servico.
- O `PORT` muda de acordo com o servico.
- Para o `notification-service`, gere uma "Senha de app" do Gmail em `myaccount.google.com/apppasswords`. O Firebase e opcional — deixe `FIREBASE_CREDENTIALS_PATH` em branco para desabilitar notificacoes push.

## Como rodar

### Com Docker Compose

O jeito mais rapido de subir todo o ambiente e usar o `docker-compose.yml` da raiz. Ele sobe:

- os 3 micro-servicos
- 1 instancia do PostgreSQL com 2 bancos separados
- 1 instancia do RabbitMQ
- 1 instancia do Adminer

Subir tudo com build:

```bash
docker compose up --build
```

Subir em background:

```bash
docker compose up --build -d
```

Parar os containers sem remover volumes:

```bash
docker compose down
```

Parar e remover containers, rede e volumes:

```bash
docker compose down -v
```

Se quiser recriar as imagens do zero:

```bash
docker compose build --no-cache
docker compose up -d
```

Endpoints uteis depois que o ambiente subir:

- `core-service`: `http://localhost:4001/docs`
- `ticket-service`: `http://localhost:4002/docs`
- `notification-service`: `http://localhost:4003/docs`
- Adminer: `http://localhost:8080`
- RabbitMQ Management: `http://localhost:15672`

Credenciais padrao:

- PostgreSQL: usuario `condogest`, senha `condogest`
- RabbitMQ: usuario `guest`, senha `guest`

No Adminer, use:

- Sistema: `PostgreSQL`
- Servidor: `postgres`
- Usuario: `condogest`
- Senha: `condogest`
- Base de dados: `condogest_core` ou `condogest_ticket`

Observacao: O script de criacao dos bancos roda na inicializacao do PostgreSQL. Se voce ja tiver um volume antigo sem os bancos criados, rode `docker compose down -v` antes de subir novamente.

### Rodando manualmente

Fluxo recomendado:

1. Inicie PostgreSQL e RabbitMQ.
2. Copie o `.env.example` para `.env` em cada servico.
3. Instale as dependencias de cada servico com `npm install`.
4. Rode as migrations de cada banco com `npm run db:migrate`.
5. Suba os servicos com `npm run start:dev`.

## Como rodar cada micro-servico

### `core-service`

Responsabilidade:
Gerencia os dados cadastrais base do sistema: usuarios, condominios e apartamentos. Tambem e responsavel por autenticacao (login/JWT) e controle de permissoes por role.

Principais rotas:
- `POST /v1/auth/register`
- `POST /v1/auth/login`
- `GET /v1/auth/me`
- `GET/PATCH/DELETE /v1/auth/:id`
- `GET/POST /v1/condominiums`
- `GET/PUT/DELETE /v1/condominiums/:id`
- `PATCH /v1/condominiums/:id/activate`
- `PATCH /v1/condominiums/:id/deactivate`
- `GET/POST /v1/condominiums/:id/apartments`
- `GET/PUT/DELETE /v1/condominiums/:id/apartments/:aptId`

Comandos:

```bash
cd services/core-service
cp .env.example .env
npm install
npm run db:migrate
npm run start:dev
```

Swagger: `http://localhost:4001/docs`

### `ticket-service`

Responsabilidade:
Gerencia chamados de manutencao, prestadores de servico e o ciclo de vida das manutencoes. Mantem projecoes locais de usuarios, condominios e apartamentos consumindo eventos do `core-service`. Tambem oferece relatorios em PDF e Excel.

Principais rotas:
- `GET/POST /v1/providers`
- `GET/PUT/DELETE /v1/providers/:id`
- `GET/POST /v1/tickets`
- `GET/PUT/DELETE /v1/tickets/:id`
- `GET /v1/tickets/resident/:residentId`
- `GET /v1/tickets/apartment/:apartmentId`
- `GET/POST /v1/maintenances`
- `GET/PUT/DELETE /v1/maintenances/:id`
- `GET /v1/maintenances/ticket/:ticketId`
- `GET /v1/reports`

Comandos:

```bash
cd services/ticket-service
cp .env.example .env
npm install
npm run db:migrate
npm run start:dev
```

Swagger: `http://localhost:4002/docs`

### `notification-service`

Responsabilidade:
Servico stateless que consome eventos de ticket e manutencao do `ticket-service` e dispara notificacoes por e-mail (Gmail) e push (Firebase Cloud Messaging). Nao expoe rotas de negocio.

Eventos consumidos:
- `ticket.created`, `ticket.status-changed`
- `maintenance.scheduled`, `maintenance.completed`, `maintenance.status-changed`

Comandos:

```bash
cd services/notification-service
cp .env.example .env
# Preencha GMAIL_USER e GMAIL_APP_PASSWORD no .env
npm install
npm run start:dev
```

Swagger: `http://localhost:4003/docs`

## Atalhos a partir da raiz

Depois que as dependencias de cada servico estiverem instaladas, voce tambem pode subir os processos a partir da raiz do monorepo:

```bash
npm run start:core
npm run start:ticket
npm run start:notification
```

## Autenticacao e permissoes

- O login e feito em `POST /v1/auth/login` do `core-service`.
- O token JWT emitido deve ser enviado como `Bearer Token` em todos os demais endpoints.
- O projeto possui dois roles:

| Role | Permissoes |
| --- | --- |
| `SINDICO` | Acesso total a todos os recursos |
| `MORADOR` | `users:read`, `tickets:read`, `tickets:write`, `maintenances:read`, `providers:read` |

## Usuarios seedados

Com `SEED_DB=true` (padrao no Docker Compose), o `core-service` cria automaticamente os seguintes usuarios e um condominio de exemplo:

| E-mail | Senha | Role |
| --- | --- | --- |
| `sindico@condogest.com` | `senha123` | SINDICO |
| `joao@condogest.com` | `senha123` | MORADOR |
| `maria@condogest.com` | `senha123` | MORADOR |

Condominio seedado: **Residencial Aurora** com 4 apartamentos (101-A, 201-A, 102-B, 202-B).

## Ordem sugerida para testes integrados

Se a ideia for testar o fluxo completo do dominio, esta ordem ajuda:

1. `core-service` — cadastrar usuarios, condominios e apartamentos
2. `ticket-service` — cadastrar prestadores, abrir chamados e registrar manutencoes
3. `notification-service` — ativo em segundo plano, envia notificacoes automaticamente ao processar eventos

Fluxo de negocio esperado:

1. Autenticar como sindico (`sindico@condogest.com`)
2. Cadastrar condominios e apartamentos no `core-service`
3. Associar moradores a apartamentos
4. Abrir chamados no `ticket-service`
5. Vincular manutencoes aos chamados e atribuir prestadores
6. O `notification-service` envia e-mails e pushs automaticamente conforme os eventos ocorrem
