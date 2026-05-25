import 'package:condogest/features/property_manager/domain/entities/propertys_entity.dart';
import 'package:condogest/features/property_manager/domain/entities/unit_entity.dart';
import 'package:flutter/material.dart';

import '../../../data/datasources/apartment_service.dart';

class PropertyDetailsView extends StatefulWidget {
  final Property property;

  const PropertyDetailsView({super.key, required this.property});

  @override
  State<PropertyDetailsView> createState() => _PropertyDetailsViewState();
}

class _PropertyDetailsViewState extends State<PropertyDetailsView> {
  final ApartmentService _apartmentService = ApartmentService();

  List<Unit> _apartments = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadApartments();
  }

  Future<void> _loadApartments() async {
    if (widget.property.id == null) {
      setState(() { _loading = false; });
      return;
    }
    try {
      final result =
          await _apartmentService.getByCondominium(widget.property.id!);
      setState(() {
        _apartments = result;
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _error = 'Erro ao carregar apartamentos';
        _loading = false;
      });
    }
  }

  // Agrupa apartamentos por andar; sem andar definido vai para o grupo 0.
  Map<int, List<Unit>> _groupByFloor(List<Unit> apartments) {
    final map = <int, List<Unit>>{};
    for (final apt in apartments) {
      map.putIfAbsent(apt.floor, () => []).add(apt);
    }
    return Map.fromEntries(
      map.entries.toList()..sort((a, b) => a.key.compareTo(b.key)),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Detalhes: ${widget.property.name}',
          style: const TextStyle(color: Colors.white),
        ),
        backgroundColor: const Color.fromRGBO(29, 27, 58, 1),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildHeader(),
          const Divider(height: 1),
          Expanded(child: _buildApartmentsSection()),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    final p = widget.property;
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            p.name,
            style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: Color.fromRGBO(29, 27, 58, 1),
            ),
          ),
          if (p.street.isNotEmpty) ...[
            const SizedBox(height: 4),
            Row(
              children: [
                const Icon(Icons.location_on, size: 16, color: Colors.grey),
                const SizedBox(width: 4),
                Expanded(
                  child: Text(
                    p.street,
                    style: TextStyle(color: Colors.grey.shade700),
                  ),
                ),
              ],
            ),
          ],
          const SizedBox(height: 8),
          Container(
            padding:
                const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: p.isActive ? Colors.green.shade100 : Colors.red.shade100,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              p.isActive ? 'Ativo' : 'Inativo',
              style: TextStyle(
                color:
                    p.isActive ? Colors.green.shade800 : Colors.red.shade800,
                fontWeight: FontWeight.w600,
                fontSize: 12,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildApartmentsSection() {
    if (_loading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_error != null) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(_error!, style: const TextStyle(color: Colors.red)),
            const SizedBox(height: 8),
            ElevatedButton(
              onPressed: _loadApartments,
              child: const Text('Tentar novamente'),
            ),
          ],
        ),
      );
    }

    if (_apartments.isEmpty) {
      return const Center(
        child: Text('Nenhum apartamento cadastrado neste condomínio.'),
      );
    }

    final grouped = _groupByFloor(_apartments);

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: grouped.length,
      itemBuilder: (context, index) {
        final floor = grouped.keys.elementAt(index);
        final units = grouped[floor]!;
        final floorLabel = floor == 0 ? 'Térreo' : '$floor° Andar';

        return Padding(
          padding: const EdgeInsets.only(bottom: 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Text(
                    floorLabel,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Color.fromRGBO(29, 27, 58, 1),
                    ),
                  ),
                  const SizedBox(width: 8),
                  const Expanded(child: Divider(color: Colors.grey)),
                ],
              ),
              const SizedBox(height: 12),
              Wrap(
                spacing: 12,
                runSpacing: 12,
                children: units.map((unit) {
                  return Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 16, vertical: 12),
                    decoration: BoxDecoration(
                      color: Colors.grey.shade200,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: Colors.grey.shade300),
                    ),
                    child: Text(
                      'Apto ${unit.number}',
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  );
                }).toList(),
              ),
            ],
          ),
        );
      },
    );
  }
}
