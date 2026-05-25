# CondoGest

Sistema de gestão de condomínios em arquitetura de microserviços — NestJS, Drizzle ORM, PostgreSQL e RabbitMQ.

## Estrutura do repositório

```
CondoGest/
├── backend/          # Todos os microserviços e infraestrutura
│   ├── core-service/     # Usuários, condomínios e apartamentos
│   ├── ticket-service/   # Tickets, manutenções e prestadores
│   ├── docker/           # Scripts de inicialização do PostgreSQL
│   └── docker-compose.yml
└── README.md
```

Para instruções completas de execução e testes, consulte o [README do backend](backend/README.md).
