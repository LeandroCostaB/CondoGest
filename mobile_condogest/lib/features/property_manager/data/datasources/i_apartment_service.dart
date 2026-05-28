import '../../domain/entities/unit_entity.dart';

abstract class IApartmentService {
  Future<List<Unit>> getByCondominium(String condominiumId);
  Future<Unit?> getById(String condominiumId, String apartmentId);
  Future<Unit> create(String condominiumId, Unit apartment);
  Future<Unit?> update(String condominiumId, Unit apartment);
  Future<bool> delete(String condominiumId, String apartmentId);
  Future<Unit> assignResident(String condominiumId, String apartmentId, String? userId);
}
