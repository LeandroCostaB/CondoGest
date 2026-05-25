import 'package:condogest/features/profile/domain/entities/provider.dart';
import '../../domain/entities/provider.dart';

class ProviderModel extends Provider {
  ProviderModel({
    int? id,
    required final String name,
    required final String cpfCnpj,
    required final String? email,
    required final String telephone,
    required final String specialty,
    required final bool isActive,
    required final DateTime createdAt,
    required final DateTime updatedAt,
  }) : super(
         id: id,
         name: name,
         cpfCnpj: cpfCnpj,
         email: email,
         telephone: telephone,
         specialty: specialty,
         isActive: isActive,
         createdAt: createdAt,
         updatedAt: updatedAt,
       );

  factory ProviderModel.fromJson(Map<String, dynamic> json) {
    return ProviderModel(
      id: json['id'],
      name: json['name'],
      cpfCnpj: json['cpfCnpj'],
      email: json['email'],
      telephone: json['telephone'],
      specialty: json['specialty'],
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
      'telefone': telephone,
      'role': specialty,
      'is_active': isActive,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }
}
