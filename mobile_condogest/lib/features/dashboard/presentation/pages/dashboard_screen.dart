import 'package:flutter/material.dart';
import 'package:condogest/features/ticket_manager/presentation/pages/ticket_list_screen.dart';
import 'package:condogest/features/ticket_manager/domain/repositories/ticket_repository.dart';
import 'package:condogest/features/property_maintenance/presentation/pages/maintenance_list_view.dart';
import 'package:condogest/features/property_maintenance/domain/repositories/maintenance_repository.dart';
import 'package:condogest/features/property_manager/domain/entities/propertys_entity.dart';
import 'package:condogest/features/ticket_manager/domain/repositories/ticket_repository.dart';

import 'package:condogest/features/property_manager/domain/repositories/property_repository.dart';
import 'package:provider/provider.dart';

class DashboardScreen extends StatefulWidget {
  final TicketRepository repository;
  final Property property;
  final String userType;
  final String? userName;

  const DashboardScreen({
    super.key,
    required this.property,
    required this.repository,
    required this.userType,
    this.userName,
  });

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  final Color _primaryColor = const Color(0xFF1D1B3A);
  final Color _accentColor = const Color(0xFF2E7D32);

  @override
  Widget build(BuildContext context) {
    if (widget.userType != 'syndic') {
      return const Scaffold(
        body: Center(child: Text("Acesso restrito ao Síndico.")),
      );
    }

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
        automaticallyImplyLeading: false,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _buildWelcomeHeader(widget.userName ?? "Síndico"),
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

  Widget _buildWelcomeHeader(String name) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          "Bem vindo,",
          style: TextStyle(fontSize: 16, color: Colors.grey),
        ),
        Text(
          name,
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
                    userType: widget.userType,
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
              // Obtenha a propriedade selecionada ou atual do seu Dashboard.
              // Substitua 'propriedadeAtual' pela variável correta que guarda
              // a propriedade no contexto do seu dashboard.

              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => MaintenanceListView(
                    property: widget.property,
                    ticketRepository: context.read<TicketRepository>(),
                  ),
                ),
              );
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
            _maintenanceItem("28/09/2025", "Interfone"),
            _maintenanceItem("30/09/2025", "Elevador"),
          ],
        ),
      ),
    );
  }

  Widget _maintenanceItem(String date, String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: Colors.red.shade50,
              borderRadius: BorderRadius.circular(4),
            ),
            child: Text(
              date,
              style: const TextStyle(
                color: Colors.red,
                fontWeight: FontWeight.bold,
                fontSize: 12,
              ),
            ),
          ),
          const SizedBox(width: 12),
          Text(
            title,
            style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w500),
          ),
        ],
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
            _buildFinancialBar("Mai", 0.7),
            _buildFinancialBar("Jun", 0.9),
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
              style: const TextStyle(color: Colors.grey, fontSize: 12),
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
}
