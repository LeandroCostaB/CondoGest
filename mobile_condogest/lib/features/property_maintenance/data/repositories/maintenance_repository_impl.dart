import '../../domain/entities/maintenance_entity.dart';
import '../../domain/repositories/maintenance_repository.dart';
import '../datasources/maintenance_local_datasource.dart';
import '../models/maintenance_model.dart';

class MaintenanceRepositoryImpl implements MaintenanceRepository {
  final MaintenanceLocalDatasource _datasource;

  MaintenanceRepositoryImpl(this._datasource);

  @override
  Future<List<Maintenance>> getAllMaintenances() async {
    return await _datasource.getAllMaintenances();
  }

  @override
  Future<void> saveMaintenance(Maintenance maintenance) async {
    final model = MaintenanceModel.fromEntity(maintenance);
    await _datasource.insertMaintenance(model);
  }

  @override
  Future<void> updateMaintenance(Maintenance maintenance) async {
    final model = MaintenanceModel.fromEntity(maintenance);
    await _datasource.updateMaintenance(model);
  }

  @override
  Future<void> updateMaintenanceStatus(String id, String newStatus) async {
    await _datasource.updateMaintenanceStatus(id, newStatus);
  }

  @override
  Future<void> deleteMaintenance(String id) async {
    await _datasource.deleteMaintenance(id);
  }
}
