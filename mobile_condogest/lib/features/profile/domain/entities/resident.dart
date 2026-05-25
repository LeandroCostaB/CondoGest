class Resident {
  final String id;
  final String userId;
  final String apartmentId;
  final String? telephone;
  final DateTime createdAt;

  Resident({
    required this.id,
    required this.userId,
    required this.apartmentId,
    this.telephone,
    required this.createdAt,
  });
}
