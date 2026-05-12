class Maintenance {
  final String id;
  final String ticketId;
  final String unitId;
  final String? local;
  final String type;
  final String priority;
  final String? providerId;
  final String? providerName;
  final String? providerContact;
  final String? status;
  final double? value;
  final DateTime? executionDate;
  final String? observation;
  final DateTime createdAt;

  Maintenance({
    required this.id,
    required this.ticketId,
    required this.unitId,
    required this.providerId,
    required this.local,
    required this.type,
    required this.priority,
    this.providerName,
    this.providerContact,
    this.status,
    this.value,
    this.executionDate,
    this.observation,
    required this.createdAt,
  });
}
