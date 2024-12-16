import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'map.dart';

// Main

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    return MaterialApp(
      title: 'AVEC app',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
            seedColor: const Color.fromRGBO(46, 174, 99, 1)),
        primaryColor: const Color.fromRGBO(46, 174, 99, 1),
        textTheme: GoogleFonts.fugazOneTextTheme(textTheme).copyWith(
          bodyMedium: GoogleFonts.oswald(textStyle: textTheme.bodyMedium),
          bodyLarge: GoogleFonts.fugazOne(textStyle: textTheme.bodyMedium),
          displayMedium:
              GoogleFonts.fugazOne(textStyle: textTheme.displayMedium),
        ),
        useMaterial3: true,
      ),
      home: const MyHomePage(title: 'AVEC'),
    );
  }
}

class MyHomePage extends StatefulWidget {
  const MyHomePage({super.key, required this.title});

  final String title;

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  TextEditingController cityController = TextEditingController();
  City? selectedCity;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
          title: const Image(
              image: AssetImage('assets/avec-logo.png'), height: 50),
        ),
        body: selectedCity == null
            ? Center(
                child: DropdownMenu<City>(
                  initialSelection: City.undecided,
                  controller: cityController,
                  requestFocusOnTap: true,
                  label: const Text('Stad'),
                  onSelected: (City? label) {
                    setState(() {
                      selectedCity = label;
                    });
                  },
                  dropdownMenuEntries:
                      City.values.map<DropdownMenuEntry<City>>((City label) {
                    return DropdownMenuEntry<City>(
                      value: label,
                      enabled: label.label != 'Välj stad...',
                      label: label.label,
                    );
                  }).toList(),
                ),
              )
            : MapPage(
                selectedCity: selectedCity!.label,
              ),
        endDrawer: const Drawer(
            child: Column(
          mainAxisAlignment: MainAxisAlignment.start,
          children: <Widget>[
            SizedBox(
              height: 30,
            ),
            Text(
              'Här kommer mer information',
              textAlign: TextAlign.left,
            ),
            SizedBox(
              height: 30,
            ),
            Text('Användare'),
            SizedBox(
              height: 30,
            ),
            Text('Tidigare resor'),
            SizedBox(
              height: 30,
            ),
            Text('Byt stad'),
          ],
        )));
  }
}

enum City {
  undecided('Välj stad...'),
  lund('Lund'),
  skelleftea('Skellefteå'),
  solna('Solna');

  const City(this.label);
  final String label;
}
