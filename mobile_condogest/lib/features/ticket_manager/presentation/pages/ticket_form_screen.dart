import 'package:flutter/material.dart';
import '../../domain/entities/ticket.dart';
import '../../domain/repositories/ticket_repository.dart';
import '../../../../core/presentation/pages/main_navigation_screen.dart';

class TicketFormScreen extends StatefulWidget {
  final TicketRepository repository;
  final Ticket? ticket;
  final bool isEditing;

  const TicketFormScreen({
    super.key, 
    required this.repository,
    this.ticket,
    this.isEditing = false,
  });

  @override
  State<TicketFormScreen> createState() => _TicketFormScreenState();
}

class _TicketFormScreenState extends State<TicketFormScreen> {
  final _formKey = GlobalKey<FormState>();
  bool _isLoading = false;

  // Form State Variables
  String? _selectedLocation;
  String? _selectedType;
  String _selectedPriority = 'Baixa';

  final _providerController = TextEditingController();
  final _phoneController = TextEditingController();
  final _observationController = TextEditingController();

  @override
  void initState() {
    super.initState();
    if (widget.isEditing && widget.ticket != null) {
      _selectedLocation = widget.ticket!.location;
      _selectedType = widget.ticket!.type;
      _selectedPriority = widget.ticket!.priority ?? 'Baixa';
      _observationController.text = widget.ticket!.description ?? '';
      
      // If description contains "Prestador:" pattern from previous logic, try to parse it
      if (_observationController.text.contains('Prestador:')) {
        try {
          final parts = _observationController.text.split(', Contato: ');
          _providerController.text = parts[0].replaceAll('Prestador: ', '');
          _phoneController.text = parts[1];
          _observationController.clear();
        } catch (_) {}
      }
    }
  }

  // Seeded Session Context (Mock IDs based on seeded data)
  String get _currentPropertyId => widget.ticket?.propertyId ?? '';
  String get _currentApartmentId => widget.ticket?.apartmentId ?? ''; 
  String get _currentResidentId => widget.ticket?.residentId ?? '';

  // Constants
  final Color _primaryColor = const Color(0xFF1D1B3A);
  final Color _residentHeaderColor = const Color(0xFF2E7D32);

  final List<String> _locations = ['Cozinha', 'Sala', 'Quarto', 'Área Comum'];
  final List<String> _types = ['Hidráulica', 'Elétrica', 'Pintura', 'Outros'];
  final List<String> _priorities = ['Baixa', 'Média', 'Alta', 'Urgente'];

  @override
  void dispose() {
    _providerController.dispose();
    _phoneController.dispose();
    _observationController.dispose();
    super.dispose();
  }

