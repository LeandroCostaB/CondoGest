import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'dart:async';

//Entities
import '../../domain/entities/propertys_entity.dart';
import '../../domain/entities/floor_entity.dart';
import '../../domain/entities/unit_entity.dart';

//Models
import '../../data/models/property_model.dart';
import '../../data/models/unit_model.dart';
import '../../data/models/floor_model.dart';

//Service
import '../../data/datasources/property_service.dart';
import '../../data/datasources/i_property_service.dart';

enum ViewState { idle, loading, success, error }

enum SearchMode { property, unit }

class PropertyViewModel extends ChangeNotifier {
  final IPropertyService _service;

  PropertyViewModel(this._service);

  List<PropertyModel> _propertys = [];
  List<PropertyModel> get propertys => _propertys;

  ViewState _state = ViewState.idle;
  ViewState get state => _state;

  bool get isLoading => _state == ViewState.loading;

  String _errorMessage = '';
  String get errorMessage => _errorMessage;

  SearchMode _searchMode = SearchMode.property;
  SearchMode get searchMode => _searchMode;

  List<Property> _searchResults = [];
  List<Property> get searchResults => _searchResults;

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
        final allProperties = await _service.getAll();

        final q = query.toLowerCase();

        _searchResults = allProperties.where((p) {
          return p.name.toLowerCase().contains(q) ||
              p.city.toLowerCase().contains(q) ||
              p.registration.toLowerCase().contains(q);
        }).toList();
      } catch (e) {
        _searchError = 'Erro ao buscar propriedades';
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
      _propertys = result.map((e) => PropertyModel.fromEntity(e)).toList();
      notifyListeners();
    } catch (e) {
      _errorMessage = 'Erro ao carregar propriedades';
      _setState(ViewState.error);
    }
  }

  Future<bool> addProperty(Property property) async {
    _setState(ViewState.loading);

    try {
      await _service.create(property);

      await fetchAll(); // importante para futuro backend

      _setState(ViewState.success);
      return true;
    } catch (e) {
      _errorMessage = 'Erro ao adicionar propriedade';
      _setState(ViewState.error);
      return false;
    }
  }

  Future<bool> updateProperty(Property property) async {
    _setState(ViewState.loading);

    try {
      await _service.update(property);

      await fetchAll();

      _setState(ViewState.success);
      return true;
    } catch (e) {
      _errorMessage = 'Erro ao atualizar propriedade';
      _setState(ViewState.error);
      return false;
    }
  }

  Future<bool> deleteProperty(String id) async {
    _setState(ViewState.loading);

    try {
      await _service.delete(id);

      await fetchAll();

      _setState(ViewState.success);
      return true;
    } catch (e) {
      _errorMessage = 'Erro ao deletar propriedade';
      _setState(ViewState.error);
      return false;
    }
  }
}
