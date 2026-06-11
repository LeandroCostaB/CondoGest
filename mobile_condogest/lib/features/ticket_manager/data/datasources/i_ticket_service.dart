import '../../domain/entities/ticket.dart';

abstract class ITicketService {
  Future<List<Ticket>> getAll();
  Future<Ticket?> getById(String id);
  Future<List<Ticket>> getByResident(String residentId);
  Future<List<Ticket>> getByApartment(String apartmentId);
  Future<List<Ticket>> getByCondominium(String condominiumId);
  Future<Ticket> create(Ticket ticket);
  Future<Ticket?> update(Ticket ticket);
  Future<bool> delete(String id);
}
