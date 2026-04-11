/*import 'package:flutter/material.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Demo',
      theme: ThemeData(
        // This is the theme of your application.
        //
        // TRY THIS: Try running your application with "flutter run". You'll see
        // the application has a purple toolbar. Then, without quitting the app,
        // try changing the seedColor in the colorScheme below to Colors.green
        // and then invoke "hot reload" (save your changes or press the "hot
        // reload" button in a Flutter-supported IDE, or press "r" if you used
        // the command line to start the app).
        //
        // Notice that the counter didn't reset back to zero; the application
        // state is not lost during the reload. To reset the state, use hot
        // restart instead.
        //
        // This works for code too, not just values: Most code changes can be
        // tested with just a hot reload.
        colorScheme: .fromSeed(seedColor: Colors.deepPurple),
      ),
      home: const MyHomePage(title: 'Flutter Demo Home Page'),
    );
  }
}

class MyHomePage extends StatefulWidget {
  const MyHomePage({super.key, required this.title});

  // This widget is the home page of your application. It is stateful, meaning
  // that it has a State object (defined below) that contains fields that affect
  // how it looks.

  // This class is the configuration for the state. It holds the values (in this
  // case the title) provided by the parent (in this case the App widget) and
  // used by the build method of the State. Fields in a Widget subclass are
  // always marked "final".

  final String title;

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  int _counter = 0;

  void _incrementCounter() {
    setState(() {
      // This call to setState tells the Flutter framework that something has
      // changed in this State, which causes it to rerun the build method below
      // so that the display can reflect the updated values. If we changed
      // _counter without calling setState(), then the build method would not be
      // called again, and so nothing would appear to happen.
      _counter++;
    });
  }

  @override
  Widget build(BuildContext context) {
    // This method is rerun every time setState is called, for instance as done
    // by the _incrementCounter method above.
    //
    // The Flutter framework has been optimized to make rerunning build methods
    // fast, so that you can just rebuild anything that needs updating rather
    // than having to individually change instances of widgets.
    return Scaffold(
      appBar: AppBar(
        // TRY THIS: Try changing the color here to a specific color (to
        // Colors.amber, perhaps?) and trigger a hot reload to see the AppBar
        // change color while the other colors stay the same.
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        // Here we take the value from the MyHomePage object that was created by
        // the App.build method, and use it to set our appbar title.
        title: Text(widget.title),
      ),
      body: Center(
        // Center is a layout widget. It takes a single child and positions it
        // in the middle of the parent.
        child: Column(
          // Column is also a layout widget. It takes a list of children and
          // arranges them vertically. By default, it sizes itself to fit its
          // children horizontally, and tries to be as tall as its parent.
          //
          // Column has various properties to control how it sizes itself and
          // how it positions its children. Here we use mainAxisAlignment to
          // center the children vertically; the main axis here is the vertical
          // axis because Columns are vertical (the cross axis would be
          // horizontal).
          //
          // TRY THIS: Invoke "debug painting" (choose the "Toggle Debug Paint"
          // action in the IDE, or press "p" in the console), to see the
          // wireframe for each widget.
          mainAxisAlignment: .center,
          children: [
            const Text('You have pushed the button this many times:'),
            Text(
              '$_counter',
              style: Theme.of(context).textTheme.headlineMedium,
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _incrementCounter,
        tooltip: 'Increment',
        child: const Icon(Icons.add),
      ),
    );
  }
}
*/

import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter/foundation.dart'; // Para kDebugMode

import 'features/milk_collection/view_models/view_models_collection.dart';
import 'features/milk_collection/views/main_screen.dart';
import 'firebase_options.dart';

import 'features/profile/service/service_person.dart';
import 'features/profile/service/service_property_search.dart';
import 'features/profile/service/service_property.dart';
import 'features/profile/view_model/view_models_person.dart';
import 'features/profile/view_model/view_model_property.dart';
import 'features/profile/view_model/search_property_view_model.dart';

import 'features/auth/service/auth_service.dart';
import 'features/auth/service/i_auth_service.dart';
import 'features/auth/view_model/auth_view_model.dart';
import 'features/auth/presentation/pages/auth_view.dart';

import 'features/home/service/home_service.dart';

// MODO DE DESENVOLVIMENTO: true = usa dados mockados, false = usa Firebase
// IMPORTANTE: Devido ao problema de reCAPTCHA em emuladores, use true para desenvolvimento
const bool USE_MOCK_AUTH = false;

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);

  // Conecta ao Firebase Auth Emulator se estiver em modo debug
  // Para usar Firebase real, você precisa:
  // 1. Configurar Firebase App Check no console
  // 2. Ou criar os usuários manualmente no Firebase Console
  // 3. Ou usar dispositivo físico ao invés de emulador

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        // Auth providers
        Provider<IAuthService>(create: (_) => AuthService()),
        ChangeNotifierProvider<AuthViewModel>(
          create: (context) => AuthViewModel(context.read<IAuthService>()),
        ),

        // Outros providers
        ChangeNotifierProvider(create: (context) => MilkCollectionViewModel()),

        Provider<PersonService>(create: (_) => PersonService()),

        Provider<ServicePropertySearch>(create: (_) => ServicePropertySearch()),

        Provider<PropertyService>(create: (_) => PropertyService()),

        ChangeNotifierProvider<PersonViewModel>(
          create: (context) => PersonViewModel(context.read<PersonService>()),
        ),

        ChangeNotifierProvider<PropertyViewModel>(
          create: (context) => PropertyViewModel(
            context.read<PropertyService>(), // <--- Aqui injeta o de CRIAÇÃO
          ),
        ),

        ChangeNotifierProvider<SearchPropertyViewModel>(
          create: (context) => SearchPropertyViewModel(
            context
                .read<ServicePropertySearch>(), // <--- Aqui injeta o de BUSCA
          ),
        ),

        // Home providers
        Provider<HomeService>(create: (_) => HomeService()),
      ],

      child: MaterialApp(
        title: 'LactoView Mobile',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          primarySwatch: Colors.blue,
          visualDensity: VisualDensity.adaptivePlatformDensity,
        ),
        home: const AuthWrapper(),
        routes: {
          '/main': (context) => const MainScreen(),
          '/login': (context) => const LoginView(),
        },
      ),
    );
  }
}

class AuthWrapper extends StatefulWidget {
  const AuthWrapper({super.key});

  @override
  State<AuthWrapper> createState() => _AuthWrapperState();
}

class _AuthWrapperState extends State<AuthWrapper> {
  @override
  void initState() {
    super.initState();
    // Inicializa o AuthViewModel após o build
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<AuthViewModel>().initialize();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthViewModel>(
      builder: (context, authViewModel, _) {
        if (authViewModel.isLoading) {
          return const Scaffold(
            body: Center(child: CircularProgressIndicator()),
          );
        }

        return authViewModel.isAuthenticated
            ? const MainScreen()
            : const LoginView();
      },
    );
  }
}
