// Base URLs para Android emulator (10.0.2.2 = localhost do host).
// Para iOS simulator ou dispositivo físico, troque por 'localhost' ou IP da máquina.
class ApiEndpoints {
  static const String coreBase = 'http://localhost:3000/v1';
  static const String ticketBase = 'http://localhost:3001/v1';

  // Auth (core-service)
  static const String login = '$coreBase/auth/login';
  static const String register = '$coreBase/auth/register';
  static const String me = '$coreBase/auth/me';

  // Condomínios (core-service)
  static const String condominiums = '$coreBase/condominiums';
  static String condominiumById(String id) => '$coreBase/condominiums/$id';
  static String activateCondominium(String id) =>
      '$coreBase/condominiums/$id/activate';
  static String deactivateCondominium(String id) =>
      '$coreBase/condominiums/$id/deactivate';

  // Apartamentos (core-service) — aninhados no condomínio
  static String apartments(String condominiumId) =>
      '$coreBase/condominiums/$condominiumId/apartments';
  static String apartmentById(String condominiumId, String apartmentId) =>
      '$coreBase/condominiums/$condominiumId/apartments/$apartmentId';

  // Tickets (ticket-service)
  static const String tickets = '$ticketBase/tickets';
  static String ticketById(String id) => '$ticketBase/tickets/$id';
  static String ticketsByResident(String residentId) =>
      '$ticketBase/tickets/resident/$residentId';
  static String ticketsByApartment(String apartmentId) =>
      '$ticketBase/tickets/apartment/$apartmentId';

  // Manutenções (ticket-service)
  static const String maintenances = '$ticketBase/maintenances';
  static String maintenanceById(String id) => '$ticketBase/maintenances/$id';
  static String maintenancesByTicket(String ticketId) =>
      '$ticketBase/maintenances/ticket/$ticketId';

  // Prestadores (ticket-service)
  static const String providers = '$ticketBase/providers';
  static String providerById(String id) => '$ticketBase/providers/$id';
}
