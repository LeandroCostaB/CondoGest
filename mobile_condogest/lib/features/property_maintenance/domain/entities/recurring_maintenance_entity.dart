class RecurringMaintenance {
  final int? id;
  final String description;
  final String? periodicity;
  final DateTime? nextExecution;
  final int propertyId;

  RecurringMaintenance({
    this.id,
    required this.description,
    this.periodicity,
    this.nextExecution,
    required this.propertyId,
  });

  RecurringMaintenance copyWith({
    int? id,
    String? description,
    String? periodicity,
    DateTime? nextExecution,
    int? propertyId,
  }) {
    return RecurringMaintenance(
      id: id ?? this.id,
      description: description ?? this.description,
      periodicity: periodicity ?? this.periodicity,
      nextExecution: nextExecution ?? this.nextExecution,
      propertyId: propertyId ?? this.propertyId,
    );
  }
}
