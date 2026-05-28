import 'dart:io';
import 'package:sqflite_common_ffi/sqflite_ffi.dart';

/// Inicializa sqflite_common_ffi em desktop (Linux / Windows / macOS).
/// Em Android e iOS o sqflite nativo já funciona sem configuração extra.
Future<void> initSqliteIfNeeded() async {
  if (Platform.isWindows || Platform.isLinux || Platform.isMacOS) {
    sqfliteFfiInit();
    databaseFactory = databaseFactoryFfi;
  }
}
