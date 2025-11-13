import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../utils/app_localizations.dart';
import '../../utils/app_theme.dart';
import '../../models/event.dart';
import '../../services/event_service.dart';
import 'event_detail_screen.dart';

class EventsScreen extends StatefulWidget {
  const EventsScreen({super.key});

  @override
  State<EventsScreen> createState() => _EventsScreenState();
}

class _EventsScreenState extends State<EventsScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _selectedCategory = 'Semua';
  List<Event> _events = [];
  List<Event> _filteredEvents = [];
  bool _isLoading = true;
  List<String> _categories = ['Semua'];

  @override
  void initState() {
    super.initState();
    _loadEvents();
  }

  Future<void> _loadEvents() async {
    try {
      setState(() => _isLoading = true);
      print('EventsScreen: Loading events...');
      final events = await EventService.getEvents(limit: 50);
      print('EventsScreen: Loaded ${events.length} events');

      // Extract unique categories from events
      final Set<String> uniqueCategories = {'Semua'};
      for (var event in events) {
        if (event.category.isNotEmpty) {
          uniqueCategories.add(event.category);
        }
      }

      setState(() {
        _events = events;
        _categories = uniqueCategories.toList();
        _filterEvents();
        _isLoading = false;
      });
      print('EventsScreen: Categories: $_categories');
      print('EventsScreen: Filtered ${_filteredEvents.length} events');
    } catch (e) {
      print('EventsScreen: Error loading events: $e');
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Gagal memuat event: ${e.toString()}'),
            backgroundColor: Colors.red,
            duration: const Duration(seconds: 5),
          ),
        );
      }
    }
  }

  void _filterEvents() {
    List<Event> filtered = _events;

    // Filter by category
    if (_selectedCategory != 'Semua') {
      filtered = filtered
          .where((event) => event.category == _selectedCategory)
          .toList();
    }

    // Filter by search
    if (_searchController.text.isNotEmpty) {
      final query = _searchController.text.toLowerCase();
      filtered = filtered
          .where(
            (event) =>
                event.title.toLowerCase().contains(query) ||
                event.description.toLowerCase().contains(query),
          )
          .toList();
    }

    setState(() => _filteredEvents = filtered);
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      body: RefreshIndicator(
        onRefresh: _loadEvents,
        child: CustomScrollView(
          slivers: [
            // Modern App Bar dengan greeting
            _buildModernAppBar(context),

            // Search Section dengan dark background
            SliverToBoxAdapter(
              child: Container(
                margin: const EdgeInsets.fromLTRB(20, 20, 20, 0),
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [Color(0xFF2C3E50), Color(0xFF34495E)],
                  ),
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.1),
                      blurRadius: 20,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Where do you want to go?',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 16),
                    Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.1),
                            blurRadius: 10,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: TextField(
                        controller: _searchController,
                        onChanged: (value) => _filterEvents(),
                        decoration: InputDecoration(
                          hintText: 'Search your destination point!',
                          hintStyle: TextStyle(
                            color: Colors.grey[400] ?? Colors.grey,
                          ),
                          prefixIcon: Icon(
                            Icons.search,
                            color: AppTheme.primaryColor,
                            size: 24,
                          ),
                          suffixIcon: _searchController.text.isNotEmpty
                              ? IconButton(
                                  icon: Icon(
                                    Icons.clear,
                                    color: AppTheme.textSecondary,
                                  ),
                                  onPressed: () {
                                    _searchController.clear();
                                    _filterEvents();
                                  },
                                )
                              : null,
                          border: InputBorder.none,
                          contentPadding: const EdgeInsets.symmetric(
                            horizontal: 20,
                            vertical: 16,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ).animate().fadeIn(duration: 400.ms).slideY(begin: 0.2),
            ),

            // Category Filter dengan modern design
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 20, 20, 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Event Categories',
                      style: TextStyle(
                        color: AppTheme.textPrimary,
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 12),
                    SizedBox(
                      height: 50,
                      child: ListView.builder(
                        scrollDirection: Axis.horizontal,
                        itemCount: _categories.length,
                        itemBuilder: (context, index) {
                          final category = _categories[index];
                          final isSelected = _selectedCategory == category;

                          return GestureDetector(
                            onTap: () {
                              setState(() => _selectedCategory = category);
                              _filterEvents();
                            },
                            child:
                                Container(
                                      margin: const EdgeInsets.only(right: 12),
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 20,
                                        vertical: 12,
                                      ),
                                      decoration: BoxDecoration(
                                        color: isSelected
                                            ? AppTheme.primaryColor
                                            : Colors.white,
                                        borderRadius: BorderRadius.circular(16),
                                        border: Border.all(
                                          color: isSelected
                                              ? AppTheme.primaryColor
                                              : const Color(0xFFE0E0E0),
                                          width: 1.5,
                                        ),
                                        boxShadow: [
                                          BoxShadow(
                                            color: Colors.black.withOpacity(
                                              0.05,
                                            ),
                                            blurRadius: 8,
                                            offset: const Offset(0, 2),
                                          ),
                                        ],
                                      ),
                                      child: Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          Icon(
                                            _getCategoryIcon(category),
                                            size: 18,
                                            color: isSelected
                                                ? Colors.white
                                                : AppTheme.textSecondary,
                                          ),
                                          const SizedBox(width: 8),
                                          Text(
                                            category,
                                            style: TextStyle(
                                              color: isSelected
                                                  ? Colors.white
                                                  : AppTheme.textSecondary,
                                              fontWeight: isSelected
                                                  ? FontWeight.w600
                                                  : FontWeight.w500,
                                              fontSize: 14,
                                            ),
                                          ),
                                        ],
                                      ),
                                    )
                                    .animate()
                                    .fadeIn(
                                      duration: 400.ms,
                                      delay: (index * 50).ms,
                                    )
                                    .slideX(begin: 0.2),
                          );
                        },
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Events List Header
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 0, 20, 16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Top Events',
                      style: TextStyle(
                        color: AppTheme.textPrimary,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      'Explore →',
                      style: TextStyle(
                        color: AppTheme.primaryColor,
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Events List or Loading
            _isLoading
                ? SliverFillRemaining(
                    child: Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          CircularProgressIndicator(
                            color: AppTheme.primaryColor,
                          ),
                          const SizedBox(height: 16),
                          Text(
                            'Memuat event...',
                            style: TextStyle(
                              color: AppTheme.textSecondary,
                              fontSize: 14,
                            ),
                          ),
                        ],
                      ),
                    ),
                  )
                : _filteredEvents.isEmpty
                ? SliverFillRemaining(
                    child: Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(24),
                            decoration: BoxDecoration(
                              color: Colors.grey[100] ?? Colors.grey,
                              shape: BoxShape.circle,
                            ),
                            child: Icon(
                              Icons.event_busy,
                              size: 64,
                              color: Colors.grey[400] ?? Colors.grey,
                            ),
                          ),
                          const SizedBox(height: 24),
                          Text(
                            'Tidak ada event ditemukan',
                            style: TextStyle(
                              color: AppTheme.textPrimary,
                              fontSize: 18,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Coba kata kunci atau kategori lain',
                            style: TextStyle(
                              color: AppTheme.textSecondary,
                              fontSize: 14,
                            ),
                          ),
                        ],
                      ).animate().fadeIn(duration: 600.ms).scale(),
                    ),
                  )
                : SliverPadding(
                    padding: const EdgeInsets.fromLTRB(20, 0, 20, 100),
                    sliver: SliverList(
                      delegate: SliverChildBuilderDelegate((context, index) {
                        final event = _filteredEvents[index];
                        return _buildModernEventCard(context, event, index);
                      }, childCount: _filteredEvents.length),
                    ),
                  ),
          ],
        ),
      ),
    );
  }

  Widget _buildModernAppBar(BuildContext context) {
    return SliverAppBar(
      expandedHeight: 100,
      floating: false,
      pinned: true,
      backgroundColor: const Color(0xFFF8F9FA),
      elevation: 0,
      flexibleSpace: FlexibleSpaceBar(
        titlePadding: const EdgeInsets.only(left: 20, bottom: 16),
        background: Container(
          decoration: const BoxDecoration(color: Color(0xFFF8F9FA)),
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 50, 20, 16),
            child: Row(
              children: [
                // Profile Picture
                Container(
                  width: 50,
                  height: 50,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: LinearGradient(
                      colors: [AppTheme.primaryColor, AppTheme.secondaryColor],
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: AppTheme.primaryColor.withOpacity(0.3),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: const Icon(
                    Icons.person,
                    color: Colors.white,
                    size: 24,
                  ),
                ),
                const SizedBox(width: 12),
                // Greeting
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        'Hai, User!',
                        style: TextStyle(
                          color: AppTheme.textPrimary,
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        'Temukan event menarik',
                        style: TextStyle(
                          color: AppTheme.textSecondary,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
                // Notification Icon
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.05),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Icon(
                    Icons.notifications_outlined,
                    color: AppTheme.textSecondary,
                    size: 20,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  IconData _getCategoryIcon(String category) {
    switch (category.toLowerCase()) {
      case 'semua':
        return Icons.apps;
      case 'teknologi':
        return Icons.computer;
      case 'bisnis':
        return Icons.business;
      case 'pendidikan':
        return Icons.school;
      case 'kesehatan':
        return Icons.health_and_safety;
      case 'seni':
        return Icons.palette;
      case 'umum':
        return Icons.event;
      case 'olahraga':
        return Icons.sports;
      case 'musik':
        return Icons.music_note;
      case 'kuliner':
        return Icons.restaurant;
      default:
        return Icons.category;
    }
  }

  Widget _buildModernEventCard(BuildContext context, Event event, int index) {
    // Warna status
    Color statusColor;
    String statusText;
    switch (event.status.toLowerCase()) {
      case 'open':
        statusColor = Colors.green;
        statusText = 'Terbuka';
        break;
      case 'full':
        statusColor = Colors.orange;
        statusText = 'Penuh';
        break;
      case 'closed':
        statusColor = Colors.red;
        statusText = 'Ditutup';
        break;
      default:
        statusColor = Colors.grey;
        statusText = event.status;
    }

    return Container(
          margin: const EdgeInsets.only(bottom: 16),
          constraints: const BoxConstraints(minHeight: 160, maxHeight: 200),
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
          child: Row(
            mainAxisSize: MainAxisSize.max,
            children: [
              // Event Image Section
              ClipRRect(
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(20),
                  bottomLeft: Radius.circular(20),
                ),
                child: Stack(
                  children: [
                    Container(
                      width: 140,
                      height: 160,
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                          colors: [
                            AppTheme.primaryColor,
                            AppTheme.secondaryColor,
                          ],
                        ),
                      ),
                      child: Stack(
                        children: [
                          // Decorative circles pattern
                          Positioned(
                            top: -20,
                            right: -20,
                            child: Container(
                              width: 80,
                              height: 80,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: Colors.white.withOpacity(0.1),
                              ),
                            ),
                          ),
                          Positioned(
                            bottom: -30,
                            left: -30,
                            child: Container(
                              width: 100,
                              height: 100,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: Colors.white.withOpacity(0.08),
                              ),
                            ),
                          ),
                          // Center icon
                          Center(
                            child: Container(
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: Colors.white.withOpacity(0.2),
                                border: Border.all(
                                  color: Colors.white.withOpacity(0.3),
                                  width: 2,
                                ),
                              ),
                              child: Icon(
                                Icons.event_available,
                                size: 32,
                                color: Colors.white,
                              ),
                            ),
                          ),
                          // Free badge
                          Positioned(
                            bottom: 8,
                            right: 8,
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 4,
                              ),
                              decoration: BoxDecoration(
                                color: Colors.green,
                                borderRadius: BorderRadius.circular(12),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withOpacity(0.2),
                                    blurRadius: 6,
                                    offset: const Offset(0, 2),
                                  ),
                                ],
                              ),
                              child: Text(
                                'GRATIS',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 9,
                                  fontWeight: FontWeight.bold,
                                  letterSpacing: 0.5,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    // Status badge
                    Positioned(
                      top: 8,
                      right: 8,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: statusColor,
                          borderRadius: BorderRadius.circular(8),
                          boxShadow: [
                            BoxShadow(
                              color: statusColor.withOpacity(0.4),
                              blurRadius: 6,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Text(
                          statusText,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 9,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              // Event Details Section
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.max,
                    children: [
                      // Title
                      Text(
                        event.title,
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: AppTheme.textPrimary,
                          fontSize: 16,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 4),

                      // Category
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 2,
                        ),
                        decoration: BoxDecoration(
                          color: AppTheme.primaryColor.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          event.category,
                          style: TextStyle(
                            color: AppTheme.primaryColor,
                            fontSize: 10,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                      const SizedBox(height: 8),

                      // Description
                      Text(
                        event.description,
                        style: TextStyle(
                          color: AppTheme.textSecondary,
                          fontSize: 12,
                          height: 1.3,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 12),

                      // Event Info
                      Row(
                        mainAxisSize: MainAxisSize.max,
                        children: [
                          Flexible(
                            flex: 1,
                            child: _buildCompactInfoItem(
                              Icons.calendar_today,
                              event.formattedDate,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Flexible(
                            flex: 1,
                            child: _buildCompactInfoItem(
                              Icons.location_on_outlined,
                              event.location,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),

                      Row(
                        mainAxisSize: MainAxisSize.max,
                        children: [
                          Flexible(
                            flex: 1,
                            child: _buildCompactInfoItem(
                              Icons.access_time,
                              event.formattedStartTime,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Flexible(
                            flex: 1,
                            child: _buildCompactInfoItem(
                              Icons.people_outline,
                              '${event.currentParticipants}/${event.maxParticipants}',
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),

                      // Action Button
                      Row(
                        mainAxisSize: MainAxisSize.max,
                        children: [
                          Flexible(
                            flex: 3,
                            child: ElevatedButton(
                              onPressed: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (context) =>
                                        EventDetailScreen(event: event),
                                  ),
                                );
                              },
                              style: ElevatedButton.styleFrom(
                                backgroundColor:
                                    event.status.toLowerCase() == 'open'
                                    ? AppTheme.primaryColor
                                    : Colors.grey,
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(
                                  vertical: 8,
                                ),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                elevation: 0,
                              ),
                              child: Text(
                                event.status.toLowerCase() == 'open'
                                    ? 'Daftar'
                                    : statusText,
                                style: const TextStyle(
                                  fontWeight: FontWeight.w600,
                                  fontSize: 12,
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Container(
                            width: 40,
                            height: 40,
                            decoration: BoxDecoration(
                              color: Colors.grey[100] ?? Colors.grey,
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: IconButton(
                              icon: Icon(
                                Icons.bookmark_border,
                                color: AppTheme.textSecondary,
                                size: 18,
                              ),
                              onPressed: () {
                                // TODO: Bookmark functionality
                              },
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        )
        .animate()
        .fadeIn(duration: 400.ms, delay: (index * 100).ms)
        .slideX(begin: 0.2, end: 0);
  }

  Widget _buildCompactInfoItem(IconData icon, String text) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 12, color: AppTheme.textSecondary),
        const SizedBox(width: 4),
        Flexible(
          child: Text(
            text,
            style: TextStyle(
              color: AppTheme.textSecondary,
              fontSize: 10,
              fontWeight: FontWeight.w500,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ],
    );
  }
}
