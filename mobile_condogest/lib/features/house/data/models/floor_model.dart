import '../../domain/entities/floor_entity.dart';
import '../models/unit_model.dart';

class FloorModel extends Floor {
  FloorModel({required super.number, required super.units});

  factory FloorModel.fromMap(Map<String, dynamic> map) {
    return FloorModel(
      number: map['number'] ?? 0,
      units:
          (map['units'] as List<dynamic>?)
              ?.map((e) => UnitModel.fromMap(e))
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'number': number,
      'units': units.map((e) => (e as UnitModel).toMap()).toList(),
    };
  }
}
