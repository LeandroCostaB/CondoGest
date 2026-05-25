class Ticket {
  final int? id;
  final String title;
  final String? description;
  final String? location;
  final String? type;
  final String? priority;
  final String? status;
  final int apartmentId;
  final int propertyId;
  final int residentId;
  final DateTime createdAt;
  final int? aptNumber;

  Ticket({
    this.id,
    required this.title,
    this.description,
    this.location,
    this.type,
    this.priority,
    this.status,
    required this.apartmentId,
    required this.propertyId,
    required this.residentId,
    required this.createdAt,
    this.aptNumber,
  });
}
