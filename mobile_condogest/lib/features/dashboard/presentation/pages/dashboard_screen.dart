import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import 'package:condogest/features/property_maintenance/data/datasources/maintenance_service.dart';
import 'package:condogest/features/property_maintenance/domain/entities/maintenance_entity.dart';
import 'package:condogest/features/ticket_manager/presentation/pages/ticket_list_screen.dart';
import 'package:condogest/features/ticket_manager/domain/repositories/ticket_repository.dart';
import 'package:condogest/features/property_manager/domain/repositories/property_repository.dart';

class DashboardScreen extends StatefulWidget {
  final TicketRepository repository;
  final String userType;
  final String? userName;

  const DashboardScreen({
    super.key,
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

  final MaintenanceService _maintenanceService = MaintenanceService();

  List<Maintenance> _maintenances = [];
  bool _loadingMaintenances = true;
  String? _maintenanceError;

  @override
  void initState() {
    super.initState();
    _fetchMaintenances();
  }

  Future<void> _fetchMaintenances() async {
    setState(() {
      _loadingMaintenances = true;
      _maintenanceError = null;
    });
    try {
      final all = await _maintenanceService.getAll();
      final pending = all
          .where((m) => m.status == 'SCHEDULED' || m.status == 'IN_PROGRESS')
          .toList()
        ..sort((a, b) {
          final da = a.executionDate ?? DateTime(9999);
          final db = b.executionDate ?? DateTime(9999);
          return da.compareTo(db);
        });
      if (mounted) {
        setState(() {
          _maintenances = pending;
          _loadingMaintenances = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _maintenanceError = 'Erro ao carregar manutenções';
          _loadingMaintenances = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (widget.userType != 'syndic') {
      return const Scaffold(
          body: Center(child: Text("Acesso restrito ao Síndico.")));
    }

    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      appBar: AppBar(
        backgroundColor: _primaryColor,
        title: const Text(
          "DASHBOARD SÍNDICO",
          style: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
            letterSpacing: 1.2,
          ),
        ),
        centerTitle: true,
        automaticallyImplyLeading: false,
      ),
      body: RefreshIndicator(
        onRefresh: _fetchMaintenances,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _buildWelcomeHeader(widget.userName ?? 'Síndico'),
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
            onTap: _fetchMaintenances,
          ),
        ),
      ],
    );
  }

  Widget _buildNavButton(
      {required String label, required VoidCallback onTap}) {
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
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  "Manutenções Pendentes",
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                if (_loadingMaintenances)
                  const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                else
                  IconButton(
                    icon: const Icon(Icons.refresh, size: 20),
                    onPressed: _fetchMaintenances,
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                  ),
              ],
            ),
            const SizedBox(height: 16),
            if (_maintenanceError != null)
              Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Text(
                  _maintenanceError!,
                  style: const TextStyle(color: Colors.red, fontSize: 13),
                ),
              )
            else if (!_loadingMaintenances && _maintenances.isEmpty)
              const Text(
                "Nenhuma manutenção pendente.",
                style: TextStyle(color: Colors.grey, fontSize: 14),
              )
            else
              ..._maintenances.map((m) => _maintenanceItem(m)),
          ],
        ),
      ),
    );
  }

  Widget _maintenanceItem(Maintenance m) {
    final dateStr = m.executionDate != null
        ? DateFormat('dd/MM/yyyy').format(m.executionDate!)
        : '–';

    final isScheduled = m.status == 'SCHEDULED';
    final statusLabel = isScheduled ? 'AGENDADO' : 'EM ANDAMENTO';
    final statusColor = isScheduled ? Colors.orange : Colors.blue;

    final valueStr = m.value != null
        ? NumberFormat.currency(locale: 'pt_BR', symbol: 'R\$').format(m.value)
        : '';

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
              dateStr,
              style: const TextStyle(
                  color: Colors.red,
                  fontWeight: FontWeight.bold,
                  fontSize: 12),
            ),
          ),
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: statusColor.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(4),
            ),
            child: Text(
              statusLabel,
              style: TextStyle(
                  color: statusColor,
                  fontWeight: FontWeight.bold,
                  fontSize: 11),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              valueStr,
              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
              overflow: TextOverflow.ellipsis,
            ),
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
            const Text("Financeiro",
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
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
              child: Text(month,
                  style: const TextStyle(color: Colors.grey, fontSize: 12))),
          Expanded(
            child: Stack(
              children: [
                Container(
                    height: 14,
                    decoration: BoxDecoration(
                        color: Colors.grey.shade100,
                        borderRadius: BorderRadius.circular(8))),
                FractionallySizedBox(
                  widthFactor: percentage,
                  child: Container(
                      height: 14,
                      decoration: BoxDecoration(
                          color: _primaryColor.withValues(alpha: 0.8),
                          borderRadius: BorderRadius.circular(8))),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
