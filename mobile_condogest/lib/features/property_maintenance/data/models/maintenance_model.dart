import '../../domain/entities/maintenance_entity.dart';

class MaintenanceModel extends Maintenance {
  MaintenanceModel({
    super.id,
    super.ticketId,
    super.unitId,
    required super.local,
    required super.type,
    required super.priority,
    required super.providerId,
    super.providerContact,
    super.providerName,
    super.status,
    super.value,
    super.executionDate,
    super.observation,
    required super.createdAt,
  });

  Map<String, dynamic> toMap() {
    final map = {
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
    if (id != null) {
      map['id'] = id;
    }
    return map;
  }

  factory MaintenanceModel.fromMap(Map<String, dynamic> map) {
    return MaintenanceModel(
      id: map['id'] as int?,
      ticketId: map['ticket_id'] as int?,
      unitId: map['unit_id'] as int?,
      local: map['local'] as String?,
      type: map['type'] as String,
      priority: map['priority'] as String,
      providerId: map['provider_id'] as int?,
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

  factory MaintenanceModel.fromEntity(Maintenance entity) {
    return MaintenanceModel(
      id: entity.id,
      ticketId: entity.ticketId,
      unitId: entity.unitId,
      local: entity.local,
      type: entity.type,
      priority: entity.priority,
      providerId: entity.providerId,
      providerContact: entity.providerContact,
      providerName: entity.providerName,
      status: entity.status,
      value: entity.value,
      executionDate: entity.executionDate,
      observation: entity.observation,
      createdAt: entity.createdAt,
    );
  }
}
