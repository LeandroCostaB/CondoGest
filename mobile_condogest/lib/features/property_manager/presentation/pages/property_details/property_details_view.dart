import 'package:flutter/material.dart';

import '../../../data/datasources/apartment_service.dart';
import '../../../domain/entities/propertys_entity.dart';
import '../../../domain/entities/unit_entity.dart';
import '../../../../../features/auth/data/datasources/user_api_service.dart';

class PropertyDetailsView extends StatefulWidget {
  final Property property;

  const PropertyDetailsView({super.key, required this.property});

  @override
  State<PropertyDetailsView> createState() => _PropertyDetailsViewState();
}

class _PropertyDetailsViewState extends State<PropertyDetailsView> {
  final ApartmentService _apartmentService = ApartmentService();
  final UserApiService _userApiService = UserApiService();

  List<Unit> _apartments = [];
  bool _loading = true;
  String? _error;

  static const _primaryColor = Color.fromRGBO(29, 27, 58, 1);

  @override
  void initState() {
    super.initState();
    _loadApartments();
  }

  Future<void> _loadApartments() async {
    if (widget.property.id == null) {
      setState(() => _loading = false);
      return;
    }
    try {
      final result = await _apartmentService.getByCondominium(widget.property.id!);
      setState(() {
        _apartments = result;
        _loading = false;
        _error = null;
      });
    } catch (e) {
      setState(() {
        _error = 'Erro ao carregar apartamentos';
        _loading = false;
      });
    }
  }

  Map<int, List<Unit>> _groupByFloor(List<Unit> apartments) {
    final map = <int, List<Unit>>{};
    for (final apt in apartments) {
      map.putIfAbsent(apt.floor, () => []).add(apt);
    }
    return Map.fromEntries(
      map.entries.toList()..sort((a, b) => a.key.compareTo(b.key)),
    );
  }

