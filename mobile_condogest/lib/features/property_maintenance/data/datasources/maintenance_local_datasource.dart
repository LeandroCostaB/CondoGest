import 'package:sqflite/sqflite.dart';
import '../models/maintenance_model.dart';

class MaintenanceLocalDatasource {
  final Database _db;
  static const String tableName = 'Maintenances';

  MaintenanceLocalDatasource(this._db);

  /// Insere uma nova manutenção no banco de dados local
  Future<void> insertMaintenance(MaintenanceModel maintenance) async {
    try {
      await _db.insert(
        tableName,
        maintenance.toMap(),
        conflictAlgorithm: ConflictAlgorithm.replace,
      );
    } catch (e) {
      throw Exception('Erro ao inserir manutenção no banco local: $e');
    }
  }

  /// Busca todas as manutenções do banco de dados local
  /// Permite filtrar por unitId ou ticketId conforme a necessidade da regra de negócio
  Future<List<MaintenanceModel>> getAllMaintenances({
    String? unitId,
    String? ticketId,
  }) async {
    try {
      List<String> whereClauses = [];
      List<dynamic> whereArgs = [];

      if (unitId != null) {
        whereClauses.add('unit_id = ?');
        whereArgs.add(unitId);
      }
      if (ticketId != null) {
        whereClauses.add('ticket_id = ?');
        whereArgs.add(ticketId);
      }

      String whereString = whereClauses.isNotEmpty 
          ? 'WHERE ${whereClauses.join(' AND ')}' 
          : '';

      final List<Map<String, dynamic>> maps = await _db.rawQuery(
        '''SELECT * FROM $tableName $whereString 
           ORDER BY CASE status
             WHEN 'Pendente' THEN 1
             WHEN 'Aberto' THEN 1
             WHEN 'Em andamento' THEN 2
             WHEN 'Finalizado' THEN 3
             ELSE 4
           END, created_at DESC''',
        whereArgs,
      );

      return maps.map((map) => MaintenanceModel.fromMap(map)).toList();
    } catch (e) {
      throw Exception('Erro ao buscar manutenções no banco local: $e');
    }
  }

  /// Atualiza o status de uma manutenção no banco de dados local
  Future<void> updateMaintenanceStatus(String maintenanceId, String newStatus) async {
    try {
      final result = await _db.update(
        tableName,
        {'status': newStatus},
        where: 'id = ?',
        whereArgs: [maintenanceId],
      );
      
      if (result == 0) {
        throw Exception('Nenhuma manutenção encontrada com o ID: $maintenanceId');
      }
    } catch (e) {
      throw Exception('Erro ao atualizar status da manutenção: $e');
    }
  }

  /// Atualiza um registro de manutenção completo no banco de dados
  Future<void> updateMaintenance(MaintenanceModel maintenance) async {
    try {
      final result = await _db.update(
        tableName,
        maintenance.toMap(),
        where: 'id = ?',
        whereArgs: [maintenance.id],
      );

      if (result == 0) {
        throw Exception('Falha ao atualizar: Manutenção não encontrada.');
      }
    } catch (e) {
      throw Exception('Erro ao atualizar manutenção no banco local: $e');
    }
  }

  /// Deleta uma manutenção do banco local
  Future<void> deleteMaintenance(String id) async {
    try {
      await _db.delete(
        tableName,
        where: 'id = ?',
        whereArgs: [id],
      );
    } catch (e) {
      throw Exception('Erro ao deletar manutenção: $e');
    }
  }
}
