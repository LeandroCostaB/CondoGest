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

  bool _isActive = true;
  int? _selectedFloors;
  Map<int, int> _apartmentsPerFloor = {};

  final _nameController = TextEditingController();
  final _cepController = TextEditingController();
  final _streetController = TextEditingController();
  final _neighborhoodController = TextEditingController();
  final _numberController = TextEditingController();
  final _cityController = TextEditingController();
  final _stateController = TextEditingController();
  final _registrationController = TextEditingController();

  @override
  void dispose() {
    _nameController.dispose();
    _cepController.dispose();
    _streetController.dispose();
    _neighborhoodController.dispose();
    _numberController.dispose();
    _cityController.dispose();
    _stateController.dispose();
    _registrationController.dispose();
    super.dispose();
  }

  void _submitForm() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    final viewModel = Provider.of<MaintenanceViewModel>(context, listen: false);

    // final floorsCount = int.tryParse(_floorsController.text) ?? 0;

    final now = DateTime.now();

    final property = PropertyModel(
      id: '',
      name: _nameController.text,
      cep: _cepController.text,
      street: _streetController.text,
      neighborhood: _neighborhoodController.text,
      number: _numberController.text,
      city: _cityController.text,
      state: _stateController.text,
      registration: _registrationController.text,

      floors: List.generate(_selectedFloors!, (floorIndex) {
        final floorNumber = floorIndex + 1;
        final unitsCount = _apartmentsPerFloor[floorNumber] ?? 0;

        return Floor(
          number: floorNumber,
          units: List.generate(unitsCount, (unitIndex) {
            final aptNumber =
                '$floorNumber${(unitIndex + 1).toString().padLeft(2, '0')}';

            return UnitModel(
              id: '${floorNumber}_${unitIndex + 1}',
              number: int.parse(aptNumber),
              floor: floorNumber,
            );
          }),
        );
      }),
      isActive: _isActive,
      createdAt: now,
      updatedAt: now,
    );

    final success = await viewModel.addProperty(property);

    if (!mounted) return;

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Propriedade cadastrada com sucesso!')),
      );
      _formKey.currentState!.reset();

      _nameController.clear();
      _cepController.clear();
      _streetController.clear();
      _neighborhoodController.clear();
      _numberController.clear();
      _cityController.clear();
      _stateController.clear();
      _registrationController.clear();
      _selectedFloors = null;
      _selectedUnits = null;
      setState(() {
        _isActive = true;
      });
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

    _nameController.clear();
    _cepController.clear();
    _streetController.clear();
    _neighborhoodController.clear();
    _numberController.clear();
    _cityController.clear();
    _stateController.clear();
    _registrationController.clear();
    _selectedFloors = null;
    _selectedUnits = null;

    setState(() {
      _isActive = true;
      _selectedFloors = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    final isLoading = context.watch<PropertyViewModel>().isLoading;

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Nova Propriedade',
          style: TextStyle(color: Colors.white),
        ),
        backgroundColor: Color.fromRGBO(29, 27, 58, 1),
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
                  SwitchListTile(
                    title: const Text('Propriedade Ativa?'),
                    value: _isActive,
                    activeColor: Colors.green.shade600,
                    onChanged: (bool value) {
                      setState(() {
                        _isActive = value;
                      });
                    },
                  ),
                  const SizedBox(height: 20),
                  const Divider(),
                  const SizedBox(height: 20),
                  TextFormField(
                    controller: _nameController,
                    decoration: const InputDecoration(
                      labelText: "Nome da Propriedade",
                      prefixIcon: Icon(Icons.business),
                    ),
                    textInputAction: TextInputAction.next,
                    validator: (value) => (value == null || value.isEmpty)
                        ? 'Campo obrigatório'
                        : null,
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _cepController,
                    decoration: const InputDecoration(
                      labelText: "CEP",
                      prefixIcon: Icon(Icons.location_pin),
                    ),
                    keyboardType: TextInputType.number,
                    textInputAction: TextInputAction.next,
                    validator: (value) => (value == null || value.isEmpty)
                        ? 'Campo obrigatório'
                        : null,
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _streetController,
                    decoration: const InputDecoration(
                      labelText: "Nome da Rua",
                      prefixIcon: Icon(Icons.signpost),
                    ),
                    textInputAction: TextInputAction.next,
                    validator: (value) => (value == null || value.isEmpty)
                        ? 'Campo obrigatório'
                        : null,
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _cityController,
                    decoration: const InputDecoration(
                      labelText: "Nome da Cidade",
                      prefixIcon: Icon(Icons.location_city),
                    ),
                    textInputAction: TextInputAction.next,
                    validator: (value) => (value == null || value.isEmpty)
                        ? 'Campo obrigatório'
                        : null,
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _stateController,
                    decoration: const InputDecoration(
                      labelText: "Estado-UF",
                      prefixIcon: Icon(Icons.public),
                    ),
                    textInputAction: TextInputAction.next,
                    validator: (value) => (value == null || value.isEmpty)
                        ? 'Campo obrigatório'
                        : null,
                  ),
                  const SizedBox(height: 16),
                  DropdownButtonFormField<int>(
                    value: _selectedFloors == 0 ? null : _selectedFloors,
                    decoration: const InputDecoration(
                      labelText: "N° de Andares",
                      prefixIcon: Icon(Icons.layers),
                    ),
                    items: List.generate(12, (index) {
                      final value = index + 1;
                      return DropdownMenuItem(
                        value: value,
                        child: Text(value.toString()),
                      );
                    }),
                    onChanged: (value) {
                      if (value != null) {
                        setState(() {
                          _selectedFloors = value;

                          final newMap = <int, int>{};
                          for (int i = 1; i <= value; i++) {
                            newMap[i] = _apartmentsPerFloor[i] ?? 1;
                          }
                          _apartmentsPerFloor = newMap;
                        });
                      }
                    },
                    validator: (value) {
                      if (value == null) {
                        return 'Campo obrigatório';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),
                  if ((_selectedFloors ?? 0) > 0) ...[
                    const Padding(
                      padding: EdgeInsets.only(bottom: 16.0),
                      child: Text(
                        "Apartamentos por Andar",
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                    ),
                    Column(
                      children: List.generate((_selectedFloors ?? 0), (index) {
                        final andar = index + 1;
                        return Padding(
                          // Espaçamento entre os andares
                          padding: const EdgeInsets.only(bottom: 12.0),
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 16.0,
                              vertical: 12.0,
                            ),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: Colors.grey.shade200),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withOpacity(0.02),
                                  blurRadius: 8,
                                  offset: const Offset(0, 2),
                                ),
                              ],
                            ),
                            child: Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(8),
                                  decoration: BoxDecoration(
                                    color: const Color.fromRGBO(
                                      29,
                                      27,
                                      58,
                                      0.05,
                                    ),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: const Icon(
                                    Icons.layers_outlined,
                                    color: Color.fromRGBO(29, 27, 58, 1),
                                    size: 20,
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Text(
                                  "$andarº Andar",
                                  style: const TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w600,
                                    color: Color.fromRGBO(29, 27, 58, 1),
                                  ),
                                ),
                                const Spacer(),

                                // 3. Dropdown estilizado como um "Pill" (pílula)
                                SizedBox(
                                  width: 130,
                                  child: DropdownButtonFormField<int>(
                                    value: _apartmentsPerFloor[andar] ?? 1,
                                    icon: const Icon(
                                      Icons.keyboard_arrow_down,
                                      size: 20,
                                    ),
                                    decoration: InputDecoration(
                                      isDense: true,
                                      filled: true,
                                      fillColor: Colors.grey.shade50,
                                      contentPadding:
                                          const EdgeInsets.symmetric(
                                            horizontal: 12,
                                            vertical: 10,
                                          ),
                                      border: OutlineInputBorder(
                                        borderRadius: BorderRadius.circular(8),
                                        borderSide: BorderSide(
                                          color: Colors.grey.shade300,
                                        ),
                                      ),
                                      enabledBorder: OutlineInputBorder(
                                        borderRadius: BorderRadius.circular(8),
                                        borderSide: BorderSide(
                                          color: Colors.grey.shade300,
                                        ),
                                      ),
                                      focusedBorder: OutlineInputBorder(
                                        borderRadius: BorderRadius.circular(8),
                                        borderSide: const BorderSide(
                                          color: Color.fromRGBO(29, 27, 58, 1),
                                          width: 1.5,
                                        ),
                                      ),
                                    ),
                                    style: const TextStyle(
                                      color: Colors.black87,
                                      fontSize: 14,
                                      fontWeight: FontWeight.w500,
                                    ),
                                    items: List.generate(4, (i) {
                                      final value = i + 1;
                                      return DropdownMenuItem(
                                        value: value,
                                        child: Text("$value Aptos"),
                                      );
                                    }),
                                    onChanged: (value) {
                                      if (value != null) {
                                        setState(() {
                                          _apartmentsPerFloor[andar] = value;
                                        });
                                      }
                                    },
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      }),
                    ),
                  ],
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
