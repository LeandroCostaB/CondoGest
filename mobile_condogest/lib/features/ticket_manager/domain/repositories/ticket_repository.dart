import '../../domain/entities/ticket.dart';

abstract class TicketRepository {
  /// Saves a ticket to the storage
  Future<void> saveTicket(Ticket ticket);

  /// Retrieves all tickets from the storage, optionally filtered by propertyId or residentId
  Future<List<Ticket>> getAllTickets({int? propertyId, int? residentId});

  /// Updates the status of a specific ticket
  Future<void> updateTicketStatus(int ticketId, String newStatus);

  /// Updates an existing ticket with new information
  Future<void> updateTicket(Ticket ticket);
}
