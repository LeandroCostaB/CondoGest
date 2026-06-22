import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import 'package:condogest/features/property_maintenance/data/models/maintenance_model.dart';
import 'package:condogest/features/property_maintenance/domain/entities/maintenance_entity.dart';
import 'package:condogest/features/property_maintenance/presentation/viewmodels/maintenance_viewmodel.dart';
import 'package:condogest/features/property_manager/domain/entities/propertys_entity.dart';
import 'package:condogest/features/property_manager/domain/repositories/property_repository.dart';
import 'package:condogest/features/ticket_manager/data/datasources/ticket_service.dart';
import 'package:condogest/features/ticket_manager/domain/entities/ticket.dart';

class MaintenanceFormView extends StatefulWidget {
  final Maintenance? maintenance;
  final String? apartmentId;
  final String? ticketId;

  const MaintenanceFormView({
    super.key,
    this.maintenance,
    this.apartmentId,
    this.ticketId,
  });

  @override
  State<MaintenanceFormView> createState() => _MaintenanceFormViewState();
}

class _MaintenanceFormViewState extends State<MaintenanceFormView> {
  final _formKey = GlobalKey<FormState>();
  final _ticketService = TicketService();

  List<Ticket> _tickets = [];
  List<Property> _properties = [];
  bool _loadingTickets = true;
  bool _loadingProperties = false;

  final List<String> _localOptions = [
    'Cozinha', 'Quartos', 'Sala', 'Sacada',
    'Banheiro', 'Garagem', 'Apto Completo', 'Área Comum',
  ];

  final List<String> _typeOptions = [
    'Hidráulica', 'Elétrica', 'Estrutural',
    'Encanamento Gás', 'Pintura', 'Acabamento', 'Outros',
  ];

  final List<String> _statusOptions = [
    'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELED',
  ];

  final _observationController = TextEditingController();
  final _providerNameController = TextEditingController();
  final _providerContactController = TextEditingController();
  final _valueController = TextEditingController();

  String? _localSelected;
  String? _selectedType;
  String? _selectedPriority;
  String? _selectedTicketId;
  int? _selectedUnitId;
  String? _selectedProviderId;
  String? _selectedStatus;
  DateTime? _executionDate;

  // scope: 'apartment' | 'condominium'
  String _scope = 'apartment';
  String? _selectedApartmentId;
  String? _selectedCondominiumId;

