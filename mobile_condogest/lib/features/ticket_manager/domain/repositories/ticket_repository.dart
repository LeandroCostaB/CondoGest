import '../../domain/entities/ticket.dart';

abstract class TicketRepository {
  /// Saves a ticket to the storage
  Future<void> saveTicket(Ticket ticket);

  /// Retrieves all tickets from the storage
  Future<List<Ticket>> getAllTickets();
}
