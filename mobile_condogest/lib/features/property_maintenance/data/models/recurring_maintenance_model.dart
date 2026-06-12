import '../../domain/entities/recurring_maintenance_entity.dart';

class RecurringMaintenanceModel extends RecurringMaintenance {
  RecurringMaintenanceModel({
    super.id,
    required super.description,
    super.periodicity,
    super.nextExecution,
    required super.propertyId,
  });

  Map<String, dynamic> toMap() {
    final map = {
      'description': description,
      'periodicity': periodicity,
      'next_execution': nextExecution?.toIso8601String(),
      'property_id': propertyId,
    };
    if (id != null) {
      map['id'] = id;
    }
    return map;
  }

  factory RecurringMaintenanceModel.fromMap(Map<String, dynamic> map) {
    return RecurringMaintenanceModel(
      id: map['id'] as int?,
      description: map['description'] as String,
      periodicity: map['periodicity'] as String?,
      nextExecution: map['next_execution'] != null
          ? DateTime.parse(map['next_execution'] as String)
          : null,
      propertyId: map['property_id'] as int,
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
