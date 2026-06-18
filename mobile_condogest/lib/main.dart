import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'core/utils/sqlite_bootstrap.dart';
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
import 'features/ticket_manager/data/datasources/ticket_local_datasource.dart';
import 'features/ticket_manager/data/datasources/ticket_service.dart';
import 'features/ticket_manager/domain/entities/ticket.dart';
import 'features/property_maintenance/data/datasources/i_maintenance_service.dart';
import 'features/property_maintenance/data/datasources/maintenance_service.dart';
import 'features/property_maintenance/presentation/viewmodels/maintenance_viewmodel.dart';
import 'core/presentation/pages/main_navigation_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Inicializa SQLite FFI no desktop; no-op no web.
  await initSqliteIfNeeded();

  late final TicketRepository ticketRepo;

  if (kIsWeb) {
    // Web: SQLite não disponível — usa repositório via HTTP.
    ticketRepo = RemoteTicketRepository();
  } else {
    final db = await DatabaseHelper().database;
    ticketRepo = TicketRepositoryImpl(TicketLocalDatasource(db));
  }

  final propertyService = PropertyService();
  final propertyRepo = PropertyRepositoryImpl(propertyService);
  final maintenanceService = MaintenanceService();

  runApp(
    MultiProvider(
      providers: [
        Provider<IAuthService>(create: (_) => AuthService()),
        ChangeNotifierProvider(
          create: (ctx) => AuthViewModel(ctx.read<IAuthService>()),
        ),
        Provider<IPropertyService>(create: (_) => propertyService),
        Provider<PropertyRepository>(create: (_) => propertyRepo),
        Provider<TicketRepository>(create: (_) => ticketRepo),
        Provider<IMaintenanceService>(create: (_) => maintenanceService),
        ChangeNotifierProvider(
          create: (ctx) => PropertyViewModel(ctx.read<IPropertyService>()),
        ),
        ChangeNotifierProvider(
          create: (ctx) => MaintenanceViewModel(ctx.read<IMaintenanceService>()),
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
              final userType = user.type == UserRole.resident ? 'resident' : 'syndic';
              return MainNavigationScreen(
                ticketRepository: context.read<TicketRepository>(),
                userType: userType,
              );
            }
          }
          return const LoginView();
        },
      ),
    );
  }
}

/// Implementação de [TicketRepository] para web — delega ao [TicketService] HTTP.
class RemoteTicketRepository implements TicketRepository {
  final _service = TicketService();

  @override
  Future<void> saveTicket(Ticket ticket) async {
    await _service.create(ticket);
  }

  @override
  Future<List<Ticket>> getAllTickets({
    String? propertyId,
    String? residentId,
  }) async {
    if (residentId != null && residentId.isNotEmpty) {
      return _service.getByResident(residentId);
    }
    if (propertyId != null && propertyId.isNotEmpty) {
      return _service.getByCondominium(propertyId);
    }
    return _service.getAll();
  }

  @override
  Future<void> updateTicketStatus(String ticketId, String newStatus) async {
    final ticket = await _service.getById(ticketId);
    if (ticket == null) return;
    await _service.update(Ticket(
      id: ticket.id,
      title: ticket.title,
      description: ticket.description,
      location: ticket.location,
      type: ticket.type,
      priority: ticket.priority,
      status: newStatus,
      apartmentId: ticket.apartmentId,
      propertyId: ticket.propertyId,
      residentId: ticket.residentId,
      createdAt: ticket.createdAt,
    ));
  }

  @override
  Future<void> updateTicket(Ticket ticket) async {
    await _service.update(ticket);
  }
}
