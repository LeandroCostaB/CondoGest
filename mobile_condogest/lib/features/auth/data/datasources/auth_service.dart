import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

import '../../../../core/network/api_client.dart';
import '../../../../core/network/api_endpoints.dart';
import '../../domain/entities/user_entity.dart';
import '../models/user_model.dart';
import 'i_auth_service.dart';

class AuthService implements IAuthService {
  final ApiClient _client = ApiClient();

  @override
  Future<UserModel?> login(String email, String password) async {
    final data = await _client.post(
      ApiEndpoints.login,
      {'email': email, 'senha': password},
      requiresAuth: false,
    );

    final token = data['access_token'] as String;
    await _client.saveToken(token);

    // O login retorna { access_token, user: { id, nome, role, permissions } }
    // O /auth/me retorna apenas { sub, email, permissions } — sem role nem nome!
    // Por isso usamos os dados do login como fonte primária.
    final userFromLogin = data['user'] as Map<String, dynamic>?;

    // Chamamos /me só para obter o e-mail confirmado (caso não venha no login)
    final me = await _client.get(ApiEndpoints.me);

    final user = UserModel(
      id: userFromLogin?['id'] as String?
          ?? me['sub'] as String?
          ?? '',
      name: userFromLogin?['nome'] as String?
          ?? userFromLogin?['name'] as String?
          ?? '',
      email: userFromLogin?['email'] as String?
          ?? me['email'] as String?
          ?? email,
      type: _mapRole(userFromLogin?['role'] as String?),
      token: token,
      apartmentId: userFromLogin?['apartmentId'] as String?,
      apartmentNumber: userFromLogin?['apartmentNumber'] as String?,
      apartmentBlock: userFromLogin?['apartmentBlock'] as String?,
    );

    await _saveUserLocally(user);
    return user;
  }

  @override
  Future<void> logout() async {
    await _client.clearToken();
    await _clearUserLocally();
  }

  @override
  Future<UserModel?> getCurrentUser() async {
    return _getUserLocally();
  }

  @override
  Future<void> resetPassword(String email) async {
    throw UnimplementedError('Reset de senha não disponível');
  }

  @override
  Future<bool> register({
    required String name,
    required String email,
    required String password,
    required String type,
  }) async {
    await _client.post(
      ApiEndpoints.register,
      {'nome': name, 'email': email, 'senha': password, 'role': type.toUpperCase()},
      requiresAuth: false,
    );
    return true;
  }

  @override
  Future<bool> updateProfile(UserModel user, String password) async {
    final body = <String, dynamic>{'nome': user.name, 'email': user.email};
    if (password.isNotEmpty) body['senha'] = password;
    await _client.patch(ApiEndpoints.updateMe, body);
    await _saveUserLocally(user);
    return true;
  }

  @override
  Future<bool> isEmailRegistered(String email) async {
    // Sem endpoint dedicado no backend — o erro 409 no register indica e-mail duplicado.
    return false;
  }

  Future<void> _saveUserLocally(UserModel user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('current_user', jsonEncode(user.toJson()));
  }

  Future<UserModel?> _getUserLocally() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString('current_user');
    if (raw == null) return null;
    return UserModel.fromJson(jsonDecode(raw) as Map<String, dynamic>);
  }

  Future<void> _clearUserLocally() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('current_user');
  }

  UserRole _mapRole(String? role) {
    switch (role) {
      case 'SINDICO':
        return UserRole.admin;
      case 'MORADOR':
        return UserRole.resident;
      case 'liquidator':
        return UserRole.liquidator;
      default:
        return UserRole.user;
    }
  }
}
