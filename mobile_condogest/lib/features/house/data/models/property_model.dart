import '../../domain/entities/propertys_entity.dart';
import '../models/floor_model.dart';

enum SearchMode { property }

class PropertyModel extends Property {
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
  });

  factory PropertyModel.fromMap(Map<String, dynamic> map) {
    return PropertyModel(
      id: map['id'] as String?,
      name: map['name'] as String? ?? '',
      cep: map['cep'] as String? ?? '',
      street: map['street'] as String? ?? '',
      neighborhood: map['neighborhood'] as String? ?? '',
      number: map['number'] as String?,
      city: map['city'] as String? ?? '',
      state: map['state'] as String? ?? '',
      registration: map['registration'] as String? ?? '',
      floors:
          (map['floors'] as List<dynamic>?)
              ?.map((e) => FloorModel.fromMap(e as Map<String, dynamic>))
              .toList() ??
          [],
      isActive: map['isActive'] as bool? ?? false,
      createdAt: map['createdAt'] is String
          ? DateTime.parse(map['createdAt'])
          : map['createdAt'] as DateTime? ?? DateTime.now(),
      updatedAt: map['updatedAt'] is String
          ? DateTime.parse(map['updatedAt'])
          : map['updatedAt'] as DateTime? ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toMap() {
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

  factory PropertyModel.fromJson(Map<String, dynamic> json) {
    return PropertyModel.fromMap(json);
  }

  Map<String, dynamic> toJson() {
    return toMap();
  }
}
