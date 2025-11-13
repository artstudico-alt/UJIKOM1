import 'package:flutter/material.dart';
import '../home/modern_home_dashboard.dart';
import '../events/events_screen.dart';
import '../certificates/certificates_screen.dart';
import '../attendance/attendance_screen.dart';
import '../profile/profile_screen.dart';
import '../../widgets/modern_bottom_navigation.dart';

class ModernMainScreen extends StatefulWidget {
  const ModernMainScreen({super.key});

  @override
  State<ModernMainScreen> createState() => _ModernMainScreenState();
}

class _ModernMainScreenState extends State<ModernMainScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = [
    const ModernHomeDashboard(),
    const EventsScreen(),
    const CertificatesScreen(),
    const AttendanceScreen(),
    const ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(index: _currentIndex, children: _screens),
      bottomNavigationBar: ModernBottomNavBar(
        currentIndex: _currentIndex,
        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
      ),
    );
  }
}
