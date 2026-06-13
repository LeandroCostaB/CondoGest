import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../auth/presentation/viewmodels/auth_view_model.dart';

class ResidentDashboardScreen extends StatelessWidget {
  const ResidentDashboardScreen({super.key});

  static const Color _primaryColor = Color(0xFF1D1B3A);
  static const Color _accentColor = Color(0xFF2E7D32);

  String _buildUnitLabel(String? number, String? block) {
    if (number == null && block == null) return '–';
    if (block == null) return 'Unidade $number';
    return 'Unidade $number – Bloco $block';
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthViewModel>().currentUser;

    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      appBar: AppBar(
        backgroundColor: _primaryColor,
        title: const Text(
          "PAINEL DO MORADOR",
          style: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
            letterSpacing: 1.2,
          ),
        ),
        centerTitle: true,
        automaticallyImplyLeading: false,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              "Bem vindo,",
              style: TextStyle(fontSize: 16, color: Colors.grey),
            ),
            Text(
              user?.name ?? 'Morador',
              style: const TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.bold,
                color: _accentColor,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              _buildUnitLabel(user?.apartmentNumber, user?.apartmentBlock),
              style: TextStyle(fontSize: 16, color: Colors.grey.shade600),
            ),
            const SizedBox(height: 40),
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.grey.shade200),
              ),
              child: Column(
                children: [
                  Icon(
                    Icons.assignment_turned_in_outlined,
                    size: 64,
                    color: _primaryColor.withValues(alpha: 0.5),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    "Acompanhe seus chamados aqui",
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    "Você não possui chamados abertos no momento.",
                    style: TextStyle(color: Colors.grey.shade500),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
