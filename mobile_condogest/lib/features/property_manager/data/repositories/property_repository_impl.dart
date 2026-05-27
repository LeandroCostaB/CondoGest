import '../../domain/entities/propertys_entity.dart';
import '../../domain/repositories/property_repository.dart';
import '../datasources/i_property_service.dart';

class PropertyRepositoryImpl implements PropertyRepository {
  final IPropertyService _service;

  PropertyRepositoryImpl(this._service);

  @override
  Future<List<Property>> getProperties() async {
    return await _service.getAll();
  }
}
