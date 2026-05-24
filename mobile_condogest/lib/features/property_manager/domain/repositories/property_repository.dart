import '../../domain/entities/propertys_entity.dart';

abstract class PropertyRepository {
  Future<List<Property>> getProperties();
}
