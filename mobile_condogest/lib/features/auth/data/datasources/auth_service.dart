import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

import '../models/user_model.dart';
import '../../domain/entities/user_entity.dart';
import 'i_auth_service.dart';

class AuthService implements IAuthService {
  /// LOGIN MOCK
  @override
  Future<UserModel?> login(String email, String password) async {
    await Future.delayed(const Duration(seconds: 1));

    final Map<String, dynamic> fakeResponse = {
      "id": "1",
      "name": "Usuário Teste",
      "email": email,
      "role": "admin",
      "token": "fake-jwt-token-123",
    };

    print("===== LOGIN MOCK =====");
    print(jsonEncode(fakeResponse));
    print("======================");

    final userAuth = UserModel(
      id: fakeResponse["id"],
      name: fakeResponse["name"],
      email: fakeResponse["email"],
      type: _mapStringToRole(fakeResponse["role"]),
      token: fakeResponse["token"],
    );

    await _saveUserLocally(userAuth);

    return userAuth;
  }

  @override
  Future<void> logout() async {
    await _clearUserLocally();
  }

  @override
  Future<UserModel?> getCurrentUser() async {
    return await _getUserLocally();
  }

  @override
  Future<void> resetPassword(String email) async {
    await Future.delayed(const Duration(seconds: 1));
    print("Reset de senha solicitado para: $email");
  }

  Future<void> _saveUserLocally(UserModel user) async {
    final prefs = await SharedPreferences.getInstance();
    final String userJson = jsonEncode(user.toJson());
    await prefs.setString('current_user', userJson);
  }

  Future<UserModel?> _getUserLocally() async {
    final prefs = await SharedPreferences.getInstance();
    final String? userJson = prefs.getString('current_user');

    if (userJson != null) {
      final Map<String, dynamic> userMap = jsonDecode(userJson);
      return UserModel.fromJson(userMap);
    }

    return null;
  }

  Future<void> _clearUserLocally() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('current_user');
  }

  UserRole _mapStringToRole(String? roleString) {
    switch (roleString) {
      case 'admin':
        return UserRole.admin;
      case 'liquidator':
        return UserRole.liquidator;
      case 'resident':
        return UserRole.resident;
      default:
        return UserRole.user;
    }
  }
}
