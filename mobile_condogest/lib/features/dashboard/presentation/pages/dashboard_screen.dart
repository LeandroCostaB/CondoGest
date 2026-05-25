import 'package:flutter/material.dart';
import 'package:condogest/features/ticket_manager/presentation/pages/ticket_list_screen.dart';
import 'package:condogest/features/ticket_manager/domain/repositories/ticket_repository.dart';
import 'package:condogest/features/property_manager/domain/repositories/property_repository.dart';
import 'package:provider/provider.dart';

class DashboardScreen extends StatefulWidget {
  final TicketRepository repository;

  const DashboardScreen({super.key, required this.repository});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  // Constants for styling
  final Color _primaryColor = const Color(0xFF1D1B3A); // Dark Purple
  final Color _accentColor = const Color(0xFF2E7D32); // Dark Green
  final Color _cardShadowColor = Colors.black.withOpacity(0.05);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      appBar: AppBar(
        backgroundColor: _primaryColor,
        title: const Text(
          "DASHBOARD",
          style: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
            letterSpacing: 1.2,
          ),
        ),
        centerTitle: true,
        automaticallyImplyLeading: false, // Root screen
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _buildWelcomeHeader(),
            const SizedBox(height: 24),
            _buildNavigationButtons(),
            const SizedBox(height: 24),
            _buildPendingMaintenancesCard(),
            const SizedBox(height: 24),
            _buildFinancialCard(),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  Widget _buildWelcomeHeader() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          "Bem vindo,",
          style: TextStyle(fontSize: 16, color: Colors.grey),
        ),
        Text(
          "Fulano da Silva",
          style: TextStyle(
            fontSize: 28,
            fontWeight: FontWeight.bold,
            color: _accentColor,
          ),
        ),
      ],
    );
  }

  Widget _buildNavigationButtons() {
    return Row(
      children: [
        Expanded(
          child: _buildNavButton(
            label: "Tickets",
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => TicketListScreen(
                    repository: widget.repository,
                    propertyRepository: context.read<PropertyRepository>(),
                  ),
                ),
              );
            },
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: _buildNavButton(
            label: "Manutenção",
            onTap: () {
              debugPrint("Navegar para Manutenção");
            },
          ),
        ),
      ],
    );
  }

  Widget _buildNavButton({required String label, required VoidCallback onTap}) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: _accentColor, width: 2),
        ),
        child: Center(
          child: Text(
            label,
            style: TextStyle(
              color: _accentColor,
              fontWeight: FontWeight.bold,
              fontSize: 16,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildPendingMaintenancesCard() {
    final List<Map<String, String>> dummyMaintenances = [
      {"date": "28/09/2025", "title": "Interfone"},
      {"date": "30/09/2025", "title": "Elevador"},
      {"date": "02/10/2025", "title": "Encanamento"},
    ];

    return Card(
      color: Colors.white,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: Colors.grey.shade200),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              "Manutenções Pendentes",
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            ...dummyMaintenances.map(
              (m) => Padding(
                padding: const EdgeInsets.only(bottom: 12.0),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.red.shade50,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        m["date"]!,
                        style: const TextStyle(
                          color: Colors.red,
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        m["title"]!,
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w500,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    ],
                    ),
                    ),
                    ),

          ],
        ),
      ),
    );
  }

  Widget _buildFinancialCard() {
    return Card(
      color: Colors.white,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: Colors.grey.shade200),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              "Financeiro",
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 24),
            _buildFinancialBar("Jan", 0.4),
            _buildFinancialBar("Fev", 0.6),
            _buildFinancialBar("Mar", 0.5),
            _buildFinancialBar("Abr", 0.8),
            _buildFinancialBar("Mai", 0.7),
            _buildFinancialBar("Jun", 0.9),
            _buildFinancialBar("Jul", 0.65),
            const SizedBox(height: 12),
            _buildFinancialXAxis(),
          ],
        ),
      ),
    );
  }

  Widget _buildFinancialBar(String month, double percentage) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: Row(
        children: [
          SizedBox(
            width: 35,
            child: Text(
              month,
              style: TextStyle(color: Colors.grey.shade600, fontSize: 12),
            ),
          ),
          Expanded(
            child: Stack(
              children: [
                Container(
                  height: 14,
                  decoration: BoxDecoration(
                    color: Colors.grey.shade100,
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                FractionallySizedBox(
                  widthFactor: percentage,
                  child: Container(
                    height: 14,
                    decoration: BoxDecoration(
                      color: _primaryColor.withOpacity(0.8),
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFinancialXAxis() {
    return Padding(
      padding: const EdgeInsets.only(left: 35.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: const [
          Text("0", style: TextStyle(fontSize: 10, color: Colors.grey)),
          Text("50", style: TextStyle(fontSize: 10, color: Colors.grey)),
          Text("100", style: TextStyle(fontSize: 10, color: Colors.grey)),
          Text("150", style: TextStyle(fontSize: 10, color: Colors.grey)),
          Text("200", style: TextStyle(fontSize: 10, color: Colors.grey)),
        ],
      ),
    );
  }
}
