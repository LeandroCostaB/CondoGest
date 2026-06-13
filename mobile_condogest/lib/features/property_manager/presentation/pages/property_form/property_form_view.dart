import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../data/datasources/apartment_service.dart';
import '../../../data/models/property_model.dart';
import '../../../domain/entities/unit_entity.dart';
import '../../viewmodels/property_viewmodel.dart';
import '../property_details/property_details_view.dart';

class PropertyFormView extends StatefulWidget {
  const PropertyFormView({super.key});

  @override
  State<PropertyFormView> createState() => _PropertyFormViewState();
}

class _PropertyFormViewState extends State<PropertyFormView> {
  static const _primaryColor = Color.fromRGBO(29, 27, 58, 1);
  final _formKey = GlobalKey<FormState>();

  final _nameController = TextEditingController();
  final _streetController = TextEditingController();
  final _numberController = TextEditingController();
  final _neighborhoodController = TextEditingController();
  final _cityController = TextEditingController();
  final _stateController = TextEditingController();

  // Apartments to create after saving
  final List<_ApartmentDraft> _apartments = [];

  @override
  void dispose() {
    _nameController.dispose();
    _streetController.dispose();
    _numberController.dispose();
    _neighborhoodController.dispose();
    _cityController.dispose();
    _stateController.dispose();
    super.dispose();
  }

  void _addApartmentRow() {
    setState(() => _apartments.add(_ApartmentDraft()));
  }

  void _removeApartmentRow(int index) {
    setState(() => _apartments.removeAt(index));
  }

