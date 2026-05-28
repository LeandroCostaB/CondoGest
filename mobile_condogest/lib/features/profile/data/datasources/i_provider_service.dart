import '../../domain/entities/provider.dart';

abstract class IProviderService {
  Future<List<Provider>> getAll();
  Future<Provider?> getById(String id);
  Future<Provider> create(Provider provider);
  Future<Provider?> update(Provider provider);
  Future<bool> delete(String id);
}
