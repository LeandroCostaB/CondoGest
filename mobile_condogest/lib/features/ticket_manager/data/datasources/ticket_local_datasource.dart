import 'package:sqflite/sqflite.dart';
import '../models/ticket_model.dart';

class TicketLocalDatasource {
  final Database _db;

  TicketLocalDatasource(this._db);

  Future<void> insertTicket(TicketModel ticket) async {
    await _db.insert(
      'Tickets',
      ticket.toMap(),
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  Future<List<TicketModel>> getAllTickets({
    String? propertyId,
    String? residentId,
  }) async {
    String query = 'SELECT Tickets.*, Units.number AS apt_numero '
        'FROM Tickets '
        'LEFT JOIN Units ON Tickets.apartment_id = Units.id ';

    final whereClauses = <String>[];
    final whereArgs = <dynamic>[];

    if (propertyId != null) {
      whereClauses.add('Tickets.property_id = ?');
      whereArgs.add(propertyId);
    }
    if (residentId != null) {
      whereClauses.add('Tickets.resident_id = ?');
      whereArgs.add(residentId);
    }

    if (whereClauses.isNotEmpty) {
      query += ' WHERE ${whereClauses.join(' AND ')}';
    }

    query += ''' ORDER BY CASE Tickets.status
      WHEN 'Pendente' THEN 1
      WHEN 'Aberto' THEN 1
      WHEN 'Em andamento' THEN 2
      WHEN 'Em Andamento' THEN 2
      WHEN 'Finalizado' THEN 3
      WHEN 'Resolvido' THEN 3
      ELSE 4
    END, Tickets.created_at DESC''';

    final maps = await _db.rawQuery(query, whereArgs);
    return maps.map((m) => TicketModel.fromMap(m)).toList();
  }

  Future<void> updateTicketStatus(String ticketId, String newStatus) async {
    await _db.update(
      'Tickets',
      {'status': newStatus},
      where: 'id = ?',
      whereArgs: [ticketId],
    );
  }

  Future<void> updateTicket(TicketModel ticket) async {
    if (ticket.id == null) return;
    await _db.update(
      'Tickets',
      ticket.toMap(),
      where: 'id = ?',
      whereArgs: [ticket.id],
    );
  }
}
