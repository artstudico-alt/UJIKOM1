import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';

class ModernHomeDashboard extends StatefulWidget {
  const ModernHomeDashboard({super.key});

  @override
  State<ModernHomeDashboard> createState() => _ModernHomeDashboardState();
}

class _ModernHomeDashboardState extends State<ModernHomeDashboard> {
  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final userName = authProvider.user?.name ?? 'User';

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            children: [
              // Header Section
              Container(
                padding: const EdgeInsets.all(24),
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [Color(0xFF8B5CF6), Color(0xFF3B82F6)],
                  ),
                  borderRadius: BorderRadius.only(
                    bottomLeft: Radius.circular(32),
                    bottomRight: Radius.circular(32),
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Top Bar
                    Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Selamat datang di,',
                              style: Theme.of(context).textTheme.bodyMedium
                                  ?.copyWith(
                                    color: Colors.white.withOpacity(0.8),
                                    fontWeight: FontWeight.w300,
                                  ),
                            ),
                            Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: Colors.white.withOpacity(0.2),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: const Icon(
                                Icons.grid_view,
                                color: Colors.white,
                                size: 20,
                              ),
                            ),
                          ],
                        )
                        .animate()
                        .fadeIn(duration: 600.ms)
                        .slideY(begin: -0.3, end: 0, duration: 600.ms),

                    const SizedBox(height: 8),

                    Text(
                          'Univ Alma ata',
                          style: Theme.of(context).textTheme.headlineMedium
                              ?.copyWith(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 28,
                              ),
                        )
                        .animate()
                        .fadeIn(duration: 600.ms, delay: 200.ms)
                        .slideY(
                          begin: -0.3,
                          end: 0,
                          duration: 600.ms,
                          delay: 200.ms,
                        ),

                    const SizedBox(height: 24),

                    // User Profile Card
                    Container(
                          padding: const EdgeInsets.all(24),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(20),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.1),
                                blurRadius: 20,
                                offset: const Offset(0, 10),
                              ),
                            ],
                          ),
                          child: Row(
                            children: [
                              // User Info
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      '1983242342',
                                      style: Theme.of(context)
                                          .textTheme
                                          .bodySmall
                                          ?.copyWith(
                                            color: const Color(0xFF6B7280),
                                            fontWeight: FontWeight.w500,
                                          ),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      userName,
                                      style: Theme.of(context)
                                          .textTheme
                                          .headlineSmall
                                          ?.copyWith(
                                            color: const Color(0xFF1F2937),
                                            fontWeight: FontWeight.bold,
                                            fontSize: 20,
                                          ),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      'Sistem Informasi',
                                      style: Theme.of(context)
                                          .textTheme
                                          .bodyMedium
                                          ?.copyWith(
                                            color: const Color(0xFF6B7280),
                                          ),
                                    ),
                                    const SizedBox(height: 8),
                                    Text(
                                      'IPK 3.8',
                                      style: Theme.of(context)
                                          .textTheme
                                          .bodyMedium
                                          ?.copyWith(
                                            color: const Color(0xFF059669),
                                            fontWeight: FontWeight.w600,
                                          ),
                                    ),
                                  ],
                                ),
                              ),

                              // Illustration
                              Stack(
                                children: [
                                  Container(
                                    width: 120,
                                    height: 120,
                                    decoration: BoxDecoration(
                                      gradient: const LinearGradient(
                                        colors: [
                                          Color(0xFFF59E0B),
                                          Color(0xFFEF4444),
                                        ],
                                      ),
                                      borderRadius: BorderRadius.circular(20),
                                    ),
                                    child: const Center(
                                      child: Icon(
                                        Icons.edit,
                                        color: Colors.white,
                                        size: 40,
                                      ),
                                    ),
                                  ),
                                  Positioned(
                                    bottom: 8,
                                    right: 8,
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 12,
                                        vertical: 6,
                                      ),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFF3B82F6),
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                      child: Text(
                                        '63 SKS',
                                        style: Theme.of(context)
                                            .textTheme
                                            .bodySmall
                                            ?.copyWith(
                                              color: Colors.white,
                                              fontWeight: FontWeight.w600,
                                              fontSize: 10,
                                            ),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        )
                        .animate()
                        .fadeIn(duration: 600.ms, delay: 400.ms)
                        .slideX(
                          begin: 0.3,
                          end: 0,
                          duration: 600.ms,
                          delay: 400.ms,
                        ),
                  ],
                ),
              ),

              const SizedBox(height: 32),

              // Menu Informasi Section
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                          'Menu Informasi',
                          style: Theme.of(context).textTheme.headlineSmall
                              ?.copyWith(
                                color: const Color(0xFF1F2937),
                                fontWeight: FontWeight.bold,
                              ),
                        )
                        .animate()
                        .fadeIn(duration: 600.ms, delay: 600.ms)
                        .slideX(
                          begin: -0.3,
                          end: 0,
                          duration: 600.ms,
                          delay: 600.ms,
                        ),

                    const SizedBox(height: 20),

                    // Menu Grid
                    GridView.count(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          crossAxisCount: 4,
                          mainAxisSpacing: 16,
                          crossAxisSpacing: 16,
                          childAspectRatio: 0.9,
                          children: [
                            _buildMenuCard(
                              'Kaldik',
                              Icons.calendar_today,
                              const Color(0xFF8B5CF6),
                            ),
                            _buildMenuCard(
                              'Rektor',
                              Icons.school,
                              const Color(0xFFEF4444),
                            ),
                            _buildMenuCard(
                              'Nilai',
                              Icons.grade,
                              const Color(0xFFF59E0B),
                            ),
                            _buildMenuCard(
                              'Presensi',
                              Icons.book,
                              const Color(0xFF10B981),
                            ),
                            _buildMenuCard(
                              'Cat PA',
                              Icons.edit_note,
                              const Color(0xFF8B5CF6),
                            ),
                            _buildMenuCard(
                              'Buku',
                              Icons.menu_book,
                              const Color(0xFF06B6D4),
                            ),
                            _buildMenuCard(
                              'LPBA',
                              Icons.folder,
                              const Color(0xFF8B5CF6),
                            ),
                            _buildMenuCard(
                              'Lainnya',
                              Icons.more_horiz,
                              const Color(0xFFEF4444),
                            ),
                          ],
                        )
                        .animate()
                        .fadeIn(duration: 600.ms, delay: 800.ms)
                        .slideY(
                          begin: 0.3,
                          end: 0,
                          duration: 600.ms,
                          delay: 800.ms,
                        ),
                  ],
                ),
              ),

              const SizedBox(height: 32),

              // Notifikasi Section
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Notifikasi',
                              style: Theme.of(context).textTheme.headlineSmall
                                  ?.copyWith(
                                    color: const Color(0xFF1F2937),
                                    fontWeight: FontWeight.bold,
                                  ),
                            ),
                            TextButton(
                              onPressed: () {
                                // TODO: Navigate to all notifications
                              },
                              child: Text(
                                'Lihat semua',
                                style: Theme.of(context).textTheme.bodyMedium
                                    ?.copyWith(
                                      color: const Color(0xFF3B82F6),
                                      fontWeight: FontWeight.w600,
                                    ),
                              ),
                            ),
                          ],
                        )
                        .animate()
                        .fadeIn(duration: 600.ms, delay: 1000.ms)
                        .slideX(
                          begin: -0.3,
                          end: 0,
                          duration: 600.ms,
                          delay: 1000.ms,
                        ),

                    const SizedBox(height: 16),

                    // Notification Card
                    Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: const Color(0xFFE5E7EB)),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.05),
                                blurRadius: 10,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: Row(
                            children: [
                              Container(
                                width: 4,
                                height: 60,
                                decoration: BoxDecoration(
                                  color: const Color(0xFF10B981),
                                  borderRadius: BorderRadius.circular(2),
                                ),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'Pendaftaran Program Magang',
                                      style: Theme.of(context)
                                          .textTheme
                                          .titleMedium
                                          ?.copyWith(
                                            color: const Color(0xFF1F2937),
                                            fontWeight: FontWeight.w600,
                                          ),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      'Mahasiswa bersertifikat di perusahaan BUMN batch 2',
                                      style: Theme.of(context)
                                          .textTheme
                                          .bodyMedium
                                          ?.copyWith(
                                            color: const Color(0xFF6B7280),
                                          ),
                                    ),
                                  ],
                                ),
                              ),
                              IconButton(
                                icon: const Icon(
                                  Icons.close,
                                  color: Color(0xFF9CA3AF),
                                  size: 20,
                                ),
                                onPressed: () {
                                  // TODO: Dismiss notification
                                },
                              ),
                            ],
                          ),
                        )
                        .animate()
                        .fadeIn(duration: 600.ms, delay: 1200.ms)
                        .slideX(
                          begin: 0.3,
                          end: 0,
                          duration: 600.ms,
                          delay: 1200.ms,
                        ),
                  ],
                ),
              ),

              const SizedBox(height: 100),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMenuCard(String title, IconData icon, Color color) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: color, size: 24),
          ),
          const SizedBox(height: 8),
          Text(
            title,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
              color: const Color(0xFF1F2937),
              fontWeight: FontWeight.w500,
              fontSize: 11,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}
