import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'package:condogest/features/property_maintenance/data/models/maintenance_model.dart';
import 'package:condogest/features/property_maintenance/domain/entities/maintenance_entity.dart';
import 'package:condogest/features/property_maintenance/presentation/viewmodels/maintenance_viewmodel.dart';

class MaintenanceFormView extends StatefulWidget {
  final Maintenance? maintenance;
  final String? apartmentId;

  const MaintenanceFormView({super.key, this.maintenance, this.apartmentId});

  @override
  State<MaintenanceFormView> createState() => _MaintenanceFormViewState();
}

class _MaintenanceFormViewState extends State<MaintenanceFormView> {
  final _formKey = GlobalKey<FormState>();

  List<Ticket> _tickets = [];

  Future<void> _loadTickets() async {
    try {
      final tickets = await widget.ticketRepository.getAllTickets();

      if (mounted) {
        setState(() {
          _tickets = tickets;
        });
      }
    } catch (e) {
      debugPrint('Erro ao carregar tickets: $e');
    }
  }

  final List<String> _localOptions = [
    'Cozinha', 'Quartos', 'Sala', 'Sacada',
    'Banheiro', 'Garagem', 'Apto Completo',
  ];

  final List<String> _typeOptions = [
    'Hidráulica', 'Elétrica', 'Estrutural',
    'Encanamento Gás', 'Pintura', 'Acabamento', 'Outros',
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

  @override
  void initState() {
    super.initState();
    if (widget.maintenance != null) {
      _selectedType = widget.maintenance!.type;
      _selectedPriority = widget.maintenance!.priority;
      _localSelected = widget.maintenance!.local;
      _selectedTicketId = widget.maintenance!.ticketId;
      _selectedUnitId = widget.maintenance!.unitId;
      _selectedProviderId = widget.maintenance!.providerId;
      _observationController.text = widget.maintenance!.observation ?? '';
      _providerNameController.text = widget.maintenance!.providerName ?? '';
      _providerContactController.text = widget.maintenance!.providerContact ?? '';
      _valueController.text = widget.maintenance!.value?.toString() ?? '';
    } else {
      // Se unitId e property não forem nulos (Fluxo 1), o campo de destino deve ser cravado
      if (widget.unitId != null) {
        _selectedUnitId =
            widget.unitId; // Correção: Atribuição direta, sem tryParse
      }
    }
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
    final now = DateTime.now();
    final isEditing = widget.maintenance != null;

    final maintenance = MaintenanceModel(
      id: isEditing ? widget.maintenance!.id : null,
      ticketId: _selectedTicketId,
      apartmentId: isEditing ? widget.maintenance!.apartmentId : widget.apartmentId,
      unitId: _selectedUnitId,
      local: _localSelected,
      type: _selectedType,
      priority: _selectedPriority ?? 'Média',
      providerId: _selectedProviderId,
      observation: _observationController.text,
      providerName: _providerNameController.text,
      providerContact: _providerContactController.text,
      value: double.tryParse(_valueController.text),
      createdAt: isEditing ? widget.maintenance!.createdAt : now,
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
      if (isEditing) {
        Navigator.pop(context);
      } else {
        _clearForm();
        _formKey.currentState!.reset();
      }
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
      Navigator.pop(context);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(viewModel.errorMessage), backgroundColor: Colors.red),
      );
    }
  }

  void _clearForm() {
    _observationController.clear();
    _providerNameController.clear();
    _providerContactController.clear();
    _valueController.clear();
    setState(() {
      _localSelected = null;
      _selectedType = null;
      _selectedPriority = null;
      _selectedTicketId = null;
      _selectedUnitId = null;
      _selectedProviderId = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    final isLoading = context.watch<MaintenanceViewModel>().isLoading;
    final isEditing = widget.maintenance != null;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          isEditing ? 'Editar Manutenção' : 'Nova Manutenção',
          style: const TextStyle(color: Colors.white),
        ),
        backgroundColor: const Color.fromRGBO(29, 27, 58, 1),
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

                  // Fluxo 1: Oculta seletor de tickets se unitId estiver presente
                  // Fluxo 2: Seleção obrigatória se unitId for nulo
                  if (widget.unitId == null) ...[
                    DropdownButtonFormField<int?>(
                      value: _selectedTicketId,
                      decoration: const InputDecoration(
                        labelText: "Chamado (Obrigatório)",
                        prefixIcon: Icon(Icons.confirmation_number_outlined),
                      ),
                      items: [
                        const DropdownMenuItem<int?>(
                          value: null,
                          child: Text("Selecione um chamado"),
                        ),

                        ..._tickets.map(
                          (ticket) => DropdownMenuItem<int?>(
                            value: ticket.id,
                            child: Text("Ticket #${ticket.id}"),
                          ),
                        ),
                      ],
                      onChanged: (int? newValue) {
                        setState(() {
                          _selectedTicketId = newValue;
                        });
                      },
                      validator: (value) => value == null
                          ? 'A seleção de um Ticket é obrigatória'
                          : null,
                    ),
                    const SizedBox(height: 16),
                  ],

                  DropdownButtonFormField<int?>(
                    value: _selectedUnitId,
                    decoration: const InputDecoration(
                      labelText: "Unidade",
                      prefixIcon: Icon(Icons.apartment_outlined),
                    ),
                    items: [
                      if (_selectedUnitId != null)
                        DropdownMenuItem<int?>(
                          value: _selectedUnitId,
                          child: Text("Unidade #$_selectedUnitId"),
                        ),

                      if (_selectedUnitId == null)
                        const DropdownMenuItem<int?>(
                          value: null,
                          child: Text("Nenhuma unidade"),
                        ),
                    ],
                    onChanged: widget.unitId != null
                        ? null // Bloqueia a edição no Fluxo 1
                        : (int? newValue) {
                            setState(() {
                              _selectedUnitId = newValue;
                            });
                          },
                    validator: (value) => value == null
                        ? 'Por favor, selecione uma unidade'
                        : null,
                  ),
                  const SizedBox(height: 16),

                  DropdownButtonFormField<String>(
                    value: _localSelected,
                    decoration: const InputDecoration(
                      labelText: "Local da Manutenção",
                      prefixIcon: Icon(Icons.meeting_room),
                    ),
                    items: _localOptions.map((l) => DropdownMenuItem(value: l, child: Text(l))).toList(),
                    onChanged: (v) => setState(() => _localSelected = v),
                    validator: (v) => (v == null || v.isEmpty) ? 'Selecione um local' : null,
                  ),
                  const SizedBox(height: 16),

                  DropdownButtonFormField<String>(
                    value: _selectedType,
                    decoration: const InputDecoration(
                      labelText: "Tipo de Manutenção",
                      prefixIcon: Icon(Icons.build),
                    ),
                    items: _typeOptions
                        .map((t) => DropdownMenuItem(value: t, child: Text(t)))
                        .toList(),
                    onChanged: (v) => setState(() => _selectedType = v),
                    validator: (v) => (v == null || v.isEmpty) ? 'Campo obrigatório' : null,
                  ),
                  const SizedBox(height: 16),

                  DropdownButtonFormField<String>(
                    value: _selectedPriority,
                    decoration: const InputDecoration(
                      labelText: "Prioridade",
                      prefixIcon: Icon(Icons.warning_amber_rounded),
                    ),
                    items: ['Baixa', 'Média', 'Alta', 'Urgente']
                        .map((p) => DropdownMenuItem(value: p, child: Text(p)))
                        .toList(),
                    onChanged: (v) => setState(() => _selectedPriority = v),
                    validator: (v) => (v == null || v.isEmpty) ? 'Campo obrigatório' : null,
                  ),
                  const SizedBox(height: 16),

                  TextFormField(
                    controller: _providerNameController,
                    decoration: const InputDecoration(
                      labelText: "Nome do Fornecedor",
                      prefixIcon: Icon(Icons.person_add_outlined),
                    ),
                    textInputAction: TextInputAction.next,
                  ),
                  const SizedBox(height: 16),

                  DropdownButtonFormField<int?>(
                    value: _selectedProviderId,
                    decoration: const InputDecoration(
                      labelText: "Fornecedor Registrado",
                      prefixIcon: Icon(Icons.person_search_outlined),
                    ),
                    items: [
                      const DropdownMenuItem<int?>(
                        value: null,
                        child: Text("Novo / Não registrado"),
                      ),
                      if (_selectedProviderId != null)
                        DropdownMenuItem<int?>(
                          value: _selectedProviderId,
                          child: Text("Fornecedor #$_selectedProviderId"),
                        ),
                    ],
                    onChanged: (int? newValue) {
                      setState(() {
                        _selectedProviderId = newValue;
                      });
                    },
                  ),
                  const SizedBox(height: 16),

                  TextFormField(
                    controller: _providerNameController,
                    decoration: const InputDecoration(
                      labelText: "Nome do Fornecedor (Novo)",
                      prefixIcon: Icon(Icons.person_add_outlined),
                    ),
                    textInputAction: TextInputAction.next,
                  ),
                  const SizedBox(height: 16),

                  TextFormField(
                    controller: _providerContactController,
                    decoration: const InputDecoration(
                      labelText: "Contato do Fornecedor (Novo)",
                      prefixIcon: Icon(Icons.contact_phone),
                    ),
                    keyboardType: TextInputType.phone,
                    textInputAction: TextInputAction.next,
                  ),
                  const SizedBox(height: 16),

                  TextFormField(
                    controller: _valueController,
                    decoration: const InputDecoration(
                      labelText: "Valor (R\$)",
                      prefixIcon: Icon(Icons.attach_money),
                    ),
                    keyboardType: TextInputType.number,
                    textInputAction: TextInputAction.next,
                  ),
                  const SizedBox(height: 16),

                  TextFormField(
                    controller: _observationController,
                    decoration: const InputDecoration(
                      labelText: "Observações",
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
                          onPressed: isLoading ? null : () { _clearForm(); Navigator.pop(context); },
                          style: ElevatedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            backgroundColor: const Color.fromARGB(255, 141, 31, 31),
                            foregroundColor: Colors.white,
                          ),
                          child: const Text("CANCELAR", style: TextStyle(fontSize: 16)),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: ElevatedButton(
                          onPressed: isLoading ? null : _submitForm,
                          style: ElevatedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            backgroundColor: Colors.green[800],
                            foregroundColor: Colors.white,
                          ),
                          child: const Text("SALVAR", style: TextStyle(fontSize: 16)),
                        ),
                      ),
                      if (isEditing) ...[
                        const SizedBox(width: 16),
                        Expanded(
                          child: ElevatedButton(
                            onPressed: isLoading ? null : _deleteForm,
                            style: ElevatedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              backgroundColor: Colors.white70,
                              foregroundColor: Colors.black,
                            ),
                            child: const Text("EXCLUIR", style: TextStyle(fontSize: 16)),
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
