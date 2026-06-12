import '../../domain/entities/ticket.dart';

class TicketModel extends Ticket {
  TicketModel({
    super.id,
    required super.title,
    super.description,
    super.location,
    super.type,
    super.priority,
    super.status,
    required super.apartmentId,
    required super.propertyId,
    required super.residentId,
    required super.createdAt,
    super.aptNumber,
  });

  Map<String, dynamic> toMap() {
    final map = {
      'title': title,
      'description': description,
      'location': location,
      'type': type,
      'priority': priority,
      'status': status,
      'apartment_id': apartmentId,
      'property_id': propertyId,
      'resident_id': residentId,
      'created_at': createdAt.toIso8601String(),
    };
    if (id != null) {
      map['id'] = id;
    }
    return map;
  }

  factory TicketModel.fromMap(Map<String, dynamic> map) {
    return TicketModel(
      id: map['id'] as int,
      title: map['title'] as String,
      description: map['description'] as String?,
      location: map['location'] as String?,
      type: map['type'] as String?,
      priority: map['priority'] as String?,
      status: map['status'] as String?,
      apartmentId: map['apartment_id'] as int,
      propertyId: map['property_id'] as int,
      residentId: map['resident_id'] as int,
      createdAt: DateTime.parse(map['created_at'] as String),
      aptNumber: map['apt_numero'] as int?,
    );
  }

  factory TicketModel.fromEntity(Ticket ticket) {
    return TicketModel(
      id: ticket.id,
      title: ticket.title,
      description: ticket.description,
      location: ticket.location,
      type: ticket.type,
      priority: ticket.priority,
      status: ticket.status,
      apartmentId: ticket.apartmentId,
      propertyId: ticket.propertyId,
      residentId: ticket.residentId,
      createdAt: ticket.createdAt,
      aptNumber: ticket.aptNumber,
    );
  }
}
