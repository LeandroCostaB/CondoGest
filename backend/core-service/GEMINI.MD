# Core Service - Instruções para o Gemini

Este serviço gerencia o núcleo estável da aplicação.

## Módulos e Entidades
1.  **User**: `name`, `email`, `password_hash`, `type` (SINDICO, MORADOR).
2.  **Condominium**: `name`, `address`, `manager_id` (FK User).
3.  **Apartment**: `number`, `block`, `floor`, `condominium_id` (FK Condominium).
4.  **Resident**: `user_id` (FK User), `apartment_id` (FK Apartment), `phone`.

## Regras de Negócio
- Um `User` pode ser `SINDICO` de múltiplos condomínios.
- Um `MORADOR` deve estar obrigatoriamente vinculado a um `Apartment` através da entidade `Resident`.
- Apenas usuários logados podem ver seus próprios dados (`/users/me`).

## Padrões de Implementação
Siga rigorosamente o template de 3 camadas:
- **Domain**: Entidades ricas e Interfaces de Repositório.
- **Application**: DTOs e Services (Casos de Uso).
- **Infra**: Controllers, Schemas Drizzle e Implementações de Repositório.

Exemplo de injeção de repositório:
```typescript
@Inject(USER_REPOSITORY)
private readonly userRepository: UserRepository
```
