import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../data/datasources/ticket_service.dart';
import '../../domain/entities/ticket.dart';
import '../../domain/repositories/ticket_repository.dart';
import '../../../../core/presentation/pages/main_navigation_screen.dart';
import '../../../../features/auth/presentation/viewmodels/auth_view_model.dart';

class TicketFormScreen extends StatefulWidget {
  final TicketRepository repository;
  final Ticket? ticket;
  final bool isEditing;
  final String? residentId;

  const TicketFormScreen({
    super.key,
    required this.repository,
    this.ticket,
    this.isEditing = false,
    this.residentId,
  });

  @override
  State<TicketFormScreen> createState() => _TicketFormScreenState();
}

class _TicketFormScreenState extends State<TicketFormScreen> {
  final _formKey = GlobalKey<FormState>();
  bool _isLoading = false;

  String? _selectedLocation;
  String? _selectedType;
  String _selectedPriority = 'Baixa';
  final _observationController = TextEditingController();

  // IDs resolvidos no initState
  String _residentId = '';
  String _apartmentId = '';
  String _apartmentLabel = '';
  bool _loadingApartment = true;

  final Color _primaryColor = const Color(0xFF1D1B3A);

  final List<String> _locations = ['Cozinha', 'Sala', 'Quarto', 'Área Comum'];
  final List<String> _types = ['Hidráulica', 'Elétrica', 'Pintura', 'Outros'];
  final List<String> _priorities = ['Baixa', 'Média', 'Alta', 'Urgente'];

  @override
  void initState() {
    super.initState();
    if (widget.isEditing && widget.ticket != null) {
      final t = widget.ticket!;
      _selectedLocation = _locations.contains(t.location) ? t.location : null;
      _selectedType = _types.contains(t.type) ? t.type : null;
      _selectedPriority = _priorities.contains(t.priority) ? t.priority! : 'Baixa';
      _observationController.text = widget.ticket!.description ?? '';
      _residentId = widget.ticket!.residentId;
      _apartmentId = widget.ticket!.apartmentId;
      _apartmentLabel = 'Ap. ${widget.ticket!.apartmentId.substring(0, 8)}…';
      _loadingApartment = false;
    } else {
      // Novo ticket: resolve IDs via AuthViewModel + tickets existentes do morador
      WidgetsBinding.instance.addPostFrameCallback((_) => _resolveIds());
    }
  }

  Future<void> _resolveIds() async {
    final auth = context.read<AuthViewModel>();
    _residentId = widget.residentId ?? auth.currentUser?.id ?? '';

    // Primary: use the apartment linked directly to the user's profile
    final profileApartmentId = auth.currentUser?.apartmentId;
    if (profileApartmentId != null && profileApartmentId.isNotEmpty) {
      _apartmentId = profileApartmentId;
      final number = auth.currentUser?.apartmentNumber;
      final block = auth.currentUser?.apartmentBlock;
      _apartmentLabel = block != null && block.isNotEmpty
          ? 'Ap. $number — Bloco $block'
          : 'Ap. ${number ?? profileApartmentId.substring(0, 8)}';
    } else if (_residentId.isNotEmpty) {
      // Fallback: derive from previous tickets (for accounts before the link existed)
      try {
        final service = TicketService();
        final tickets = await service.getByResident(_residentId);
        if (tickets.isNotEmpty) {
          _apartmentId = tickets.first.apartmentId;
          _apartmentLabel = 'Ap. ${tickets.first.apartmentId.substring(0, 8)}…';
        }
      } catch (_) {}
    }

    if (mounted) {
      setState(() => _loadingApartment = false);
    }
  }

  @override
  void dispose() {
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
    if (_residentId.isEmpty || _apartmentId.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Não foi possível identificar seu apartamento. '
              'Verifique se você já possui chamados anteriores cadastrados.'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

    setState(() => _isLoading = true);
    try {
      final ticket = Ticket(
        id: widget.ticket?.id,
        title: '$_selectedLocation - $_selectedType - $_selectedPriority',
        description: _observationController.text.isNotEmpty
            ? _observationController.text
            : '$_selectedLocation — $_selectedType',
        location: _selectedLocation,
        type: _selectedType,
        priority: _selectedPriority,
        status: widget.ticket?.status ?? 'OPEN',
        apartmentId: _apartmentId,
        propertyId: '',
        residentId: _residentId,
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
            content: Text(widget.isEditing
                ? 'Ticket atualizado com sucesso!'
                : 'Ticket gravado com sucesso!'),
            backgroundColor: Colors.green,
          ),
        );
        if (Navigator.canPop(context)) {
          Navigator.pop(context, true);
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
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final userName = context.watch<AuthViewModel>().currentUser?.name ?? '…';

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: _primaryColor,
        title: Text(
          widget.isEditing ? "EDITAR CHAMADO" : "NOVO TICKET",
          style: const TextStyle(
              color: Colors.white, fontWeight: FontWeight.bold),
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
                  _buildResidentHeader(userName),
                  const SizedBox(height: 24),
                  _buildDropdownField(
                    label: "Local",
                    hint: "Selecione o Local",
                    value: _selectedLocation,
                    items: _locations,
                    onChanged: (val) =>
                        setState(() => _selectedLocation = val),
                  ),
                  const SizedBox(height: 16),
                  _buildDropdownField(
                    label: "Tipo",
                    hint: "Selecione o Tipo",
                    value: _selectedType,
                    items: _types,
                    onChanged: (val) =>
                        setState(() => _selectedType = val),
                  ),
                  const SizedBox(height: 24),
                  const Text(
                    "Prioridade",
                    style:
                        TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
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

  Widget _buildResidentHeader(String name) {
    return Column(
      children: [
        Text(
          name,
          style: const TextStyle(
            color: Color(0xFF2E7D32),
            fontWeight: FontWeight.bold,
            fontSize: 20,
          ),
        ),
        const SizedBox(height: 4),
        _loadingApartment
            ? const SizedBox(
                height: 16,
                width: 16,
                child: CircularProgressIndicator(strokeWidth: 2),
              )
            : Text(
                _apartmentId.isEmpty
                    ? 'Apartamento não identificado'
                    : _apartmentLabel,
                style:
                    TextStyle(color: Colors.grey.shade600, fontSize: 14),
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
        Text(label,
            style: const TextStyle(
                fontWeight: FontWeight.bold, fontSize: 16)),
        const SizedBox(height: 8),
        DropdownButtonFormField<String>(
          value: value,
          decoration: InputDecoration(
            hintText: hint,
            border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8)),
            contentPadding:
                const EdgeInsets.symmetric(horizontal: 12),
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
          selectedColor: _primaryColor.withValues(alpha: 0.2),
          labelStyle: TextStyle(
            color: isSelected ? _primaryColor : Colors.black87,
            fontWeight:
                isSelected ? FontWeight.bold : FontWeight.normal,
          ),
        );
      }).toList(),
    );
  }

  Widget _buildObservationField() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text("Observação",
            style:
                TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        const SizedBox(height: 8),
        TextFormField(
          controller: _observationController,
          maxLines: 4,
          decoration: InputDecoration(
            hintText: "Descreva o problema aqui...",
            border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8)),
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
                  borderRadius: BorderRadius.circular(8)),
            ),
            child: const Text("CANCELAR",
                style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: ElevatedButton(
            onPressed: (_isLoading || _loadingApartment) ? null : _saveTicket,
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.green.shade700,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8)),
            ),
            child: const Text("GRAVAR",
                style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ),
      ],
    );
  }
}
