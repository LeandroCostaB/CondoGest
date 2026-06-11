import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';

class DatabaseHelper {
  static final DatabaseHelper _instance = DatabaseHelper._internal();
  static Database? _database;

  factory DatabaseHelper() => _instance;

  DatabaseHelper._internal();

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDatabase();
    return _database!;
  }

  Future<Database> _initDatabase() async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, 'condogest.db');

    return await openDatabase(
      path,
      version: 1,
      onCreate: _onCreate,
      onConfigure: (db) async {
        await db.execute('PRAGMA foreign_keys = ON');
      },
    );
  }

  Future<void> _onCreate(Database db, int version) async {
    // 1. Users table
    await db.execute('''
      CREATE TABLE Users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        password_hash TEXT,
        created_at TEXT NOT NULL,
        type TEXT NOT NULL
      )
    ''');

    // 2. Properties table
    await db.execute('''
      CREATE TABLE Properties (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        address TEXT NOT NULL,
        user_id INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES Users (id) ON DELETE CASCADE
      )
    ''');

    // 3. Units table
    await db.execute('''
      CREATE TABLE Units (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        number INTEGER NOT NULL,
        block TEXT,
        floor INTEGER NOT NULL,
        property_id INTEGER NOT NULL,
        FOREIGN KEY (property_id) REFERENCES Properties (id) ON DELETE CASCADE
      )
    ''');

    // 4. Providers table
    await db.execute('''
      CREATE TABLE Providers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        telephone TEXT NOT NULL,
        specialty TEXT NOT NULL
      )
    ''');

    // 5. Residents table
    await db.execute('''
      CREATE TABLE Residents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        apartment_id INTEGER NOT NULL,
        telephone TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES Users (id) ON DELETE CASCADE,
        FOREIGN KEY (apartment_id) REFERENCES Units (id) ON DELETE CASCADE
      )
    ''');

    // 6. Tickets table
    await db.execute('''
      CREATE TABLE Tickets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        location TEXT,
        type TEXT,
        priority TEXT,
        status TEXT,
        apartment_id INTEGER NOT NULL,
        property_id INTEGER NULL,
        resident_id INTEGER NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (apartment_id) REFERENCES Units (id) ON DELETE CASCADE,
        FOREIGN KEY (property_id) REFERENCES Properties (id) ON DELETE CASCADE,
        FOREIGN KEY (resident_id) REFERENCES Residents (id) ON DELETE CASCADE
      )
    ''');

    // 7. Maintenances table
    await db.execute('''
      CREATE TABLE Maintenances (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ticket_id INTEGER NULL,
        unit_id INTEGER NULL,
        local TEXT,
        type TEXT,
        priority TEXT,
        provider_id INTEGER NULL,
        provider_name TEXT,
        provider_contact TEXT,
        status TEXT,
        value REAL,
        execution_date TEXT,
        observation TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (ticket_id) REFERENCES Tickets (id) ON DELETE CASCADE,
        FOREIGN KEY (provider_id) REFERENCES Providers (id) ON DELETE CASCADE,
        FOREIGN KEY (unit_id) REFERENCES Units (id) ON DELETE CASCADE
      )
    ''');

    // 8. Recurring Maintenances table
    await db.execute('''
      CREATE TABLE RecurringMaintenances (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        description TEXT NOT NULL,
        periodicity TEXT,
        next_execution TEXT,
        property_id INTEGER NOT NULL,
        FOREIGN KEY (property_id) REFERENCES Properties (id) ON DELETE CASCADE
      )
    ''');

    // Seed initial data
    await _seedInitialData(db);
  }

  Future<void> _seedInitialData(Database db) async {
    try {
      // 1. INSERT Syndic User
      await db.execute('''
        INSERT OR IGNORE INTO Users (id, name, email, password_hash, created_at, type) 
        VALUES (1, 'Síndico Adminn', 'sindico@teste.com', '123456', '2026-05-24', 'syndic')
      ''');

      // 2. INSERT Resident User ("Fulano da Silva")
      await db.execute('''
        INSERT OR IGNORE INTO Users (id, name, email, password_hash, created_at, type) 
        VALUES (2, 'Fulano Silva', 'morador@teste.com', '123456', '2026-05-24', 'resident')
      ''');

      // 3. INSERT Property ("Residencial Las Venturas" linked to user_id: 1)
      await db.execute('''
        INSERT OR IGNORE INTO Properties (id, name, address, user_id, created_at) 
        VALUES (1, 'Residencial Las Venturas', 'Av. Principal, 500', 1, '2026-05-24')
      ''');

      // 4. INSERT Unit ("207" linked to property_id: 1)
      await db.execute('''
        INSERT OR IGNORE INTO Units (id, number,floor, property_id) 
        VALUES (1, 207, 2, 1)
      ''');

      // 5. INSERT Resident Profile (linked to User 2 and Unit 1)
      await db.execute('''
        INSERT OR IGNORE INTO Residents (id, user_id, apartment_id, telephone, created_at) 
        VALUES (1, 2, 1, '45999999999', '2026-05-24')
      ''');

      print('Banco semeado com sucesso.');
    } catch (e) {
      print('Erro ao semear o banco: $e');
    }
  }
}
