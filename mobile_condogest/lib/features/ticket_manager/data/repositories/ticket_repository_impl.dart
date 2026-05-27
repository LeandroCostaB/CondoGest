import '../../domain/entities/ticket.dart';
import '../../domain/repositories/ticket_repository.dart';
import '../datasources/ticket_local_datasource.dart';
import '../models/ticket_model.dart';

class TicketRepositoryImpl implements TicketRepository {
  final TicketLocalDatasource _datasource;

  TicketRepositoryImpl(this._datasource);

  @override
  Future<void> saveTicket(Ticket ticket) async {
    // Convert Entity to Model for the Data layer
    final ticketModel = TicketModel.fromEntity(ticket);
    await _datasource.insertTicket(ticketModel);
  }

  @override
  Future<List<Ticket>> getAllTickets({int? propertyId, int? residentId}) async {
    return await _datasource.getAllTickets(propertyId: propertyId, residentId: residentId);
  }

  @override
  Future<void> updateTicketStatus(int ticketId, String newStatus) async {
    await _datasource.updateTicketStatus(ticketId, newStatus);
  }

  @override
  Future<void> updateTicket(Ticket ticket) async {
    final ticketModel = TicketModel.fromEntity(ticket);
    await _datasource.updateTicket(ticketModel);
  }
}
