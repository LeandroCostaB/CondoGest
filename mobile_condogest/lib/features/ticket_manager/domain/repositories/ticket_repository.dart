import '../../domain/entities/ticket.dart';

abstract class TicketRepository {
  Future<void> saveTicket(Ticket ticket);
  Future<List<Ticket>> getAllTickets({String? propertyId, String? residentId});
  Future<void> updateTicketStatus(String ticketId, String newStatus);
  Future<void> updateTicket(Ticket ticket);
}
