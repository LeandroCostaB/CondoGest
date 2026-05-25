import '../../../../core/network/api_client.dart';
import '../../../../core/network/api_endpoints.dart';
import '../../domain/entities/provider.dart';
import 'i_provider_service.dart';

class ProviderService implements IProviderService {
  final ApiClient _client = ApiClient();

  Provider _fromApiJson(Map<String, dynamic> json) {
    return Provider(
      id: null, // backend usa UUID string; a entidade atual usa int? — manter null
      name: json['name'] as String,
      cpfCnpj: '',
      email: null,
      telephone: json['phone'] as String? ?? '',
      specialty: json['specialty'] as String? ?? '',
      isActive: true,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'] as String)
          : DateTime.now(),
      updatedAt: json['updatedAt'] != null
          ? DateTime.parse(json['updatedAt'] as String)
          : DateTime.now(),
    );
  }

  @override
  Future<List<Provider>> getAll() async {
    final data = await _client.get(ApiEndpoints.providers);
    final items = data['data'] as List<dynamic>;
    return items
        .map((e) => _fromApiJson(e as Map<String, dynamic>))
        .toList();
  }

  @override
  Future<Provider?> getById(String id) async {
    final data = await _client.get(ApiEndpoints.providerById(id));
    return _fromApiJson(data as Map<String, dynamic>);
  }

  @override
  Future<Provider> create(Provider provider) async {
    final data = await _client.post(ApiEndpoints.providers, {
      'name': provider.name,
      'phone': provider.telephone,
      'specialty': provider.specialty,
    });
    return _fromApiJson(data as Map<String, dynamic>);
  }

  @override
  Future<Provider?> update(Provider provider) async {
    await _client.put(ApiEndpoints.providerById(provider.id.toString()), {
      'name': provider.name,
      'phone': provider.telephone,
      'specialty': provider.specialty,
    });
    return provider;
  }

  @override
  Future<bool> delete(String id) async {
    await _client.delete(ApiEndpoints.providerById(id));
    return true;
  }
}
