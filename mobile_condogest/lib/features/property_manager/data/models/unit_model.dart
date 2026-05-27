import '../../domain/entities/unit_entity.dart';

class UnitModel extends Unit {
  final String? block;

  UnitModel({
    required super.id,
    required super.number,
    required super.floor,
    this.block,
  });

  factory UnitModel.fromMap(Map<String, dynamic> map) {
    return UnitModel(
      id: map['id']?.toString() ?? '',
      number: map['number'] is int
          ? map['number'] as int
          : int.tryParse(map['number'].toString()) ?? 0,
      floor: map['floor'] as int? ?? 0,
      block: map['block'] as String?,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'number': number,
      'block': block,
      'floor': floor,
    };
  }
}
