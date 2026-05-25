import 'package:condogest/features/property_manager/domain/entities/unit_entity.dart';

import '../entities/floor_entity.dart';

class Property {
  final String? id;
  final String name;
  final String cep;
  final String street;
  final String neighborhood;
  final String? number;
  final String city;
  final String state;
  final String registration;
  final List<Floor> floors;
  final bool isActive;
  final DateTime createdAt;
  final DateTime updatedAt;

  Property({
    this.id,
    required this.name,
    required this.cep,
    required this.street,
    required this.neighborhood,
    required this.number,
    required this.city,
    required this.state,
    required this.floors,
    required this.registration,
    required this.isActive,
    required this.createdAt,
    required this.updatedAt,
  });
}
