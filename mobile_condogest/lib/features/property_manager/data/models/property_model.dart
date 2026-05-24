import 'dart:convert';
import '../../domain/entities/propertys_entity.dart';
import '../models/floor_model.dart';

enum SearchMode { property }

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

  factory PropertyModel.fromMap(Map<String, dynamic> map) {
    // Check if 'address' is a JSON string (from DB)
    Map<String, dynamic> addressData = {};
    String addressStr = map['address'] as String? ?? '';
    
    try {
      if (addressStr.startsWith('{')) {
        addressData = jsonDecode(addressStr);
      } else {
        addressData = {'street': addressStr};
      }
    } catch (_) {
      addressData = {'street': addressStr};
    }

    return PropertyModel(
      id: map['id'] as int?,
      userId: map['user_id'] as int?,
      name: map['name'] as String? ?? '',
      cep: addressData['cep'] as String? ?? map['cep'] as String? ?? '',
      street: addressData['street'] as String? ?? map['street'] as String? ?? '',
      neighborhood: addressData['neighborhood'] as String? ?? map['neighborhood'] as String? ?? '',
      number: addressData['number'] as String? ?? map['number'] as String?,
      city: addressData['city'] as String? ?? map['city'] as String? ?? '',
      state: addressData['state'] as String? ?? map['state'] as String? ?? '',
      registration: addressData['registration'] as String? ?? map['registration'] as String? ?? '',
      floors:
          (map['floors'] as List<dynamic>?)
              ?.map((e) => FloorModel.fromMap(e as Map<String, dynamic>))
              .toList() ??
          [],
      isActive: addressData['isActive'] as bool? ?? map['isActive'] as bool? ?? false,
      createdAt: map['created_at'] != null 
          ? DateTime.parse(map['created_at'])
          : (map['createdAt'] is String
              ? DateTime.parse(map['createdAt'])
              : map['createdAt'] as DateTime? ?? DateTime.now()),
      updatedAt: addressData['updatedAt'] != null
          ? DateTime.parse(addressData['updatedAt'])
          : (map['updatedAt'] is String
              ? DateTime.parse(map['updatedAt'])
              : map['updatedAt'] as DateTime? ?? DateTime.now()),
    );
  }

  Map<String, dynamic> toMap() {
    // Use JSON for address to store all fields in the strict schema's 'address' column
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
      'user_id': userId ?? 1, // Defaulting to 1 if not provided
      'created_at': createdAt.toIso8601String(),
    };
  }

  factory PropertyModel.fromJson(Map<String, dynamic> json) {
    return PropertyModel.fromMap(json);
  }

  Map<String, dynamic> toJson() {
    // For JSON/UI representation, we might want the full map
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
}
