import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:sqflite/sqflite.dart';

import '../models/user_model.dart';
import '../../domain/entities/user_entity.dart';
import 'i_auth_service.dart';

class AuthService implements IAuthService {
  final Database db;

  AuthService(this.db);

  @override
  Future<UserModel?> login(String email, String password) async {
    // 1. Asynchronous query against the Users table
    final List<Map<String, dynamic>> results = await db.query(
      'Users',
      where: 'email = ? AND password_hash = ?',
      whereArgs: [email, password],
    );

    if (results.isEmpty) {
      return null;
    }

    final userData = results.first;

    final userAuth = UserModel(
      id: userData['id'].toString(),
      name: userData['name'],
      email: userData['email'],
      type: _mapStringToRole(userData['type']),
      token: 'fake-jwt-token-${userData['id']}', // Mock token for session
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

  @override
  Future<bool> updateProfile(UserModel user, String password) async {
    try {
      int rowsAffected = await db.update(
        'Users',
        {
          'name': user.name,
          'email': user.email,
          'password_hash': password,
        },
        where: 'id = ?',
        whereArgs: [int.parse(user.id)],
      );

      if (rowsAffected > 0) {
        await _saveUserLocally(user);
        return true;
      }
      return false;
    } catch (e) {
      print('Error updating profile: $e');
      return false;
    }
  }

  @override
  Future<bool> register({
    required String name,
    required String email,
    required String password,
    required String type,
  }) async {
    try {
      final String createdAt = DateTime.now().toIso8601String().split('T')[0];
      
      int id = await db.insert(
        'Users',
        {
          'name': name,
          'email': email,
          'password_hash': password,
          'created_at': createdAt,
          'type': type,
        },
        conflictAlgorithm: ConflictAlgorithm.fail,
      );
      
      return id > 0;
    } catch (e) {
      print('Error registering user: $e');
      return false;
    }
  }

  @override
  Future<bool> isEmailRegistered(String email) async {
    final List<Map<String, dynamic>> result = await db.query(
      'Users',
      where: 'email = ?',
      whereArgs: [email],
    );
    return result.isNotEmpty;
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
      case 'syndic': // Support for 'syndic' from database
        return UserRole.liquidator;
      case 'resident':
        return UserRole.resident;
      default:
        return UserRole.user;
    }
  }
}
