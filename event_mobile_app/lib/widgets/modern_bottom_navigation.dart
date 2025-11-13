import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

class ModernBottomNavigationBar extends StatelessWidget {
  final int currentIndex;
  final Function(int) onTap;

  const ModernBottomNavigationBar({
    super.key,
    required this.currentIndex,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF8B5CF6), Color(0xFF3B82F6)],
        ),
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(32),
          topRight: Radius.circular(32),
        ),
        boxShadow: [
          BoxShadow(
            color: Color(0xFF8B5CF6),
            blurRadius: 20,
            offset: Offset(0, -5),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: const BorderRadius.only(
          topLeft: Radius.circular(32),
          topRight: Radius.circular(32),
        ),
        child: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [Color(0xFF8B5CF6), Color(0xFF3B82F6)],
            ),
          ),
          child: Stack(
            children: [
              // Wave Design
              Positioned(
                top: 0,
                left: 0,
                right: 0,
                child: CustomPaint(
                  size: const Size(double.infinity, 40),
                  painter: WavePainter(),
                ),
              ),

              // Navigation Items
              Padding(
                padding: const EdgeInsets.only(top: 20, bottom: 16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    _buildNavItem(
                      context,
                      index: 0,
                      icon: Icons.home_outlined,
                      activeIcon: Icons.home,
                      label: 'Beranda',
                    ),
                    _buildNavItem(
                      context,
                      index: 1,
                      icon: Icons.event_outlined,
                      activeIcon: Icons.event,
                      label: 'Event',
                    ),
                    _buildNavItem(
                      context,
                      index: 2,
                      icon: Icons.workspace_premium_outlined,
                      activeIcon: Icons.workspace_premium,
                      label: 'Sertifikat',
                    ),
                    _buildNavItem(
                      context,
                      index: 3,
                      icon: Icons.check_circle_outline,
                      activeIcon: Icons.check_circle,
                      label: 'Kehadiran',
                    ),
                    _buildNavItem(
                      context,
                      index: 4,
                      icon: Icons.person_outline,
                      activeIcon: Icons.person,
                      label: 'Profil',
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem(
    BuildContext context, {
    required int index,
    required IconData icon,
    required IconData activeIcon,
    required String label,
  }) {
    final isActive = currentIndex == index;

    return GestureDetector(
      onTap: () => onTap(index),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          color: isActive ? Colors.white.withOpacity(0.2) : Colors.transparent,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            AnimatedContainer(
                  duration: const Duration(milliseconds: 300),
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: isActive ? Colors.white : Colors.transparent,
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: isActive
                        ? [
                            BoxShadow(
                              color: Colors.white.withOpacity(0.3),
                              blurRadius: 8,
                              offset: const Offset(0, 2),
                            ),
                          ]
                        : null,
                  ),
                  child: Icon(
                    isActive ? activeIcon : icon,
                    color: isActive
                        ? const Color(0xFF8B5CF6)
                        : Colors.white.withOpacity(0.7),
                    size: 24,
                  ),
                )
                .animate(target: isActive ? 1 : 0)
                .scale(duration: 300.ms, curve: Curves.elasticOut),
            const SizedBox(height: 4),
            Text(
                  label,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: isActive
                        ? Colors.white
                        : Colors.white.withOpacity(0.7),
                    fontWeight: isActive ? FontWeight.w600 : FontWeight.normal,
                    fontSize: 11,
                  ),
                )
                .animate(target: isActive ? 1 : 0)
                .fadeIn(duration: 200.ms)
                .slideY(begin: 0.3, end: 0, duration: 200.ms),
          ],
        ),
      ),
    );
  }
}

class WavePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white.withOpacity(0.1)
      ..style = PaintingStyle.fill;

    final path = Path();

    // Create wave pattern
    path.moveTo(0, size.height * 0.5);

    // First wave
    path.quadraticBezierTo(
      size.width * 0.25,
      size.height * 0.2,
      size.width * 0.5,
      size.height * 0.5,
    );

    // Second wave
    path.quadraticBezierTo(
      size.width * 0.75,
      size.height * 0.8,
      size.width,
      size.height * 0.5,
    );

    path.lineTo(size.width, 0);
    path.lineTo(0, 0);
    path.close();

    canvas.drawPath(path, paint);

    // Add smaller decorative waves
    final smallPaint = Paint()
      ..color = Colors.white.withOpacity(0.05)
      ..style = PaintingStyle.fill;

    final smallPath = Path();
    smallPath.moveTo(0, size.height * 0.3);
    smallPath.quadraticBezierTo(
      size.width * 0.3,
      size.height * 0.1,
      size.width * 0.6,
      size.height * 0.3,
    );
    smallPath.quadraticBezierTo(
      size.width * 0.9,
      size.height * 0.5,
      size.width,
      size.height * 0.3,
    );
    smallPath.lineTo(size.width, 0);
    smallPath.lineTo(0, 0);
    smallPath.close();

    canvas.drawPath(smallPath, smallPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

// Custom Bottom Navigation Bar Widget
class ModernBottomNavBar extends StatefulWidget {
  final int currentIndex;
  final Function(int) onTap;

  const ModernBottomNavBar({
    super.key,
    required this.currentIndex,
    required this.onTap,
  });

  @override
  State<ModernBottomNavBar> createState() => _ModernBottomNavBarState();
}

class _ModernBottomNavBarState extends State<ModernBottomNavBar> {
  @override
  Widget build(BuildContext context) {
    return Container(
      height: 90,
      child: ModernBottomNavigationBar(
        currentIndex: widget.currentIndex,
        onTap: widget.onTap,
      ),
    );
  }
}
