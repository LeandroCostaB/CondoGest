# CondoGest — Mobile

Aplicativo mobile de gestão condominial desenvolvido em Flutter. Permite que **síndicos** gerenciem imóveis, manutenções e chamados, e que **moradores** acompanhem e abram tickets de suporte, com sincronização via API REST e persistência local.

---

## Descrição do App

O CondoGest Mobile é parte do sistema integrado CondoGest. Ele oferece:

- **Perfil Síndico:** cadastro e gestão de condomínios, andares e unidades; acompanhamento de manutenções; visualização e triagem de tickets.
- **Perfil Morador:** abertura e acompanhamento de tickets de suporte; visualização de dados do apartamento; edição de perfil.
- **Notificações Push:** recebimento de avisos em tempo real via Firebase Cloud Messaging.
- **Modo offline parcial:** dados de tickets e manutenções armazenados localmente em SQLite.

---

## Como Executar

### Pré-requisitos

| Ferramenta | Versão mínima |
|---|---|
| Flutter SDK | 3.22+ (Dart 3.11+) |
| Android Studio / Xcode | Qualquer versão compatível com Flutter 3.22 |
| Firebase | Projeto configurado (para push notifications) |

### Backend

O app depende de dois serviços REST em execução local:

| Serviço | URL padrão |
|---|---|
| Core API (auth, condominiums, apartments, maintenances, users, providers) | `http://localhost:4001/v1` |
| Ticket Service | `http://localhost:4002/v1` |

> **Android Emulator:** substitua `localhost` por `10.0.2.2` em `lib/core/network/api_endpoints.dart` ao rodar em emulador.

### Passos

```bash
# 1. Instalar dependências
cd mobile_condogest
flutter pub get

# 2. Rodar em modo debug (Android/iOS/Web/Desktop)
flutter run

# 3. Escolher dispositivo (se houver múltiplos)
flutter run -d <device-id>
```

---

## Padrão Arquitetural e Padrões de Projeto

### Arquitetura: MVVM

O projeto segue o padrão **MVVM (Model — ViewModel — View)** organizado por features:

```
lib/features/<nome>/
├── data/
│   ├── datasources/    # acesso à API e ao banco local
│   ├── models/         # DTOs com serialização JSON
│   └── repositories/   # implementações de contratos
├── domain/
│   ├── entities/       # objetos puros de domínio (Model)
│   └── repositories/   # interfaces/contratos
└── presentation/
    ├── pages/          # widgets de tela (View)
    ├── viewmodels/     # lógica de estado via ChangeNotifier (ViewModel)
    └── widgets/        # componentes reutilizáveis
```

### Padrões adicionais implementados

**Singleton**
Garante uma única instância de componentes críticos:
- `DatabaseHelper` — gerencia a conexão SQLite; usa factory constructor com campo estático `_instance`.
- `ApiClient` — cliente HTTP com gerenciamento de token Bearer; mesmo padrão de factory.
- `PushNotificationService.instance` — inicialização e registro do token FCM.

**Observer (via Provider + ChangeNotifier)**
As ViewModels notificam a UI automaticamente ao chamar `notifyListeners()`. As Views consomem as mudanças via `Consumer<T>` ou `context.watch<T>()`, sem acoplamento direto — implementação canônica do padrão Observer do GoF no Flutter.

---

## API Utilizada

Todos os endpoints são REST/JSON sobre HTTP. Exemplos:

| Recurso | Método | Endpoint |
|---|---|---|
| Login | POST | `/auth/login` |
| Registro | POST | `/auth/register` |
| Perfil autenticado | GET | `/auth/me` |
| Listar condomínios | GET | `/condominiums` |
| Criar condomínio | POST | `/condominiums` |
| Detalhes condomínio | GET | `/condominiums/:id` |
| Listar apartamentos | GET | `/condominiums/:id/apartments` |
| Listar tickets | GET | `/tickets` |
| Criar ticket | POST | `/tickets` |
| Atualizar ticket | PUT | `/tickets/:id` |
| Listar manutenções | GET | `/maintenances` |
| Criar manutenção | POST | `/maintenances` |
| FCM Token | PATCH | `/users/fcm-token` |

A autenticação é feita via **JWT Bearer Token** armazenado em `SharedPreferences` e injetado automaticamente pelo `ApiClient`.

---

## Armazenamento Local

### SQLite (`sqflite`)

Banco relacional local com 8 tabelas:

| Tabela | Descrição |
|---|---|
| `Users` | Dados do usuário autenticado |
| `Properties` | Condomínios cadastrados |
| `Units` | Unidades/apartamentos |
| `Providers` | Prestadores de serviço |
| `Residents` | Perfis de moradores |
| `Tickets` | Chamados de suporte (persistência offline) |
| `Maintenances` | Registros de manutenção |
| `RecurringMaintenances` | Manutenções recorrentes programadas |

Os dados são recuperados automaticamente ao reabrir o app. O banco é inicializado em `lib/core/database/database_helper.dart` usando o padrão Singleton.

### SharedPreferences

Usado para persistir dados leves de sessão:
- `access_token` — JWT para autenticação nas requisições
- Dados básicos do usuário logado (cache de sessão)
