import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../viewmodels/property_viewmodel.dart';

class PropertyListView extends StatefulWidget {
  const PropertyListView({super.key});

  @override
  State<PropertyListView> createState() => _PropertyListViewState();
}

class _PropertyListViewState extends State<PropertyListView> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      context.read<PropertyViewModel>().fetchAll();
    });
  }

  @override
  Widget build(BuildContext context) {
    final vm = context.watch<PropertyViewModel>();

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Propriedades',
          style: TextStyle(color: Colors.white),
          ),
          backgroundColor: Color.fromRGBO(29, 27, 58, 1),
          iconTheme: const IconThemeData(color: Colors.white),
          automaticallyImplyLeading: true,
        ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(8),
            child: TextField(
              decoration: const InputDecoration(
                hintText: 'Buscar propriedade...',
                prefixIcon: Icon(Icons.search),
                border: OutlineInputBorder(),
              ),
              onChanged: vm.search,
            ),
          ),

          if (vm.isSearching) const LinearProgressIndicator(),

          if (vm.searchError.isNotEmpty) Text(vm.searchError),

          Expanded(child: _buildList(vm)),
        ],
      ),
    );
  }

  Widget _buildList(PropertyViewModel vm) {
    final list = vm.searchResults.isNotEmpty ? vm.searchResults : vm.propertys;

    if (vm.state == ViewState.loading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (list.isEmpty) {
      return const Center(child: Text('Nenhuma propriedade encontrada'));
    }

    return ListView.builder(
      itemCount: list.length,
      itemBuilder: (_, index) {
        final property = list[index];

        return ListTile(
          title: Text(property.name),
          subtitle: Text('${property.city} - ${property.state}'),
          onTap: () {
            // navegar para detail
          },
        );
      },
    );
  }
}
