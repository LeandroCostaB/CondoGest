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

enum ViewState { idle, loading, success, error }

class PropertyViewmodel extends ChangeNotifier {
  final _service = PropertyService();

  List<PropertyModel> _propertys = [];
  List<PropertyModel> get propertys => _propertys;

  ViewState _state = ViewState.idle;
  ViewState get state => _state;

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
}
