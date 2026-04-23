# CondoGest Backend

Backend em arquitetura de microserviços para gestão de condomínios.

## Estrutura de Microserviços

- **`core-service`**: Cadastro de usuários, condomínios e moradores.
- **`ticket-service`**: Operação de tickets e manutenções.
- **`notification-service`**: Disparo de comunicações.

## Comunicação
Os serviços se comunicam via RabbitMQ para eventos assíncronos e via REST para consultas síncronas.

## Como rodar
Veja o `GEMINI.MD` em cada pasta para instruções específicas.
