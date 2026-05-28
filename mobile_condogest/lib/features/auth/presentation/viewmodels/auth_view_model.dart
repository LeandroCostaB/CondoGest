import 'package:flutter/material.dart';
import '../../data/models/user_model.dart';
import '../../data/datasources/i_auth_service.dart';

class AuthViewModel extends ChangeNotifier {
  final IAuthService _authService;

  AuthViewModel(this._authService);

  bool _isLoading = false;
  String? _errorMessage;
  UserModel? _currentUser;

  //GETTERS
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  UserModel? get currentUser => _currentUser;
  bool get isAuthenticated => _currentUser != null;

  Future<void> initialize() async {
    _isLoading = true;
    notifyListeners();

    try {
      _currentUser = await _authService.getCurrentUser();
    } catch (e) {
      print('Erro ao inicializar auth: $e');
      _currentUser = null;
    }

    _isLoading = false;
    notifyListeners();
  }

  //login
  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _currentUser = await _authService.login(email, password);
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      _isLoading = false;
      _currentUser = null;
      notifyListeners();
      return false;
    }
  }

  //logout
  Future<void> logout() async {
    _isLoading = true;
    notifyListeners();

    try {
      await _authService.logout();
      _currentUser = null;
      _errorMessage = null;
    } catch (e) {
      _errorMessage = e.toString().replaceAll('Exception: ', '');
    }

    _isLoading = false;
    notifyListeners();
  }

  //Recupera senha
  Future<bool> resetPassword(String email) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await _authService.resetPassword(email);
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> updateProfile({
    required String name,
    required String email,
    required String password,
  }) async {
    if (_currentUser == null) return false;

    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final updatedUser = UserModel(
        id: _currentUser!.id,
        name: name,
        email: email,
        type: _currentUser!.type,
        token: _currentUser!.token,
      );

      final success = await _authService.updateProfile(updatedUser, password);
      if (success) {
        _currentUser = updatedUser;
      }
      _isLoading = false;
      notifyListeners();
      return success;
    } catch (e) {
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> register({
    required String name,
    required String email,
    required String password,
    required String type,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final success = await _authService.register(
        name: name,
        email: email,
        password: password,
        type: type,
      );
      _isLoading = false;
      notifyListeners();
      return success;
    } catch (e) {
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> isEmailRegistered(String email) async {
    return await _authService.isEmailRegistered(email);
  }

  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }
}
