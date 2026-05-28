// Importação condicional: usa a versão nativa quando dart:io está disponível,
// e a versão web (stub) quando não está.
export 'sqlite_bootstrap_stub.dart'
    if (dart.library.io) 'sqlite_bootstrap_native.dart';
