import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../property_maintenance/data/models/maintenance_model.dart';
import '../../../property_maintenance/domain/entities/maintenance_entity.dart';
import '../../presentation/viewmodels/maintenance_viewmodel.dart';
import '../../domain/entities/maintenance_entity.dart';

class MaintenanceFormView extends StatefulWidget {
  final Maintenance? maintenance;

  const MaintenanceFormView({super.key, this.maintenance});

  @override
  _MaintenanceFormViewState createState() => _MaintenanceFormViewState();
}

class _MaintenanceFormViewState extends State<MaintenanceFormView> {
  final _formKey = GlobalKey<FormState>();

  final List<String> _localOptions = [
    'Cozinha',
    'Quartos',
    'Sala',
    'Sacada',
    'Banheiro',
    'Garagem',
    'Apto Completo',
  ];

  final List<String> _typeOptions = [
    'Hidráulica',
    'Elétrica',
    'Estrutural',
    'Encanamento Gás',
    'Pintura',
    'Acabamento',
    'Outros',
  ];

  final List<String> _priorityOptions = ['Baixa', 'Média', 'Alta', 'Urgente'];

  final List<String> _statusOptions = [
    'Pendente',
    'Em Análise',
    'Em Andamento',
    'Concluído',
  ];

  final _observationController = TextEditingController();
  final _providerNameController = TextEditingController();
  final _providerContactController = TextEditingController();
  final _valueController = TextEditingController();

  String? _localSelected;
  String? _selectedType;
  String? _selectedPriority;

  @override
  void initState() {
    super.initState();

    //modo edição
    if (widget.maintenance != null) {
      _selectedType = widget.maintenance!.type;
      _selectedPriority = widget.maintenance!.priority;
      _localSelected = widget.maintenance!.local;
      _observationController.text = widget.maintenance!.observation ?? '';
      _providerNameController.text = widget.maintenance!.providerName ?? '';
      _providerContactController.text =
          widget.maintenance!.providerContact ?? '';
      _valueController.text = widget.maintenance!.value?.toString() ?? '';
    }
  }

  void dispose() {
    _observationController.dispose();
    _providerNameController.dispose();
    _providerContactController.dispose();
    _valueController.dispose();
    super.dispose();
  }

  void _submitForm() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    final viewModel = Provider.of<MaintenanceViewModel>(context, listen: false);
    final now = DateTime.now();

    final isEditing = widget.maintenance != null;
    final currentId = isEditing ? widget.maintenance!.id : '';

    final maintenance = MaintenanceModel(
      id: currentId,
      ticketId: 'TICKET-TODO',
      unitId: 'UNIT-TODO',
      local: _localSelected!,
      type: _selectedType!,
      priority: _selectedPriority ?? 'Média',
      providerId: 'PROVIDER-TODO',
      observation: _observationController.text,
      providerName: _providerNameController.text,
      providerContact: _providerContactController.text,
      value: double.tryParse(_valueController.text),
      createdAt: isEditing ? widget.maintenance!.createdAt : now,
    );

    bool success;
    if (isEditing) {
      success = await viewModel.updateMaintenance(maintenance); //Update
    } else {
      success = await viewModel.addMaintenance(maintenance); //Criar
    }

