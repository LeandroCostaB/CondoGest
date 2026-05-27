import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../viewmodels/auth_view_model.dart';
import 'auth_view.dart';

class ResidentPlaceholderScreen extends StatelessWidget {
  const ResidentPlaceholderScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Área do Morador"),
        backgroundColor: const Color(0xFF2E7D32),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async {
              await context.read<AuthViewModel>().logout();
              if (context.mounted) {
                Navigator.of(context).pushReplacement(
                  MaterialPageRoute(builder: (_) => const LoginView()),
                );
              }
            },
          ),
        ],
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.construction, size: 100, color: Colors.orange),
            const SizedBox(height: 20),
            const Text(
              'Área do Morador - Em Desenvolvimento',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),
            const Text(
              'Em breve você poderá gerenciar seus tickets e unidade.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey),
            ),
            const SizedBox(height: 30),
            ElevatedButton(
              onPressed: () async {
                await context.read<AuthViewModel>().logout();
                if (context.mounted) {
                  Navigator.of(context).pushReplacement(
                    MaterialPageRoute(builder: (_) => const LoginView()),
                  );
                }
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red.shade900,
                foregroundColor: Colors.white,
              ),
              child: const Text("SAIR"),
            ),
          ],
        ),
      ),
    );
  }
}
