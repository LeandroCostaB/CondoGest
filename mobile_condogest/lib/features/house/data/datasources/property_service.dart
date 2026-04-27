import 'dart:async';

import '../../domain/entities/propertys_entity.dart';

class PropertyService {
  final List<Property> _properties = [];

  Future<List<Property>> getAll() async {
    await Future.delayed(const Duration(milliseconds: 300));
    return List.from(_properties);
  }

  Future<Property> create(Property property) async {
    await Future.delayed(const Duration(milliseconds: 300));

    final newProperty = Property(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      name: property.name,
      cep: property.cep,
      street: property.street,
      neighborhood: property.neighborhood,
      number: property.number,
      city: property.city,
      state: property.state,
      registration: property.registration,
      floors: property.floors,
      isActive: property.isActive,
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
    );

    _properties.add(newProperty);
    return newProperty;
  }

  Future<Property?> getById(String id) async {
    await Future.delayed(const Duration(milliseconds: 200));

    try {
      return _properties.firstWhere((p) => p.id == id);
    } catch (_) {
      return null;
    }
  }

  Future<Property?> update(Property property) async {
    await Future.delayed(const Duration(milliseconds: 300));

    final index = _properties.indexWhere((p) => p.id == property.id);

    if (index == -1) return null;

    final updated = Property(
      id: property.id,
      name: property.name,
      cep: property.cep,
      street: property.street,
      neighborhood: property.neighborhood,
      number: property.number,
      city: property.city,
      state: property.state,
      registration: property.registration,
      floors: property.floors,
      isActive: property.isActive,
      createdAt: _properties[index].createdAt,
      updatedAt: DateTime.now(),
    );

    _properties[index] = updated;
    return updated;
  }

  Future<bool> delete(String id) async {
    await Future.delayed(const Duration(milliseconds: 300));

    final initialLength = _properties.length;
    _properties.removeWhere((p) => p.id == id);

    return _properties.length < initialLength;
  }
}
