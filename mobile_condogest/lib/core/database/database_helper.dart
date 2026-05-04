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
      CREATE TABLE users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        password_hash TEXT,
        created_at TEXT NOT NULL,
        type TEXT NOT NULL
      )
    ''');

    // 2. Properties table
    await db.execute('''
      CREATE TABLE properties (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        address TEXT NOT NULL,
        user_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    ''');

    // 3. Apartments table
    await db.execute('''
      CREATE TABLE apartments (
        id TEXT PRIMARY KEY,
        number INTEGER NOT NULL,
        block TEXT,
        floor INTEGER NOT NULL,
        property_id TEXT NOT NULL,
        FOREIGN KEY (property_id) REFERENCES properties (id) ON DELETE CASCADE
      )
    ''');

    // 4. Providers table
    await db.execute('''
      CREATE TABLE providers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        telephone TEXT NOT NULL,
        specialty TEXT NOT NULL
      )
    ''');

    // 5. Residents table
    await db.execute('''
      CREATE TABLE residents (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        apartment_id TEXT NOT NULL,
        telephone TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (apartment_id) REFERENCES apartments (id) ON DELETE CASCADE
      )
    ''');

    // 6. Tickets table
    await db.execute('''
      CREATE TABLE tickets (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        location TEXT,
        type TEXT,
        priority TEXT,
        status TEXT,
        apartment_id TEXT NOT NULL,
        property_id TEXT NOT NULL,
        resident_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (apartment_id) REFERENCES apartments (id) ON DELETE CASCADE,
        FOREIGN KEY (property_id) REFERENCES properties (id) ON DELETE CASCADE,
        FOREIGN KEY (resident_id) REFERENCES residents (id) ON DELETE CASCADE
      )
    ''');

    // 7. Maintenances table
    await db.execute('''
      CREATE TABLE maintenances (
        id TEXT PRIMARY KEY,
        ticket_id TEXT NOT NULL,
        provider_id INTEGER NOT NULL,
        status TEXT,
        value REAL,
        execution_date TEXT,
        observation TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (ticket_id) REFERENCES tickets (id) ON DELETE CASCADE,
        FOREIGN KEY (provider_id) REFERENCES providers (id) ON DELETE CASCADE
      )
    ''');

    // 8. Recurring Maintenances table
    await db.execute('''
      CREATE TABLE recurring_maintenances (
        id TEXT PRIMARY KEY,
        description TEXT NOT NULL,
        periodicity TEXT,
        next_execution TEXT,
        property_id TEXT NOT NULL,
        FOREIGN KEY (property_id) REFERENCES properties (id) ON DELETE CASCADE
      )
    ''');
  }
}
