import 'package:flutter/material.dart';
import 'dart:async';

//Entities
import '../../domain/entities/propertys_entity.dart';

//Models
import '../../data/models/property_model.dart';

//Service
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

  String _lastQuery = '';
  bool get isFiltering => _lastQuery.isNotEmpty;

  Timer? _debounce;

  void setSearchMode(SearchMode mode) {
    _searchMode = mode;
    _searchResults = [];
    _isSearching = false;
    _searchError = '';
    _lastQuery = '';
    notifyListeners();
  }

  Future<void> search(String query) async {
    _lastQuery = query;
    if (_debounce?.isActive ?? false) _debounce!.cancel();

    _debounce = Timer(const Duration(milliseconds: 400), () async {
      if (query.isEmpty || query.length < 1) {
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

        if (_searchMode == SearchMode.property) {
          _searchResults = allProperties.where((p) {
            return p.name.toLowerCase().contains(q) ||
                p.city.toLowerCase().contains(q) ||
                p.registration.toLowerCase().contains(q);
          }).toList();
        } else {
          // Pesquisa por Unidade
          _searchResults = allProperties.where((p) {
            return p.floors.any((floor) => floor.units.any(
              (unit) => unit.number.toString().contains(q),
            ));
          }).toList();
        }
      } catch (e) {
        _searchError = 'Erro ao buscar dados';
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

  Future<void> fetchAll({int? userId}) async {
    try {
      final result = await _service.getAll(userId: userId);
      _propertys = result.map((e) => PropertyModel.fromEntity(e)).toList();
      notifyListeners();
    } catch (e) {
      _errorMessage = 'Erro ao carregar propriedades';
      _setState(ViewState.error);
    }
  }

  Future<Property?> addProperty(Property property) async {
    _setState(ViewState.loading);

    try {
      final created = await _service.create(property);

      await fetchAll();

      _setState(ViewState.success);
      return created;
    } catch (e) {
      _errorMessage = 'Erro ao adicionar propriedade: $e';
      _setState(ViewState.error);
      return null;
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