  @override
  void initState() {
    super.initState();

    final m = widget.maintenance;
    if (m != null) {
      _selectedType = m.type;
      _selectedPriority = m.priority;
      _localSelected = m.local;
      _selectedTicketId = m.ticketId;
      _selectedUnitId = m.unitId;
      _selectedProviderId = m.providerId;
      _selectedStatus = m.status;
      _executionDate = m.executionDate;
      _selectedApartmentId = m.apartmentId;
      _selectedCondominiumId = m.condominiumId;
      _scope = m.condominiumId != null ? 'condominium' : 'apartment';
      _observationController.text = m.observation ?? '';
      _providerNameController.text = m.providerName ?? '';
      _providerContactController.text = m.providerContact ?? '';
      _valueController.text = m.value?.toString() ?? '';
    } else {
      // Pre-fill from navigation context
      _selectedApartmentId = widget.apartmentId;
      _selectedTicketId = widget.ticketId;
    }

    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadTickets();
      // Load properties only when creating without a fixed apartmentId
      if (widget.apartmentId == null && widget.maintenance == null) {
        _loadProperties();
      }
    });
  }

  Future<void> _loadTickets() async {
    if (!mounted) return;
    setState(() => _loadingTickets = true);
    try {
      final tickets = _selectedApartmentId != null
          ? await _ticketService.getByApartment(_selectedApartmentId!)
          : await _ticketService.getAll();
      if (mounted) {
        setState(() {
          _tickets = tickets;
          if (_selectedTicketId != null &&
              !tickets.any((t) => t.id == _selectedTicketId)) {
            _selectedTicketId = null;
          }
          _loadingTickets = false;
        });
      }
    } catch (e) {
      debugPrint('Erro ao carregar tickets: $e');
      if (mounted) setState(() => _loadingTickets = false);
    }
  }

  Future<void> _loadProperties() async {
    if (!mounted) return;
    setState(() => _loadingProperties = true);
    try {
      final repo = context.read<PropertyRepository>();
      final props = await repo.getProperties();
      if (mounted) setState(() => _properties = props);
    } catch (e) {
      debugPrint('Erro ao carregar condomínios: $e');
    } finally {
      if (mounted) setState(() => _loadingProperties = false);
    }
  }

  String _formatTicketLabel(Ticket ticket) {
    final parts = <String>[];
    if (ticket.location != null && ticket.location!.isNotEmpty) {
      parts.add(ticket.location!);
    }
    if (ticket.type != null && ticket.type!.isNotEmpty) {
      parts.add(ticket.type!);
    }
    final shortId = ticket.id != null && ticket.id!.length >= 8
        ? '#${ticket.id!.substring(0, 8)}'
        : '#${ticket.id ?? '?'}';
    parts.add(shortId);
    return parts.join(' – ');
  }

  String _statusLabel(String s) {
    switch (s) {
      case 'SCHEDULED':
        return 'Agendada';
      case 'IN_PROGRESS':
        return 'Em Andamento';
      case 'COMPLETED':
        return 'Concluída';
      case 'CANCELED':
        return 'Cancelada';
      default:
        return s;
    }
  }

  Future<void> _pickDateTime() async {
    final date = await showDatePicker(
      context: context,
      initialDate: _executionDate ?? DateTime.now(),
      firstDate: DateTime(2020),
      lastDate: DateTime(2030),
    );
    if (date == null || !mounted) return;

    final time = await showTimePicker(
      context: context,
      initialTime: _executionDate != null
          ? TimeOfDay.fromDateTime(_executionDate!)
          : TimeOfDay.now(),
    );
    if (time == null) return;

    setState(() {
      _executionDate =
          DateTime(date.year, date.month, date.day, time.hour, time.minute);
    });
  }

  @override
  void dispose() {
    _observationController.dispose();
    _providerNameController.dispose();
    _providerContactController.dispose();
    _valueController.dispose();
    super.dispose();
  }

  void _submitForm() async {
    if (!_formKey.currentState!.validate()) return;

    final viewModel = Provider.of<MaintenanceViewModel>(context, listen: false);
    final isEditing = widget.maintenance != null;

    final String? effectiveApartmentId =
        _scope == 'apartment' ? (_selectedApartmentId ?? widget.apartmentId) : null;
    final String? effectiveCondominiumId =
        _scope == 'condominium' ? _selectedCondominiumId : null;

    final maintenance = MaintenanceModel(
      id: isEditing ? widget.maintenance!.id : null,
      ticketId: _selectedTicketId,
      apartmentId: effectiveApartmentId,
      condominiumId: effectiveCondominiumId,
      unitId: _selectedUnitId,
      local: _localSelected,
      type: _selectedType,
      priority: _selectedPriority ?? 'Média',
      providerId: _selectedProviderId,
      observation: _observationController.text,
      providerName: _providerNameController.text,
      providerContact: _providerContactController.text,
      value: double.tryParse(_valueController.text),
      status: isEditing ? (_selectedStatus ?? widget.maintenance!.status) : 'SCHEDULED',
      executionDate: _executionDate,
      createdAt: isEditing ? widget.maintenance!.createdAt : DateTime.now(),
    );

    final success = isEditing
        ? await viewModel.updateMaintenance(maintenance)
        : await viewModel.addMaintenance(maintenance);

    if (!mounted) return;

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(isEditing
              ? 'Manutenção atualizada com sucesso!'
              : 'Manutenção cadastrada com sucesso!'),
        ),
      );
      Navigator.pop(context, true);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(viewModel.errorMessage),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  void _deleteForm() async {
    if (widget.maintenance?.id == null) return;

    final bool? confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Excluir Manutenção'),
        content: const Text(
          'Tem certeza que deseja excluir esta manutenção? Esta ação não poderá ser desfeita.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('CANCELAR'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('EXCLUIR'),
          ),
        ],
      ),
    );

    if (confirm != true || !mounted) return;

    final viewModel = Provider.of<MaintenanceViewModel>(context, listen: false);
    final success = await viewModel.deleteMaintenance(widget.maintenance!.id!);

    if (!mounted) return;

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Manutenção excluída com sucesso!')),
      );
      Navigator.pop(context, true);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
            content: Text(viewModel.errorMessage),
            backgroundColor: Colors.red),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isLoading = context.watch<MaintenanceViewModel>().isLoading;
    final isEditing = widget.maintenance != null;
    final showScopeSelector =
        widget.apartmentId == null && widget.ticketId == null && !isEditing;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          isEditing ? 'Editar Manutenção' : 'Nova Manutenção',
          style: const TextStyle(color: Colors.white),
        ),
        backgroundColor: const Color(0xFF1D1B3A),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: Form(
        key: _formKey,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20.0),
          child: Stack(
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const SizedBox(height: 10),

                  // ── Escopo (só aparece na criação sem contexto) ──
                  if (showScopeSelector) ...[
                    DropdownButtonFormField<String>(
                      value: _scope,
                      decoration: const InputDecoration(
                        labelText: 'Tipo de Escopo',
                        prefixIcon: Icon(Icons.home_work_outlined),
                      ),
                      items: const [
                        DropdownMenuItem(
                            value: 'apartment',
                            child: Text('Apartamento')),
                        DropdownMenuItem(
                            value: 'condominium',
                            child: Text('Condomínio (área comum)')),
                      ],
                      onChanged: (v) {
                        if (v == null) return;
                        setState(() {
                          _scope = v;
                          _selectedApartmentId = null;
                          _selectedCondominiumId = null;
                        });
                      },
                    ),
                    const SizedBox(height: 16),
                    if (_scope == 'condominium') ...[
                      _loadingProperties
                          ? const LinearProgressIndicator()
                          : DropdownButtonFormField<String>(
                              value: _selectedCondominiumId,
                              decoration: const InputDecoration(
                                labelText: 'Condomínio',
                                prefixIcon: Icon(Icons.apartment),
                              ),
                              items: _properties
                                  .map((p) => DropdownMenuItem<String>(
                                        value: p.id?.toString(),
                                        child: Text(p.name),
                                      ))
                                  .toList(),
                              onChanged: (v) =>
                                  setState(() => _selectedCondominiumId = v),
                              validator: (v) => (v == null || v.isEmpty)
                                  ? 'Selecione um condomínio'
                                  : null,
                            ),
                      const SizedBox(height: 16),
                    ],
                  ],

                  // ── Chamado vinculado (opcional) ──
                  _loadingTickets
                      ? const Padding(
                          padding: EdgeInsets.only(bottom: 16),
                          child: LinearProgressIndicator(),
                        )
                      : DropdownButtonFormField<String?>(
                          value: _selectedTicketId,
                          decoration: const InputDecoration(
                            labelText: 'Chamado Vinculado (Opcional)',
                            prefixIcon:
                                Icon(Icons.confirmation_number_outlined),
                          ),
                          items: [
                            const DropdownMenuItem<String?>(
                              value: null,
                              child: Text('Nenhum chamado'),
                            ),
                            ..._tickets.map(
                              (t) => DropdownMenuItem<String?>(
                                value: t.id,
                                child: Text(
                                  _formatTicketLabel(t),
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ),
                          ],
                          onChanged: (v) =>
                              setState(() => _selectedTicketId = v),
                        ),
                  const SizedBox(height: 16),

                  // ── Local ──
                  DropdownButtonFormField<String>(
                    value: _localSelected,
                    decoration: const InputDecoration(
                      labelText: 'Local da Manutenção',
                      prefixIcon: Icon(Icons.meeting_room),
                    ),
                    items: _localOptions
                        .map((l) =>
                            DropdownMenuItem(value: l, child: Text(l)))
                        .toList(),
                    onChanged: (v) => setState(() => _localSelected = v),
                    validator: (v) =>
                        (v == null || v.isEmpty) ? 'Selecione um local' : null,
                  ),
                  const SizedBox(height: 16),

                  // ── Tipo ──
                  DropdownButtonFormField<String>(
                    value: _selectedType,
                    decoration: const InputDecoration(
                      labelText: 'Tipo de Manutenção',
                      prefixIcon: Icon(Icons.build),
                    ),
                    items: _typeOptions
                        .map((t) =>
                            DropdownMenuItem(value: t, child: Text(t)))
                        .toList(),
                    onChanged: (v) => setState(() => _selectedType = v),
                    validator: (v) =>
                        (v == null || v.isEmpty) ? 'Campo obrigatório' : null,
                  ),
                  const SizedBox(height: 16),

                  // ── Prioridade ──
                  DropdownButtonFormField<String>(
                    value: _selectedPriority,
                    decoration: const InputDecoration(
                      labelText: 'Prioridade',
                      prefixIcon: Icon(Icons.warning_amber_rounded),
                    ),
                    items: ['Baixa', 'Média', 'Alta', 'Urgente']
                        .map((p) =>
                            DropdownMenuItem(value: p, child: Text(p)))
                        .toList(),
                    onChanged: (v) => setState(() => _selectedPriority = v),
                    validator: (v) =>
                        (v == null || v.isEmpty) ? 'Campo obrigatório' : null,
                  ),
                  const SizedBox(height: 16),

                  // ── Status (edição apenas) ──
                  if (isEditing) ...[
                    DropdownButtonFormField<String>(
                      value: _selectedStatus,
                      decoration: const InputDecoration(
                        labelText: 'Status',
                        prefixIcon: Icon(Icons.flag_outlined),
                      ),
                      items: _statusOptions
                          .map((s) => DropdownMenuItem(
                              value: s, child: Text(_statusLabel(s))))
                          .toList(),
                      onChanged: (v) =>
                          setState(() => _selectedStatus = v),
                    ),
                    const SizedBox(height: 16),
                  ],

                  // ── Data e Hora ──
                  FormField<DateTime>(
                    initialValue: _executionDate,
                    validator: (_) => !isEditing &&
                            widget.apartmentId == null &&
                            widget.ticketId == null &&
                            _executionDate == null
                        ? 'Selecione a data e hora'
                        : null,
                    builder: (field) => InkWell(
                      onTap: _pickDateTime,
                      borderRadius: BorderRadius.circular(4),
                      child: InputDecorator(
                        decoration: InputDecoration(
                          labelText: 'Data e Hora da Execução',
                          prefixIcon: const Icon(Icons.calendar_today),
                          errorText: field.errorText,
                        ),
                        child: Text(
                          _executionDate != null
                              ? DateFormat('dd/MM/yyyy HH:mm')
                                  .format(_executionDate!)
                              : 'Selecione data e hora',
                          style: TextStyle(
                            color: _executionDate != null
                                ? Colors.black87
                                : Colors.grey.shade600,
                            fontSize: 16,
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // ── Fornecedor ──
                  TextFormField(
                    controller: _providerNameController,
                    decoration: const InputDecoration(
                      labelText: 'Nome do Fornecedor',
                      prefixIcon: Icon(Icons.person_add_outlined),
                    ),
                    textInputAction: TextInputAction.next,
                  ),
                  const SizedBox(height: 16),

                  TextFormField(
                    controller: _providerContactController,
                    decoration: const InputDecoration(
                      labelText: 'Contato do Fornecedor',
                      prefixIcon: Icon(Icons.contact_phone),
                    ),
                    keyboardType: TextInputType.phone,
                    textInputAction: TextInputAction.next,
                  ),
                  const SizedBox(height: 16),

                  // ── Valor ──
                  TextFormField(
                    controller: _valueController,
                    decoration: const InputDecoration(
                      labelText: 'Valor (R\$)',
                      prefixIcon: Icon(Icons.attach_money),
                    ),
                    keyboardType: TextInputType.number,
                    textInputAction: TextInputAction.next,
                  ),
                  const SizedBox(height: 16),

                  // ── Observações ──
                  TextFormField(
                    controller: _observationController,
                    decoration: const InputDecoration(
                      labelText: 'Observações',
                      prefixIcon: Icon(Icons.notes),
                      alignLabelWithHint: true,
                    ),
                    maxLines: 3,
                    textInputAction: TextInputAction.done,
                  ),

                  const SizedBox(height: 30),

                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton(
                          onPressed: isLoading
                              ? null
                              : () => Navigator.pop(context),
                          style: ElevatedButton.styleFrom(
                            padding:
                                const EdgeInsets.symmetric(vertical: 16),
                            backgroundColor:
                                const Color.fromARGB(255, 141, 31, 31),
                            foregroundColor: Colors.white,
                          ),
                          child: const Text('CANCELAR',
                              style: TextStyle(fontSize: 16)),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: ElevatedButton(
                          onPressed: isLoading ? null : _submitForm,
                          style: ElevatedButton.styleFrom(
                            padding:
                                const EdgeInsets.symmetric(vertical: 16),
                            backgroundColor: Colors.green[800],
                            foregroundColor: Colors.white,
                          ),
                          child: const Text('SALVAR',
                              style: TextStyle(fontSize: 16)),
                        ),
                      ),
                      if (isEditing) ...[
                        const SizedBox(width: 16),
                        Expanded(
                          child: ElevatedButton(
                            onPressed: isLoading ? null : _deleteForm,
                            style: ElevatedButton.styleFrom(
                              padding:
                                  const EdgeInsets.symmetric(vertical: 16),
                              backgroundColor: Colors.white70,
                              foregroundColor: Colors.black,
                            ),
                            child: const Text('EXCLUIR',
                                style: TextStyle(fontSize: 16)),
                          ),
                        ),
                      ],
                    ],
                  ),
                ],
              ),
              if (isLoading)
                Positioned.fill(
                  child: Container(
                    color: Colors.black.withValues(alpha: 0.3),
                    child: const Center(child: CircularProgressIndicator()),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
