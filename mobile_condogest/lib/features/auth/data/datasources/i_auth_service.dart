import '../models/user_model.dart';

//Classe abstrata para mock
abstract class IAuthService {
  Future<UserModel?> login(String email, String password);
  Future<void> logout();
  Future<UserModel?> getCurrentUser();
  Future<void> resetPassword(String email);
  Future<bool> updateProfile(UserModel user, String password);
  Future<bool> register({
    required String name,
    required String email,
    required String password,
    required String type,
  });
  Future<bool> isEmailRegistered(String email);
}
