class RecurringMaintenance {
  final String id;
  final String description;
  final String? periodicity;
  final DateTime? nextExecution;
  final String propertyId;

  RecurringMaintenance({
    required this.id,
    required this.description,
    this.periodicity,
    this.nextExecution,
    required this.propertyId,
  });
}
