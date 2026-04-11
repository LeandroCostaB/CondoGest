import '../model/user_model.dart';

/// Interface base para serviços de autenticação
/// Implementada por AuthService (Firebase) e AuthServiceMock (Testes)
abstract class IAuthService {
  Future<UserAuth?> login(String email, String password);
  Future<void> logout();
  Future<UserAuth?> getCurrentUser();
  Future<void> resetPassword(String email);
}
