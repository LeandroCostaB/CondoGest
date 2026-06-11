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
      block: json['block'] as String?,
      userId: json['userId'] as String?,
    );
  }

  Map<String, dynamic> _toJson(Unit unit) {
    return {
      'number': unit.number.toString(),
      'floor': unit.floor,
      if (unit.block != null) 'block': unit.block,
    };
  }

  @override
  Future<List<Unit>> getByCondominium(String condominiumId) async {
    final data = await _client.get('${ApiEndpoints.apartments(condominiumId)}?limit=500');
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
    if (data == null) return null;
    return _fromJson(data as Map<String, dynamic>);
  }

  @override
  Future<Unit> create(String condominiumId, Unit apartment) async {
    // POST retorna 201 sem body — retorna o objeto de entrada (callers recarregam a lista)
    await _client.post(ApiEndpoints.apartments(condominiumId), _toJson(apartment));
    return apartment;
  }

  @override
  Future<Unit?> update(String condominiumId, Unit apartment) async {
    // PUT retorna 200 sem body — retorna o objeto de entrada
    await _client.put(
      ApiEndpoints.apartmentById(condominiumId, apartment.id),
      _toJson(apartment),
    );
    return apartment;
  }

  @override
  Future<bool> delete(String condominiumId, String apartmentId) async {
    await _client.delete(
      ApiEndpoints.apartmentById(condominiumId, apartmentId),
    );
    return true;
  }

  @override
  Future<Unit> assignResident(
    String condominiumId,
    String apartmentId,
    String? userId,
  ) async {
    // PATCH retorna 200 sem body — busca o apartamento atualizado para retornar
    await _client.patch(
      ApiEndpoints.apartmentResident(condominiumId, apartmentId),
      {'userId': userId},
    );
    final updated = await getById(condominiumId, apartmentId);
    return updated ??
        Unit(id: apartmentId, number: 0, floor: 0, userId: userId);
  }
}
