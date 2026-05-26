import 'package:sqflite/sqflite.dart';
import '../models/ticket_model.dart';

class TicketLocalDatasource {
  final Database _db;

  TicketLocalDatasource(this._db);

  /// Inserts a new ticket into the local database
  Future<void> insertTicket(TicketModel ticket) async {
    await _db.insert(
      'Tickets',
      ticket.toMap(),
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  /// Fetches tickets from the local database, filtered by role and property/resident context
  Future<List<TicketModel>> getAllTickets({int? propertyId, int? residentId}) async {
    String query = 'SELECT Tickets.*, Units.number AS apt_numero '
        'FROM Tickets '
        'LEFT JOIN Units ON Tickets.apartment_id = Units.id ';
    
    List<String> whereClauses = [];
    List<dynamic> whereArgs = [];

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
    
    final List<Map<String, dynamic>> maps = await _db.rawQuery(query, whereArgs);
    return maps.map((map) => TicketModel.fromMap(map)).toList();
  }

  /// Updates the status of a ticket in the local database
  Future<void> updateTicketStatus(int ticketId, String newStatus) async {
    await _db.update(
      'Tickets',
      {'status': newStatus},
      where: 'id = ?',
      whereArgs: [ticketId],
    );
  }

  /// Updates a ticket record in the database
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