  Future<void> _submitForm() async {
    if (!_formKey.currentState!.validate()) return;

    // Validate apartment rows
    for (final apt in _apartments) {
      if (apt.number.trim().isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Preencha o número de todos os apartamentos ou remova as linhas vazias.'),
            backgroundColor: Colors.orange,
          ),
        );
        return;
      }
    }

    final viewModel = context.read<PropertyViewModel>();
    final now = DateTime.now();

    final property = PropertyModel(
      id: null,
      name: _nameController.text.trim(),
      street: _streetController.text.trim(),
      number: _numberController.text.trim(),
      neighborhood: _neighborhoodController.text.trim(),
      city: _cityController.text.trim(),
      state: _stateController.text.trim(),
      cep: '',
      registration: '',
      floors: [],
      isActive: true,
      createdAt: now,
      updatedAt: now,
      userId: userId,
    );

    final created = await viewModel.addProperty(property);
    if (!mounted) return;

    if (created == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(viewModel.errorMessage),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    // Create apartments if any were added
    if (_apartments.isNotEmpty && created.id != null) {
      final service = ApartmentService();
      int failed = 0;
      for (final draft in _apartments) {
        try {
          await service.create(
            created.id!,
            Unit(
              id: '',
              number: int.tryParse(draft.number.trim()) ?? 0,
              floor: int.tryParse(draft.floor.trim()) ?? 0,
              block: draft.block.trim().isEmpty ? null : draft.block.trim(),
            ),
          );
        } catch (_) {
          failed++;
        }
      }
      if (!mounted) return;
      if (failed > 0) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Condomínio criado, mas $failed apartamento(s) não puderam ser adicionados.'),
            backgroundColor: Colors.orange,
          ),
        );
      }
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Condomínio cadastrado com sucesso!')),
        );
      }
    }

    if (!mounted) return;
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(
        builder: (_) => PropertyDetailsView(property: created),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isLoading = context.watch<PropertyViewModel>().isLoading;

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Novo Condomínio',
          style: TextStyle(color: Colors.white),
        ),
        backgroundColor: _primaryColor,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: Stack(
        children: [
          Form(
            key: _formKey,
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  _sectionTitle('Identificação'),
                  const SizedBox(height: 12),
                  _field(
                    controller: _nameController,
                    label: 'Nome do Condomínio',
                    icon: Icons.business,
                    required: true,
                  ),
                  const SizedBox(height: 24),
                  _sectionTitle('Endereço'),
                  const SizedBox(height: 12),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        flex: 3,
                        child: _field(
                          controller: _streetController,
                          label: 'Rua / Avenida',
                          icon: Icons.signpost,
                          required: true,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        flex: 1,
                        child: _field(
                          controller: _numberController,
                          label: 'Número',
                          icon: Icons.tag,
                          required: true,
                          keyboardType: TextInputType.number,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  _field(
                    controller: _neighborhoodController,
                    label: 'Bairro',
                    icon: Icons.map,
                    required: true,
                  ),
                  const SizedBox(height: 16),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        flex: 3,
                        child: _field(
                          controller: _cityController,
                          label: 'Cidade',
                          icon: Icons.location_city,
                          required: true,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        flex: 1,
                        child: _field(
                          controller: _stateController,
                          label: 'UF',
                          icon: Icons.public,
                          required: true,
                          maxLength: 2,
                          textCapitalization: TextCapitalization.characters,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 28),
                  _buildApartmentsSection(),
                  const SizedBox(height: 32),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: isLoading ? null : () => Navigator.pop(context),
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            foregroundColor: Colors.red.shade700,
                            side: BorderSide(color: Colors.red.shade700),
                          ),
                          child: const Text('CANCELAR'),
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
                          child: const Text('CADASTRAR'),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                ],
              ),
            ),
          ),
          if (isLoading)
            Container(
              color: Colors.black.withValues(alpha: 0.3),
              child: const Center(child: CircularProgressIndicator()),
            ),
        ],
      ),
    );
  }

  Widget _buildApartmentsSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            _sectionTitle('Apartamentos'),
            const Spacer(),
            TextButton.icon(
              onPressed: _addApartmentRow,
              icon: const Icon(Icons.add, size: 18),
              label: const Text('Adicionar'),
              style: TextButton.styleFrom(foregroundColor: _primaryColor),
            ),
          ],
        ),
        if (_apartments.isEmpty)
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 8),
            child: Text(
              'Nenhum apartamento. Você pode adicioná-los agora ou depois.',
              style: TextStyle(color: Colors.grey.shade500, fontSize: 13),
            ),
          )
        else ...[
          const SizedBox(height: 4),
          // Header row
          Padding(
            padding: const EdgeInsets.only(bottom: 6),
            child: Row(
              children: [
                Expanded(flex: 2, child: Text('Número *', style: _headerStyle)),
                const SizedBox(width: 8),
                Expanded(child: Text('Andar', style: _headerStyle)),
                const SizedBox(width: 8),
                Expanded(child: Text('Bloco', style: _headerStyle)),
                const SizedBox(width: 36),
              ],
            ),
          ),
          ...List.generate(_apartments.length, (i) => _buildApartmentRow(i)),
        ],
      ],
    );
  }

  static final _headerStyle = TextStyle(
    fontSize: 11,
    fontWeight: FontWeight.w600,
    color: Colors.grey.shade600,
  );

  Widget _buildApartmentRow(int index) {
    final draft = _apartments[index];
    return Padding(
      key: ObjectKey(draft),
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Expanded(
            flex: 2,
            child: TextFormField(
              initialValue: draft.number,
              keyboardType: TextInputType.number,
              textInputAction: TextInputAction.next,
              decoration: const InputDecoration(
                hintText: 'Ex: 101',
                border: OutlineInputBorder(),
                contentPadding: EdgeInsets.symmetric(horizontal: 10, vertical: 10),
                isDense: true,
              ),
              onChanged: (v) => draft.number = v,
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: TextFormField(
              initialValue: draft.floor,
              keyboardType: TextInputType.number,
              textInputAction: TextInputAction.next,
              decoration: const InputDecoration(
                hintText: '1',
                border: OutlineInputBorder(),
                contentPadding: EdgeInsets.symmetric(horizontal: 10, vertical: 10),
                isDense: true,
              ),
              onChanged: (v) => draft.floor = v,
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: TextFormField(
              initialValue: draft.block,
              textCapitalization: TextCapitalization.characters,
              textInputAction: TextInputAction.next,
              decoration: const InputDecoration(
                hintText: 'A',
                border: OutlineInputBorder(),
                contentPadding: EdgeInsets.symmetric(horizontal: 10, vertical: 10),
                isDense: true,
              ),
              onChanged: (v) => draft.block = v,
            ),
          ),
          const SizedBox(width: 4),
          IconButton(
            onPressed: () => _removeApartmentRow(index),
            icon: Icon(Icons.close, size: 18, color: Colors.red.shade600),
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
          ),
        ],
      ),
    );
  }

  Widget _sectionTitle(String title) {
    return Text(
      title,
      style: const TextStyle(
        fontSize: 14,
        fontWeight: FontWeight.w600,
        color: _primaryColor,
        letterSpacing: 0.5,
      ),
    );
  }

  Widget _field({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    bool required = false,
    TextInputType keyboardType = TextInputType.text,
    TextCapitalization textCapitalization = TextCapitalization.words,
    int? maxLength,
  }) {
    return TextFormField(
      controller: controller,
      keyboardType: keyboardType,
      textInputAction: TextInputAction.next,
      textCapitalization: textCapitalization,
      maxLength: maxLength,
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon),
        counterText: '',
      ),
      validator: required
          ? (v) => (v == null || v.trim().isEmpty) ? 'Campo obrigatório' : null
          : null,
    );
  }
}

class _ApartmentDraft {
  String number = '';
  String floor = '';
  String block = '';
}
