import '../entities/maintenance_entity.dart';

abstract class MaintenanceRepository {
  Future<List<Maintenance>> getAllMaintenances();
  Future<void> saveMaintenance(Maintenance maintenance);
  Future<void> updateMaintenance(Maintenance maintenance);
  Future<void> updateMaintenanceStatus(String id, String newStatus);
  Future<void> deleteMaintenance(String id);
}
