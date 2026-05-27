import 'dart:async';
import 'package:sqflite/sqflite.dart';
import '../../domain/entities/propertys_entity.dart';
import '../models/property_model.dart';
import '../models/unit_model.dart';
import 'i_property_service.dart';

class PropertyService implements IPropertyService {
  final Database db;

  PropertyService(this.db);

  @override
  Future<List<Property>> getAll({int? userId}) async {
    final List<Map<String, dynamic>> propertyMaps = await db.query(
      'Properties',
      where: userId != null ? 'user_id = ?' : null,
      whereArgs: userId != null ? [userId] : null,
    );
    
    List<Property> properties = [];
    
    for (var propMap in propertyMaps) {
      final propertyId = propMap['id'] as int;
      
      // Fetch units for this property
      final List<Map<String, dynamic>> unitMaps = await db.query(
        'Units',
        where: 'property_id = ?',
        whereArgs: [propertyId],
      );
      
      // Group units by floor to match FloorModel expectations
      Map<int, List<Map<String, dynamic>>> floorsMap = {};
      for (var unitMap in unitMaps) {
        final floorNum = unitMap['floor'] as int;
        floorsMap.putIfAbsent(floorNum, () => []).add(unitMap);
      }
      
      final floorsList = floorsMap.entries.map((entry) {
        return {
          'number': entry.key,
          'units': entry.value,
        };
      }).toList();
      
      // Construct mutable map for PropertyModel.fromMap
      final mutableMap = Map<String, dynamic>.from(propMap);
      mutableMap['floors'] = floorsList;
      
      properties.add(PropertyModel.fromMap(mutableMap));
    }
    
    return properties;
  }

  @override
  Future<Property> create(Property property, {required int userId}) async {
    final propertyModel = PropertyModel.fromEntity(property).copyWithUserId(userId);
    
    // 1. Insert Property into Properties table
    final int propertyId = await db.insert('Properties', propertyModel.toMap());

    // 2. Insert all Units into Units table
    for (var floor in property.floors) {
      for (var unit in floor.units) {
        final unitModel = UnitModel(
          id: 0,
          number: unit.number,
          floor: floor.number,
          propertyId: propertyId,
        );
        await db.insert('Units', unitModel.toMap());
      }
    }

    // Return property with its new ID
    final result = await db.query('Properties', where: 'id = ?', whereArgs: [propertyId], limit: 1);
    if (result.isNotEmpty) {
      // Re-fetch to get nested structure correctly
      final List<Property> all = await getAll(userId: userId);
      return all.firstWhere((p) => p.id == propertyId);
    }
    
    return property;
  }

  @override
  Future<Property?> update(Property property) async {
    if (property.id == null) return null;
    
    final propertyModel = PropertyModel.fromEntity(property);
    
    // 1. Update Property table
    await db.update(
      'Properties',
      propertyModel.toMap(),
      where: 'id = ?',
      whereArgs: [property.id],
    );

    // 2. Sync Units (simplest approach: delete and re-insert)
    await db.delete('Units', where: 'property_id = ?', whereArgs: [property.id]);
    
    for (var floor in property.floors) {
      for (var unit in floor.units) {
        final unitModel = UnitModel(
          id: 0,
          number: unit.number,
          floor: floor.number,
          propertyId: property.id,
        );
        await db.insert('Units', unitModel.toMap());
      }
    }

    return property;
  }

  @override
  Future<bool> delete(String id) async {
    final intId = int.tryParse(id);
    if (intId == null) return false;

    // Delete associated units first
    await db.delete('Units', where: 'property_id = ?', whereArgs: [intId]);
    
    // Delete property
    final rowsAffected = await db.delete(
      'Properties',
      where: 'id = ?',
      whereArgs: [intId],
    );

    return rowsAffected > 0;
  }

  Future<Property?> getById(String id) async {
    final intId = int.tryParse(id);
    if (intId == null) return null;
    
    final List<Property> all = await getAll();
    try {
      return all.firstWhere((p) => p.id == intId);
    } catch (_) {
      return null;
    }
  }
}
