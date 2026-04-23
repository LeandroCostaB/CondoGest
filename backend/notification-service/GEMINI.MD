# Notification Service - Instruções para o Gemini

Consumidor de eventos para disparar comunicações.

## Funcionamento
- Não possui banco de dados.
- Escuta as filas do RabbitMQ publicadas pelo `ticket-service`.
- Traduz os eventos em mensagens amigáveis para o usuário.

## Exemplos de Notificação
- Se receber `ticket.created` -> Enviar e-mail para o síndico.
- Se receber `ticket.resolved` -> Enviar push para o morador.
- Se receber `maintenance.scheduled` -> Enviar SMS/WhatsApp para o morador e prestador.

## Padrões
- Utilize o `@nestjs/microservices` para configurar o transportador RabbitMQ.
