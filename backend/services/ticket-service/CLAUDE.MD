# Ticket Service - Instruções para o Gemini

Coração operacional do CondoGest.

## Módulos e Entidades
1.  **Ticket**: `title`, `description`, `location`, `status`, `resident_id`, `apartment_id`.
2.  **Maintenance**: `ticket_id`, `provider_id`, `status`, `value`, `execution_date`.
3.  **Provider**: `name`, `phone`, `specialty`.

## Fluxo de Eventos
Toda alteração de estado relevante deve ser publicada no **RabbitMQ**:
- `ticket.created`: Disparado ao abrir um novo chamado.
- `ticket.resolved`: Disparado ao finalizar um chamado.
- `maintenance.scheduled`: Disparado ao agendar um prestador.

## Integração
- Este serviço deve consultar o `core-service` via REST para validar se um `resident_id` ou `apartment_id` existe.
- Atua como o **Publisher** principal do sistema.
