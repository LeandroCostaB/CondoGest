import 'dart:io';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:sqflite_common_ffi/sqflite_ffi.dart';

import 'core/database/database_helper.dart';
import 'features/property_manager/data/datasources/i_property_service.dart';
import 'features/property_manager/data/datasources/property_service.dart';
import 'features/property_manager/presentation/viewmodels/property_viewmodel.dart';
import 'features/property_manager/domain/repositories/property_repository.dart';
import 'features/property_manager/data/repositories/property_repository_impl.dart';
import 'features/auth/data/datasources/auth_service.dart';
import 'features/auth/data/datasources/i_auth_service.dart';
import 'features/auth/presentation/viewmodels/auth_view_model.dart';
import 'features/auth/presentation/pages/auth_view.dart';
import 'features/auth/domain/entities/user_entity.dart';
import 'features/ticket_manager/domain/repositories/ticket_repository.dart';
import 'features/ticket_manager/data/repositories/ticket_repository_impl.dart';
import 'features/property_maintenance/domain/repositories/maintenance_repository.dart';
import 'features/property_maintenance/data/repositories/maintenance_repository_impl.dart';
import 'features/ticket_manager/data/datasources/ticket_local_datasource.dart';
import 'core/presentation/pages/main_navigation_screen.dart';
import 'features/property_maintenance/data/datasources/maintenance_local_datasource.dart';
import 'features/property_maintenance/presentation/viewmodels/maintenance_viewmodel.dart';
import 'package:condogest/features/property_manager/domain/entities/propertys_entity.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  if (Platform.isWindows || Platform.isLinux || Platform.isMacOS) {
    sqfliteFfiInit();
    databaseFactory = databaseFactoryFfi;
  }

  final dbHelper = DatabaseHelper();
  final db = await dbHelper.database;

  final ticketRepo = TicketRepositoryImpl(TicketLocalDatasource(db));
  final maintenanceRepo = MaintenanceRepositoryImpl(
    MaintenanceLocalDatasource(db),
  );
  final propertyService = PropertyService(db);
  final propertyRepo = PropertyRepositoryImpl(propertyService);

  runApp(
    MultiProvider(
      providers: [
        Provider<IAuthService>(create: (_) => AuthService(db)),
        ChangeNotifierProvider(
          create: (context) => AuthViewModel(context.read<IAuthService>()),
        ),
        Provider<IPropertyService>(create: (_) => propertyService),
        Provider<PropertyRepository>(create: (_) => propertyRepo),
        Provider<TicketRepository>(create: (_) => ticketRepo),
        Provider<MaintenanceRepository>(create: (_) => maintenanceRepo),

        // Mantendo o ViewModel de Propriedades que você já tinha:
        ChangeNotifierProvider(
          create: (context) =>
              PropertyViewModel(context.read<IPropertyService>()),
        ),

        ChangeNotifierProvider(
          create: (context) =>
              MaintenanceViewModel(context.read<MaintenanceRepository>()),
        ),
      ],
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'CondoGest',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primaryColor: const Color(0xFF1D1B3A),
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF1D1B3A)),
      ),
      home: Consumer<AuthViewModel>(
        builder: (context, auth, _) {
          if (auth.isLoading) {
            return const Scaffold(
              body: Center(child: CircularProgressIndicator()),
            );
          }
          if (auth.isAuthenticated) {
            final user = auth.currentUser;
            if (user != null) {
              final userType = (user.type == UserRole.resident)
                  ? 'resident'
                  : 'syndic';
              return MainNavigationScreen(
                ticketRepository: context.read<TicketRepository>(),
                userType: userType,
                property: Property(
                  id: 0, // O ID na sua entidade é int?, então passamos 0 (ou null)
                  name: 'Selecione um condomínio',
                  cep: '',
                  street: '',
                  neighborhood: '',
                  number: '',
                  city: '',
                  state: '',
                  registration: '',
                  floors: const [], // Lista vazia de andares
                  isActive: false,
                  createdAt: DateTime.now(),
                  updatedAt: DateTime.now(),
                ),
              );
            }
          }
          return const LoginView();
        },
      ),
    );
  }
}
