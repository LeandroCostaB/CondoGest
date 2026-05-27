import 'package:condogest/features/property_maintenance/data/datasources/i_maintenance_service.dart';
import 'package:condogest/features/property_maintenance/data/datasources/maintenance_service.dart';
import 'package:condogest/features/property_maintenance/presentation/viewmodels/maintenance_viewmodel.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter/foundation.dart';

import 'core/app/app_root.dart';
import 'features/property_manager/data/datasources/i_property_service.dart';
import 'features/property_manager/data/datasources/property_service.dart';
import 'features/property_manager/presentation/viewmodels/property_viewmodel.dart';
import 'features/auth/data/datasources/auth_service.dart';
import 'features/auth/data/datasources/i_auth_service.dart';
import 'features/auth/presentation/viewmodels/auth_view_model.dart';
import 'features/auth/presentation/pages/auth_view.dart';

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

        Provider<IPropertyService>(create: (_) => PropertyService()),
        ChangeNotifierProvider(
          create: (context) =>
              PropertyViewModel(context.read<IPropertyService>()),
        ),
        Provider<IMaintenanceService>(create: (_) => MaintenanceService()),
        ChangeNotifierProvider(
          create: (context) =>
              MaintenanceViewModel(context.read<IMaintenanceService>()),
        ),
      ],
      child: MaterialApp(
        title: 'CondoGest',
        debugShowCheckedModeBanner: false,
        //home: const LoginView(),
        home: const AppRoot(),
      ),
    );
  }
}
