import 'package:condogest/features/property_maintenance/data/datasources/i_maintenance_service.dart';
import 'package:condogest/features/property_maintenance/data/datasources/maintenance_service.dart';
import 'package:condogest/features/property_maintenance/presentation/viewmodels/maintenance_viewmodel.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter/foundation.dart';
import 'package:sqflite_common_ffi/sqflite_ffi.dart';

import 'core/app/app_root.dart';
import 'core/database/database_helper.dart';
import 'features/property_manager/data/datasources/i_property_service.dart';
import 'features/property_manager/data/datasources/property_service.dart';
import 'features/property_manager/presentation/viewmodels/property_viewmodel.dart';
import 'features/auth/data/datasources/auth_service.dart';
import 'features/auth/data/datasources/i_auth_service.dart';
import 'features/auth/presentation/viewmodels/auth_view_model.dart';
import 'features/ticket_manager/domain/repositories/ticket_repository.dart';
import 'features/ticket_manager/data/repositories/ticket_repository_impl.dart';
import 'features/ticket_manager/data/datasources/ticket_local_datasource.dart';
import 'core/presentation/pages/main_navigation_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Desktop support for sqflite
  if (Platform.isWindows || Platform.isLinux || Platform.isMacOS) {
    sqfliteFfiInit();
    databaseFactory = databaseFactoryFfi;
  }
  
  final dbHelper = DatabaseHelper();
  final db = await dbHelper.database;
  
  // Repositories Initialization
  final ticketRepo = TicketRepositoryImpl(TicketLocalDatasource(db));
  final propertyService = PropertyService(db);
  final propertyRepo = PropertyRepositoryImpl(propertyService);

  runApp(
    MultiProvider(
      providers: [
        Provider<IAuthService>(create: (_) => AuthService()),
        ChangeNotifierProvider(
          create: (context) => AuthViewModel(context.read<IAuthService>()),
        ),

        Provider<IPropertyService>(create: (_) => propertyService),
        Provider<PropertyRepository>(create: (_) => propertyRepo),
        Provider<TicketRepository>(create: (_) => ticketRepo),
        
        ChangeNotifierProvider(
          create: (context) =>
              PropertyViewModel(context.read<IPropertyService>()),
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
<<<<<<< HEAD
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
=======
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
            return const Scaffold(body: Center(child: CircularProgressIndicator()));
          }
          if (auth.isAuthenticated) {
            return MainNavigationScreen(
              ticketRepository: context.read<TicketRepository>(),
            );
          }
          return const AppRoot(); // Handles login view
        },
>>>>>>> mobile_/feature/SCRUM-23
      ),
    );
  }
}
