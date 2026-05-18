# CondoGest - Arquitetura de Microserviços

## Visão Geral
O backend do CondoGest é composto por microserviços desacoplados que se comunicam via **RabbitMQ** (assíncrono) e **REST** (síncrono apenas para referências estáveis).

### Serviços
1.  **`core-service`** (Porta: 3001)
    *   **Responsabilidade**: Cadastro base (Usuários, Condomínios, Apartamentos, Moradores).
    *   **Banco**: PostgreSQL + Drizzle ORM.
    *   **Padrão**: Clean Architecture + DDD.

2.  **`ticket-service`** (Porta: 3002)
    *   **Responsabilidade**: Gestão de chamados, manutenções e prestadores.
    *   **Papel**: Publisher de eventos (ex: `ticket.created`, `maintenance.scheduled`).

3.  **`notification-service`** (Porta: 3003)
    *   **Responsabilidade**: Disparo de e-mails, push e SMS.
    *   **Papel**: Consumer puro. Não possui banco de dados.

## Padrões de Código
- **Arquitetura**: Domain, Application, Infrastructure.
- **Injeção de Dependência**: Usar Tokens (`Symbol`) para interfaces de repositório.
- **Entidades**: Devem ser imutáveis com métodos `withX()` e `static restore()`.
- **Linter**: Biome (`npm run check`).

## Comunicação Inter-serviços
- Eventos devem seguir o padrão `modulo.evento` (ex: `ticket.status_changed`).
- O `ticket-service` deve publicar no RabbitMQ.
- O `notification-service` deve consumir as filas correspondentes.
