import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'package:condogest/features/auth/data/datasources/user_api_service.dart';
import 'package:condogest/features/property_maintenance/data/datasources/maintenance_service.dart';
import 'package:condogest/features/property_maintenance/domain/entities/maintenance_entity.dart';
import 'package:condogest/features/property_maintenance/presentation/pages/maintenance_detail_view.dart';
import 'package:condogest/features/property_maintenance/presentation/pages/maintenance_form_view.dart';
import 'package:condogest/features/property_maintenance/presentation/viewmodels/maintenance_viewmodel.dart';
import 'package:condogest/features/property_manager/data/datasources/apartment_service.dart';
import 'package:condogest/features/property_manager/domain/entities/propertys_entity.dart';
import 'package:condogest/features/property_manager/domain/entities/unit_entity.dart';
import 'package:condogest/features/ticket_manager/data/datasources/ticket_service.dart';
import 'package:condogest/features/ticket_manager/domain/entities/ticket.dart';
import 'package:intl/intl.dart';

class ApartamentDetailsView extends StatefulWidget {
  final Unit unit;
  final String condominiumId;
  final Property property;

  const ApartamentDetailsView({
    super.key,
    required this.unit,
    required this.condominiumId,
    required this.property,
  });

  @override
  State<ApartamentDetailsView> createState() => _ApartamentDetailsViewState();
}

class _ApartamentDetailsViewState extends State<ApartamentDetailsView> {
  static const _primaryColor = Color.fromRGBO(29, 27, 58, 1);

  final _apartmentService = ApartmentService();
  final _userService = UserApiService();
  final _ticketService = TicketService();
  final _maintenanceService = MaintenanceService();

  late Unit _unit;
  SimpleUser? _resident;
  bool _residentLoading = false;

  List<Ticket> _tickets = [];
  bool _ticketsLoading = true;

  List<Maintenance> _maintenances = [];
  bool _maintenancesLoading = true;

  bool _addingResident = false;
  bool _editingResident = false;
  bool _saving = false;

