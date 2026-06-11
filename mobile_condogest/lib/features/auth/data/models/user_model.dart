import '../../domain/entities/user_entity.dart';

class UserModel extends UserAuth {
  const UserModel({
    required super.id,
    required super.name,
    required super.email,
    required super.type,
    required super.token,
    super.apartmentId,
    super.apartmentNumber,
    super.apartmentBlock,
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

  factory UserModel.fromMap(Map<String, dynamic> map) {
    return UserModel(
      id: map['id'] as String? ?? '',
      name: map['name'] ?? 'Sem Nome',
      email: map['email'] as String,
      type: _stringToRole(map['role'] as String?),
      token: map['token'] ?? '',
      apartmentId: map['apartmentId'] as String?,
      apartmentNumber: map['apartmentNumber'] as String?,
      apartmentBlock: map['apartmentBlock'] as String?,
    );
  }

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      email: json['email'] as String? ?? '',
      type: _stringToRole(json['role'] as String?),
      token: json['token'] as String? ?? '',
      apartmentId: json['apartmentId'] as String?,
      apartmentNumber: json['apartmentNumber'] as String?,
      apartmentBlock: json['apartmentBlock'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'role': type.name,
      'token': token,
      if (apartmentId != null) 'apartmentId': apartmentId,
      if (apartmentNumber != null) 'apartmentNumber': apartmentNumber,
      if (apartmentBlock != null) 'apartmentBlock': apartmentBlock,
    };
  }
}
