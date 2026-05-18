import 'package:condogest/features/property_manager/domain/entities/propertys_entity.dart';
import 'package:flutter/material.dart';
import 'dart:convert';

import '../../../data/models/property_model.dart';
import '../apartament_details/apartament_details_view.dart';

class PropertyDetailsView extends StatelessWidget {
  final Property property;

  const PropertyDetailsView({super.key, required this.property});

  @override
  Widget build(BuildContext context) {
    String jsonString = "";
    try {
      final encoder = const JsonEncoder.withIndent('  ');
      jsonString = encoder.convert((property as PropertyModel).toJson());
    } catch (e) {
      jsonString = "Erro ao converter para JSON:\n$e";
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Detalhes: ${property.name}',
          style: const TextStyle(color: Colors.white),
        ),
        backgroundColor: const Color.fromRGBO(29, 27, 58, 1),
        iconTheme: const IconThemeData(color: Colors.white),
        automaticallyImplyLeading: true,
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16.0),
        itemCount: property.floors.length,
        itemBuilder: (context, floorIndex) {
          final floor = property.floors[floorIndex];
          return Padding(
            padding: const EdgeInsets.only(bottom: 24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      '${floor.number}° Andar',
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Color.fromRGBO(29, 27, 58, 1),
                      ),
                    ),
                    const SizedBox(width: 8),
                    const Expanded(
                      child: Divider(color: Colors.grey, thickness: 1),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                Wrap(
                  spacing: 12.0,
                  runSpacing: 12.0,
                  children: floor.units.map((unit) {
                    // Alterado para 3 casas para bater com seu exemplo "001"
                    final aptNumber = unit.number.toString().padLeft(3, '0');

                    // Substituímos o Container por Material + InkWell para ficar clicável
                    return Material(
                      color: Colors.transparent,
                      child: InkWell(
                        borderRadius: BorderRadius.circular(8),
                        onTap: () {
                          // Navegação para a nova tela de detalhes do apartamento
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => ApartamentDetailsView(
                                unitNumber: aptNumber,
                                property: property,
                              ),
                            ),
                          );
                        },
                        child: Ink(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 12,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.grey.shade200,
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: Colors.grey.shade300),
                          ),
                          child: Text(
                            'Apto $aptNumber',
                            style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
