import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../providers/auth_provider.dart';
import '../../utils/app_localizations.dart';
import '../../utils/app_theme.dart';
import '../../widgets/modern_components.dart';
import '../../services/event_service.dart';
import '../../models/event.dart';
import '../events/event_detail_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  List<Event> _events = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadEvents();
  }

  Future<void> _loadEvents() async {
    try {
      final events = await EventService.getEvents(limit: 5);
      setState(() {
        _events = events;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);

    return Scaffold(
      backgroundColor: Colors.grey[50] ?? Colors.grey.shade50,
      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            children: [
              // Simple App Bar
              Padding(
                padding: const EdgeInsets.all(24),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppTheme.primaryColor,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: const Icon(
                        Icons.event_available,
                        color: Colors.white,
                        size: 24,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Text(
                      'EventHub',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: AppTheme.textPrimary,
                        fontSize: 18,
                      ),
                    ),
                    const Spacer(),
                    IconButton(
                      icon: const Icon(Icons.notifications_active_outlined),
                      onPressed: () {},
                      style: IconButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: AppTheme.primaryColor,
                      ),
                    ),
                  ],
                ),
              ),

              // Hero Section
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Container(
                  padding: const EdgeInsets.all(32),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(32),
                    boxShadow: [
                      BoxShadow(
                        color: AppTheme.primaryColor.withOpacity(0.2),
                        blurRadius: 40,
                        offset: const Offset(0, 15),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Halo, ${Provider.of<AuthProvider>(context).user?.name ?? 'User'}! 👋',
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.bold,
                          color: AppTheme.textPrimary,
                          fontSize: 24,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Temukan event menarik di sekitar Anda',
                        style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                          color: AppTheme.textSecondary,
                          fontSize: 16,
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 24),

              // Featured Events Section
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      mainAxisSize: MainAxisSize.max,
                      children: [
                        Flexible(
                          child: Text(
                            'Event Populer',
                            style: Theme.of(context).textTheme.titleLarge
                                ?.copyWith(
                                  fontWeight: FontWeight.bold,
                                  color: AppTheme.textPrimary,
                                  fontSize: 18,
                                ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Flexible(
                              child: ElevatedButton(
                                onPressed: () {},
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: AppTheme.primaryColor,
                                  foregroundColor: Colors.white,
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 12,
                                    vertical: 8,
                                  ),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                ),
                                child: const Text(
                                  'Lihat Semua',
                                  style: TextStyle(fontSize: 12),
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Flexible(
                              child: ElevatedButton(
                                onPressed: () {
                                  if (_events.isNotEmpty) {
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder: (context) => EventDetailScreen(
                                          event: _events.first,
                                        ),
                                      ),
                                    );
                                  }
                                },
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: AppTheme.accentColor,
                                  foregroundColor: Colors.white,
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 12,
                                    vertical: 8,
                                  ),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                ),
                                child: const Text(
                                  'Lihat Detail',
                                  style: TextStyle(fontSize: 12),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),
                    SizedBox(
                      height: 300,
                      child: _isLoading
                          ? const Center(child: CircularProgressIndicator())
                          : _events.isEmpty
                          ? const Center(
                              child: Text('Tidak ada event tersedia'),
                            )
                          : ListView.builder(
                              scrollDirection: Axis.horizontal,
                              itemCount: _events.length,
                              itemBuilder: (context, index) {
                                final event = _events[index];
                                return Container(
                                  width: 280,
                                  margin: const EdgeInsets.only(right: 16),
                                  decoration: BoxDecoration(
                                    color: Colors.white,
                                    borderRadius: BorderRadius.circular(20),
                                    boxShadow: [
                                      BoxShadow(
                                        color: Colors.black.withOpacity(0.08),
                                        blurRadius: 20,
                                        offset: const Offset(0, 8),
                                      ),
                                    ],
                                  ),
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Container(
                                        height: 120,
                                        decoration: BoxDecoration(
                                          gradient: LinearGradient(
                                            begin: Alignment.topLeft,
                                            end: Alignment.bottomRight,
                                            colors: [
                                              AppTheme.primaryColor,
                                              AppTheme.secondaryColor,
                                            ],
                                          ),
                                          borderRadius: const BorderRadius.only(
                                            topLeft: Radius.circular(20),
                                            topRight: Radius.circular(20),
                                          ),
                                        ),
                                        child: const Center(
                                          child: Icon(
                                            Icons.event_available,
                                            color: Colors.white,
                                            size: 48,
                                          ),
                                        ),
                                      ),
                                      Padding(
                                        padding: const EdgeInsets.all(16),
                                        child: Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              event.title,
                                              style: const TextStyle(
                                                fontWeight: FontWeight.bold,
                                                fontSize: 16,
                                              ),
                                              maxLines: 2,
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                            const SizedBox(height: 8),
                                            Text(
                                              event.formattedDate,
                                              style: TextStyle(
                                                color: AppTheme.textSecondary,
                                                fontSize: 12,
                                              ),
                                            ),
                                            const SizedBox(height: 8),
                                            Text(
                                              event.location,
                                              style: TextStyle(
                                                color: AppTheme.textSecondary,
                                                fontSize: 12,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ],
                                  ),
                                );
                              },
                            ),
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

  SliverAppBar _buildModernAppBar(BuildContext context, AppLocalizations l10n) {
    return SliverAppBar(
      backgroundColor: Colors.transparent,
      elevation: 0,
      expandedHeight: 80,
      floating: true,
      pinned: false,
      flexibleSpace: FlexibleSpaceBar(
        background: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppTheme.primaryColor,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: AppTheme.primaryColor.withOpacity(0.2),
                      blurRadius: 8,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: const Icon(
                  Icons.event_available,
                  color: Colors.white,
                  size: 24,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child:
                    Text(
                          'EventHub',
                          style: Theme.of(context).textTheme.titleMedium
                              ?.copyWith(
                                fontWeight: FontWeight.bold,
                                color: AppTheme.textPrimary,
                                fontSize: 18,
                                height: 1.0,
                              ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        )
                        .animate()
                        .fadeIn(duration: 800.ms, delay: 200.ms)
                        .slideX(
                          begin: -0.3,
                          end: 0,
                          duration: 800.ms,
                          delay: 200.ms,
                        ),
              ),
              AnimatedIconButton(
                    icon: Icons.notifications_active_outlined,
                    onPressed: () {},
                    backgroundColor: Colors.white,
                    iconColor: AppTheme.primaryColor,
                  )
                  .animate()
                  .fadeIn(duration: 800.ms, delay: 600.ms)
                  .slideX(begin: 0.3, end: 0, duration: 800.ms, delay: 600.ms),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildModernHeroSection(BuildContext context, AppLocalizations l10n) {
    return SliverToBoxAdapter(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: ModernCard(
          padding: const EdgeInsets.all(32),
          backgroundColor: Colors.white,
          borderRadius: BorderRadius.circular(32),
          boxShadow: [
            BoxShadow(
              color: AppTheme.primaryColor.withOpacity(0.2),
              blurRadius: 40,
              offset: const Offset(0, 15),
            ),
            BoxShadow(
              color: AppTheme.secondaryColor.withOpacity(0.1),
              blurRadius: 25,
              offset: const Offset(0, 8),
            ),
          ],
          child: Row(
            children: [
              Container(
                width: 70,
                height: 70,
                decoration: BoxDecoration(
                  color: AppTheme.primaryColor,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: AppTheme.primaryColor.withOpacity(0.2),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: const Icon(
                  Icons.person_outline,
                  color: Colors.white,
                  size: 32,
                ),
              ),
              const SizedBox(width: 20),
              Expanded(
                child: Consumer<AuthProvider>(
                  builder: (context, authProvider, child) {
                    return Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                              'Halo, ${authProvider.user?.name ?? 'User'}! 👋',
                              style: Theme.of(context).textTheme.titleLarge
                                  ?.copyWith(
                                    fontWeight: FontWeight.bold,
                                    color: AppTheme.textPrimary,
                                    fontSize: 18,
                                    height: 1.3,
                                  ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            )
                            .animate()
                            .fadeIn(duration: 800.ms, delay: 200.ms)
                            .slideY(
                              begin: 0.3,
                              end: 0,
                              duration: 800.ms,
                              delay: 200.ms,
                            ),
                        const SizedBox(height: 6),
                        Text(
                              'Selamat datang di EventHub',
                              style: Theme.of(context).textTheme.bodyMedium
                                  ?.copyWith(
                                    color: AppTheme.textSecondary,
                                    height: 1.3,
                                    fontSize: 13,
                                  ),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            )
                            .animate()
                            .fadeIn(duration: 800.ms, delay: 400.ms)
                            .slideY(
                              begin: 0.3,
                              end: 0,
                              duration: 800.ms,
                              delay: 400.ms,
                            ),
                      ],
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildModernStatsSection(BuildContext context) {
    return SliverToBoxAdapter(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        child: Row(
          children: [
            Expanded(
              child: _buildModernStatCard(
                context,
                '12',
                'Events',
                Icons.event_note_outlined,
                [AppTheme.primaryColor, AppTheme.secondaryColor],
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: _buildModernStatCard(
                context,
                '8',
                'Sertifikat',
                Icons.workspace_premium_outlined,
                [AppTheme.accentColor, AppTheme.primaryColor],
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: _buildModernStatCard(
                context,
                '95%',
                'Kehadiran',
                Icons.trending_up_outlined,
                [AppTheme.successColor, AppTheme.accentColor],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildModernStatCard(
    BuildContext context,
    String value,
    String label,
    IconData icon,
    List<Color> gradientColors,
  ) {
    return ModernCard(
      padding: const EdgeInsets.all(20),
      backgroundColor: Colors.white,
      borderRadius: BorderRadius.circular(24),
      border: Border.all(color: gradientColors[0].withOpacity(0.1), width: 1),
      boxShadow: [
        BoxShadow(
          color: gradientColors[0].withOpacity(0.15),
          blurRadius: 20,
          offset: const Offset(0, 8),
        ),
        BoxShadow(
          color: Colors.black.withOpacity(0.05),
          blurRadius: 10,
          offset: const Offset(0, 4),
        ),
      ],
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: gradientColors,
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: gradientColors[0].withOpacity(0.3),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Icon(icon, color: Colors.white, size: 24),
          ).animate().scale(duration: 600.ms, curve: Curves.elasticOut),
          const SizedBox(height: 12),
          Text(
                value,
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: AppTheme.textPrimary,
                  fontSize: 20,
                ),
              )
              .animate()
              .fadeIn(duration: 800.ms, delay: 200.ms)
              .slideY(begin: 0.3, end: 0, duration: 800.ms, delay: 200.ms),
          const SizedBox(height: 4),
          Text(
                label,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: AppTheme.textSecondary,
                  fontWeight: FontWeight.w500,
                  fontSize: 12,
                ),
              )
              .animate()
              .fadeIn(duration: 800.ms, delay: 400.ms)
              .slideY(begin: 0.3, end: 0, duration: 800.ms, delay: 400.ms),
        ],
      ),
    );
  }

  Widget _buildModernQuickActionsSection(
    BuildContext context,
    AppLocalizations l10n,
  ) {
    return SliverToBoxAdapter(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
                  'Aksi Cepat',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: AppTheme.textPrimary,
                    fontSize: 20,
                  ),
                )
                .animate()
                .fadeIn(duration: 800.ms, delay: 200.ms)
                .slideX(begin: -0.3, end: 0, duration: 800.ms, delay: 200.ms),
            const SizedBox(height: 20),
            GridView.count(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisCount: 2,
              childAspectRatio: 2.0,
              crossAxisSpacing: 16,
              mainAxisSpacing: 16,
              children: [
                _buildModernActionCard(
                  context,
                  'Cari Event',
                  Icons.search_outlined,
                  [AppTheme.primaryColor, AppTheme.secondaryColor],
                ),
                _buildModernActionCard(
                  context,
                  'Scan QR',
                  Icons.qr_code_scanner_outlined,
                  [AppTheme.accentColor, AppTheme.primaryColor],
                ),
                _buildModernActionCard(
                  context,
                  'Sertifikat',
                  Icons.workspace_premium_outlined,
                  [AppTheme.warningColor, AppTheme.successColor],
                ),
                _buildModernActionCard(
                  context,
                  'Kehadiran',
                  Icons.check_circle_outline,
                  [AppTheme.successColor, AppTheme.accentColor],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildModernActionCard(
    BuildContext context,
    String title,
    IconData icon,
    List<Color> gradientColors,
  ) {
    return Container(
      decoration: BoxDecoration(
        color: gradientColors[0],
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: gradientColors[0].withOpacity(0.2),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () {
            // TODO: Implement navigation for quick actions
          },
          borderRadius: BorderRadius.circular(20),
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.25),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(icon, color: Colors.white, size: 20),
                ),
                const SizedBox(height: 6),
                Flexible(
                  child: Text(
                    title,
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w600,
                      fontSize: 12,
                    ),
                    textAlign: TextAlign.center,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildModernFeaturedEventsSection(
    BuildContext context,
    AppLocalizations l10n,
  ) {
    return SliverToBoxAdapter(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              mainAxisSize: MainAxisSize.max,
              children: [
                Text(
                      'Event Populer',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: AppTheme.textPrimary,
                        fontSize: 20,
                      ),
                    )
                    .animate()
                    .fadeIn(duration: 800.ms, delay: 200.ms)
                    .slideX(
                      begin: -0.3,
                      end: 0,
                      duration: 800.ms,
                      delay: 200.ms,
                    ),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Expanded(
                      child:
                          GradientButton(
                                text: 'Lihat Semua',
                                onPressed: () {
                                  // TODO: Navigate to all events
                                },
                                gradientColors: [
                                  AppTheme.primaryColor,
                                  AppTheme.secondaryColor,
                                ],
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 16,
                                  vertical: 8,
                                ),
                              )
                              .animate()
                              .fadeIn(duration: 800.ms, delay: 400.ms)
                              .slideX(
                                begin: 0.3,
                                end: 0,
                                duration: 800.ms,
                                delay: 400.ms,
                              ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child:
                          GradientButton(
                                text: 'Lihat Detail',
                                onPressed: () {
                                  if (_events.isNotEmpty) {
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder: (context) => EventDetailScreen(
                                          event: _events.first,
                                        ),
                                      ),
                                    );
                                  } else {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      const SnackBar(
                                        content: Text(
                                          'Tidak ada event tersedia',
                                        ),
                                        backgroundColor: Colors.orange,
                                      ),
                                    );
                                  }
                                },
                                gradientColors: [
                                  AppTheme.accentColor,
                                  AppTheme.primaryColor,
                                ],
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 16,
                                  vertical: 8,
                                ),
                              )
                              .animate()
                              .fadeIn(duration: 800.ms, delay: 600.ms)
                              .slideX(
                                begin: 0.3,
                                end: 0,
                                duration: 800.ms,
                                delay: 600.ms,
                              ),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 20),
            SizedBox(
              height: 300,
              child: _isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : _events.isEmpty
                  ? const Center(child: Text('Tidak ada event tersedia'))
                  : ListView.builder(
                      scrollDirection: Axis.horizontal,
                      itemCount: _events.length,
                      itemBuilder: (context, index) {
                        return _buildModernEventCard(context, _events[index]);
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildModernEventCard(BuildContext context, Event event) {
    final gradients = [
      [AppTheme.primaryColor, AppTheme.secondaryColor],
      [AppTheme.accentColor, AppTheme.primaryColor],
      [AppTheme.successColor, AppTheme.accentColor],
      [AppTheme.warningColor, AppTheme.successColor],
      [AppTheme.secondaryColor, AppTheme.accentColor],
    ];

    return Container(
      width: 280,
      margin: const EdgeInsets.only(right: 20),
      child: ModernCard(
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.circular(28),
        boxShadow: [
          BoxShadow(
            color: AppTheme.primaryColor.withOpacity(0.1),
            blurRadius: 25,
            offset: const Offset(0, 10),
          ),
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 15,
            offset: const Offset(0, 5),
          ),
        ],
        border: Border.all(color: AppTheme.borderColor, width: 1),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              height: 140,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: gradients[event.id % gradients.length],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(28),
                  topRight: Radius.circular(28),
                ),
              ),
              child: Stack(
                children: [
                  Center(
                    child: Icon(Icons.event, color: Colors.white, size: 50),
                  ),
                  Positioned(
                    top: 16,
                    right: 16,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: Colors.white.withOpacity(0.3),
                        ),
                      ),
                      child: const Text(
                        'Tech',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    event.title,
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: AppTheme.textPrimary,
                      fontSize: 16,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Icon(
                        Icons.calendar_today_outlined,
                        size: 16,
                        color: AppTheme.textSecondary,
                      ),
                      const SizedBox(width: 6),
                      Text(
                        event.formattedDate,
                        style: TextStyle(
                          color: AppTheme.textSecondary,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      Icon(
                        Icons.location_on_outlined,
                        size: 16,
                        color: AppTheme.textSecondary,
                      ),
                      const SizedBox(width: 6),
                      Text(
                        event.location,
                        style: TextStyle(
                          color: AppTheme.textSecondary,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    '${event.currentParticipants}/${event.maxParticipants} Peserta',
                    style: TextStyle(
                      color: AppTheme.textSecondary,
                      fontSize: 12,
                    ),
                  ),
                  const SizedBox(height: 16),
                  StatusBadge(
                    text: event.status == 'active' ? 'Aktif' : 'Tidak Aktif',
                    backgroundColor: event.status == 'active'
                        ? AppTheme.successColor
                        : AppTheme.warningColor,
                    textColor: Colors.white,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