    if (!mounted) return;

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            isEditing
                ? 'Manutenção atualizada com sucesso!'
                : 'Manutenção cadastrada com sucesso!',
          ),
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
    if (widget.maintenance == null) return;

    final bool? confirm = await showDialog<bool>(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Excluir Manutenção'),
          content: const Text(
            'Tem certeza que deseja excluir esta manutenção? Esta ação não poderá ser desfeita.',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: const Text('CANCELAR'),
            ),
            TextButton(
              onPressed: () => Navigator.pop(context, true),
              style: TextButton.styleFrom(foregroundColor: Colors.red),
              child: const Text('EXCLUIR'),
            ),
          ],
        );
      },
    );

    if (confirm != true) return;

    if (!mounted) return;

    final viewModel = Provider.of<MaintenanceViewModel>(context, listen: false);
    final success = await viewModel.deleteMaintenance(widget.maintenance!.id);

    if (!mounted) return;

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Manutenção excluída com sucesso!')),
      );

      Navigator.pop(context);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(viewModel.errorMessage),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  void _clearForm() {
    _formKey.currentState!.reset();
    _observationController.clear();
    _providerNameController.clear();
    _providerContactController.clear();
    _valueController.clear();

    setState(() {
      _localSelected = null;
      _selectedType = null;
      _selectedPriority = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    final isLoading = context.watch<MaintenanceViewModel>().isLoading;

    final isEditing = widget.maintenance != null;

    final appBarTitle = isEditing
        ? 'Editar Manutenção - ${widget.maintenance!.id}'
        : 'Nova Manutenção';

    return Scaffold(
      appBar: AppBar(
        title: Text(appBarTitle, style: TextStyle(color: Colors.white)),
        backgroundColor: const Color.fromRGBO(29, 27, 58, 1),
        iconTheme: const IconThemeData(color: Colors.white),
        automaticallyImplyLeading: true,
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

                  DropdownButtonFormField<String>(
                    value: _localSelected,
                    decoration: const InputDecoration(
                      labelText: "Local da Manutenção",
                      prefixIcon: Icon(Icons.meeting_room),
                    ),
                    items: _localOptions.map((String local) {
                      return DropdownMenuItem<String>(
                        value: local,
                        child: Text(local),
                      );
                    }).toList(),
                    onChanged: (String? newValue) {
                      setState(() {
                        _localSelected = newValue;
                      });
                    },
                    validator: (value) => (value == null || value.isEmpty)
                        ? 'Por favor, selecione um local'
                        : null,
                  ),
                  const SizedBox(height: 16),

                  DropdownButtonFormField<String>(
                    value: _selectedType,
                    decoration: const InputDecoration(
                      labelText: "Tipo de Manutenção",
                      prefixIcon: Icon(Icons.build),
                    ),
                    items: ['Preventiva', 'Corretiva', 'Melhoria'].map((
                      String tipo,
                    ) {
                      return DropdownMenuItem<String>(
                        value: tipo,
                        child: Text(tipo),
                      );
                    }).toList(),
                    onChanged: (String? newValue) {
                      setState(() {
                        _selectedType = newValue;
                      });
                    },
                    validator: (value) => (value == null || value.isEmpty)
                        ? 'Campo obrigatório'
                        : null,
                  ),
                  const SizedBox(height: 16),

                  DropdownButtonFormField<String>(
                    value: _selectedPriority,
                    decoration: const InputDecoration(
                      labelText: "Prioridade",
                      prefixIcon: Icon(Icons.warning_amber_rounded),
                    ),
                    items: ['Baixa', 'Média', 'Alta', 'Urgente'].map((
                      String prioridade,
                    ) {
                      return DropdownMenuItem<String>(
                        value: prioridade,
                        child: Text(prioridade),
                      );
                    }).toList(),
                    onChanged: (String? newValue) {
                      setState(() {
                        _selectedPriority = newValue;
                      });
                    },
                    validator: (value) => (value == null || value.isEmpty)
                        ? 'Campo obrigatório'
                        : null,
                  ),
                  const SizedBox(height: 16),

                  TextFormField(
                    controller: _providerContactController,
                    decoration: const InputDecoration(
                      labelText: "Contato do Fornecedor",
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
                          onPressed: isLoading
                              ? null
                              : () {
                                  _clearForm();
                                  Navigator.pop(context);
                                },
                          style: ElevatedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            backgroundColor: const Color.fromARGB(
                              255,
                              141,
                              31,
                              31,
                            ),
                            foregroundColor: Colors.white,
                          ),
                          child: const Text(
                            "CANCELAR",
                            style: TextStyle(fontSize: 16),
                          ),
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
                          child: const Text(
                            "SALVAR",
                            style: TextStyle(fontSize: 16),
                          ),
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
                            child: const Text(
                              "EXCLUIR",
                              style: TextStyle(fontSize: 16),
                            ),
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
                    color: Colors.black.withOpacity(0.3),
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
