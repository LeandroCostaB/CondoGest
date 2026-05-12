import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'dart:async';

//Entities
import '../../domain/entities/maintenance_entity.dart';

//Models
import '../../data/models/maintenance_model.dart';

//Service
import '../../data/datasources/maintenance_service.dart';
import '../../data/datasources/i_maintenance_service.dart';

enum ViewState { idle, loading, success, error }

enum SearchMode { maintenance, unit }

class MaintenanceViewModel extends ChangeNotifier {
  final IMaintenanceService _service;

  MaintenanceViewModel(this._service);

  List<MaintenanceModel> _maintenance = [];
  List<MaintenanceModel> get maintenance => _maintenance;

  ViewState _state = ViewState.idle;
  ViewState get state => _state;

  bool get isLoading => _state == ViewState.loading;

  String _errorMessage = '';
  String get errorMessage => _errorMessage;

  SearchMode _searchMode = SearchMode.maintenance;
  SearchMode get searchMode => _searchMode;

  List<Maintenance> _searchResults = [];
  List<Maintenance> get searchResults => _searchResults;

  bool _isSearching = false;
  bool get isSearching => _isSearching;

  String _searchError = '';
  String get searchError => _searchError;

  Timer? _debounce;

  Future<void> search(String query) async {
    if (_debounce?.isActive ?? false) _debounce!.cancel();

    _debounce = Timer(const Duration(milliseconds: 400), () async {
      if (query.isEmpty || query.length < 2) {
        _searchResults = [];
        _isSearching = false;
        notifyListeners();
        return;
      }

      _isSearching = true;
      _searchError = '';
      notifyListeners();

      try {
        final allMaintenance = await _service.getAll();

        final q = query.toLowerCase();

        _searchResults = allMaintenance.where((p) {
          return p.priority.toLowerCase().contains(q) ||
              p.type.toLowerCase().contains(q) ||
              p.unitId.toLowerCase().contains(q);
        }).toList();
      } catch (e) {
        _searchError = 'Erro ao buscar manutenção';
        _searchResults = [];
      } finally {
        _isSearching = false;
        notifyListeners();
      }
    });
  }

  void clearSearchResults() {
    _searchResults = [];
    _searchError = '';
    notifyListeners();
  }

  void _setState(ViewState state) {
    _state = state;
    notifyListeners();
  }

  Future<void> fetchAll() async {
    try {
      final result = await _service.getAll();
      _maintenance = result.map((e) => MaintenanceModel.fromEntity(e)).toList();
      notifyListeners();
    } catch (e) {
      _errorMessage = 'Erro ao carregar manutençoes';
      _setState(ViewState.error);
    }
  }

  Future<bool> addMaintenance(Maintenance maintenance) async {
    _setState(ViewState.loading);

    try {
      await _service.create(maintenance);

      await fetchAll(); // importante para futuro backend

      _setState(ViewState.success);
      return true;
    } catch (e) {
      _errorMessage = 'Erro ao adicionar manutenção';
      _setState(ViewState.error);
      return false;
    }
  }

  Future<bool> updateMaintenance(Maintenance maintenance) async {
    _setState(ViewState.loading);

    try {
      await _service.update(maintenance);

      await fetchAll();

      _setState(ViewState.success);
      return true;
    } catch (e) {
      _errorMessage = 'Erro ao atualizar manutenção';
      _setState(ViewState.error);
      return false;
    }
  }

  Future<bool> deleteMaintenance(String id) async {
    _setState(ViewState.loading);

    try {
      await _service.delete(id);

      await fetchAll();

      _setState(ViewState.success);
      return true;
    } catch (e) {
      _errorMessage = 'Erro ao deletar manutenção';
      _setState(ViewState.error);
      return false;
    }
  }
}
