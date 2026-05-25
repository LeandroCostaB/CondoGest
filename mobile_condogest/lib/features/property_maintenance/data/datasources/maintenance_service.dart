import 'dart:async';

import '../../domain/entities/maintenance_entity.dart';
import '../../data/datasources/i_maintenance_service.dart';

class MaintenanceService implements IMaintenanceService {
  final List<Maintenance> _maintenance = [];

  @override
  Future<List<Maintenance>> getAll() async {
    await Future.delayed(const Duration(milliseconds: 300));
    return List.from(_maintenance);
  }

  @override
  Future<Maintenance> create(Maintenance maintenance) async {
    await Future.delayed(const Duration(milliseconds: 300));

    final newMaintenance = Maintenance(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      ticketId: DateTime.now().millisecondsSinceEpoch.toString(),
      unitId: DateTime.now().millisecondsSinceEpoch.toString(),
      local: maintenance.local,
      type: maintenance.type,
      priority: maintenance.priority,
      providerId: DateTime.now().millisecondsSinceEpoch.toString(),
      providerName: maintenance.providerName,
      providerContact: maintenance.providerContact,
      status: maintenance.status,
      value: maintenance.value,
      executionDate: DateTime.now(),
      observation: maintenance.observation,
      createdAt: DateTime.now(),
    );

    _maintenance.add(newMaintenance);
    return newMaintenance;
  }

  Future<Maintenance?> getById(String id) async {
    await Future.delayed(const Duration(milliseconds: 200));

    try {
      return _maintenance.firstWhere((p) => p.id == id);
    } catch (_) {
      return null;
    }
  }

  @override
  Future<Maintenance?> update(Maintenance maintenance) async {
    await Future.delayed(const Duration(milliseconds: 300));

    final index = _maintenance.indexWhere((p) => p.id == maintenance.id);

    if (index == -1) return null;

    final updated = Maintenance(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      ticketId: DateTime.now().millisecondsSinceEpoch.toString(),
      unitId: DateTime.now().millisecondsSinceEpoch.toString(),
      local: maintenance.local,
      type: maintenance.type,
      priority: maintenance.priority,
      providerId: DateTime.now().millisecondsSinceEpoch.toString(),
      providerName: maintenance.providerName,
      providerContact: maintenance.providerContact,
      status: maintenance.status,
      value: maintenance.value,
      executionDate: DateTime.now(),
      observation: maintenance.observation,
      createdAt: DateTime.now(),
    );

    _maintenance[index] = updated;
    return updated;
  }

  @override
  Future<bool> delete(String id) async {
    await Future.delayed(const Duration(milliseconds: 300));

    final initialLength = _maintenance.length;
    _maintenance.removeWhere((p) => p.id == id);

    return _maintenance.length < initialLength;
  }
}
