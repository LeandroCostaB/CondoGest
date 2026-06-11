import 'package:flutter/foundation.dart' show kIsWeb;

/// URLs base dos serviços.
///
/// Regras de host:
///  - Flutter Web  → localhost  (browser acessa direto o host da máquina)
///  - Android Emu  → 10.0.2.2  (o emulador mapeia localhost do host para 10.0.2.2)
///  - iOS Sim / físico → localhost ou IP real da máquina
class ApiEndpoints {
  ApiEndpoints._();

  static String get _host {
    if (kIsWeb) return 'localhost';
    // Para Android emulator descomente a linha abaixo e comente a seguinte:
    // return '10.0.2.2';
    return 'localhost';
  }

  static String get coreBase  => 'http://$_host:4001/v1';
  static String get ticketBase => 'http://$_host:4002/v1';

  // ── Auth (core-service) ───────────────────────────────────────────────────
  static String get login    => '$coreBase/auth/login';
  static String get register => '$coreBase/auth/register';
  static String get me       => '$coreBase/auth/me';
  static String get updateMe => '$coreBase/auth/me';

  // ── Condomínios (core-service) ────────────────────────────────────────────
  static String get condominiums => '$coreBase/condominiums';
  static String condominiumById(String id)    => '$coreBase/condominiums/$id';
  static String activateCondominium(String id)   => '$coreBase/condominiums/$id/activate';
  static String deactivateCondominium(String id) => '$coreBase/condominiums/$id/deactivate';

  // ── Apartamentos (core-service) — aninhados no condomínio ────────────────
  static String apartments(String condominiumId) =>
      '$coreBase/condominiums/$condominiumId/apartments';
  static String apartmentById(String condominiumId, String apartmentId) =>
      '$coreBase/condominiums/$condominiumId/apartments/$apartmentId';
  static String apartmentResident(String condominiumId, String apartmentId) =>
      '$coreBase/condominiums/$condominiumId/apartments/$apartmentId/resident';

  // ── Usuários (core-service) ───────────────────────────────────────────────
  static String get users      => '$coreBase/users';
  static String userById(String id)   => '$coreBase/users/$id';
  static String updateUser(String id) => '$coreBase/users/$id';
  static String get residents => '$coreBase/auth/residents';

  // ── Tickets (ticket-service) ──────────────────────────────────────────────
  static String get tickets => '$ticketBase/tickets';
  static String ticketById(String id)                     => '$ticketBase/tickets/$id';
  static String get ticketsMine => '$ticketBase/tickets/mine';
  static String ticketsByApartment(String apartmentId)    => '$ticketBase/tickets/apartment/$apartmentId';
  static String ticketsByCondominium(String condominiumId) => '$ticketBase/tickets/condominium/$condominiumId';

  // ── Manutenções (ticket-service) ─────────────────────────────────────────
  static String get maintenances => '$ticketBase/maintenances';
  static String maintenanceById(String id)                => '$ticketBase/maintenances/$id';
  static String maintenancesByTicket(String ticketId)     => '$ticketBase/maintenances/ticket/$ticketId';
  static String maintenancesByApartment(String apartmentId) => '$ticketBase/maintenances/apartment/$apartmentId';

  // ── Prestadores (ticket-service) ─────────────────────────────────────────
  static String get providers => '$ticketBase/providers';
  static String providerById(String id) => '$ticketBase/providers/$id';
}
