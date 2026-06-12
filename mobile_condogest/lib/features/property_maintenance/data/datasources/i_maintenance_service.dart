import '../../domain/entities/maintenance_entity.dart';

abstract class IMaintenanceService {
  Future<List<Maintenance>> getAll();
  Future<Maintenance> create(Maintenance maintenance);
  Future<Maintenance?> update(Maintenance maintenance);
  Future<bool> delete(int id);
}
