import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'package:condogest/features/property_maintenance/data/datasources/maintenance_service.dart';
import 'package:condogest/features/property_maintenance/domain/entities/maintenance_entity.dart';
import 'package:condogest/features/property_maintenance/presentation/pages/maintenance_detail_view.dart';
import 'package:condogest/features/property_maintenance/presentation/pages/maintenance_form_view.dart';
import 'package:condogest/features/property_maintenance/presentation/viewmodels/maintenance_viewmodel.dart';
import 'package:condogest/features/property_manager/domain/entities/propertys_entity.dart';
import 'package:condogest/features/property_manager/domain/repositories/property_repository.dart';
import 'package:condogest/features/ticket_manager/presentation/widgets/ticket_summary_chip.dart';

class MaintenanceListScreen extends StatefulWidget {
  final String userType;

  const MaintenanceListScreen({super.key, required this.userType});

  @override
  State<MaintenanceListScreen> createState() => _MaintenanceListScreenState();
}

class _MaintenanceListScreenState extends State<MaintenanceListScreen> {
  static const _primaryColor = Color(0xFF1D1B3A);

  final _maintenanceService = MaintenanceService();
  final _searchController = TextEditingController();

  List<Maintenance> _all = [];
  List<Maintenance> _filtered = [];
  List<Property> _properties = [];
  bool _isLoading = true;
  String? _searchQuery;

  // filter scope: 'all' | 'condominium' | 'apartment'
  String _scopeFilter = 'all';
  String? _selectedCondominiumId;
  String? _selectedApartmentId;