  Future<void> _saveTicket() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedLocation == null || _selectedType == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Por favor, selecione o local e o tipo.')),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      final ticket = Ticket(
        id: widget.ticket?.id,
        title: '$_selectedLocation - $_selectedType',
        description: _observationController.text.isNotEmpty
            ? _observationController.text
            : 'Prestador: ${_providerController.text}, Contato: ${_phoneController.text}',
        location: _selectedLocation,
        type: _selectedType,
        priority: _selectedPriority,
        status: widget.ticket?.status ?? 'Pendente',
        apartmentId: _currentApartmentId,
        propertyId: _currentPropertyId,
        residentId: _currentResidentId,
        createdAt: widget.ticket?.createdAt ?? DateTime.now(),
      );

      if (widget.isEditing) {
        await widget.repository.updateTicket(ticket);
      } else {
        await widget.repository.saveTicket(ticket);
      }

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(widget.isEditing ? 'Ticket atualizado com sucesso!' : 'Ticket gravado com sucesso!'),
            backgroundColor: Colors.green,
          ),
        );
        
        if (Navigator.canPop(context)) {
          Navigator.pop(context, true); // Return true to signal refresh
        } else {
          Navigator.pushAndRemoveUntil(
            context,
            MaterialPageRoute(
              builder: (context) => MainNavigationScreen(
                ticketRepository: widget.repository,
                userType: 'resident',
              ),
            ),
            (route) => false,
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erro ao salvar ticket: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: _primaryColor,
        title: Text(
          widget.isEditing ? "EDITAR CHAMADO" : "NOVO TICKET",
          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: Stack(
        children: [
          SingleChildScrollView(
            padding: const EdgeInsets.all(16.0),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  _buildResidentHeader(),
                  const SizedBox(height: 24),

                  _buildDropdownField(
                    label: "Local",
                    hint: "Selecione o Local",
                    value: _selectedLocation,
                    items: _locations,
                    onChanged: (val) => setState(() => _selectedLocation = val),
                  ),
                  const SizedBox(height: 16),

                  _buildDropdownField(
                    label: "Tipo",
                    hint: "Selecione o Tipo",
                    value: _selectedType,
                    items: _types,
                    onChanged: (val) => setState(() => _selectedType = val),
                  ),
                  const SizedBox(height: 24),

                  const Text(
                    "Prioridade",
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                  const SizedBox(height: 8),
                  _buildPrioritySelector(),
                  const SizedBox(height: 24),

                  _buildObservationField(),
                  const SizedBox(height: 32),

                  _buildActionButtons(),
                  const SizedBox(height: 16),
                ],
              ),
            ),
          ),
          if (_isLoading)
            Container(
              color: Colors.black26,
              child: const Center(child: CircularProgressIndicator()),
            ),
        ],
      ),
    );
  }

  Widget _buildResidentHeader() {
    return Column(
      children: [
        const Text(
          "FULANO DA SILVA",
          style: TextStyle(
            color: Color(0xFF2E7D32),
            fontWeight: FontWeight.bold,
            fontSize: 20,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          "Andar: 2°  |  Apartamento: 207",
          style: TextStyle(color: Colors.grey.shade600, fontSize: 14),
        ),
      ],
    );
  }

  Widget _buildDropdownField({
    required String label,
    required String hint,
    required String? value,
    required List<String> items,
    required ValueChanged<String?> onChanged,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
        ),
        const SizedBox(height: 8),
        DropdownButtonFormField<String>(
          value: value,
          decoration: InputDecoration(
            hintText: hint,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
            contentPadding: const EdgeInsets.symmetric(horizontal: 12),
          ),
          items: items
              .map((e) => DropdownMenuItem(value: e, child: Text(e)))
              .toList(),
          onChanged: onChanged,
        ),
      ],
    );
  }

  Widget _buildPrioritySelector() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: _priorities.map((priority) {
        final isSelected = _selectedPriority == priority;
        return ChoiceChip(
          label: Text(priority),
          selected: isSelected,
          onSelected: (selected) {
            if (selected) setState(() => _selectedPriority = priority);
          },
          selectedColor: _primaryColor.withOpacity(0.2),
          labelStyle: TextStyle(
            color: isSelected ? _primaryColor : Colors.black87,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
          ),
        );
      }).toList(),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required String placeholder,
    TextInputType keyboardType = TextInputType.text,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
        ),
        const SizedBox(height: 8),
        TextFormField(
          controller: controller,
          keyboardType: keyboardType,
          decoration: InputDecoration(
            hintText: placeholder,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
          ),
          validator: (value) =>
              (value == null || value.isEmpty) ? 'Campo obrigatório' : null,
        ),
      ],
    );
  }

  Widget _buildObservationField() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          "Observação",
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
        ),
        const SizedBox(height: 8),
        TextFormField(
          controller: _observationController,
          maxLines: 4,
          decoration: InputDecoration(
            hintText: "Descreva o problema aqui...",
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
            suffixIcon: const Icon(Icons.camera_alt, color: Colors.green),
          ),
        ),
      ],
    );
  }

  Widget _buildActionButtons() {
    return Row(
      children: [
        Expanded(
          child: ElevatedButton(
            onPressed: () => Navigator.pop(context),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red.shade900,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            child: const Text(
              "CANCELAR",
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: ElevatedButton(
            onPressed: _isLoading ? null : _saveTicket,
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.green.shade700,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            child: const Text(
              "GRAVAR",
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
          ),
        ),
      ],
    );
  }
}
