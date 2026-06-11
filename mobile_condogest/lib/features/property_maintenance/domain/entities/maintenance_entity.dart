class Maintenance {
  final String? id;
  final String? ticketId;
  final String? apartmentId;
  final String? providerId;
  final int? unitId;
  final String? local;
  final String? type;
  final String? priority;
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
    this.apartmentId,
    this.providerId,
    this.unitId,
    this.local,
    this.type,
    this.priority,
    this.providerName,
    this.providerContact,
    this.status,
    this.value,
    this.executionDate,
    this.observation,
    required this.createdAt,
  });

  Maintenance copyWith({
    String? id,
    String? ticketId,
    String? apartmentId,
    String? providerId,
    int? unitId,
    String? local,
    String? type,
    String? priority,
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
      apartmentId: apartmentId ?? this.apartmentId,
      providerId: providerId ?? this.providerId,
      unitId: unitId ?? this.unitId,
      local: local ?? this.local,
      type: type ?? this.type,
      priority: priority ?? this.priority,
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
