import '../../../../core/network/api_client.dart';
import '../../../../core/network/api_endpoints.dart';

class SimpleUser {
  final String id;
  final String name;
  final String role;

  const SimpleUser({required this.id, required this.name, required this.role});
}

class UserApiService {
  final ApiClient _client = ApiClient();

  Future<List<SimpleUser>> listResidents() async {
    final data = await _client.get(ApiEndpoints.users);
    final items = data as List<dynamic>;
    return items
        .map((e) => e as Map<String, dynamic>)
        .where((u) => u['role'] == 'MORADOR')
        .map(
          (u) => SimpleUser(
            id: u['id'] as String,
            name: u['nome'] as String? ?? u['name'] as String? ?? '',
            role: u['role'] as String,
          ),
        )
        .toList();
  }
}
