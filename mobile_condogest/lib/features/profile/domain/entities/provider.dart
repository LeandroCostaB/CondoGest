class Provider {
  final int? id;
  final String name;
  final String cpfCnpj;
  final String? email;
  final String telephone;
  final String specialty;
  final bool isActive;
  final DateTime createdAt;
  final DateTime updatedAt;

  Provider({
    this.id,
    required this.name,
    required this.cpfCnpj,
    required this.email,
    required this.telephone,
    required this.specialty,
    required this.isActive,
    required this.createdAt,
    required this.updatedAt,
  });
}
