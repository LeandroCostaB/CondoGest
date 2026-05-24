import '../../domain/entities/unit_entity.dart';

class UnitModel extends Unit {
  final int? propertyId;
  final String? block;

  UnitModel({
    required super.id,
    required super.number,
    required super.floor,
    this.propertyId,
    this.block,
  });

  factory UnitModel.fromMap(Map<String, dynamic> map) {
    return UnitModel(
      id: map['id'] as int? ?? 0,
      number: map['number'] ?? 0,
      floor: map['floor'] as int? ?? 0,
      propertyId: map['property_id'] as int?,
      block: map['block'] as String?,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'number': number,
      'block': block,
      'floor': floor,
      'property_id': propertyId,
    };
  }
}
