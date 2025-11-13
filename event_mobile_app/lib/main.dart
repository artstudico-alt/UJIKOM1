import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:provider/provider.dart';

import 'providers/auth_provider.dart';
import 'providers/theme_provider.dart';
import 'providers/language_provider.dart';
import 'screens/auth/modern_login_screen.dart';
import 'screens/main/modern_main_screen.dart';
import 'services/auth_service.dart';
import 'services/notification_service.dart';
import 'utils/app_theme.dart';
import 'utils/app_localizations.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize services
  await NotificationService.initialize();
  await AuthService.loadAuthData();

  runApp(const EventApp());
}

class EventApp extends StatelessWidget {
  const EventApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => ThemeProvider()),
        ChangeNotifierProvider(create: (_) => LanguageProvider()),
      ],
      child: Consumer3<AuthProvider, ThemeProvider, LanguageProvider>(
        builder:
            (context, authProvider, themeProvider, languageProvider, child) {
              return MaterialApp(
                title: 'EventHub Mobile',
                debugShowCheckedModeBanner: false,
                theme: AppTheme.lightTheme,
                darkTheme: AppTheme.darkTheme,
                themeMode: themeProvider.themeMode,
                locale: languageProvider.locale,
                localizationsDelegates: const [
                  AppLocalizations.delegate,
                  GlobalMaterialLocalizations.delegate,
                  GlobalWidgetsLocalizations.delegate,
                  GlobalCupertinoLocalizations.delegate,
                ],
                supportedLocales: const [
                  Locale('id', 'ID'),
                  Locale('en', 'US'),
                ],
                home: const AuthWrapper(),
              );
            },
      ),
    );
  }
}

class AuthWrapper extends StatelessWidget {
  const AuthWrapper({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, authProvider, child) {
        if (authProvider.isLoading) {
          return const Scaffold(
            body: Center(child: CircularProgressIndicator()),
          );
        }

        // Show login screen if not authenticated, otherwise show main screen
        if (authProvider.isAuthenticated) {
          return const ModernMainScreen();
        } else {
          return const ModernLoginScreen();
        }
      },
    );
  }
}
