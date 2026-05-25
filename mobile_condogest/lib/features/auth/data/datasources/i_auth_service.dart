import '../models/user_model.dart';

//Classe abstrata para mock
abstract class IAuthService {
  Future<UserModel?> login(String email, String password);
  Future<void> logout();
  Future<UserModel?> getCurrentUser();
  Future<void> resetPassword(String email);
}
