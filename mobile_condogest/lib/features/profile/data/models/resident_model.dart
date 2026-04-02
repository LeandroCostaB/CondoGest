class Resident {
  final int? id;
  final String name;
  final String telefone;
  final String email;
  final bool isActive;
  final DateTime createdAt;
  final DateTime updatedAt;

  Resident({
    this.id,
    required this.name,
    required this.email,
    required this.telefone,
    required this.isActive,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Resident.fromJson(Map<String, dynamic> json) {
    return Resident(
      id: json['id'],
      name: json['name'],
      email: json['email'],
      telefone: json['telefone'],
      isActive: json['is_active'],
      createdAt: DateTime.parse(json['created_at']),
      updatedAt: DateTime.parse(json['updated_at']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'telefone': telefone,
      'is_active': isActive,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }
}
