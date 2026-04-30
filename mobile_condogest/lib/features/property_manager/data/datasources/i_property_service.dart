import '../../domain/entities/propertys_entity.dart';

abstract class IPropertyService {
  Future<List<Property>> getAll();
  Future<Property> create(Property property);
  Future<Property?> update(Property property);
  Future<bool> delete(String id);
}
