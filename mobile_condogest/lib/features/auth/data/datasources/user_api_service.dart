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
    final raw = data is Map ? (data['data'] as List<dynamic>? ?? []) : (data as List<dynamic>);
    return raw
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

  Future<Map<String, dynamic>> createResident({required String nome, required String email}) async {
    final data = await _client.post(
      ApiEndpoints.residents,
      {'nome': nome, 'email': email},
    );
    return data as Map<String, dynamic>;
  }

  Future<SimpleUser?> getById(String id) async {
    final data = await _client.get(ApiEndpoints.userById(id)) as Map<String, dynamic>;
    return SimpleUser(
      id: data['id'] as String,
      name: data['nome'] as String? ?? data['name'] as String? ?? '',
      role: data['role'] as String? ?? '',
    );
  }

  Future<void> updateUser(String id, {required String nome, required String email}) async {
    await _client.put(ApiEndpoints.updateUser(id), {'nome': nome, 'email': email});
  }
}
