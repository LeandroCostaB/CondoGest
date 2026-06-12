import 'package:condogest/features/property_manager/domain/entities/propertys_entity.dart';
import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:provider/provider.dart';

import 'package:condogest/features/property_manager/data/models/property_model.dart';
import 'package:condogest/features/property_maintenance/presentation/pages/maintenance_list_view.dart';
import 'package:condogest/features/property_maintenance/presentation/viewmodels/maintenance_viewmodel.dart';
import 'package:condogest/features/ticket_manager/domain/repositories/ticket_repository.dart';
import 'package:condogest/features/property_maintenance/data/datasources/maintenance_service.dart';

class ApartamentDetailsView extends StatelessWidget {
  final int unitId;
  final Property property;

  const ApartamentDetailsView({
    super.key,
    required this.unitId,
    required this.property,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Detalhes do Apartamento',
          style: TextStyle(color: Colors.white),
        ),
        backgroundColor: const Color.fromRGBO(29, 27, 58, 1),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const SizedBox(height: 24),

            Text(
              'Apartamento $unitId',
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 26,
                fontWeight: FontWeight.bold,
                color: Color.fromRGBO(29, 27, 58, 1),
              ),
            ),

            const SizedBox(height: 48),

            ElevatedButton.icon(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => MaintenanceListView(
                      property: property,
                      unitId: unitId,
                      ticketRepository: context.read<TicketRepository>(),
                    ),
                  ),
                );
              },
              icon: const Icon(Icons.settings),
              label: const Text('Manutenções', style: TextStyle(fontSize: 16)),
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
                backgroundColor: const Color.fromRGBO(29, 27, 58, 1),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),

            const SizedBox(height: 16),

            ElevatedButton.icon(
              onPressed: () {},
              icon: const Icon(Icons.confirmation_number),
              label: const Text('Tickets', style: TextStyle(fontSize: 16)),
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
                backgroundColor: const Color.fromRGBO(29, 27, 58, 1),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