  // filter by status (null = todos)
  String? _selectedStatus;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      final propertyRepo = context.read<PropertyRepository>();
      final results = await Future.wait([
        _maintenanceService.getAll(),
        propertyRepo.getProperties(),
      ]);
      if (mounted) {
        setState(() {
          _all = results[0] as List<Maintenance>;
          _properties = results[1] as List<Property>;
          _isLoading = false;
        });
        _applyFilters();
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  void _applyFilters() {
    var list = List<Maintenance>.from(_all);

    if (_scopeFilter == 'condominium' && _selectedCondominiumId != null) {
      list = list
          .where((m) => m.condominiumId == _selectedCondominiumId)
          .toList();
    } else if (_scopeFilter == 'apartment' && _selectedApartmentId != null) {
      list = list
          .where((m) => m.apartmentId == _selectedApartmentId)
          .toList();
    }

    if (_selectedStatus != null) {
      list = list.where((m) => m.status == _selectedStatus).toList();
    }

    if (_searchQuery != null && _searchQuery!.length >= 2) {
      final q = _searchQuery!.toLowerCase();
      list = list
          .where((m) =>
              (m.type?.toLowerCase().contains(q) ?? false) ||
              (m.local?.toLowerCase().contains(q) ?? false) ||
              (m.priority?.toLowerCase().contains(q) ?? false))
          .toList();
    }

    setState(() => _filtered = list);
  }

  int _countByStatus(String status) =>
      _all.where((m) => m.status == status).length;

  Color _statusColor(String? status) {
    switch (status) {
      case 'SCHEDULED':
        return Colors.orange;
      case 'IN_PROGRESS':
        return Colors.blue;
      case 'COMPLETED':
        return Colors.green.shade700;
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
        return '—';
    }
  }

  // Derive a simple label from a maintenance item for the list card
  String _mainTitle(Maintenance m) =>
      [m.type, m.local].where((s) => s != null && s.isNotEmpty).join(' · ');

  @override
  Widget build(BuildContext context) {
    final isSyndic = widget.userType == 'syndic';

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: _primaryColor,
        iconTheme: const IconThemeData(color: Colors.white),
        title: const Text(
          'MANUTENÇÕES',
          style: TextStyle(
              color: Colors.white, fontWeight: FontWeight.bold, letterSpacing: 1.1),
        ),
        centerTitle: true,
      ),
      body: Column(
        children: [
          _buildSummaryChips(),
          _buildFilterBar(),
          _buildSearchField(),
          Expanded(child: _buildList()),
        ],
      ),
      floatingActionButton: isSyndic
          ? FloatingActionButton(
              backgroundColor: Colors.green.shade700,
              foregroundColor: Colors.white,
              shape: const CircleBorder(),
              onPressed: () async {
                final vm = Provider.of<MaintenanceViewModel>(
                    context,
                    listen: false);
                await Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) =>
                        ChangeNotifierProvider<MaintenanceViewModel>.value(
                      value: vm,
                      child: const MaintenanceFormView(),
                    ),
                  ),
                );
                if (mounted) _loadData();
              },
              child: const Icon(Icons.add),
            )
          : null,
    );
  }

  Widget _buildSummaryChips() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      child: Row(
        children: [
          TicketSummaryChip(
            label: 'Agendadas',
            count: _countByStatus('SCHEDULED'),
            color: Colors.orange,
          ),
          TicketSummaryChip(
            label: 'Andamento',
            count: _countByStatus('IN_PROGRESS'),
            color: Colors.blue,
          ),
          TicketSummaryChip(
            label: 'Concluídas',
            count: _countByStatus('COMPLETED'),
            color: Colors.green.shade700,
          ),
          TicketSummaryChip(
            label: 'Canceladas',
            count: _countByStatus('CANCELED'),
            color: Colors.red,
          ),
        ],
      ),
    );
  }

  Widget _buildFilterBar() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Scope dropdown
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: Colors.grey.shade300),
            ),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<String>(
                value: _scopeFilter,
                isExpanded: true,
                icon: const Icon(Icons.keyboard_arrow_down),
                items: const [
                  DropdownMenuItem(value: 'all', child: Text('Todas as manutenções')),
                  DropdownMenuItem(
                      value: 'condominium', child: Text('Por Condomínio')),
                  DropdownMenuItem(
                      value: 'apartment', child: Text('Por Apartamento')),
                ],
                onChanged: (val) {
                  if (val == null) return;
                  setState(() {
                    _scopeFilter = val;
                    _selectedCondominiumId = null;
                    _selectedApartmentId = null;
                  });
                  _applyFilters();
                },
              ),
            ),
          ),

          // Sub-dropdown for condominium
          if (_scopeFilter == 'condominium') ...[
            const SizedBox(height: 8),
            _buildCondominiumDropdown(),
          ],

          // Status chip row
          const SizedBox(height: 8),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _statusFilterChip(null, 'Todos'),
                _statusFilterChip('SCHEDULED', 'Agendadas'),
                _statusFilterChip('IN_PROGRESS', 'Em Andamento'),
                _statusFilterChip('COMPLETED', 'Concluídas'),
                _statusFilterChip('CANCELED', 'Canceladas'),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCondominiumDropdown() {
    if (_properties.isEmpty) {
      return const SizedBox.shrink();
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.grey.shade300),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: _selectedCondominiumId,
          isExpanded: true,
          hint: const Text('Selecione o condomínio'),
          icon: const Icon(Icons.keyboard_arrow_down),
          items: _properties
              .map((p) => DropdownMenuItem<String>(
                    value: p.id?.toString(),
                    child: Text(p.name),
                  ))
              .toList(),
          onChanged: (val) {
            setState(() => _selectedCondominiumId = val);
            _applyFilters();
          },
        ),
      ),
    );
  }

  Widget _statusFilterChip(String? status, String label) {
    final isSelected = _selectedStatus == status;
    final color = status != null ? _statusColor(status) : const Color(0xFF1D1B3A);
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: FilterChip(
        label: Text(label),
        selected: isSelected,
        selectedColor: color.withValues(alpha: 0.15),
        checkmarkColor: color,
        labelStyle: TextStyle(
          color: isSelected ? color : Colors.black87,
          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
        ),
        side: BorderSide(
            color: isSelected ? color : Colors.grey.shade300),
        onSelected: (_) {
          setState(() => _selectedStatus = isSelected ? null : status);
          _applyFilters();
        },
      ),
    );
  }

  Widget _buildSearchField() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 4),
      child: TextField(
        controller: _searchController,
        decoration: InputDecoration(
          hintText: 'Buscar por tipo, local, prioridade...',
          hintStyle: TextStyle(color: Colors.grey.shade500, fontSize: 14),
          filled: true,
          fillColor: Colors.grey.shade100,
          contentPadding: const EdgeInsets.symmetric(vertical: 0),
          prefixIcon: const Icon(Icons.search),
          suffixIcon: _searchQuery != null && _searchQuery!.isNotEmpty
              ? IconButton(
                  icon: const Icon(Icons.clear),
                  onPressed: () {
                    _searchController.clear();
                    setState(() => _searchQuery = null);
                    _applyFilters();
                  },
                )
              : null,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide.none,
          ),
        ),
        onChanged: (val) {
          setState(() => _searchQuery = val.isEmpty ? null : val);
          _applyFilters();
        },
      ),
    );
  }

  Widget _buildList() {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }
    if (_filtered.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.build_circle_outlined,
                size: 64, color: Colors.grey.shade300),
            const SizedBox(height: 16),
            Text(
              'Nenhuma manutenção encontrada',
              style: TextStyle(color: Colors.grey.shade500, fontSize: 16),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _loadData,
      child: ListView.builder(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        itemCount: _filtered.length,
        itemBuilder: (context, index) => _buildCard(_filtered[index]),
      ),
    );
  }

  Widget _buildCard(Maintenance m) {
    final statusColor = _statusColor(m.status);
    final statusLabel = _statusLabel(m.status);
    final title = _mainTitle(m);

    return Card(
      elevation: 0,
      margin: const EdgeInsets.only(bottom: 10),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: Colors.grey.shade200),
      ),
      child: ListTile(
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        leading: CircleAvatar(
          backgroundColor: _primaryColor,
          child: const Icon(Icons.build, color: Colors.white, size: 20),
        ),
        title: Text(
          title.isNotEmpty ? title : 'Manutenção',
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
        ),
        subtitle: Padding(
          padding: const EdgeInsets.only(top: 4),
          child: Row(
            children: [
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: statusColor.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  statusLabel,
                  style: TextStyle(
                    color: statusColor,
                    fontWeight: FontWeight.bold,
                    fontSize: 11,
                  ),
                ),
              ),
              if (m.priority != null) ...[
                const SizedBox(width: 8),
                Text(
                  m.priority!,
                  style: TextStyle(
                      color: Colors.grey.shade600, fontSize: 12),
                ),
              ],
            ],
          ),
        ),
        trailing:
            const Icon(Icons.chevron_right, color: Colors.grey),
        onTap: () async {
          final vm = Provider.of<MaintenanceViewModel>(context, listen: false);
          final result = await Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) =>
                  ChangeNotifierProvider<MaintenanceViewModel>.value(
                value: vm,
                child: MaintenanceDetailView(
                  maintenance: m,
                  userType: widget.userType,
                ),
              ),
            ),
          );
          if (result == true && mounted) _loadData();
        },
      ),
    );
  }
}
