import '../../domain/entities/maintenance_entity.dart';

class MaintenanceModel extends Maintenance {
  MaintenanceModel({
    required super.id,
    required super.ticketId,
    required super.providerId,
    super.status,
    super.value,
    super.executionDate,
    super.observation,
    required super.createdAt,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'ticket_id': ticketId,
      'provider_id': providerId,
      'status': status,
      'value': value,
      'execution_date': executionDate?.toIso8601String(),
      'observation': observation,
      'created_at': createdAt.toIso8601String(),
    };
  }

  factory MaintenanceModel.fromMap(Map<String, dynamic> map) {
    return MaintenanceModel(
      id: map['id'] as String,
      ticketId: map['ticket_id'] as String,
      providerId: map['provider_id'] as int,
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
      providerId: entity.providerId,
      status: entity.status,
      value: entity.value,
      executionDate: entity.executionDate,
      observation: entity.observation,
      createdAt: entity.createdAt,
    );
  }
}
