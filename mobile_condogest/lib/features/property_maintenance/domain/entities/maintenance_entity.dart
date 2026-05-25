class Maintenance {
  final String id;
  final String ticketId;
  final String providerId; // UUID no backend
  final String? status;
  final double? value;
  final DateTime? executionDate;
  final String? observation;
  final DateTime createdAt;

  Maintenance({
    required this.id,
    required this.ticketId,
    required this.providerId,
    this.status,
    this.value,
    this.executionDate,
    this.observation,
    required this.createdAt,
  });
}