  final _nomeController = TextEditingController();
  final _emailController = TextEditingController();
  final _editNomeController = TextEditingController();
  final _editEmailController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _unit = widget.unit;
    if (_unit.userId != null) _loadResident();
    _loadTickets();
    _loadMaintenances();
  }

  @override
  void dispose() {
    _nomeController.dispose();
    _emailController.dispose();
    _editNomeController.dispose();
    _editEmailController.dispose();
    super.dispose();
  }

  Future<void> _loadResident() async {
    if (_unit.userId == null) return;
    setState(() => _residentLoading = true);
    try {
      final r = await _userService.getById(_unit.userId!);
      if (mounted) setState(() { _resident = r; _residentLoading = false; });
    } catch (_) {
      if (mounted) setState(() => _residentLoading = false);
    }
  }

  Future<void> _loadTickets() async {
    setState(() => _ticketsLoading = true);
    try {
      final result = await _ticketService.getByApartment(_unit.id);
      if (mounted) setState(() { _tickets = result; _ticketsLoading = false; });
    } catch (_) {
      if (mounted) setState(() => _ticketsLoading = false);
    }
  }

  Future<void> _loadMaintenances() async {
    setState(() => _maintenancesLoading = true);
    try {
      final result = await _maintenanceService.getByApartment(_unit.id);
      if (mounted) setState(() { _maintenances = result; _maintenancesLoading = false; });
    } catch (_) {
      if (mounted) setState(() => _maintenancesLoading = false);
    }
  }

  Future<void> _createResident() async {
    final nome = _nomeController.text.trim();
    final email = _emailController.text.trim();
    if (nome.isEmpty || email.isEmpty) return;

    setState(() => _saving = true);
    try {
      // 1. Cria o morador (retorna {user: {id, ...}})
      final response = await _userService.createResident(nome: nome, email: email);
      final newUserId = response['user']['id'] as String;

      // 2. Vincula ao apartamento
      final updated = await _apartmentService.assignResident(
        widget.condominiumId, _unit.id, newUserId,
      );

      _nomeController.clear();
      _emailController.clear();
      if (mounted) {
        setState(() {
          _unit = updated;
          _addingResident = false;
          _saving = false;
        });
        _loadResident();
      }
    } catch (e) {
      if (mounted) {
        setState(() => _saving = false);
        _showError('Erro ao criar morador: $e');
      }
    }
  }

  Future<void> _saveResident() async {
    final nome = _editNomeController.text.trim();
    final email = _editEmailController.text.trim();
    if (nome.isEmpty || email.isEmpty || _unit.userId == null) return;

    setState(() => _saving = true);
    try {
      await _userService.updateUser(_unit.userId!, nome: nome, email: email);
      if (mounted) {
        setState(() {
          _resident = SimpleUser(id: _unit.userId!, name: nome, role: 'MORADOR');
          _editingResident = false;
          _saving = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _saving = false);
        _showError('Erro ao atualizar morador: $e');
      }
    }
  }

  Future<void> _unassignResident() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Desvincular Morador'),
        content: Text('Deseja desvincular ${_resident?.name ?? "o morador"} deste apartamento?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancelar')),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red, foregroundColor: Colors.white),
            child: const Text('Desvincular'),
          ),
        ],
      ),
    );
    if (confirmed != true || !mounted) return;

    setState(() => _saving = true);
    try {
      final updated = await _apartmentService.assignResident(widget.condominiumId, _unit.id, null);
      if (mounted) {
        setState(() {
          _unit = updated;
          _resident = null;
          _editingResident = false;
          _saving = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _saving = false);
        _showError('Erro ao desvincular: $e');
      }
    }
  }

  void _showError(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(msg), backgroundColor: Colors.red),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      appBar: AppBar(
        title: Text(
          'Apartamento ${_unit.number}${_unit.block != null ? " — Bloco ${_unit.block}" : ""}',
          style: const TextStyle(color: Colors.white),
        ),
        backgroundColor: _primaryColor,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: RefreshIndicator(
        onRefresh: () async { _loadResident(); await Future.wait([_loadTickets(), _loadMaintenances()]); },
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildHeader(),
              const SizedBox(height: 16),
              _buildSectionTitle('Morador'),
              _buildResidentSection(),
              const SizedBox(height: 16),
              _buildSectionTitle('Chamados'),
              _buildTicketsSection(),
              const SizedBox(height: 16),
              _buildMaintenancesSection(),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Text(
            title,
            style: const TextStyle(
              fontSize: 16, fontWeight: FontWeight.bold, color: _primaryColor,
            ),
          ),
          const SizedBox(width: 8),
          const Expanded(child: Divider()),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: Colors.grey.shade200),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: _primaryColor.withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(Icons.door_front_door_outlined, color: _primaryColor, size: 28),
            ),
            const SizedBox(width: 16),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Apto ${_unit.number}',
                  style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: _primaryColor),
                ),
                if (_unit.block != null)
                  Text('Bloco ${_unit.block}', style: TextStyle(color: Colors.grey.shade600)),
                if (_unit.floor > 0)
                  Text('${_unit.floor}º Andar', style: TextStyle(color: Colors.grey.shade600)),
              ],
            ),
          ],
        ),
      ),
    );
  }

  // ── RESIDENT SECTION ───────────────────────────────────────────────────────

  Widget _buildResidentSection() {
    if (_residentLoading) {
      return const Center(child: Padding(
        padding: EdgeInsets.all(16),
        child: CircularProgressIndicator(),
      ));
    }

    if (_unit.userId == null) {
      return _addingResident ? _buildAddResidentForm() : _buildNoResidentCard();
    }

    return _editingResident ? _buildEditResidentForm() : _buildResidentCard();
  }

  Widget _buildNoResidentCard() {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: Colors.grey.shade200),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Icon(Icons.person_outline, color: Colors.grey.shade400, size: 32),
            const SizedBox(width: 12),
            const Expanded(
              child: Text('Sem morador vinculado', style: TextStyle(color: Colors.grey)),
            ),
            ElevatedButton.icon(
              onPressed: () => setState(() => _addingResident = true),
              icon: const Icon(Icons.add, size: 16),
              label: const Text('Adicionar'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.green[800],
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAddResidentForm() {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: Colors.green.shade200),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Informações do Morador',
              style: TextStyle(fontWeight: FontWeight.w600, color: _primaryColor),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _nomeController,
              decoration: const InputDecoration(
                labelText: 'Nome *',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.person_outline),
              ),
              textInputAction: TextInputAction.next,
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _emailController,
              keyboardType: TextInputType.emailAddress,
              decoration: const InputDecoration(
                labelText: 'E-mail *',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.email_outlined),
              ),
              textInputAction: TextInputAction.done,
            ),
            const SizedBox(height: 8),
            Text(
              'Uma senha temporária será enviada por e-mail.',
              style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                TextButton(
                  onPressed: _saving ? null : () => setState(() { _addingResident = false; _nomeController.clear(); _emailController.clear(); }),
                  child: const Text('Cancelar'),
                ),
                const SizedBox(width: 8),
                ElevatedButton(
                  onPressed: _saving ? null : _createResident,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green[800],
                    foregroundColor: Colors.white,
                  ),
                  child: _saving
                      ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : const Text('Criar Morador'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildResidentCard() {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: Colors.green.shade200),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            CircleAvatar(
              backgroundColor: Colors.green.shade100,
              child: Icon(Icons.person, color: Colors.green.shade700),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    _resident?.name ?? '—',
                    style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15),
                  ),
                  if (_resident != null)
                    Text(
                      _resident!.role,
                      style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                    ),
                ],
              ),
            ),
            IconButton(
              icon: const Icon(Icons.edit_outlined, color: _primaryColor),
              tooltip: 'Editar',
              onPressed: () {
                _editNomeController.text = _resident?.name ?? '';
                _editEmailController.text = '';
                setState(() => _editingResident = true);
              },
            ),
            IconButton(
              icon: Icon(Icons.link_off, color: Colors.red.shade400),
              tooltip: 'Desvincular',
              onPressed: _saving ? null : _unassignResident,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEditResidentForm() {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: _primaryColor.withValues(alpha: 0.4)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Editar Morador',
              style: TextStyle(fontWeight: FontWeight.w600, color: _primaryColor),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _editNomeController,
              decoration: const InputDecoration(
                labelText: 'Nome *',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.person_outline),
              ),
              textInputAction: TextInputAction.next,
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _editEmailController,
              keyboardType: TextInputType.emailAddress,
              decoration: InputDecoration(
                labelText: 'E-mail',
                hintText: 'Deixe vazio para manter o atual',
                border: const OutlineInputBorder(),
                prefixIcon: const Icon(Icons.email_outlined),
                hintStyle: TextStyle(fontSize: 12, color: Colors.grey.shade400),
              ),
              textInputAction: TextInputAction.done,
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                TextButton(
                  onPressed: _saving ? null : () => setState(() => _editingResident = false),
                  child: const Text('Cancelar'),
                ),
                const SizedBox(width: 8),
                ElevatedButton(
                  onPressed: _saving ? null : _saveResident,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: _primaryColor,
                    foregroundColor: Colors.white,
                  ),
                  child: _saving
                      ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : const Text('Salvar'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  // ── TICKETS SECTION ────────────────────────────────────────────────────────

  Widget _buildTicketsSection() {
    if (_ticketsLoading) {
      return const Center(
        child: Padding(padding: EdgeInsets.all(16), child: CircularProgressIndicator()),
      );
    }

    if (_tickets.isEmpty) {
      return Card(
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: BorderSide(color: Colors.grey.shade200),
        ),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Icon(Icons.confirmation_number_outlined, color: Colors.grey.shade400),
              const SizedBox(width: 12),
              const Text('Nenhum chamado para este apartamento.',
                  style: TextStyle(color: Colors.grey)),
            ],
          ),
        ),
      );
    }

    return Column(
      children: _tickets.map((t) => _buildTicketCard(t)).toList(),
    );
  }

  Widget _buildTicketCard(Ticket ticket) {
    final statusColor = _statusColor(ticket.status);
    final statusLabel = _statusLabel(ticket.status);

    return Card(
      elevation: 0,
      margin: const EdgeInsets.only(bottom: 8),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(10),
        side: BorderSide(color: Colors.grey.shade200),
      ),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: statusColor.withValues(alpha: 0.15),
          child: Icon(Icons.confirmation_number_outlined, color: statusColor, size: 18),
        ),
        title: Text(ticket.title, style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 14)),
        subtitle: Text(
          '${ticket.type ?? "–"} · ${ticket.priority ?? "–"}',
          style: const TextStyle(fontSize: 12),
        ),
        trailing: Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          decoration: BoxDecoration(
            color: statusColor.withValues(alpha: 0.12),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Text(
            statusLabel,
            style: TextStyle(fontSize: 11, color: statusColor, fontWeight: FontWeight.bold),
          ),
        ),
      ),
    );
  }

  Color _statusColor(String? status) {
    switch (status) {
      case 'OPEN': return Colors.red.shade600;
      case 'IN_PROGRESS': return Colors.orange.shade700;
      case 'RESOLVED': return Colors.green.shade700;
      case 'CLOSED': case 'CANCELED': return Colors.grey;
      default: return Colors.grey;
    }
  }

  String _statusLabel(String? status) {
    const map = {
      'OPEN': 'Aberto', 'IN_PROGRESS': 'Em Andamento',
      'RESOLVED': 'Resolvido', 'CLOSED': 'Fechado', 'CANCELED': 'Cancelado',
    };
    return map[status] ?? status ?? '–';
  }

  // ── MAINTENANCES SECTION ───────────────────────────────────────────────────

  Widget _buildMaintenancesSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(bottom: 8),
          child: Row(
            children: [
              const Text(
                'Manutenções',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: _primaryColor),
              ),
              const SizedBox(width: 8),
              const Expanded(child: Divider()),
              const SizedBox(width: 8),
              InkWell(
                onTap: _openNewMaintenanceForm,
                borderRadius: BorderRadius.circular(6),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.add, size: 16, color: Colors.green[800]),
                      const SizedBox(width: 4),
                      Text('Nova', style: TextStyle(fontSize: 13, color: Colors.green[800], fontWeight: FontWeight.w600)),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
        _buildMaintenancesContent(),
      ],
    );
  }

  void _openNewMaintenanceForm() async {
    await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => ChangeNotifierProvider(
          create: (_) => MaintenanceViewModel(MaintenanceService()),
          child: MaintenanceFormView(apartmentId: _unit.id),
        ),
      ),
    );
    if (mounted) _loadMaintenances();
  }

  Widget _buildMaintenancesContent() {
    if (_maintenancesLoading) {
      return const Center(
        child: Padding(padding: EdgeInsets.all(16), child: CircularProgressIndicator()),
      );
    }

    if (_maintenances.isEmpty) {
      return Card(
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: BorderSide(color: Colors.grey.shade200),
        ),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Icon(Icons.build_outlined, color: Colors.grey.shade400),
              const SizedBox(width: 12),
              const Expanded(
                child: Text('Nenhuma manutenção registrada para este apartamento.',
                    style: TextStyle(color: Colors.grey)),
              ),
            ],
          ),
        ),
      );
    }

    return Column(
      children: _maintenances.map(_buildMaintenanceCard).toList(),
    );
  }

  Widget _buildMaintenanceCard(Maintenance m) {
    final statusColor = _maintenanceStatusColor(m.status);
    final statusLabel = _maintenanceStatusLabel(m.status);
    final dateLabel = m.executionDate != null
        ? DateFormat('dd/MM/yyyy').format(m.executionDate!)
        : '—';
    final valueLabel = m.value != null
        ? 'R\$ ${m.value!.toStringAsFixed(2)}'
        : '—';

    return Card(
      elevation: 0,
      margin: const EdgeInsets.only(bottom: 8),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(10),
        side: BorderSide(color: Colors.grey.shade200),
      ),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: statusColor.withValues(alpha: 0.15),
          child: Icon(Icons.build_outlined, color: statusColor, size: 18),
        ),
        title: Text(
          m.type ?? '—',
          style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 14),
        ),
        subtitle: Text(
          '$dateLabel · $valueLabel',
          style: const TextStyle(fontSize: 12),
        ),
        trailing: Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          decoration: BoxDecoration(
            color: statusColor.withValues(alpha: 0.12),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Text(
            statusLabel,
            style: TextStyle(fontSize: 11, color: statusColor, fontWeight: FontWeight.bold),
          ),
        ),
        onTap: () async {
          await Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => ChangeNotifierProvider(
                create: (_) => MaintenanceViewModel(MaintenanceService()),
                child: MaintenanceDetailView(
                  maintenance: m,
                  userType: 'syndic',
                ),
              ),
            ),
          );
          if (mounted) _loadMaintenances();
        },
      ),
    );
  }

  Color _maintenanceStatusColor(String? status) {
    switch (status) {
      case 'SCHEDULED': return Colors.blue.shade600;
      case 'IN_PROGRESS': return Colors.orange.shade700;
      case 'COMPLETED': return Colors.green.shade700;
      case 'CANCELED': return Colors.grey;
      default: return Colors.grey;
    }
  }

  String _maintenanceStatusLabel(String? status) {
    const map = {
      'SCHEDULED': 'Agendada',
      'IN_PROGRESS': 'Em Andamento',
      'COMPLETED': 'Concluída',
      'CANCELED': 'Cancelada',
    };
    return map[status] ?? status ?? '—';
  }
}
