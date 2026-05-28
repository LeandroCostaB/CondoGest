import '../../../../core/network/api_client.dart';
import '../../../../core/network/api_endpoints.dart';
import '../../domain/entities/ticket.dart';
import '../models/ticket_model.dart';
import 'i_ticket_service.dart';

class TicketService implements ITicketService {
  final ApiClient _client = ApiClient();

  Ticket _fromApiJson(Map<String, dynamic> json) {
    // title is stored as "location - type - priority"; parse back the parts
    final parts = (json['title'] as String).split(' - ');
    return TicketModel(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String?,
      location: json['location'] as String?,
      type: parts.length > 1 ? parts[1] : null,
      priority: parts.length > 2 ? parts[2] : null,
      status: json['status'] as String?,
      apartmentId: json['apartmentId'] as String,
      propertyId: '',
      residentId: json['residentId'] as String,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'] as String)
          : DateTime.now(),
    );
  }

  List<Ticket> _parseList(dynamic data) {
    final items = data['data'] as List<dynamic>;
    return items
        .map((e) => _fromApiJson(e as Map<String, dynamic>))
        .toList();
  }

  @override
  Future<List<Ticket>> getAll() async {
    final data = await _client.get(ApiEndpoints.tickets);
    return _parseList(data);
  }

  @override
  Future<Ticket?> getById(String id) async {
    final data = await _client.get(ApiEndpoints.ticketById(id));
    return _fromApiJson(data as Map<String, dynamic>);
  }

  @override
  Future<List<Ticket>> getByResident(String residentId) async {
    final data = await _client.get(ApiEndpoints.ticketsByResident(residentId));
    return _parseList(data);
  }

  @override
  Future<List<Ticket>> getByApartment(String apartmentId) async {
    final data =
        await _client.get(ApiEndpoints.ticketsByApartment(apartmentId));
    return _parseList(data);
  }

  @override
  Future<Ticket> create(Ticket ticket) async {
    final data = await _client.post(ApiEndpoints.tickets, {
      'title': ticket.title,
      'description': ticket.description ?? '',
      'location': ticket.location ?? '',
      'residentId': ticket.residentId,
      'apartmentId': ticket.apartmentId,
    });
    return _fromApiJson(data as Map<String, dynamic>);
  }

  @override
  Future<Ticket?> update(Ticket ticket) async {
    if (ticket.id == null) return null;
    await _client.put(ApiEndpoints.ticketById(ticket.id!), {
      if (ticket.title.isNotEmpty) 'title': ticket.title,
      if (ticket.description != null) 'description': ticket.description,
      if (ticket.location != null) 'location': ticket.location,
      if (ticket.status != null) 'status': ticket.status,
    });
    return ticket;
  }

  @override
  Future<bool> delete(String id) async {
    await _client.delete(ApiEndpoints.ticketById(id));
    return true;
  }
}
