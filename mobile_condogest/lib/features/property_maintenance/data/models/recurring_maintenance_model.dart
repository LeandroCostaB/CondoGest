import '../../domain/entities/recurring_maintenance_entity.dart';

class RecurringMaintenanceModel extends RecurringMaintenance {
  RecurringMaintenanceModel({
    required super.id,
    required super.description,
    super.periodicity,
    super.nextExecution,
    required super.propertyId,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'description': description,
      'periodicity': periodicity,
      'next_execution': nextExecution?.toIso8601String(),
      'property_id': propertyId,
    };
  }

  factory RecurringMaintenanceModel.fromMap(Map<String, dynamic> map) {
    return RecurringMaintenanceModel(
      id: map['id'] as String,
      description: map['description'] as String,
      periodicity: map['periodicity'] as String?,
      nextExecution: map['next_execution'] != null
          ? DateTime.parse(map['next_execution'] as String)
          : null,
      propertyId: map['property_id'] as String,
    );
  }

  factory RecurringMaintenanceModel.fromEntity(RecurringMaintenance entity) {
    return RecurringMaintenanceModel(
      id: entity.id,
      description: entity.description,
      periodicity: entity.periodicity,
      nextExecution: entity.nextExecution,
      propertyId: entity.propertyId,
    );
  }
}
