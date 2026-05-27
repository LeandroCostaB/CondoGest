import 'package:condogest/features/property_manager/presentation/pages/property_details/property_details_view.dart';
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
              'Gerenciar Propriedades',
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
                hintText: 'Buscar por nome, cidade...',
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

          if (vm.searchError.isNotEmpty) Text(vm.searchError),

          Expanded(child: _buildList(vm)),
        ],
      ),
    );
  }

  Widget _buildList(PropertyViewModel vm) {
    final list = vm.isFiltering ? vm.searchResults : vm.propertys;

    if (vm.state == ViewState.loading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (list.isEmpty) {
      return const Center(child: Text('Nenhuma propriedade encontrada'));
    }

    return ListView.builder(
      itemCount: list.length,
      itemBuilder: (context, index) {
        final property = list[index];

        return ListTile(
          title: Text(property.name),
          subtitle: Text(
            property.street.isNotEmpty ? property.street : 'Sem endereço',
          ),
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => PropertyDetailsView(property: property),
              ),
            );
          },
        );
      },
    );
  }
}
