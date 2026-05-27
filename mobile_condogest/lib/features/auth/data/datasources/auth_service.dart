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

    final me = await _client.get(ApiEndpoints.me);
    final user = UserModel(
      id: me['sub'] as String? ?? me['id'] as String? ?? '',
      name: me['nome'] as String? ?? me['name'] as String? ?? '',
      email: me['email'] as String? ?? email,
      type: _mapRole(me['role'] as String?),
      token: token,
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
