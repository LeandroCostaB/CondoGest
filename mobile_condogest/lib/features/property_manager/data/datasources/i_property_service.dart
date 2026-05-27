import '../../domain/entities/propertys_entity.dart';

abstract class IPropertyService {
  Future<List<Property>> getAll({int? userId});
  Future<Property> create(Property property, {required int userId});
  Future<Property?> update(Property property);
  Future<bool> delete(String id);
}
