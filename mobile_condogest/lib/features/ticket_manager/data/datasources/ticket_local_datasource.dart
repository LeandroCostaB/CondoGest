import 'package:sqflite/sqflite.dart';
import '../models/ticket_model.dart';

class TicketLocalDatasource {
  final Database _db;

  TicketLocalDatasource(this._db);

  /// Inserts a new ticket into the local database
  Future<void> insertTicket(TicketModel ticket) async {
    await _db.insert(
      'tickets',
      ticket.toMap(),
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  /// Fetches all tickets from the local database
  Future<List<TicketModel>> getAllTickets() async {
    final List<Map<String, dynamic>> maps = await _db.rawQuery(
        'SELECT tickets.*, units.number AS apt_numero '
        'FROM tickets '
        'LEFT JOIN units ON tickets.apartment_id = units.id '
        'ORDER BY tickets.created_at DESC');
    return maps.map((map) => TicketModel.fromMap(map)).toList();
  }
}
