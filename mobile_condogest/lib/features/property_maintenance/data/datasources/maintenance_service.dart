import 'dart:async';
import 'package:sqflite/sqflite.dart';

import '../../domain/entities/maintenance_entity.dart';
import '../../data/datasources/i_maintenance_service.dart';
import '../models/maintenance_model.dart';

class MaintenanceService implements IMaintenanceService {
  final Database db;
  static const String tableName = 'Maintenances';

  MaintenanceService(this.db);

  @override
  Future<List<Maintenance>> getAll() async {
    final List<Map<String, dynamic>> maps = await db.query(tableName, orderBy: 'created_at DESC');
    return maps.map((map) => MaintenanceModel.fromMap(map)).toList();
  }

  @override
  Future<Maintenance> create(Maintenance maintenance) async {
    Maintenance currentMaintenance = maintenance;

    // "On-the-fly" Provider creation logic
    if (currentMaintenance.providerId == null && 
        currentMaintenance.providerName != null && 
        currentMaintenance.providerName!.isNotEmpty) {
      
      final int newProviderId = await db.insert('Providers', {
        'name': currentMaintenance.providerName,
        'telephone': currentMaintenance.providerContact ?? '',
        'specialty': 'Geral', // Default specialty for on-the-fly creation
      });
      
      currentMaintenance = currentMaintenance.copyWith(providerId: newProviderId);
    }

    final model = MaintenanceModel.fromEntity(currentMaintenance);
    final map = model.toMap();
    map.remove('id'); // Ensure SQLite handles auto-increment

    final id = await db.insert(tableName, map);
    return currentMaintenance.copyWith(id: id);
  }

  Future<Maintenance?> getById(int? id) async {
    if (id == null) return null;
    
    final List<Map<String, dynamic>> maps = await db.query(
      tableName,
      where: 'id = ?',
      whereArgs: [id],
      limit: 1,
    );

    if (maps.isEmpty) return null;
    return MaintenanceModel.fromMap(maps.first);
  }

  @override
  Future<Maintenance?> update(Maintenance maintenance) async {
    if (maintenance.id == null) return null;

    final model = MaintenanceModel.fromEntity(maintenance);
    final rowsAffected = await db.update(
      tableName,
      model.toMap(),
      where: 'id = ?',
      whereArgs: [maintenance.id],
    );

    if (rowsAffected == 0) return null;
    return maintenance;
  }

  @override
  Future<bool> delete(int id) async {
    final rowsAffected = await db.delete(
      tableName,
      where: 'id = ?',
      whereArgs: [id],
    );

    return rowsAffected > 0;
  }
}
