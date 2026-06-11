import '../../../../core/network/api_client.dart';
import '../../../../core/network/api_endpoints.dart';
import '../../domain/entities/propertys_entity.dart';
import '../models/property_model.dart';
import 'i_property_service.dart';

class PropertyService implements IPropertyService {
  final ApiClient _client = ApiClient();

  @override
  Future<List<Property>> getAll() async {
    final data = await _client.get(ApiEndpoints.condominiums);
    final items = data['data'] as List<dynamic>;
    return items
        .map((e) => PropertyModel.fromApiJson(e as Map<String, dynamic>))
        .toList();
  }

  @override
  Future<Property?> getById(String id) async {
    final data = await _client.get(ApiEndpoints.condominiumById(id));
    return PropertyModel.fromApiJson(data as Map<String, dynamic>);
  }

  @override
  Future<Property> create(Property property) async {
    final model = PropertyModel.fromEntity(property);
    // POST retorna 201 sem body — recarrega a lista e retorna pelo nome
    await _client.post(ApiEndpoints.condominiums, model.toApiJson());
    final all = await getAll();
    return all.firstWhere(
      (p) => p.name == property.name,
      orElse: () => PropertyModel.fromEntity(property),
    );
  }

  @override
  Future<Property?> update(Property property) async {
    if (property.id == null) return null;
    final model = PropertyModel.fromEntity(property);
    // PUT retorna 200 sem body — retorna o próprio objeto de entrada
    await _client.put(ApiEndpoints.condominiumById(property.id!), model.toApiJson());
    return property;
  }

  @override
  Future<bool> delete(String id) async {
    await _client.delete(ApiEndpoints.condominiumById(id));
    return true;
  }

  @override
  Future<void> activate(String id) async {
    await _client.patch(ApiEndpoints.activateCondominium(id));
  }

  @override
  Future<void> deactivate(String id) async {
    await _client.patch(ApiEndpoints.deactivateCondominium(id));
  }
}
