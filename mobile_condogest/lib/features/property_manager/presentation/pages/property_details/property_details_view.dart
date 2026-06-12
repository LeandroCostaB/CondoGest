import 'package:condogest/features/property_manager/domain/entities/propertys_entity.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../data/models/property_model.dart';
import '../../viewmodels/property_viewmodel.dart';
import '../apartament_details/apartament_details_view.dart';

// Import do Maintenance ViewModel, states e form
import 'package:condogest/features/property_maintenance/presentation/viewmodels/maintenance_viewmodel.dart'
    as maintenance_vm;
import 'package:condogest/features/property_maintenance/presentation/pages/maintenance_form_view.dart';
import 'package:condogest/features/ticket_manager/domain/repositories/ticket_repository.dart';

class PropertyDetailsView extends StatefulWidget {
  final Property property;

  const PropertyDetailsView({super.key, required this.property});

  @override
  State<PropertyDetailsView> createState() => _PropertyDetailsViewState();
}

class _PropertyDetailsViewState extends State<PropertyDetailsView> {
  final Color primaryColor = const Color.fromRGBO(29, 27, 58, 1);

  @override
  void initState() {
    super.initState();
    // Seguindo a lógica de maintenance_list_view.dart para carregar os dados
    Future.microtask(() {
      if (mounted) {
        context.read<maintenance_vm.MaintenanceViewModel>().fetchAll();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    // Acessa os ViewModels de forma reativa
    final propertyViewModel = context.watch<PropertyViewModel>();
    final maintenanceViewModel = context
        .watch<maintenance_vm.MaintenanceViewModel>();

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
            title: widget.property.name,
            icon: Icons.business,
            initiallyExpanded: false,
            children: [_buildPropertyList(context, propertyViewModel)],
          ),
          const SizedBox(height: 12),
          _buildCustomExpansionTile(
            title: 'Manutenções Pendentes',
            icon: Icons.build_circle_outlined,
            initiallyExpanded: true,
            children: [
              // PADRÃO DE REFERÊNCIA: Tratamento de erro exibido antes da lista
              if (maintenanceViewModel.searchError.isNotEmpty)
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Text(
                    maintenanceViewModel.searchError,
                    style: const TextStyle(color: Colors.red),
                    textAlign: TextAlign.center,
                  ),
                ),
              _buildMaintenanceList(maintenanceViewModel),
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
          ...widget.property.floors.map((floor) {
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
                      final int aptNumber = unit.number;

                      return Material(
                        color: Colors.transparent,
                        child: InkWell(
                          borderRadius: BorderRadius.circular(12),
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) => ApartamentDetailsView(
                                  unitId: unit.id,
                                  property: widget.property,
                                ),
                              ),
                            );
                          },
                          child: Ink(
                            width:
                                (MediaQuery.of(context).size.width - 32 - 24) /
                                3,
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
                              border: Border.all(color: Colors.grey.shade200),
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
                                  aptNumber.toString(),
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

  /// Constrói a lista de propriedades dentro do ExpansionTile
  Widget _buildPropertyList(BuildContext context, PropertyViewModel viewModel) {
    if (viewModel.isLoading) {
      return const Padding(
        padding: EdgeInsets.all(24.0),
        child: Center(
          child: CircularProgressIndicator(
            strokeWidth: 3,
            valueColor: AlwaysStoppedAnimation<Color>(
              Color.fromRGBO(29, 27, 58, 1),
            ),
          ),
        ),
      );
    }

    if (viewModel.propertys.isEmpty) {
      return const Padding(
        padding: EdgeInsets.all(24.0),
        child: Center(
          child: Text(
            "Nenhuma propriedade encontrada",
            style: TextStyle(color: Colors.grey, fontSize: 14),
          ),
        ),
      );
    }

    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      padding: const EdgeInsets.symmetric(vertical: 8),
      itemCount: viewModel.propertys.length,
      separatorBuilder: (context, index) => Divider(
        height: 1,
        color: Colors.grey.shade100,
        indent: 16,
        endIndent: 16,
      ),
      itemBuilder: (context, index) {
        final p = viewModel.propertys[index];
        final bool isCurrent = p.id == widget.property.id;

        return ListTile(
          leading: CircleAvatar(
            backgroundColor: primaryColor.withOpacity(0.08),
            child: Icon(
              Icons.location_city_rounded,
              color: isCurrent ? primaryColor : Colors.grey.shade400,
              size: 20,
            ),
          ),
          title: Text(
            p.name,
            style: TextStyle(
              fontWeight: isCurrent ? FontWeight.bold : FontWeight.w500,
              color: isCurrent ? primaryColor : Colors.black87,
              fontSize: 15,
            ),
          ),
          subtitle: Text(
            '${p.city} - ${p.state}',
            style: TextStyle(color: Colors.grey.shade500, fontSize: 12),
          ),
          trailing: Icon(
            Icons.chevron_right_rounded,
            color: Colors.grey.shade300,
            size: 20,
          ),
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => PropertyDetailsView(property: p),
              ),
            );
          },
        );
      },
    );
  }

  /// REFATORADO: Constrói a lista de manutenções filtradas espelhando o comportamento original
  Widget _buildMaintenanceList(maintenance_vm.MaintenanceViewModel vm) {
    // 1. Verificação de Loading: Condição idêntica ao arquivo de referência
    if (vm.state == maintenance_vm.ViewState.loading && !vm.isSearching) {
      return const Padding(
        padding: EdgeInsets.all(24.0),
        child: Center(child: CircularProgressIndicator()),
      );
    }

    // 2. Fonte de Dados: Prioriza resultados de busca se existirem (Design Pattern)
    final sourceList = vm.searchResults.isNotEmpty
        ? vm.searchResults
        : vm.maintenance;

    // 3. Tratamento de Lista Vazia: Mensagem padronizada
    if (sourceList.isEmpty) {
      return const Padding(
        padding: EdgeInsets.all(24.0),
        child: Center(child: Text('Nenhuma manutenção encontrada')),
      );
    }

    // 4. Renderização: ListView.builder utilizando a sourceList diretamente
    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: sourceList.length,
      itemBuilder: (context, index) {
        final item = sourceList[index];

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
                  builder: (context) => MaintenanceFormView(
                    maintenance: item,
                    ticketRepository: context.read<TicketRepository>(),
                  ),
                ),
              );
              if (context.mounted) {
                context.read<maintenance_vm.MaintenanceViewModel>().fetchAll();
              }
            },
          ),
        );
      },
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
