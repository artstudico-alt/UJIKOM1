import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../utils/app_localizations.dart';
import '../../utils/app_theme.dart';
import '../home/home_screen.dart';
import '../events/events_screen.dart';
import '../certificates/certificates_screen.dart';
import '../attendance/attendance_screen.dart';
import '../profile/profile_screen.dart';

class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = [
    const HomeScreen(),
    const EventsScreen(),
    const CertificatesScreen(),
    const AttendanceScreen(),
    const ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);

    return Scaffold(
      body: IndexedStack(index: _currentIndex, children: _screens),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: const BorderRadius.only(
            topLeft: Radius.circular(24),
            topRight: Radius.circular(24),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 20,
              offset: const Offset(0, -5),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: const BorderRadius.only(
            topLeft: Radius.circular(24),
            topRight: Radius.circular(24),
          ),
          child: BottomNavigationBar(
            type: BottomNavigationBarType.fixed,
            currentIndex: _currentIndex,
            onTap: (index) {
              setState(() {
                _currentIndex = index;
              });
            },
            selectedItemColor: AppTheme.primaryColor,
            unselectedItemColor: const Color(0xFF9E9E9E),
            backgroundColor: Colors.white,
            elevation: 0,
            selectedFontSize: 12,
            unselectedFontSize: 11,
            selectedLabelStyle: const TextStyle(fontWeight: FontWeight.w600),
            unselectedLabelStyle: const TextStyle(
              fontWeight: FontWeight.normal,
            ),
            items: [
              BottomNavigationBarItem(
                icon: _buildAnimatedIcon(Icons.home_outlined, Icons.home, 0),
                label: l10n.home,
              ),
              BottomNavigationBarItem(
                icon: _buildAnimatedIcon(Icons.event_outlined, Icons.event, 1),
                label: l10n.events,
              ),
              BottomNavigationBarItem(
                icon: _buildAnimatedIcon(
                  Icons.workspace_premium_outlined,
                  Icons.workspace_premium,
                  2,
                ),
                label: l10n.certificates,
              ),
              BottomNavigationBarItem(
                icon: _buildAnimatedIcon(
                  Icons.check_circle_outline,
                  Icons.check_circle,
                  3,
                ),
                label: l10n.attendance,
              ),
              BottomNavigationBarItem(
                icon: _buildAnimatedIcon(Icons.person_outline, Icons.person, 4),
                label: l10n.profile,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildAnimatedIcon(
    IconData outlineIcon,
    IconData filledIcon,
    int index,
  ) {
    final isSelected = _currentIndex == index;

    return AnimatedContainer(
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeInOut,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          decoration: BoxDecoration(
            color: isSelected
                ? AppTheme.primaryColor.withOpacity(0.15)
                : Colors.transparent,
            borderRadius: BorderRadius.circular(16),
          ),
          child: Icon(
            isSelected ? filledIcon : outlineIcon,
            size: isSelected ? 26 : 24,
            color: isSelected ? AppTheme.primaryColor : const Color(0xFF9E9E9E),
          ),
        )
        .animate(target: isSelected ? 1 : 0)
        .scale(
          duration: 200.ms,
          begin: const Offset(0.95, 0.95),
          end: const Offset(1.0, 1.0),
          curve: Curves.easeOutBack,
        )
        .fadeIn(duration: 150.ms);
  }
}
