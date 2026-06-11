import 'package:flutter/material.dart';
import '../../domain/entities/ticket.dart';
import '../../domain/repositories/ticket_repository.dart';
import 'ticket_form_screen.dart';

class TicketDetailScreen extends StatefulWidget {
  final Ticket ticket;
  final String userType;
  final TicketRepository repository;

  const TicketDetailScreen({
    super.key,
    required this.ticket,
    required this.userType,
    required this.repository,
  });

  @override
  State<TicketDetailScreen> createState() => _TicketDetailScreenState();
}

class _TicketDetailScreenState extends State<TicketDetailScreen> {
  late String _currentStatus;
  bool _isUpdating = false;

  static const _statusOptions = ['OPEN', 'IN_PROGRESS', 'RESOLVED'];

  static const _statusLabels = {
    'OPEN':        'Pendente',
    'IN_PROGRESS': 'Em Andamento',
    'RESOLVED':    'Finalizado',
  };

  final Color _primaryColor = const Color(0xFF1D1B3A);

  @override
  void initState() {
    super.initState();
    final raw = widget.ticket.status ?? 'OPEN';
    _currentStatus = _statusOptions.contains(raw) ? raw : 'OPEN';
  }

  Future<void> _updateStatus(String? newStatus) async {
    if (newStatus == null || newStatus == _currentStatus) return;
    setState(() => _isUpdating = true);
    try {
      await widget.repository.updateTicketStatus(widget.ticket.id!, newStatus);
      if (mounted) {
        setState(() {
          _currentStatus = newStatus;
          _isUpdating = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Status atualizado com sucesso!'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isUpdating = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erro ao atualizar status: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'OPEN':        return Colors.red.shade700;
      case 'IN_PROGRESS': return Colors.orange.shade700;
      case 'RESOLVED':    return Colors.green.shade700;
      default:            return _primaryColor;
    }
  }

  @override
  Widget build(BuildContext context) {
    final bool isSyndic = widget.userType == 'syndic';
    final Color color = _statusColor(_currentStatus);

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: _primaryColor,
        title: const Text(
          "DETALHES DO TICKET",
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildHeader(color),
            const SizedBox(height: 32),
            _buildInfoSection("Local",     widget.ticket.location  ?? "Não informado"),
            _buildInfoSection("Tipo",      widget.ticket.type      ?? "Não informado"),
            _buildInfoSection("Prioridade",widget.ticket.priority  ?? "Normal"),
            _buildInfoSection("Descrição", widget.ticket.description ?? "Sem descrição"),
            const SizedBox(height: 40),
            if (isSyndic) _buildStatusPicker(color),
            if (!isSyndic) _buildStatusReadOnly(color),
            const SizedBox(height: 24),
          ],
        ),
      ),
      bottomNavigationBar: isSyndic
          ? SafeArea(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: ElevatedButton(
                  onPressed: () async {
                    final navigator = Navigator.of(context);
                    final result = await Navigator.push<bool>(
                      context,
                      MaterialPageRoute(
                        builder: (context) => TicketFormScreen(
                          repository: widget.repository,
                          ticket: widget.ticket,
                          isEditing: true,
                        ),
                      ),
                    );
                    if (result == true && mounted) {
                      navigator.pop();
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green.shade700,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12)),
                    elevation: 2,
                  ),
                  child: const Text(
                    "EDITAR INFORMAÇÕES",
                    style:
                        TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                ),
              ),
            )
          : null,
    );
  }

  Widget _buildHeader(Color color) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 64,
          height: 64,
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.1),
            shape: BoxShape.circle,
            border: Border.all(color: color, width: 2),
          ),
          child: Center(
            child: Text(
              '${widget.ticket.aptNumber ?? '--'}',
              style: TextStyle(
                  color: color, fontWeight: FontWeight.bold, fontSize: 20),
            ),
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                widget.ticket.title,
                style: const TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF1D1B3A),
                ),
              ),
              const SizedBox(height: 4),
              Text(
                "Aberto em: "
                "${widget.ticket.createdAt.day.toString().padLeft(2, '0')}/"
                "${widget.ticket.createdAt.month.toString().padLeft(2, '0')}/"
                "${widget.ticket.createdAt.year}",
                style: TextStyle(color: Colors.grey.shade600),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildInfoSection(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label.toUpperCase(),
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.bold,
              color: Colors.grey.shade500,
              letterSpacing: 1.1,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: const TextStyle(
              fontSize: 16,
              color: Color(0xFF1D1B3A),
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusPicker(Color color) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          "ATUALIZAR STATUS",
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.bold,
            color: Color(0xFF1D1B3A),
            letterSpacing: 1.1,
          ),
        ),
        const SizedBox(height: 12),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          decoration: BoxDecoration(
            color: Colors.grey.shade50,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.grey.shade200),
          ),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              value: _currentStatus,
              isExpanded: true,
              icon: _isUpdating
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2))
                  : Icon(Icons.keyboard_arrow_down, color: color),
              items: _statusOptions.map((status) {
                final c = _statusColor(status);
                return DropdownMenuItem<String>(
                  value: status,
                  child: Text(
                    _statusLabels[status] ?? status,
                    style: TextStyle(color: c, fontWeight: FontWeight.bold),
                  ),
                );
              }).toList(),
              onChanged: _isUpdating ? null : _updateStatus,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildStatusReadOnly(Color color) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          "STATUS ATUAL",
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.bold,
            color: Colors.grey,
            letterSpacing: 1.1,
          ),
        ),
        const SizedBox(height: 12),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: color.withValues(alpha: 0.5)),
          ),
          child: Text(
            _statusLabels[_currentStatus] ?? _currentStatus,
            textAlign: TextAlign.center,
            style: TextStyle(
                color: color, fontWeight: FontWeight.bold, fontSize: 16),
          ),
        ),
      ],
    );
  }
}
