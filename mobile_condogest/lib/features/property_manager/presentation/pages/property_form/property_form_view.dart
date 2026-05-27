import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'package:condogest/features/auth/presentation/viewmodels/auth_view_model.dart';
import '../../../data/models/property_model.dart';
import '../../../domain/entities/floor_entity.dart';
import '../../viewmodels/property_viewmodel.dart';
import '../../../data/models/unit_model.dart';

class PropertyFormView extends StatefulWidget {
  const PropertyFormView({super.key});

  @override
  State<PropertyFormView> createState() => _PropertyFormViewState();
}

class _PropertyFormViewState extends State<PropertyFormView> {
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

    final viewModel = Provider.of<PropertyViewModel>(context, listen: false);
    final authViewModel = Provider.of<AuthViewModel>(context, listen: false);
    final userId = int.tryParse(authViewModel.currentUser?.id ?? '0') ?? 0;

    final now = DateTime.now();

    final property = PropertyModel(
      id: 0,
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
            final sequentialUnitIndex = unitIndex + 1;
            final apartmentNumber = (floorNumber * 100) + sequentialUnitIndex;

            return UnitModel(
              id: 0,
              number: apartmentNumber,
              floor: floorNumber,
            );
          }),
        );
      }),
      isActive: _isActive,
      createdAt: now,
      updatedAt: now,
      userId: userId,
    );

    final success = await viewModel.addProperty(property, userId: userId);

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
      setState(() {
        _isActive = true;
        _selectedFloors = null;
        _apartmentsPerFloor = {};
      });
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
    _nameController.clear();
    _cepController.clear();
    _streetController.clear();
    _neighborhoodController.clear();
    _numberController.clear();
    _cityController.clear();
    _stateController.clear();
    _registrationController.clear();

    setState(() {
      _isActive = true;
      _selectedFloors = null;
      _apartmentsPerFloor = {};
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
        backgroundColor: const Color.fromRGBO(29, 27, 58, 1),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: Form(
        key: _formKey,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20.0),
          child: Column(
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
                validator: (value) => (value == null || value.isEmpty) ? 'Campo obrigatório' : null,
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
                validator: (value) => (value == null || value.isEmpty) ? 'Campo obrigatório' : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _streetController,
                decoration: const InputDecoration(
                  labelText: "Nome da Rua",
                  prefixIcon: Icon(Icons.signpost),
                ),
                textInputAction: TextInputAction.next,
                validator: (value) => (value == null || value.isEmpty) ? 'Campo obrigatório' : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _cityController,
                decoration: const InputDecoration(
                  labelText: "Nome da Cidade",
                  prefixIcon: Icon(Icons.location_city),
                ),
                textInputAction: TextInputAction.next,
                validator: (value) => (value == null || value.isEmpty) ? 'Campo obrigatório' : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _stateController,
                decoration: const InputDecoration(
                  labelText: "Estado-UF",
                  prefixIcon: Icon(Icons.public),
                ),
                textInputAction: TextInputAction.next,
                validator: (value) => (value == null || value.isEmpty) ? 'Campo obrigatório' : null,
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<int>(
                value: _selectedFloors,
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
                validator: (value) => value == null ? 'Campo obrigatório' : null,
              ),
              const SizedBox(height: 16),
              if ((_selectedFloors ?? 0) > 0) ...[
                const Padding(
                  padding: EdgeInsets.only(bottom: 16.0),
                  child: Text(
                    "Apartamentos por Andar",
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                ),
                Column(
                  children: List.generate((_selectedFloors ?? 0), (index) {
                    final andar = index + 1;
                    return Padding(
                      padding: const EdgeInsets.symmetric(vertical: 6.0),
                      child: Row(
                        children: [
                          Text("$andar° Andar", style: const TextStyle(fontWeight: FontWeight.w500)),
                          const Expanded(child: Padding(padding: EdgeInsets.symmetric(horizontal: 12.0), child: Divider(thickness: 1))),
                          SizedBox(
                            width: 120,
                            child: DropdownButtonFormField<int>(
                              value: _apartmentsPerFloor[andar] ?? 1,
                              decoration: const InputDecoration(
                                isDense: true,
                                contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                                border: OutlineInputBorder(),
                              ),
                              items: List.generate(4, (i) {
                                final value = i + 1;
                                return DropdownMenuItem(value: value, child: Text("$value Aptos"));
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
                    );
                  }),
                ),
              ],
              const SizedBox(height: 30),
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton(
                      onPressed: isLoading ? null : () => Navigator.pop(context),
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
                      child: isLoading
                          ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                          : const Text("CADASTRAR", style: TextStyle(fontSize: 16)),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
