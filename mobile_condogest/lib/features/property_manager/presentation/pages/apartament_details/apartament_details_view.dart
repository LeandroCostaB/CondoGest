import 'package:condogest/features/property_manager/domain/entities/propertys_entity.dart';
import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:provider/provider.dart'; // 1. IMPORTANTE: Adicione o import do Provider

// Ajuste estes imports de acordo com as pastas do seu projeto
import '../../../data/models/property_model.dart';
import '../../../../property_maintenance/presentation/pages/maintenance_list_view.dart';
import '../../../../property_maintenance/presentation/viewmodels/maintenance_viewmodel.dart'; // 2. Import do ViewModel
import '../../../../property_maintenance/data/datasources/maintenance_service.dart';

class ApartamentDetailsView extends StatelessWidget {
  final String unitNumber;
  final Property property;

  const ApartamentDetailsView({
    super.key,
    required this.unitNumber,
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

            // 1. Nome do apartamento centralizado
            Text(
              'Apartamento $unitNumber',
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 26,
                fontWeight: FontWeight.bold,
                color: Color.fromRGBO(29, 27, 58, 1),
              ),
            ),

            const SizedBox(height: 48),

            // 2. Botão "Manutenções"
            ElevatedButton.icon(
              onPressed: () {
                // Navegação limpa: o Flutter vai usar automaticamente o Provider do main.dart
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) =>
                        MaintenanceListView(property: property),
                  ),
                );
              },
              icon: const Icon(Icons.settings), // Símbolo de engrenagem
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

            // 3. Botão "Tickets"
            ElevatedButton.icon(
              onPressed: () {
                // TODO: Adicionar navegação para a tela de Tickets
              },
              icon: const Icon(Icons.confirmation_number), // Símbolo de ticket
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
