import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import 'package:condogest/features/property_maintenance/data/datasources/maintenance_service.dart';
import 'package:condogest/features/property_maintenance/domain/entities/maintenance_entity.dart';
import 'package:condogest/features/property_maintenance/presentation/pages/maintenance_list_screen.dart';
import 'package:condogest/features/property_maintenance/presentation/viewmodels/maintenance_viewmodel.dart';
import 'package:condogest/features/ticket_manager/domain/entities/ticket.dart';
import 'package:condogest/features/ticket_manager/domain/repositories/ticket_repository.dart';
import 'package:condogest/features/ticket_manager/presentation/pages/ticket_list_screen.dart';
import 'package:condogest/features/ticket_manager/presentation/widgets/ticket_summary_chip.dart';
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
  static const _primaryColor = Color(0xFF1D1B3A);
  static const _accentColor = Color(0xFF2E7D32);

  final MaintenanceService _maintenanceService = MaintenanceService();

  // ── Manutenções pendentes ────────────────────────────────────────────────
  List<Maintenance> _pendingMaintenances = [];
  bool _loadingMaintenances = true;
  String? _maintenanceError;

  // ── Financeiro (manutenções COMPLETED agrupadas por mês) ─────────────────
  // Chave: DateTime do início do mês; valor: soma em R$
  final Map<DateTime, double> _monthlyExpenses = {};

  // ── Tickets ──────────────────────────────────────────────────────────────
  List<Ticket> _tickets = [];
  bool _loadingTickets = true;

  @override
  void initState() {
    super.initState();
    _fetchMaintenances();
    _fetchTickets();
  }

  // ── Loaders ───────────────────────────────────────────────────────────────

  Future<void> _fetchMaintenances() async {
    if (mounted) setState(() { _loadingMaintenances = true; _maintenanceError = null; });
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

      // Agrupar COMPLETED por mês (último ano)
      final cutoff = DateTime.now().subtract(const Duration(days: 365));
      final Map<DateTime, double> monthly = {};
      for (final m in all) {
        if (m.status != 'COMPLETED') continue;
        if (m.executionDate == null || m.executionDate!.isBefore(cutoff)) continue;
        final key = DateTime(m.executionDate!.year, m.executionDate!.month);
        monthly[key] = (monthly[key] ?? 0) + (m.value ?? 0);
      }

      if (mounted) {
        setState(() {
          _pendingMaintenances = pending;
          _monthlyExpenses
            ..clear()
            ..addAll(monthly);
          _loadingMaintenances = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _maintenanceError = 'Erro ao carregar manutenções';
          _loadingMaintenances = false;
        });
      }
    }
  }

  Future<void> _fetchTickets() async {
    if (mounted) setState(() => _loadingTickets = true);
    try {
      final tickets = await widget.repository.getAllTickets();
      if (mounted) setState(() { _tickets = tickets; _loadingTickets = false; });
    } catch (_) {
      if (mounted) setState(() => _loadingTickets = false);
    }
  }

  Future<void> _refreshAll() async {
    await Future.wait([_fetchMaintenances(), _fetchTickets()]);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  int _countByStatus(String status) =>
      _tickets.where((t) => t.status == status).length;

  void _navigateToMaintenances() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => ChangeNotifierProvider(
          create: (_) => MaintenanceViewModel(_maintenanceService),
          child: const MaintenanceListScreen(userType: 'syndic'),
        ),
      ),
    );
  }

  void _navigateToTickets() {
    final propertyRepo = context.read<PropertyRepository>();
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => TicketListScreen(
          repository: widget.repository,
          propertyRepository: propertyRepo,
          userType: widget.userType,
        ),
      ),
    );
  }

  // ── Build ─────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    if (widget.userType != 'syndic') {
      return const Scaffold(body: Center(child: Text('Acesso restrito ao Síndico.')));
    }

    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      appBar: AppBar(
        backgroundColor: _primaryColor,
        title: const Text(
          'DASHBOARD SÍNDICO',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, letterSpacing: 1.2),
        ),
        centerTitle: true,
        automaticallyImplyLeading: false,
      ),
      body: RefreshIndicator(
        onRefresh: _refreshAll,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _buildWelcomeHeader(widget.userName ?? 'Síndico'),
              const SizedBox(height: 24),
              _buildNavigationButtons(),
              const SizedBox(height: 24),
              _buildTicketStatsCard(),
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

  // ── Header ────────────────────────────────────────────────────────────────

  Widget _buildWelcomeHeader(String name) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Bem vindo,', style: TextStyle(fontSize: 16, color: Colors.grey)),
        Text(
          name,
          style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: _accentColor),
        ),
      ],
    );
  }

  // ── Botões de navegação ───────────────────────────────────────────────────

  Widget _buildNavigationButtons() {
    return Row(
      children: [
        Expanded(child: _buildNavButton(label: 'Tickets', onTap: _navigateToTickets)),
        const SizedBox(width: 16),
        Expanded(child: _buildNavButton(label: 'Manutenção', onTap: _navigateToMaintenances)),
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
            style: const TextStyle(color: _accentColor, fontWeight: FontWeight.bold, fontSize: 16),
          ),
        ),
      ),
    );
  }

  // ── Card de estatísticas de tickets ───────────────────────────────────────

  Widget _buildTicketStatsCard() {
    return Card(
      color: Colors.white,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: Colors.grey.shade200),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Chamados',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                if (_loadingTickets)
                  const SizedBox(
                    width: 18, height: 18,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  ),
              ],
            ),
            const SizedBox(height: 16),
            if (!_loadingTickets)
              Row(
                children: [
                  TicketSummaryChip(
                    label: 'Abertos',
                    count: _countByStatus('OPEN'),
                    color: Colors.red.shade700,
                  ),
                  TicketSummaryChip(
                    label: 'Andamento',
                    count: _countByStatus('IN_PROGRESS'),
                    color: Colors.orange.shade700,
                  ),
                  TicketSummaryChip(
                    label: 'Resolvidos',
                    count: _countByStatus('RESOLVED'),
                    color: Colors.green.shade700,
                  ),
                ],
              ),
          ],
        ),
      ),
    );
  }

  // ── Card de manutenções pendentes ─────────────────────────────────────────

  Widget _buildPendingMaintenancesCard() {
    return Card(
      color: Colors.white,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: Colors.grey.shade200),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Manutenções Pendentes',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                if (_loadingMaintenances)
                  const SizedBox(
                    width: 18, height: 18,
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
              Text(_maintenanceError!, style: const TextStyle(color: Colors.red, fontSize: 13))
            else if (!_loadingMaintenances && _pendingMaintenances.isEmpty)
              const Text('Nenhuma manutenção pendente.',
                  style: TextStyle(color: Colors.grey, fontSize: 14))
            else
              ..._pendingMaintenances.map(_buildMaintenanceRow),
          ],
        ),
      ),
    );
  }

  Widget _buildMaintenanceRow(Maintenance m) {
    final dateStr = m.executionDate != null
        ? DateFormat('dd/MM/yyyy HH:mm').format(m.executionDate!)
        : '–';
    final isScheduled = m.status == 'SCHEDULED';
    final statusLabel = isScheduled ? 'AGENDADA' : 'EM ANDAMENTO';
    final statusColor = isScheduled ? Colors.orange : Colors.blue;
    final valueStr = m.value != null
        ? NumberFormat.currency(locale: 'pt_BR', symbol: 'R\$').format(m.value)
        : '';

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: Colors.red.shade50,
              borderRadius: BorderRadius.circular(4),
            ),
            child: Text(dateStr,
                style: const TextStyle(
                    color: Colors.red, fontWeight: FontWeight.bold, fontSize: 12)),
          ),
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: statusColor.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(4),
            ),
            child: Text(statusLabel,
                style: TextStyle(
                    color: statusColor, fontWeight: FontWeight.bold, fontSize: 11)),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(valueStr,
                style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
                overflow: TextOverflow.ellipsis),
          ),
        ],
      ),
    );
  }

  // ── Card financeiro com dados reais ───────────────────────────────────────

  static const _monthAbbr = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
  ];

  Widget _buildFinancialCard() {
    final now = DateTime.now();
    final months = List.generate(6, (i) {
      return DateTime(now.year, now.month - (5 - i));
    });

    final values = months
        .map((m) => _monthlyExpenses[DateTime(m.year, m.month)] ?? 0.0)
        .toList();

    final maxVal = values.fold<double>(0, (a, b) => b > a ? b : a);

    return Card(
      color: Colors.white,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: Colors.grey.shade200),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Gastos com Manutenção',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            Text('Últimos 6 meses (concluídas)',
                style: TextStyle(fontSize: 12, color: Colors.grey.shade500)),
            const SizedBox(height: 20),
            if (_loadingMaintenances)
              const Center(child: CircularProgressIndicator())
            else
              ...List.generate(months.length, (i) {
                final label = _monthAbbr[months[i].month - 1];
                final val = values[i];
                final pct = maxVal > 0 ? val / maxVal : 0.0;
                final valLabel = val > 0
                    ? NumberFormat.compactCurrency(
                            locale: 'pt_BR', symbol: 'R\$', decimalDigits: 0)
                        .format(val)
                    : '—';
                return _buildFinancialBar(label, pct, valLabel);
              }),
          ],
        ),
      ),
    );
  }

  Widget _buildFinancialBar(String month, double percentage, String valueLabel) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        children: [
          SizedBox(
            width: 36,
            child: Text(month,
                style: const TextStyle(color: Colors.grey, fontSize: 12)),
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
                  widthFactor: percentage.clamp(0.0, 1.0),
                  child: Container(
                    height: 14,
                    decoration: BoxDecoration(
                      color: _primaryColor.withValues(alpha: 0.8),
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          SizedBox(
            width: 52,
            child: Text(
              valueLabel,
              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600),
              textAlign: TextAlign.right,
            ),
          ),
        ],
      ),
    );
  }
}
