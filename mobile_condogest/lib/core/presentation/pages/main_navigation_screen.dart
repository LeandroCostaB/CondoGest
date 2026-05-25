import 'package:condogest/features/property_manager/presentation/pages/home_view.dart';
import 'package:flutter/material.dart';
import '../../../features/dashboard/presentation/pages/dashboard_screen.dart';
import '../../../features/property_manager/presentation/pages/property_list/property_list_view.dart';
import '../../../features/ticket_manager/domain/repositories/ticket_repository.dart';
import '../../../features/profile/presentation/pages/profile_view.dart';

class MainNavigationScreen extends StatefulWidget {
  final TicketRepository ticketRepository;

  const MainNavigationScreen({super.key, required this.ticketRepository});

  @override
  State<MainNavigationScreen> createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen> {
  int _currentIndex = 0;

  // Constants for styling
  final Color _primaryColor = const Color(0xFF1D1B3A); // Dark Purple
  final Color _unselectedColor = Colors.white70;
  final Color _selectedColor = Colors.white;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: [
          DashboardScreen(repository: widget.ticketRepository),
          const HomeView(),
          const ProfileView(),
        ],
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        backgroundColor: _primaryColor,
        selectedItemColor: _selectedColor,
        unselectedItemColor: _unselectedColor,
        type: BottomNavigationBarType.fixed,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.grid_view_rounded),
            label: "Dashboard",
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.home_rounded),
            label: "Propriedades",
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person_rounded),
            label: "Perfil",
          ),
        ],
      ),
    );
  }
}
