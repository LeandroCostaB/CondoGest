import 'package:flutter/material.dart';
import '../../domain/entities/ticket.dart';
import '../../domain/repositories/ticket_repository.dart';
import 'package:condogest/features/property_manager/domain/repositories/property_repository.dart';
import 'package:condogest/features/property_manager/domain/entities/propertys_entity.dart';
import '../widgets/ticket_card_widget.dart';
import '../widgets/ticket_summary_chip.dart';
import 'ticket_form_screen.dart';
import 'ticket_detail_screen.dart';

class TicketListScreen extends StatefulWidget {
  final TicketRepository repository;
  final PropertyRepository propertyRepository;
  final String userType;
  final int? residentId;

  const TicketListScreen({
    super.key,
    required this.repository,
    required this.propertyRepository,
    required this.userType,
    this.residentId,
  });

  @override
  State<TicketListScreen> createState() => _TicketListScreenState();
}

class _TicketListScreenState extends State<TicketListScreen> {
  bool _isLoading = true;
  List<Ticket> _tickets = [];
  List<Property> _properties = [];
  int? _selectedPropertyId;

  final Color _primaryColor = const Color(0xFF1D1B3A);

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      final bool isSyndic = widget.userType == 'syndic';
      int? effectivePropertyId = _selectedPropertyId;

      if (isSyndic) {
        // 1. Fetch properties for Syndic to populate the filter
        final properties = await widget.propertyRepository.getProperties();
        if (mounted) {
          if (properties.isNotEmpty && effectivePropertyId == null) {
            effectivePropertyId = properties.first.id;
          }
          setState(() {
            _properties = properties;
            _selectedPropertyId = effectivePropertyId;
          });
        }
      }

      // 2. Enforce Business Logic:
      // Syndic: filter ONLY by propertyId. 
      // Resident: filter ONLY by residentId.
      final tickets = await widget.repository.getAllTickets(
        propertyId: isSyndic ? effectivePropertyId : null,
        residentId: isSyndic ? null : (widget.residentId ?? 1),
      );

      if (mounted) {
        setState(() {
          _tickets = tickets;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erro ao carregar dados: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  int _getCountByStatus(String status) {
    return _tickets
        .where((t) => t.status?.toLowerCase() == status.toLowerCase())
        .length;
  }

  @override
  Widget build(BuildContext context) {
    final bool isSyndic = widget.userType == 'syndic';
    final bool isResident = widget.userType == 'resident';

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: _primaryColor,
        title: const Text(
          "TICKETS",
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: Column(
        children: [
          if (isSyndic) _buildCondoHeader(),
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              children: [
                TicketSummaryChip(
                  label: "Pendentes",
                  count: _getCountByStatus("Pendente"),
                  color: Colors.red.shade700,
                ),
                TicketSummaryChip(
                  label: "Andamento",
                  count: _getCountByStatus("Em Andamento"),
                  color: Colors.orange.shade700,
                ),
                TicketSummaryChip(
                  label: "Finalizados",
                  count: _getCountByStatus("Finalizado"),
                  color: Colors.green.shade700,
                ),
              ],
            ),
          ),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _tickets.isEmpty
                ? _buildEmptyState()
                : _buildTicketList(),
          ),
        ],
      ),
      floatingActionButton: isResident 
        ? FloatingActionButton(
            onPressed: () async {
              // Await the form result and refresh data upon return
              await Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) =>
                      TicketFormScreen(repository: widget.repository),
                ),
              );
              _loadData();
            },
            backgroundColor: Colors.green.shade700,
            child: const Icon(Icons.add, color: Colors.white, size: 32),
          )
        : null,
    );
  }

  Widget _buildCondoHeader() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.grey.shade50,
        border: Border(bottom: BorderSide(color: Colors.grey.shade200)),
      ),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: Colors.grey.shade300),
        ),
        child: DropdownButtonHideUnderline(
          child: DropdownButton<int>(
            value: _selectedPropertyId,
            isExpanded: true,
            hint: const Text("Selecione um Condomínio"),
            icon: Icon(Icons.keyboard_arrow_down, color: _primaryColor),
            items: _properties
                .map(
                  (p) =>
                      DropdownMenuItem<int>(value: p.id, child: Text(p.name)),
                )
                .toList(),
            onChanged: (val) {
              if (val != null) {
                setState(() => _selectedPropertyId = val);
                _loadData(); // Trigger refresh on property change
              }
            },
            style: TextStyle(
              color: _primaryColor,
              fontWeight: FontWeight.bold,
              fontSize: 16,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.assignment_outlined,
            size: 64,
            color: Colors.grey.shade300,
          ),
          const SizedBox(height: 16),
          Text(
            "Nenhum ticket encontrado",
            style: TextStyle(color: Colors.grey.shade500, fontSize: 16),
          ),
        ],
      ),
    );
  }

  Widget _buildTicketList() {
    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      itemCount: _tickets.length,
      itemBuilder: (context, index) {
        return TicketCardWidget(
          ticket: _tickets[index],
          onTap: () async {
            await Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => TicketDetailScreen(
                  ticket: _tickets[index],
                  userType: widget.userType,
                  repository: widget.repository,
                ),
              ),
            );
            _loadData(); // Refresh list when returning from details
          },
        );
      },
    );
  }
}
