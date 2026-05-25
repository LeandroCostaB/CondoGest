import '../../domain/entities/maintenance_entity.dart';

abstract class IMaintenanceService {
  Future<List<Maintenance>> getAll();
  Future<Maintenance?> getById(String id);
  Future<List<Maintenance>> getByTicket(String ticketId);
  Future<Maintenance> create(Maintenance maintenance);
  Future<Maintenance?> update(Maintenance maintenance);
  Future<bool> delete(String id);
}
