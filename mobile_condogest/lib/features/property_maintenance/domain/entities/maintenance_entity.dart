class Maintenance {
  final int? id;
  final int? ticketId;
  final int? unitId;
  final String? local;
  final String type;
  final String priority;
  final int? providerId;
  final String? providerName;
  final String? providerContact;
  final String? status;
  final double? value;
  final DateTime? executionDate;
  final String? observation;
  final DateTime createdAt;

  Maintenance({
    this.id,
    this.ticketId,
    this.unitId,
    this.providerId,
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

  Maintenance copyWith({
    int? id,
    int? ticketId,
    int? unitId,
    String? local,
    String? type,
    String? priority,
    int? providerId,
    String? providerName,
    String? providerContact,
    String? status,
    double? value,
    DateTime? executionDate,
    String? observation,
    DateTime? createdAt,
  }) {
    return Maintenance(
      id: id ?? this.id,
      ticketId: ticketId ?? this.ticketId,
      unitId: unitId ?? this.unitId,
      local: local ?? this.local,
      type: type ?? this.type,
      priority: priority ?? this.priority,
      providerId: providerId ?? this.providerId,
      providerName: providerName ?? this.providerName,
      providerContact: providerContact ?? this.providerContact,
      status: status ?? this.status,
      value: value ?? this.value,
      executionDate: executionDate ?? this.executionDate,
      observation: observation ?? this.observation,
      createdAt: createdAt ?? this.createdAt,
    );
  }
}
