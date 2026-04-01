enum UserRole { admin, liquidator, resident, user }

class UserAuth {
  final String id;
  final String name;
  final String email;
  final UserRole type;
  final String token;

  UserAuth({
    required this.id,
    required this.name,
    required this.email,
    required this.type,
    required this.token,
  });

  static UserRole _stringToRole(String? roleString) {
    switch (roleString) {
      case 'admin':
        return UserRole.admin;
      case 'liquidator':
        return UserRole.liquidator;
      case 'resident':
        return UserRole.resident;
      default:
        return UserRole.user;
    }
  }

  factory UserAuth.fromMap(Map<String, dynamic> map) {
    return UserAuth(
      id: map['id'] as String? ?? '',
      name: map['name'] ?? 'Sem Nome',
      email: map['email'] as String,
      type: _stringToRole(map['role'] as String?),
      token: map['token'] ?? '',
    );
  }

  factory UserAuth.fromJson(Map<String, dynamic> json) {
    return UserAuth(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      email: json['email'] as String? ?? '',
      type: _stringToRole(json['role'] as String?),
      token: json['token'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'role': type.name,
      'token': token,
    };
  }
}
