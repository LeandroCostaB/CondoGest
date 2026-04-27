import '../../domain/entities/unit_entity.dart';

class UnitModel extends Unit {
  UnitModel({required super.id, required super.number});

  factory UnitModel.fromMap(Map<String, dynamic> map) {
    return UnitModel(id: map['id'] as String, number: map['number'] ?? 0);
  }

  Map<String, dynamic> toMap() {
    return {'id': id, 'number': number};
  }
}
