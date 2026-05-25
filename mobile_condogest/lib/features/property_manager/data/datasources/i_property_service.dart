import '../../domain/entities/propertys_entity.dart';

abstract class IPropertyService {
  Future<List<Property>> getAll();
  Future<Property?> getById(String id);
  Future<Property> create(Property property);
  Future<Property?> update(Property property);
  Future<bool> delete(String id);
  Future<void> activate(String id);
  Future<void> deactivate(String id);
}
