import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../data/models/property_model.dart';
import '../../../domain/entities/floor_entity.dart';
import '../../viewmodels/property_viewmodel.dart';

class PropertyFormView extends StatefulWidget {
  @override
  _PropertyFormViewState createState() => _PropertyFormViewState();
}

class _PropertyFormViewState extends State<PropertyFormView> {
  final _formKey = GlobalKey<FormState>();

  bool _isActive = true;
  int? _selectedFloors;

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
      floors: List.generate(
        _selectedFloors!,
        (index) => Floor(
          number: index + 1,
          units: [],
        ),
      ),
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
                      setState(() {
                        _selectedFloors = value;
                      });
                    },
                    validator: (value) {
                      if (value == null) {
                        return 'Campo obrigatório';
                      }
                      return null;
                    },
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
