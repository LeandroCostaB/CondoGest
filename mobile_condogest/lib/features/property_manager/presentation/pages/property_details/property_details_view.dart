import 'package:condogest/features/property_manager/domain/entities/propertys_entity.dart';
import 'package:flutter/material.dart';
import 'dart:convert';

import '../../../data/models/property_model.dart';
import '../apartament_details/apartament_details_view.dart';

class PropertyDetailsView extends StatelessWidget {
  final Property property;

  const PropertyDetailsView({super.key, required this.property});

  final Color primaryColor = const Color.fromRGBO(29, 27, 58, 1);

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
      backgroundColor: Colors.grey.shade50, 
      appBar: AppBar(
        title: const Text(
          'Detalhes da Propriedade',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
        ),
        backgroundColor: primaryColor,
        iconTheme: const IconThemeData(color: Colors.white),
        automaticallyImplyLeading: true,
        centerTitle: true,
        elevation: 0,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16.0),
        children: [
          _buildCustomExpansionTile(
            title: property.name,
            icon: Icons.business,
            initiallyExpanded: false,
            children: [
              const Padding(
                padding: EdgeInsets.all(16.0),
                child: Text(
                  "Conteúdo da propriedade em breve...",
                  style: TextStyle(color: Colors.grey),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          _buildCustomExpansionTile(
            title: 'Manutenções Pendentes',
            icon: Icons.build_circle_outlined,
            initiallyExpanded: true,
            children: [
              const Padding(
                padding: EdgeInsets.all(16.0),
                child: Text(
                  "Nenhuma manutenção pendente no momento.",
                  style: TextStyle(color: Colors.grey),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          _buildCustomExpansionTile(
            title: 'Financeiro - Despesas',
            icon: Icons.account_balance_wallet_outlined,
            initiallyExpanded: true,
            children: [
              const Padding(
                padding: EdgeInsets.all(16.0),
                child: Text(
                  "Dados financeiros em breve...",
                  style: TextStyle(color: Colors.grey),
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          const Padding(
            padding: EdgeInsets.only(bottom: 16.0, left: 4.0),
            child: Text(
              'Unidades',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600, 
                color: Color.fromRGBO(29, 27, 58, 1),
                letterSpacing: 0.5,
              ),
            ),
          ),

          ...property.floors.map((floor) {
            return Padding(
              padding: const EdgeInsets.only(bottom: 20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 4,
                        height: 16,
                        decoration: BoxDecoration(
                          color: const Color.fromRGBO(29, 27, 58, 0.2), 
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        '${floor.number}° Andar',
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                          color: Colors.black87,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16), 

                  Wrap(
                    spacing: 12.0, 
                    runSpacing: 12.0,
                    children: floor.units.map((unit) {
                      final aptNumber = unit.number.toString().padLeft(3, '0');

                      return Material(
                        color: Colors.transparent,
                        child: InkWell(
                          borderRadius: BorderRadius.circular(12),
                          onTap: () {
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
                            width: (MediaQuery.of(context).size.width - 32 - 24) / 3, 
                            padding: const EdgeInsets.symmetric(vertical: 16), 
                            decoration: BoxDecoration(
                              color: Colors.white, 
                              borderRadius: BorderRadius.circular(12),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withOpacity(0.04),
                                  blurRadius: 6,
                                  offset: const Offset(0, 2),
                                ),
                              ],
                              border: Border.all(color: Colors.grey.shade100),
                            ),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const Text(
                                  'APTO',
                                  style: TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.w500,
                                    color: Colors.grey,
                                    letterSpacing: 1.0,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  aptNumber,
                                  style: const TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                    color: Color.fromRGBO(29, 27, 58, 1), 
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }

  //Widget padrao ux/ui
  Widget _buildCustomExpansionTile({
    required String title,
    required IconData icon,
    required bool initiallyExpanded,
    required List<Widget> children,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade200),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.02),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Theme(
        // Remove as linhas divisórias padrões do ExpansionTile
        data: ThemeData().copyWith(dividerColor: Colors.transparent),
        child: ExpansionTile(
          initiallyExpanded: initiallyExpanded,
          iconColor: primaryColor,
          collapsedIconColor: Colors.grey.shade600,
          leading: Icon(icon, color: primaryColor),
          title: Center(
            child: Text(
              title,
              style: TextStyle(
                fontWeight: FontWeight.w600,
                fontSize: 16,
                color: primaryColor,
              ),
            ),
          ),
          children: children,
        ),
      ),
    );
  }
}

