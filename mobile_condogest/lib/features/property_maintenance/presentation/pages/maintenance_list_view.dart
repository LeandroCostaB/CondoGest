import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../presentation/viewmodels/maintenance_viewmodel.dart';
import '../../../property_maintenance/presentation/pages/maintenance_form_view.dart';
import '../../presentation/viewmodels/maintenance_viewmodel.dart';
import '../../../property_manager/domain/entities/propertys_entity.dart';

class MaintenanceListView extends StatefulWidget {
  final Property property;

  const MaintenanceListView({super.key, required this.property});

  @override
  State<MaintenanceListView> createState() => _MaintenanceListViewState();
}

class _MaintenanceListViewState extends State<MaintenanceListView> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      context.read<MaintenanceViewModel>().fetchAll();
    });
  }

  @override
  Widget build(BuildContext context) {
    final vm = context.watch<MaintenanceViewModel>();

    return Scaffold(
      appBar: AppBar(
        title: Text(
          widget.property.name,
          style: TextStyle(color: Colors.white),
        ),
        backgroundColor: const Color.fromRGBO(29, 27, 58, 1),
        iconTheme: const IconThemeData(color: Colors.white),
        automaticallyImplyLeading: true,
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const SizedBox(height: 24),
          const Center(
            child: Text(
              'Gerenciar Manutenções',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
                color: Color.fromRGBO(29, 27, 58, 1),
              ),
            ),
          ),
          const SizedBox(height: 16),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            child: TextField(
              decoration: InputDecoration(
                hintText: 'Buscar propriedade...',
                hintStyle: TextStyle(color: Colors.grey.shade600),
                filled: true,
                fillColor: Colors.grey.shade200,
                contentPadding: const EdgeInsets.symmetric(vertical: 0),
                prefixIcon: const Icon(Icons.search),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12.0),
                  borderSide: BorderSide.none,
                ),
              ),
              onChanged: vm.search,
            ),
          ),

          if (vm.isSearching) const LinearProgressIndicator(),

          if (vm.searchError.isNotEmpty)
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Text(
                vm.searchError,
                style: const TextStyle(color: Colors.red),
                textAlign: TextAlign.center,
              ),
            ),

          Expanded(child: _buildList(vm)),
        ],
      ),
      // Botão + que leva pra maintenance_form_view
      floatingActionButton: FloatingActionButton(
        backgroundColor: Colors.green,
        foregroundColor: Colors.white,
        shape: const CircleBorder(),
        onPressed: () async {
          await Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => MaintenanceFormView()),
          );
          if (context.mounted) {
            context.read<MaintenanceViewModel>().fetchAll();
          }
        },
        child: const Icon(Icons.add),
      ),
    );
  }

  Widget _buildList(MaintenanceViewModel vm) {
    // Verifica se está carregando primeiro para evitar mostrar lista vazia durante o loading
    if (vm.state == ViewState.loading && !vm.isSearching) {
      return const Center(child: CircularProgressIndicator());
    }

    final list = vm.searchResults.isNotEmpty
        ? vm.searchResults
        : vm.maintenance;

    if (list.isEmpty) {
      return const Center(child: Text('Nenhuma manutenção encontrada'));
    }

    return ListView.builder(
      itemCount: list.length,
      itemBuilder: (context, index) {
        final item = list[index];

        // CORREÇÃO: Retornando o Widget que representa o item da lista
        return Card(
          margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          elevation: 2,
          child: ListTile(
            leading: const CircleAvatar(
              backgroundColor: Color.fromRGBO(29, 27, 58, 1),
              child: Icon(Icons.build, color: Colors.white),
            ),
            title: Text(
              'Tipo: ${item.type}',
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
            subtitle: Text(
              'Unidade: ${item.unitId}\nPrioridade: ${item.priority}',
            ),
            isThreeLine: true,
            onTap: () async {
              await Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => MaintenanceFormView(maintenance: item),
                ),
              );
              if (context.mounted) {
                context.read<MaintenanceViewModel>().fetchAll();
              }
            },
          ),
        );
      },
    );
  }
}
