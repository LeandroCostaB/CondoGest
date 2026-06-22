import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:condogest/core/network/api_client.dart';
import 'package:condogest/core/network/api_endpoints.dart';

/// Handler de mensagens em background (top-level, fora de qualquer classe).
@pragma('vm:entry-point')
Future<void> _firebaseBackgroundHandler(RemoteMessage message) async {
  // Firebase já exibe a notificação automaticamente em background/terminated.
  // Aqui você pode salvar dados locais se necessário.
  debugPrint('[FCM] background message: ${message.messageId}');
}

class PushNotificationService {
  PushNotificationService._();
  static final PushNotificationService instance = PushNotificationService._();

  late final FirebaseMessaging _fcm = FirebaseMessaging.instance;
  final ApiClient _api = ApiClient();

  /// Inicializa FCM: pede permissão, registra token e configura handlers.
  /// Chame após login bem-sucedido.
  Future<void> initialize() async {
    // Web usa vapid key separada — por ora só inicializamos em Android/iOS.
    if (kIsWeb) return;

    // 1. Solicitar permissão (iOS / Android 13+)
    final settings = await _fcm.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );
    if (settings.authorizationStatus == AuthorizationStatus.denied) {
      debugPrint('[FCM] Permissão negada pelo usuário.');
      return;
    }

    // 2. Handler de background
    FirebaseMessaging.onBackgroundMessage(_firebaseBackgroundHandler);

    // 3. Handler de foreground — exibe um snackbar via overlay ou loga
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      debugPrint('[FCM] foreground: ${message.notification?.title} — ${message.notification?.body}');
      // Para exibir um banner em foreground no Android você precisaria de
      // flutter_local_notifications. Por ora apenas logamos.
    });

    // 4. Obter e enviar token ao backend
    final token = await _fcm.getToken();
    if (token != null) {
      await _sendTokenToBackend(token);
    }

    // 5. Atualizar token quando ele for renovado pelo FCM
    _fcm.onTokenRefresh.listen(_sendTokenToBackend);
  }

  Future<void> _sendTokenToBackend(String token) async {
    try {
      await _api.patch(ApiEndpoints.fcmToken, {'token': token});
      debugPrint('[FCM] Token registrado no backend.');
    } catch (e) {
      debugPrint('[FCM] Falha ao registrar token: $e');
    }
  }
}
