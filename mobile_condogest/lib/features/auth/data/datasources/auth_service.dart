import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:firebase_auth/firebase_auth.dart';
import 'package:shared_preferences/shared_preferences.dart';

//serviços >>>

import '../model/user_model.dart';
import 'i_auth_service.dart';

class AuthService implements IAuthService {
  final FirebaseAuth _firebaseAuth = FirebaseAuth.instance;

  final String _baseUrl = 'http://localhost:8080';

  AuthService() {
    // Desabilita a verificação de App para permitir login em emuladores
    _firebaseAuth.setSettings(appVerificationDisabledForTesting: true);
  }

  /// Realiza login com email e senha usando Firebase Authentication
  Future<UserAuth?> login(String email, String password) async {
    try {
      // Autentica com Firebase
      final UserCredential userCredential = await _firebaseAuth
          .signInWithEmailAndPassword(email: email, password: password);

      final User? firebaseUser = userCredential.user;
      if (firebaseUser == null) {
        throw Exception('Falha ao obter usuário do Firebase');
      }

      // Obtém o token de autenticação
      final String? token = await firebaseUser.getIdToken();
      if (token == null) {
        throw Exception('Falha ao obter token');
      }

      final url = Uri.parse('$_baseUrl/user_route');

      final response = await http.get(
        url,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token', //Envia o token ao back pra validar
        },
      );

      String roleStringFromBack = 'user';

      if (response.statusCode == 200) {
        //Back-end confirmou quem é o usuário e sua respectiva ROLE>
        final Map<String, dynamic> backendData = jsonDecode(response.body);

        //Extrai a ROLE real da coleção 'person' do db >>>
        roleStringFromBack = backendData['role'] ?? 'user';

        print('Login Back-end obteve Êxito! Role String = $roleStringFromBack');
      } else {
        print('Erro ao buscar dados no Back: ${response.statusCode}');
        throw Exception(
          'Erro de integração: Não foi possível recuperar o perfil do usuário: ${response.statusCode}',
        );
      }

      // Montagem Objeto Final.

      final userAuth = UserAuth(
        id: firebaseUser.uid,
        name: firebaseUser.displayName ?? 'Usuário',
        email: firebaseUser.email ?? email,
        role: _mapStringToRole(roleStringFromBack), //ROLE vinda do Back
        profileImg: firebaseUser.photoURL,
        token: token,
      );

      // Salva os dados do usuário localmente
      await _saveUserLocally(userAuth);

      return userAuth;
    } on FirebaseAuthException catch (e) {
      print("===== DEBUG LOGIN FIREBASE =====");
      print("EMAIL ENVIADO: '$email'");
      print("SENHA ENVIADA: '$password'");
      print("ERRO CODE: ${e.code}");
      print("ERRO MESSAGE: ${e.message}");
      print("ERRO COMPLETO: $e");
      print("===== FIM DEBUG =====");
      throw _handleFirebaseAuthException(e);
    } catch (e) {
      throw Exception('Erro ao fazer login: $e');
    }
  }

  /// Realiza logout
  Future<void> logout() async {
    try {
      await _firebaseAuth.signOut();
      await _clearUserLocally();
    } catch (e) {
      throw Exception('Erro ao fazer logout: $e');
    }
  }

  /// Verifica se existe um usuário logado
  Future<UserAuth?> getCurrentUser() async {
    try {
      final User? firebaseUser = _firebaseAuth.currentUser;

      if (firebaseUser != null) {
        // Tenta carregar do cache local primeiro
        final cachedUser = await _getUserLocally();
        if (cachedUser != null) {
          return cachedUser;
        }

        // Se não tem cache, cria do Firebase
        final String? token = await firebaseUser.getIdToken();
        return UserAuth(
          id: firebaseUser.uid,
          name: firebaseUser.displayName ?? 'Usuário',
          email: firebaseUser.email ?? '',
          role: UserRole.user,
          profileImg: firebaseUser.photoURL,
          token: token ?? '',
        );
      }

      return null;
    } catch (e) {
      print('Erro ao obter usuário atual: $e');
      return null;
    }
  }

  /// Salva dados do usuário localmente usando SharedPreferences
  Future<void> _saveUserLocally(UserAuth user) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final String userJson = jsonEncode(user.toJson());
      await prefs.setString('current_user', userJson);
    } catch (e) {
      print('Erro ao salvar usuário localmente: $e');
    }
  }

  /// Recupera dados do usuário do cache local
  Future<UserAuth?> _getUserLocally() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final String? userJson = prefs.getString('current_user');
      if (userJson != null) {
        final Map<String, dynamic> userMap = jsonDecode(userJson);
        return UserAuth.fromJson(userMap);
      }
      return null;
    } catch (e) {
      print('Erro ao recuperar usuário do cache: $e');
      return null;
    }
  }

  /*Future<void> _saveUserLocally(UserAuth user) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final String userJson = jsonEnconde(user.toJson());
      await prefs.setString('current_user', userJson);
    } catch (e) {
      print('Erro ao salvar usuário localmente: $e');
    }
  } */

  /// Remove dados do usuário do cache local
  Future<void> _clearUserLocally() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('current_user');
    } catch (e) {
      print('Erro ao limpar cache do usuário: $e');
    }
  }

  /// Trata erros do Firebase Auth e retorna mensagens amigáveis
  String _handleFirebaseAuthException(FirebaseAuthException e) {
    print('----- DEBUG LOGIN ERROR -----');
    print('CODE: ${e.code}');
    print('MESSAGE: ${e.message}');
    print('PLUGIN: ${e.plugin}');
    print('STACK: ${e.stackTrace}');
    print('------------------------------');

    switch (e.code) {
      case 'user-not-found':
        return 'Usuário não encontrado';
      case 'wrong-password':
        return 'Senha incorreta';
      case 'invalid-email':
        return 'Email inválido';
      case 'user-disabled':
        return 'Usuário desabilitado';
      case 'too-many-requests':
        return 'Muitas tentativas. Tente novamente mais tarde';
      case 'invalid-credential':
        return 'Credenciais inválidas';
      default:
        return 'Erro ao fazer login: ${e.message}';
    }
  }

  /// Recupera senha (envia email de redefinição)
  Future<void> resetPassword(String email) async {
    try {
      await _firebaseAuth.sendPasswordResetEmail(email: email);
    } on FirebaseAuthException catch (e) {
      throw _handleFirebaseAuthException(e);
    } catch (e) {
      throw Exception('Erro ao recuperar senha: $e');
    }
  }

  UserRole _mapStringToRole(String? roleString) {
    switch (roleString) {
      case 'admin':
        return UserRole.admin;
      case 'producer':
        return UserRole.producer;
      case 'collector':
        return UserRole.collector;
      default:
        // Se vier null, vazio ou 'user', retorna o papel padrão
        return UserRole.user;
    }
  }
}
