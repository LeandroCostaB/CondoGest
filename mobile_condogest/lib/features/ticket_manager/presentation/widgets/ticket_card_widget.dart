import 'package:flutter/material.dart';
import '../../domain/entities/ticket.dart';

class TicketCardWidget extends StatelessWidget {
  final Ticket ticket;
  final VoidCallback onTap;

  const TicketCardWidget({
    super.key,
    required this.ticket,
    required this.onTap,
  });

  Color _getStatusColor(String? status) {
    switch (status?.toLowerCase()) {
      case 'pendente':
        return Colors.red.shade700;
      case 'em andamento':
        return Colors.orange.shade700;
      case 'finalizado':
        return Colors.green.shade700;
      default:
        return const Color(0xFF1D1B3A);
    }
  }

  @override
  Widget build(BuildContext context) {
    final statusColor = _getStatusColor(ticket.status);
    final String dateStr = "${ticket.createdAt.day.toString().padLeft(2, '0')}/"
        "${ticket.createdAt.month.toString().padLeft(2, '0')}/"
        "${ticket.createdAt.year}";

    return Card(
      elevation: 0,
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: Colors.grey.shade200),
      ),
      child: ListTile(
        onTap: onTap,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        leading: Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            color: statusColor.withOpacity(0.1),
            shape: BoxShape.circle,
            border: Border.all(color: statusColor, width: 2),
          ),
          child: Center(
            child: Text(
              '${ticket.aptNumber ?? '--'}',
              style: TextStyle(
                color: statusColor,
                fontWeight: FontWeight.bold,
                fontSize: 14,
              ),
            ),
          ),
        ),
        title: Text(
          "${ticket.title} - ${ticket.type ?? 'Geral'}",
          style: const TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 15,
            color: Color(0xFF1D1B3A),
          ),
        ),
        subtitle: Padding(
          padding: const EdgeInsets.only(top: 4),
          child: Text(
            dateStr,
            style: TextStyle(color: Colors.grey.shade600, fontSize: 13),
          ),
        ),
        trailing: Icon(
          Icons.chevron_right,
          color: Colors.grey.shade400,
        ),
      ),
    );
  }
}
