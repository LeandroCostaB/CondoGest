import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter/foundation.dart'; // Para kDebugMode

import 'features/auth/data/datasources/auth_service.dart';
import 'features/auth/data/datasources/i_auth_service.dart';
import 'features/auth/presentation/viewmodels/auth_view_model.dart';
import 'features/auth/presentation/pages/auth_view.dart';

// MODO DE DESENVOLVIMENTO: true = usa dados mockados, false = usa Firebase
// IMPORTANTE: Devido ao problema de reCAPTCHA em emuladores, use true para desenvolvimento
const bool USE_MOCK_AUTH = false;

void main() async {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        Provider<IAuthService>(create: (_) => AuthService()),
        ChangeNotifierProvider(
          create: (context) => AuthViewModel(context.read<IAuthService>()),
        ),
      ],
      child: MaterialApp(
        title: 'CondoGest',
        debugShowCheckedModeBanner: false,
        home: const LoginView(),
      ),
    );
  }
}
