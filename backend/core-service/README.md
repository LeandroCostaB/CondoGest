# CondoGest — Core Service

Microserviço responsável por autenticação, usuários, condomínios e apartamentos.

- **Porta:** `3000`
- **Swagger:** http://localhost:3000/docs
- **Banco:** `condogest_core` (PostgreSQL)

Para instruções completas de execução e testes, consulte o [README do backend](../README.md).

## Endpoints principais

| Método | Rota                                          | Auth | Descrição                          |
|--------|-----------------------------------------------|------|------------------------------------|
| POST   | `/v1/auth/register`                           | —    | Registrar novo usuário             |
| POST   | `/v1/auth/login`                              | —    | Login e obtenção do JWT            |
| GET    | `/v1/auth/me`                                 | JWT  | Dados do usuário autenticado       |
| GET    | `/v1/auth/list`                               | JWT  | Listar todos os usuários           |
| PATCH  | `/v1/auth/fcm-token`                          | JWT  | Atualizar token de notificação     |
| PATCH  | `/v1/auth/:id`                                | JWT  | Atualizar dados de um usuário      |
| DELETE | `/v1/auth/:id`                                | JWT  | Remover usuário                    |
| GET    | `/v1/condominiums`                            | JWT  | Listar condomínios                 |
| POST   | `/v1/condominiums`                            | JWT  | Criar condomínio                   |
| GET    | `/v1/condominiums/:id`                        | JWT  | Buscar condomínio por ID           |
| PUT    | `/v1/condominiums/:id`                        | JWT  | Atualizar condomínio               |
| DELETE | `/v1/condominiums/:id`                        | JWT  | Remover condomínio                 |
| GET    | `/v1/condominiums/:id/apartments`             | JWT  | Listar apartamentos do condomínio  |
| POST   | `/v1/condominiums/:id/apartments`             | JWT  | Criar apartamento                  |

## Desenvolvimento local

```bash
npm install
# Configure DATABASE_URL, RABBITMQ_URL e JWT_SECRET no .env
npm run start:dev
```

Scripts disponíveis:

| Script              | Descrição                                        |
|---------------------|--------------------------------------------------|
| `npm run start:dev` | Modo desenvolvimento com hot reload              |
| `npm run build`     | Build de produção (webpack)                      |
| `npm run db:generate` | Gerar migration a partir dos schemas           |
| `npm run db:push`   | Sincronizar schema no banco sem migration        |
| `npm run db:studio` | Abrir Drizzle Studio                             |
