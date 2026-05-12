import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../property_maintenance/data/models/maintenance_model.dart';
import '../../../property_maintenance/domain/entities/maintenance_entity.dart';
import '../../presentation/viewmodels/maintenance_viewmodel.dart';

class MaintenanceFormView extends StatefulWidget {
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

  final List<String> _priorityOptions = [
  'Baixa',
  'Média',
  'Alta',
  'Urgente',
];

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

    // final floorsCount = int.tryParse(_floorsController.text) ?? 0;

    final now = DateTime.now();

    final maintenance = MaintenanceModel(
      id: '',
      ticketId: 'TICKET-TODO',
      unitId: 'UNIT-TODO',
      local: _localSelected!,
      type: _selectedType!,
      priority: _selectedPriority ?? 'Média',
      providerId: 'PROVIDER-TODO',
      observation: _observationController.text,
      createdAt: now,
    );

    final success = await viewModel.addMaintenance(maintenance);

    if (!mounted) return;

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Propriedade cadastrada com sucesso!')),
      );
      _clearForm();
      _formKey.currentState!.reset();
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

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Nova Manutenção', 
          style: TextStyle(color: Colors.white),
        ),
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
                    items: ['Preventiva', 'Corretiva', 'Melhoria']
                        .map((String tipo) {
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
                    items: ['Baixa', 'Média', 'Alta', 'Urgente']
                        .map((String prioridade) {
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
                            backgroundColor: const Color.fromARGB(255, 141, 31, 31),
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
                            "CADASTRAR",
                            style: TextStyle(fontSize: 16),
                          ),
                        ),
                      ),
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
