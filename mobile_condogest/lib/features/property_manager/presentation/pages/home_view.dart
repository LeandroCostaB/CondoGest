import 'package:flutter/material.dart';
import '../pages/property_list/property_list_view.dart';
import '../pages/property_form/property_form_view.dart';

class HomeView extends StatefulWidget {
  const HomeView({super.key});

  @override
  State<HomeView> createState() => _HomeViewState();
}

class _HomeViewState extends State<HomeView> {
  int _index = 0;

  final List<Widget> _pages = [PropertyListView(), PropertyFormView()];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: PropertyListView(),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => PropertyFormView()),
          );
        },
        child: const Icon(Icons.add),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.endFloat,
    );
  }
}
