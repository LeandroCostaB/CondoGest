import '../../domain/entities/ticket.dart';
import '../../domain/repositories/ticket_repository.dart';
import '../datasources/ticket_local_datasource.dart';
import '../models/ticket_model.dart';

class TicketRepositoryImpl implements TicketRepository {
  final TicketLocalDatasource _datasource;

  TicketRepositoryImpl(this._datasource);

  @override
  Future<void> saveTicket(Ticket ticket) async {
    await _datasource.insertTicket(TicketModel.fromEntity(ticket));
  }

  @override
  Future<List<Ticket>> getAllTickets({
    String? propertyId,
    String? residentId,
  }) async {
    return _datasource.getAllTickets(
      propertyId: propertyId,
      residentId: residentId,
    );
  }

  @override
  Future<void> updateTicketStatus(String ticketId, String newStatus) async {
    await _datasource.updateTicketStatus(ticketId, newStatus);
  }

  @override
  Future<void> updateTicket(Ticket ticket) async {
    await _datasource.updateTicket(TicketModel.fromEntity(ticket));
  }
}
