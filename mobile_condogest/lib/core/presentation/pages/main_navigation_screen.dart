import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../features/dashboard/presentation/pages/dashboard_screen.dart';
import '../../../features/dashboard/presentation/pages/resident_dashboard_screen.dart';
import '../../../features/property_manager/presentation/pages/home_view.dart';
import '../../../features/ticket_manager/domain/repositories/ticket_repository.dart';
import '../../../features/ticket_manager/presentation/pages/ticket_form_screen.dart';
import '../../../features/profile/presentation/pages/profile_view.dart';
import '../../../features/ticket_manager/presentation/pages/ticket_list_screen.dart';
import '../../../features/property_manager/domain/repositories/property_repository.dart';

class MainNavigationScreen extends StatefulWidget {
  final TicketRepository ticketRepository;
  final String userType;

  const MainNavigationScreen({
    super.key,
    required this.ticketRepository,
    required this.userType,
  });

  @override
  State<MainNavigationScreen> createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen> {
  int _currentIndex = 0;

  final Color _primaryColor = const Color(0xFF1D1B3A);
  final Color _unselectedColor = Colors.white70;
  final Color _selectedColor = Colors.white;

  @override
  Widget build(BuildContext context) {
    final bool isSyndic = widget.userType == 'syndic';

    final List<Widget> pages = isSyndic
        ? [
            DashboardScreen(repository: widget.ticketRepository, userType: 'syndic'),
            const HomeView(),
            const ProfileView(),
          ]
        : [
            TicketListScreen(
              repository: widget.ticketRepository,
              propertyRepository: context.read<PropertyRepository>(),
              userType: 'resident',
              residentId: null, // residentId vem do usuário autenticado
            ),
            TicketFormScreen(repository: widget.ticketRepository),
            const ProfileView(),
          ];

    final List<BottomNavigationBarItem> navItems = isSyndic
        ? const [
            BottomNavigationBarItem(
              icon: Icon(Icons.grid_view_rounded),
              label: "Início",
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.business_rounded),
              label: "Condomínios",
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.person_rounded),
              label: "Perfil",
            ),
          ]
        : const [
            BottomNavigationBarItem(
              icon: Icon(Icons.dashboard_rounded),
              label: "Início",
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.add_circle_outline_rounded),
              label: "Novo Chamado",
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.person_rounded),
              label: "Perfil",
            ),
          ];

    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: pages,
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
        backgroundColor: _primaryColor,
        selectedItemColor: _selectedColor,
        unselectedItemColor: _unselectedColor,
        type: BottomNavigationBarType.fixed,
        items: navItems,
      ),
    );
  }
}
