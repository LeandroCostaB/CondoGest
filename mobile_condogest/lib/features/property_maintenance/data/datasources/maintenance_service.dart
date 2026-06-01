import '../../../../core/network/api_client.dart';
import '../../../../core/network/api_endpoints.dart';
import '../../domain/entities/maintenance_entity.dart';
import '../models/maintenance_model.dart';
import 'i_maintenance_service.dart';

class MaintenanceService implements IMaintenanceService {
  final ApiClient _client = ApiClient();

  @override
  Future<List<Maintenance>> getAll() async {
    final data = await _client.get(ApiEndpoints.maintenances);
    final items = data['data'] as List<dynamic>;
    return items
        .map((e) => MaintenanceModel.fromApiJson(e as Map<String, dynamic>))
        .toList();
  }

  @override
  Future<Maintenance?> getById(String id) async {
    final data = await _client.get(ApiEndpoints.maintenanceById(id));
    return MaintenanceModel.fromApiJson(data as Map<String, dynamic>);
  }

  @override
  Future<List<Maintenance>> getByTicket(String ticketId) async {
    final data = await _client.get(ApiEndpoints.maintenancesByTicket(ticketId));
    final items = data as List<dynamic>;
    return items
        .map((e) => MaintenanceModel.fromApiJson(e as Map<String, dynamic>))
        .toList();
  }

  @override
  Future<Maintenance> create(Maintenance maintenance) async {
    final model = MaintenanceModel.fromEntity(maintenance);
    final data = await _client.post(
      ApiEndpoints.maintenances,
      model.toApiJson(),
    );
    return MaintenanceModel.fromApiJson(data as Map<String, dynamic>);
  }

  @override
  Future<Maintenance?> update(Maintenance maintenance) async {
    final model = MaintenanceModel.fromEntity(maintenance);
    await _client.put(
      ApiEndpoints.maintenanceById(maintenance.id!),
      model.toApiJson(),
    );
    return maintenance;
  }

  @override
  Future<bool> delete(String id) async {
    await _client.delete(ApiEndpoints.maintenanceById(id));
    return true;
  }
}
