import '../../domain/entities/ticket.dart';

class TicketModel extends Ticket {
  TicketModel({
    required super.id,
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
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
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
  }

  factory TicketModel.fromMap(Map<String, dynamic> map) {
    return TicketModel(
      id: map['id'] as String,
      title: map['title'] as String,
      description: map['description'] as String?,
      location: map['location'] as String?,
      type: map['type'] as String?,
      priority: map['priority'] as String?,
      status: map['status'] as String?,
      apartmentId: map['apartment_id'] as String,
      propertyId: map['property_id'] as String,
      residentId: map['resident_id'] as String,
      createdAt: DateTime.parse(map['created_at'] as String),
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
    );
  }
}