  Future<void> _showAddApartmentSheet() async {
    final numberCtrl = TextEditingController();
    final floorCtrl = TextEditingController();
    final blockCtrl = TextEditingController();
    final formKey = GlobalKey<FormState>();
    bool saving = false;

    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setSheetState) => Padding(
          padding: EdgeInsets.only(
            left: 24, right: 24, top: 24,
            bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
          ),
          child: Form(
            key: formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Novo Apartamento',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: _primaryColor),
                ),
                const SizedBox(height: 20),
                Row(
                  children: [
                    Expanded(
                      flex: 2,
                      child: TextFormField(
                        controller: numberCtrl,
                        decoration: const InputDecoration(
                          labelText: 'Número *',
                          border: OutlineInputBorder(),
                        ),
                        validator: (v) =>
                            (v == null || v.trim().isEmpty) ? 'Obrigatório' : null,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: TextFormField(
                        controller: floorCtrl,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(
                          labelText: 'Andar',
                          border: OutlineInputBorder(),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: TextFormField(
                        controller: blockCtrl,
                        decoration: const InputDecoration(
                          labelText: 'Bloco',
                          border: OutlineInputBorder(),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: saving
                        ? null
                        : () async {
                            if (!formKey.currentState!.validate()) return;
                            setSheetState(() => saving = true);
                            try {
                              await _apartmentService.create(
                                widget.property.id!,
                                Unit(
                                  id: '',
                                  number: int.tryParse(numberCtrl.text.trim()) ?? 0,
                                  floor: int.tryParse(floorCtrl.text.trim()) ?? 0,
                                  block: blockCtrl.text.trim().isEmpty
                                      ? null
                                      : blockCtrl.text.trim(),
                                ),
                              );
                              if (ctx.mounted) Navigator.pop(ctx);
                              await _loadApartments();
                            } catch (e) {
                              setSheetState(() => saving = false);
                              if (ctx.mounted) {
                                ScaffoldMessenger.of(ctx).showSnackBar(
                                  SnackBar(
                                    content: Text('Erro ao criar apartamento: $e'),
                                    backgroundColor: Colors.red,
                                  ),
                                );
                              }
                            }
                          },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.green[800],
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                    child: saving
                        ? const SizedBox(
                            height: 20, width: 20,
                            child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                          )
                        : const Text('ADICIONAR'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _confirmDelete(Unit unit) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Excluir Apartamento'),
        content: Text(
          'Deseja excluir o apartamento ${unit.number}'
          '${unit.block != null ? " - Bloco ${unit.block}" : ""}?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancelar'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              foregroundColor: Colors.white,
            ),
            child: const Text('Excluir'),
          ),
        ],
      ),
    );

    if (confirmed == true && mounted) {
      try {
        await _apartmentService.delete(widget.property.id!, unit.id);
        await _loadApartments();
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Erro ao excluir: $e'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    }
  }

  Future<void> _showAssignResidentSheet(Unit unit) async {
    List<SimpleUser>? residents;
    String? selectedUserId = unit.userId;
    bool loading = true;
    bool saving = false;

    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setSheetState) {
          if (loading) {
            _userApiService.listResidents().then((list) {
              setSheetState(() {
                residents = list;
                loading = false;
              });
            }).catchError((_) {
              setSheetState(() {
                residents = [];
                loading = false;
              });
            });
          }

          return Padding(
            padding: EdgeInsets.only(
              left: 24, right: 24, top: 24,
              bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Apto ${unit.number}${unit.block != null ? " - Bloco ${unit.block}" : ""} — Atribuir Morador',
                  style: const TextStyle(
                    fontSize: 16, fontWeight: FontWeight.bold, color: _primaryColor,
                  ),
                ),
                const SizedBox(height: 20),
                if (loading)
                  const Center(child: CircularProgressIndicator())
                else if (residents == null || residents!.isEmpty)
                  const Text('Nenhum morador disponível.')
                else
                  DropdownButtonFormField<String>(
                    value: residents!.any((r) => r.id == selectedUserId)
                        ? selectedUserId
                        : null,
                    decoration: const InputDecoration(
                      labelText: 'Morador',
                      border: OutlineInputBorder(),
                    ),
                    hint: const Text('Nenhum (remover vínculo)'),
                    items: [
                      const DropdownMenuItem<String>(
                        value: null,
                        child: Text('— Nenhum (remover vínculo) —'),
                      ),
                      ...residents!.map(
                        (r) => DropdownMenuItem<String>(
                          value: r.id,
                          child: Text(r.name),
                        ),
                      ),
                    ],
                    onChanged: (val) => setSheetState(() => selectedUserId = val),
                  ),
                const SizedBox(height: 24),
                if (!loading)
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: saving
                          ? null
                          : () async {
                              setSheetState(() => saving = true);
                              try {
                                await _apartmentService.assignResident(
                                  widget.property.id!,
                                  unit.id,
                                  selectedUserId,
                                );
                                if (ctx.mounted) Navigator.pop(ctx);
                                await _loadApartments();
                              } catch (e) {
                                setSheetState(() => saving = false);
                                if (ctx.mounted) {
                                  ScaffoldMessenger.of(ctx).showSnackBar(
                                    SnackBar(
                                      content: Text('Erro ao atribuir morador: $e'),
                                      backgroundColor: Colors.red,
                                    ),
                                  );
                                }
                              }
                            },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: _primaryColor,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                      child: saving
                          ? const SizedBox(
                              height: 20, width: 20,
                              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                            )
                          : const Text('SALVAR'),
                    ),
                  ),
              ],
            ),
          );
        },
      ),
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
        backgroundColor: _primaryColor,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      floatingActionButton: widget.property.id != null
          ? FloatingActionButton(
              onPressed: _showAddApartmentSheet,
              backgroundColor: Colors.green[800],
              child: const Icon(Icons.add, color: Colors.white),
            )
          : null,
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
              fontSize: 20, fontWeight: FontWeight.bold, color: _primaryColor,
            ),
          ),
          if (p.street.isNotEmpty) ...[
            const SizedBox(height: 4),
            Row(
              children: [
                const Icon(Icons.location_on, size: 16, color: Colors.grey),
                const SizedBox(width: 4),
                Expanded(
                  child: Text(p.street, style: TextStyle(color: Colors.grey.shade700)),
                ),
              ],
            ),
          ],
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: p.isActive ? Colors.green.shade100 : Colors.red.shade100,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              p.isActive ? 'Ativo' : 'Inativo',
              style: TextStyle(
                color: p.isActive ? Colors.green.shade800 : Colors.red.shade800,
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
    if (_loading) return const Center(child: CircularProgressIndicator());

    if (_error != null) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(_error!, style: const TextStyle(color: Colors.red)),
            const SizedBox(height: 8),
            ElevatedButton(onPressed: _loadApartments, child: const Text('Tentar novamente')),
          ],
        ),
      );
    }

    if (_apartments.isEmpty) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.apartment_outlined, size: 56, color: Colors.grey.shade300),
            const SizedBox(height: 12),
            Text(
              'Nenhum apartamento cadastrado.\nUse o botão + para adicionar.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey.shade500),
            ),
          ],
        ),
      );
    }

    final grouped = _groupByFloor(_apartments);

    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 80),
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
                      fontSize: 16, fontWeight: FontWeight.bold, color: _primaryColor,
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
                children: units.map((unit) => _buildUnitCard(unit)).toList(),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildUnitCard(Unit unit) {
    final hasResident = unit.userId != null;

    return Container(
      width: 120,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: hasResident ? Colors.green.shade50 : Colors.grey.shade100,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(
          color: hasResident ? Colors.green.shade300 : Colors.grey.shade300,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  'Apto ${unit.number}${unit.block != null ? "\n${unit.block}" : ""}',
                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Icon(
            hasResident ? Icons.person : Icons.person_outline,
            size: 14,
            color: hasResident ? Colors.green.shade700 : Colors.grey,
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              InkWell(
                onTap: () => _showAssignResidentSheet(unit),
                borderRadius: BorderRadius.circular(4),
                child: Icon(
                  Icons.person_add_outlined,
                  size: 18,
                  color: _primaryColor,
                ),
              ),
              const SizedBox(width: 8),
              InkWell(
                onTap: () => _confirmDelete(unit),
                borderRadius: BorderRadius.circular(4),
                child: Icon(Icons.delete_outline, size: 18, color: Colors.red.shade600),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
