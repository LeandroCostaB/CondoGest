# CondoGest — Backend

Backend em arquitetura de microserviços para gestão de condomínios.

## Serviços

| Serviço               | Porta  | Descrição                                      |
|-----------------------|--------|------------------------------------------------|
| `core-service`        | `3000` | Autenticação, usuários, condomínios, apartamentos |
| `ticket-service`      | `3001` | Tickets, manutenções e prestadores de serviço  |
| PostgreSQL            | `5432` | Banco de dados relacional                      |
| RabbitMQ              | `5672` | Mensageria entre serviços                      |
| RabbitMQ Management   | `15672`| Painel de administração do RabbitMQ            |
| Adminer               | `8080` | UI web para inspecionar os bancos de dados     |

## Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/) >= 24
- [Docker Compose](https://docs.docker.com/compose/) >= 2.20

---

## Como rodar

### 1. Configurar variáveis de ambiente

Copie o arquivo de exemplo e ajuste se necessário:

```bash
cp .env.example .env
```

Para subir com dados iniciais de teste, edite o `.env` e defina:

```env
SEED_DB=true
```

> O seed é idempotente — se o banco já tiver dados, ele é ignorado automaticamente.

### 2. Subir todos os serviços

```bash
docker compose up -d --build
```

Para reiniciar do zero (apaga volumes e recria tudo):

```bash
docker compose down -v && docker compose up -d --build
```

### 3. Verificar se os serviços estão rodando

```bash
docker compose ps
docker logs condogest-core   # logs do core-service
docker logs condogest-ticket # logs do ticket-service
```

Quando o core-service estiver pronto, você verá:
```
✅ Drizzle conectado e migrations aplicadas com sucesso
[SeedService] Seed concluído com sucesso.
[NestApplication] Nest application successfully started
```

---

## Documentação da API (Swagger)

| Serviço          | URL                                        |
|------------------|--------------------------------------------|
| core-service     | http://localhost:3000/docs                 |
| ticket-service   | http://localhost:3001/docs                 |

No Swagger, clique em **Authorize** e cole o `access_token` obtido no login para testar os endpoints protegidos.

---

## Usuários de teste (seed)

Disponíveis quando `SEED_DB=true`:

| Nome           | E-mail                    | Senha      | Papel    |
|----------------|---------------------------|------------|----------|
| Admin Síndico  | sindico@condogest.com     | `senha123` | SINDICO  |
| João Morador   | joao@condogest.com        | `senha123` | MORADOR  |
| Maria Moradora | maria@condogest.com       | `senha123` | MORADOR  |

**Diferença de permissões:**
- `SINDICO` — acesso total a todos os endpoints.
- `MORADOR` — pode ler e criar tickets, consultar manutenções e prestadores, e ver dados de usuários.

---

## Testando com curl

### Autenticação

**Login (obtém o JWT):**
```bash
curl -s -X POST http://localhost:3000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sindico@condogest.com","senha":"senha123"}'
```

Resposta:
```json
{
  "access_token": "<jwt>",
  "user": { "id": "...", "nome": "Admin Síndico", "role": "SINDICO", "permissions": [...] }
}
```

Salve o token para usar nas próximas requisições:
```bash
TOKEN=$(curl -s -X POST http://localhost:3000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sindico@condogest.com","senha":"senha123"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")
```

**Registrar novo usuário:**
```bash
curl -s -X POST http://localhost:3000/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nome":"Novo Morador","email":"novo@condogest.com","senha":"senha123","role":"MORADOR"}'
```

**Ver perfil do usuário autenticado:**
```bash
curl -s http://localhost:3000/v1/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

**Listar todos os usuários:**
```bash
curl -s http://localhost:3000/v1/auth/list \
  -H "Authorization: Bearer $TOKEN"
```

---

### Core-service — Condomínios e Apartamentos

**Listar condomínios:**
```bash
curl -s http://localhost:3000/v1/condominiums \
  -H "Authorization: Bearer $TOKEN"
```

**Listar apartamentos de um condomínio:**
```bash
curl -s http://localhost:3000/v1/condominiums/<condominium_id>/apartments \
  -H "Authorization: Bearer $TOKEN"
```

---

### Ticket-service — Tickets, Manutenções e Prestadores

> O JWT emitido pelo `core-service` é aceito pelo `ticket-service` diretamente.

**Listar tickets:**
```bash
curl -s http://localhost:3001/v1/tickets \
  -H "Authorization: Bearer $TOKEN"
```

**Criar ticket:**
```bash
curl -s -X POST http://localhost:3001/v1/tickets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Porta com defeito",
    "description": "A fechadura do apartamento está travando.",
    "location": "Porta de entrada",
    "residentId": "24b8e62f-4c7a-4481-b07c-329664c9e194",
    "apartmentId": "a9dd0e45-dbfb-4b34-a41e-3d12cfb1f1ce"
  }'
```

**Listar prestadores:**
```bash
curl -s http://localhost:3001/v1/providers \
  -H "Authorization: Bearer $TOKEN"
```

**Listar manutenções:**
```bash
curl -s http://localhost:3001/v1/maintenances \
  -H "Authorization: Bearer $TOKEN"
```

---

## Dados de seed disponíveis

Com `SEED_DB=true`, os seguintes dados são criados automaticamente:

**Condomínio:**
- Residencial Aurora — `Rua das Flores, 100 - Vila Madalena - São Paulo/SP`

**Apartamentos:**
| ID (fixo)                              | Número | Bloco | Andar |
|----------------------------------------|--------|-------|-------|
| a9dd0e45-dbfb-4b34-a41e-3d12cfb1f1ce  | 101    | A     | 1     |
| b2c3d4e5-f6a7-8901-bcde-f12345678901  | 201    | A     | 2     |
| c3d4e5f6-a7b8-9012-cdef-012345678902  | 102    | B     | 1     |
| d4e5f6a7-b8c9-0123-def0-123456789012  | 202    | B     | 2     |

**Prestadores (ticket-service):**
| Nome               | Especialidade |
|--------------------|---------------|
| Encanamentos Total | PLUMBER       |
| Elétrica Rápida    | ELECTRICIAN   |
| Pintura & Arte     | PAINTER       |

**Tickets (ticket-service):**
| Título                     | Status      |
|----------------------------|-------------|
| Vazamento na cozinha       | OPEN        |
| Curto circuito no quarto   | IN_PROGRESS |
| Infiltração no teto da sala| RESOLVED    |

---

## Variáveis de ambiente

| Variável            | Padrão     | Descrição                                                   |
|---------------------|------------|-------------------------------------------------------------|
| `POSTGRES_USER`     | `condogest`| Usuário do PostgreSQL                                       |
| `POSTGRES_PASSWORD` | `condogest`| Senha do PostgreSQL                                         |
| `RABBITMQ_USER`     | `guest`    | Usuário do RabbitMQ                                         |
| `RABBITMQ_PASS`     | `guest`    | Senha do RabbitMQ                                           |
| `JWT_SECRET`        | —          | Segredo para assinar os tokens JWT (troque em produção)     |
| `SEED_DB`           | `false`    | `true` para popular o banco com dados iniciais no primeiro boot |
