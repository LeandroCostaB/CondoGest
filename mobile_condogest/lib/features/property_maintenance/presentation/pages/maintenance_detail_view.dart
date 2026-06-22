import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import 'package:condogest/features/property_maintenance/data/models/maintenance_model.dart';
import 'package:condogest/features/property_maintenance/domain/entities/maintenance_entity.dart';
import 'package:condogest/features/property_maintenance/presentation/pages/maintenance_form_view.dart';
import 'package:condogest/features/property_maintenance/presentation/viewmodels/maintenance_viewmodel.dart';

class MaintenanceDetailView extends StatefulWidget {
  final Maintenance maintenance;
  final String userType;

  const MaintenanceDetailView({
    super.key,
    required this.maintenance,
    required this.userType,
  });

  @override
  State<MaintenanceDetailView> createState() => _MaintenanceDetailViewState();
}

class _MaintenanceDetailViewState extends State<MaintenanceDetailView> {
  static const _primaryColor = Color(0xFF1D1B3A);
  static const _accentColor = Color(0xFF2E7D32);

  late Maintenance _maintenance;

  @override
  void initState() {
    super.initState();
    _maintenance = widget.maintenance;
  }

  Color _statusColor(String? status) {
    switch (status) {
      case 'SCHEDULED':
        return Colors.orange;
      case 'IN_PROGRESS':
        return Colors.blue;
      case 'COMPLETED':
        return _accentColor;
      case 'CANCELED':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  String _statusLabel(String? status) {
    switch (status) {
      case 'SCHEDULED':
        return 'Agendada';
      case 'IN_PROGRESS':
        return 'Em Andamento';
      case 'COMPLETED':
        return 'Concluída';
      case 'CANCELED':
        return 'Cancelada';
      default:
        return status ?? '—';
    }
  }

  void _showStatusBottomSheet() {
    const statuses = [
      ('SCHEDULED', 'Agendada'),
      ('IN_PROGRESS', 'Em Andamento'),
      ('COMPLETED', 'Concluída'),
      ('CANCELED', 'Cancelada'),
    ];

    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Atualizar Status',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: _primaryColor,
              ),
            ),
            const SizedBox(height: 16),
            ...statuses.map((s) {
              final isSelected = _maintenance.status == s.$1;
              return ListTile(
                leading: CircleAvatar(
                  radius: 8,
                  backgroundColor: _statusColor(s.$1),
                ),
                title: Text(s.$2),
                trailing: isSelected
                    ? const Icon(Icons.check, color: _accentColor)
                    : null,
                onTap: () {
                  Navigator.pop(ctx);
                  _updateStatus(s.$1);
                },
              );
            }),
          ],
        ),
      ),
    );
  }

  Future<void> _updateStatus(String newStatus) async {
    final viewModel = Provider.of<MaintenanceViewModel>(context, listen: false);
    final updated = MaintenanceModel.fromEntity(_maintenance).copyWith(
      status: newStatus,
    );
    final success = await viewModel.updateMaintenance(updated);
    if (!mounted) return;
    if (success) {
      setState(() => _maintenance = updated);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Status atualizado com sucesso!')),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(viewModel.errorMessage),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final dateStr = _maintenance.executionDate != null
        ? DateFormat('dd/MM/yyyy HH:mm').format(_maintenance.executionDate!)
        : '—';
    final valueStr = _maintenance.value != null
        ? NumberFormat.currency(locale: 'pt_BR', symbol: 'R\$')
            .format(_maintenance.value)
        : '—';
    final statusColor = _statusColor(_maintenance.status);
    final statusLabel = _statusLabel(_maintenance.status);
    final isSyndic = widget.userType == 'syndic';

    return Scaffold(
      appBar: AppBar(
        backgroundColor: _primaryColor,
        iconTheme: const IconThemeData(color: Colors.white),
        title: const Text(
          'Detalhes da Manutenção',
          style: TextStyle(color: Colors.white),
        ),
        actions: [
          if (isSyndic)
            IconButton(
              icon: const Icon(Icons.edit_outlined, color: Colors.white),
              tooltip: 'Editar',
              onPressed: () async {
                final vm = Provider.of<MaintenanceViewModel>(context, listen: false);
                final nav = Navigator.of(context);
                final result = await nav.push(
                  MaterialPageRoute(
                    builder: (_) => ChangeNotifierProvider<MaintenanceViewModel>.value(
                      value: vm,
                      child: MaintenanceFormView(maintenance: _maintenance),
                    ),
                  ),
                );
                if (result == true && mounted) {
                  nav.pop(true);
                }
              },
            ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _StatusBadge(label: statusLabel, color: statusColor),
            const SizedBox(height: 24),
            _InfoCard(children: [
              _InfoRow(
                icon: Icons.build_outlined,
                label: 'Tipo',
                value: _maintenance.type ?? '—',
              ),
              _InfoRow(
                icon: Icons.meeting_room_outlined,
                label: 'Local',
                value: _maintenance.local ?? '—',
              ),
              _InfoRow(
                icon: Icons.warning_amber_rounded,
                label: 'Prioridade',
                value: _maintenance.priority ?? '—',
              ),
            ]),
            const SizedBox(height: 16),
            _InfoCard(children: [
              _InfoRow(
                icon: Icons.calendar_today_outlined,
                label: 'Data e Hora',
                value: dateStr,
              ),
              _InfoRow(
                icon: Icons.attach_money,
                label: 'Valor',
                value: valueStr,
              ),
            ]),
            if (_maintenance.providerName != null &&
                _maintenance.providerName!.isNotEmpty) ...[
              const SizedBox(height: 16),
              _InfoCard(children: [
                _InfoRow(
                  icon: Icons.person_outline,
                  label: 'Fornecedor',
                  value: _maintenance.providerName ?? '—',
                ),
                if (_maintenance.providerContact != null &&
                    _maintenance.providerContact!.isNotEmpty)
                  _InfoRow(
                    icon: Icons.contact_phone_outlined,
                    label: 'Contato',
                    value: _maintenance.providerContact!,
                  ),
              ]),
            ],
            if (_maintenance.observation != null &&
                _maintenance.observation!.isNotEmpty) ...[
              const SizedBox(height: 16),
              _InfoCard(children: [
                _InfoRow(
                  icon: Icons.notes_outlined,
                  label: 'Observações',
                  value: _maintenance.observation!,
                ),
              ]),
            ],
            const SizedBox(height: 80),
          ],
        ),
      ),
      floatingActionButton: isSyndic
          ? FloatingActionButton.extended(
              backgroundColor: _primaryColor,
              foregroundColor: Colors.white,
              icon: const Icon(Icons.swap_horiz),
              label: const Text('Atualizar Status'),
              onPressed: _showStatusBottomSheet,
            )
          : null,
    );
  }
}

class _StatusBadge extends StatelessWidget {
  final String label;
  final Color color;

  const _StatusBadge({required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.12),
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: color, width: 1.5),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: color,
            fontWeight: FontWeight.bold,
            fontSize: 16,
          ),
        ),
      ),
    );
  }
}

class _InfoCard extends StatelessWidget {
  final List<Widget> children;

  const _InfoCard({required this.children});

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0,
      color: Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: Colors.grey.shade200),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 8),
        child: Column(children: children),
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _InfoRow({
    required this.icon,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 20, color: const Color(0xFF1D1B3A)),
          const SizedBox(width: 12),
          SizedBox(
            width: 100,
            child: Text(
              label,
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                color: Colors.black54,
                fontSize: 13,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(fontSize: 14),
            ),
          ),
        ],
      ),
    );
  }
}
