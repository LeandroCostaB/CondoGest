import '../../../../core/network/api_client.dart';
import '../../../../core/network/api_endpoints.dart';
import '../../domain/entities/unit_entity.dart';
import 'i_apartment_service.dart';

class ApartmentService implements IApartmentService {
  final ApiClient _client = ApiClient();

  Unit _fromJson(Map<String, dynamic> json) {
    return Unit(
      id: json['id'] as String,
      number: int.tryParse(json['number'].toString()) ?? 0,
      floor: (json['floor'] as num?)?.toInt() ?? 0,
    );
  }

  Map<String, dynamic> _toJson(Unit unit) {
    return {
      'number': unit.number.toString(),
      'floor': unit.floor,
    };
  }

  @override
  Future<List<Unit>> getByCondominium(String condominiumId) async {
    final data = await _client.get(ApiEndpoints.apartments(condominiumId));
    final items = data['data'] as List<dynamic>;
    return items
        .map((e) => _fromJson(e as Map<String, dynamic>))
        .toList();
  }

  @override
  Future<Unit?> getById(String condominiumId, String apartmentId) async {
    final data = await _client.get(
      ApiEndpoints.apartmentById(condominiumId, apartmentId),
    );
    return _fromJson(data as Map<String, dynamic>);
  }

  @override
  Future<Unit> create(String condominiumId, Unit apartment) async {
    final data = await _client.post(
      ApiEndpoints.apartments(condominiumId),
      _toJson(apartment),
    );
    return _fromJson(data as Map<String, dynamic>);
  }

  @override
  Future<Unit?> update(String condominiumId, Unit apartment) async {
    final data = await _client.put(
      ApiEndpoints.apartmentById(condominiumId, apartment.id),
      _toJson(apartment),
    );
    return _fromJson(data as Map<String, dynamic>);
  }

  @override
  Future<bool> delete(String condominiumId, String apartmentId) async {
    await _client.delete(
      ApiEndpoints.apartmentById(condominiumId, apartmentId),
    );
    return true;
  }
}
