import '../../domain/entities/maintenance_entity.dart';

class MaintenanceModel extends Maintenance {
  MaintenanceModel({
    super.id,
    super.ticketId,
    super.unitId,
    super.local,
    super.type,
    super.priority,
    super.providerId,
    super.providerName,
    super.providerContact,
    super.status,
    super.value,
    super.executionDate,
    super.observation,
    required super.createdAt,
  });

  Map<String, dynamic> toMap() {
    final map = <String, dynamic>{
      'ticket_id': ticketId,
      'unit_id': unitId,
      'local': local,
      'type': type,
      'priority': priority,
      'provider_id': providerId,
      'provider_name': providerName,
      'provider_contact': providerContact,
      'status': status,
      'value': value,
      'execution_date': executionDate?.toIso8601String(),
      'observation': observation,
      'created_at': createdAt.toIso8601String(),
    };
    if (id != null) map['id'] = id;
    return map;
  }

  factory MaintenanceModel.fromMap(Map<String, dynamic> map) {
    return MaintenanceModel(
      id: map['id']?.toString(),
      ticketId: map['ticket_id']?.toString(),
      unitId: map['unit_id'] as int?,
      local: map['local'] as String?,
      type: map['type'] as String?,
      priority: map['priority'] as String?,
      providerId: map['provider_id']?.toString(),
      providerName: map['provider_name'] as String?,
      providerContact: map['provider_contact'] as String?,
      status: map['status'] as String?,
      value: map['value'] != null ? (map['value'] as num).toDouble() : null,
      executionDate: map['execution_date'] != null
          ? DateTime.parse(map['execution_date'] as String)
          : null,
      observation: map['observation'] as String?,
      createdAt: DateTime.parse(map['created_at'] as String),
    );
  }

  factory MaintenanceModel.fromApiJson(Map<String, dynamic> json) {
    return MaintenanceModel(
      id: json['id'] as String?,
      ticketId: json['ticketId'] as String?,
      providerId: json['providerId'] as String?,
      type: json['type'] as String?,
      priority: json['priority'] as String?,
      status: json['status'] as String?,
      value: json['value'] != null ? (json['value'] as num).toDouble() : null,
      executionDate: json['executionDate'] != null
          ? DateTime.parse(json['executionDate'] as String)
          : null,
      observation: json['observation'] as String?,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'] as String)
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toApiJson() {
    return {
      if (ticketId != null) 'ticketId': ticketId,
      if (providerId != null) 'providerId': providerId,
      if (type != null) 'type': type,
      if (priority != null) 'priority': priority,
      'value': value ?? 0.0,
      'executionDate':
          executionDate?.toIso8601String() ?? DateTime.now().toIso8601String(),
      if (observation != null) 'observation': observation,
    };
  }

  factory MaintenanceModel.fromEntity(Maintenance entity) {
    return MaintenanceModel(
      id: entity.id,
      ticketId: entity.ticketId,
      unitId: entity.unitId,
      local: entity.local,
      type: entity.type,
      priority: entity.priority,
      providerId: entity.providerId,
      providerName: entity.providerName,
      providerContact: entity.providerContact,
      status: entity.status,
      value: entity.value,
      executionDate: entity.executionDate,
      observation: entity.observation,
      createdAt: entity.createdAt,
    );
  }
}
