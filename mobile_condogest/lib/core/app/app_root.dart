import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter/foundation.dart';

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../features/auth/presentation/viewmodels/auth_view_model.dart';
import '../../features/auth/presentation/pages/auth_view.dart';
import '../../features/property_manager/presentation/pages/property_list/property_list_view.dart';
import '../../features/property_manager/presentation/pages/property_form/property_form_view.dart';
import '../../features/property_manager/presentation/pages/home_view.dart';

class AppRoot extends StatelessWidget {
  const AppRoot({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthViewModel>();

    if (auth.isLoading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    if (auth.isAuthenticated) {
      return const HomeView();
    }
    return const LoginView();
  }
}
