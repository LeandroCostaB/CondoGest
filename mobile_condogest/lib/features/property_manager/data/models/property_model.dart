import 'dart:convert';
import '../../domain/entities/propertys_entity.dart';
import '../models/floor_model.dart';

class PropertyModel extends Property {
  final int? userId;

  PropertyModel({
    required super.id,
    required super.name,
    required super.cep,
    required super.street,
    required super.neighborhood,
    required super.number,
    required super.city,
    required super.state,
    required super.floors,
    required super.registration,
    required super.isActive,
    required super.createdAt,
    required super.updatedAt,
    this.userId,
  });

  factory PropertyModel.fromEntity(Property entity) {
    return PropertyModel(
      id: entity.id,
      name: entity.name,
      cep: entity.cep,
      street: entity.street,
      neighborhood: entity.neighborhood,
      number: entity.number,
      city: entity.city,
      state: entity.state,
      registration: entity.registration,
      floors: entity.floors,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    );
  }

  // Lê de linha SQLite (endereço armazenado como JSON no campo address)
  factory PropertyModel.fromMap(Map<String, dynamic> map) {
    Map<String, dynamic> addressData = {};
    final addressStr = map['address'] as String? ?? '';
    try {
      if (addressStr.startsWith('{')) {
        addressData = jsonDecode(addressStr) as Map<String, dynamic>;
      } else {
        addressData = {'street': addressStr};
      }
    } catch (_) {
      addressData = {'street': addressStr};
    }

    return PropertyModel(
      id: map['id']?.toString(),
      name: map['name'] as String? ?? '',
      cep: addressData['cep'] as String? ?? '',
      street: addressData['street'] as String? ?? '',
      neighborhood: addressData['neighborhood'] as String? ?? '',
      number: addressData['number'] as String?,
      city: addressData['city'] as String? ?? '',
      state: addressData['state'] as String? ?? '',
      registration: addressData['registration'] as String? ?? '',
      floors: (map['floors'] as List<dynamic>?)
              ?.map((e) => FloorModel.fromMap(e as Map<String, dynamic>))
              .toList() ??
          [],
      isActive: addressData['isActive'] as bool? ?? map['isActive'] as bool? ?? false,
      createdAt: map['created_at'] != null
          ? DateTime.parse(map['created_at'] as String)
          : DateTime.now(),
      updatedAt: map['updatedAt'] != null
          ? DateTime.parse(map['updatedAt'] as String)
          : DateTime.now(),
    );
  }

  // Serializa para SQLite (endereço como JSON no campo address)
  Map<String, dynamic> toMap() {
    final addressJson = jsonEncode({
      'cep': cep,
      'street': street,
      'neighborhood': neighborhood,
      'number': number,
      'city': city,
      'state': state,
      'registration': registration,
      'isActive': isActive,
      'updatedAt': updatedAt.toIso8601String(),
    });
    return {
      'name': name,
      'address': addressJson,
      'created_at': createdAt.toIso8601String(),
    };
  }

  factory PropertyModel.fromJson(Map<String, dynamic> json) {
    return PropertyModel.fromMap(json);
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'cep': cep,
      'street': street,
      'neighborhood': neighborhood,
      'number': number,
      'city': city,
      'state': state,
      'registration': registration,
      'floors': floors.map((e) => (e as FloorModel).toMap()).toList(),
      'isActive': isActive,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  // Constrói a partir do CondominiumDto retornado pelo backend.
  factory PropertyModel.fromApiJson(Map<String, dynamic> json) {
    return PropertyModel(
      id: json['id'] as String?,
      name: json['name'] as String? ?? '',
      street: json['address'] as String? ?? '',
      cep: '',
      neighborhood: '',
      number: '',
      city: '',
      state: '',
      registration: '',
      floors: [],
      isActive: (json['status'] as String?) == 'active',
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
    );
  }

  // Serializa para CreateCondominiumDto / UpdateCondominiumDto do backend.
  Map<String, dynamic> toApiJson() {
    final parts = [street, number, neighborhood, city, state]
        .where((s) => s != null && s.isNotEmpty)
        .join(', ');
    return {
      'name': name,
      'address': parts.isNotEmpty ? parts : name,
    };
  }
}
