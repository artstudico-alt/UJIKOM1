import 'package:flutter/material.dart';
import '../../utils/app_localizations.dart';

class AttendanceScreen extends StatefulWidget {
  const AttendanceScreen({super.key});

  @override
  State<AttendanceScreen> createState() => _AttendanceScreenState();
}

class _AttendanceScreenState extends State<AttendanceScreen> {
  final List<Map<String, dynamic>> _attendanceRecords = [
    {
      'event': 'Tech Conference 2024',
      'date': '25 Nov 2024',
      'checkIn': '08:45',
      'checkOut': '17:30',
      'duration': '8 jam 45 menit',
      'status': 'present',
      'location': 'Jakarta Convention Center',
    },
    {
      'event': 'UI/UX Workshop',
      'date': '30 Nov 2024',
      'checkIn': '09:15',
      'checkOut': '16:00',
      'duration': '6 jam 45 menit',
      'status': 'present',
      'location': 'Online',
    },
    {
      'event': 'Mobile Development Bootcamp',
      'date': '5 Des 2024',
      'checkIn': '08:30',
      'checkOut': '18:15',
      'duration': '9 jam 45 menit',
      'status': 'present',
      'location': 'Bandung Tech Hub',
    },
    {
      'event': 'Data Science Summit',
      'date': '12 Des 2024',
      'checkIn': '07:45',
      'checkOut': '20:00',
      'duration': '12 jam 15 menit',
      'status': 'present',
      'location': 'Surabaya',
    },
    {
      'event': 'AI & Machine Learning',
      'date': '20 Des 2024',
      'checkIn': '08:00',
      'checkOut': '17:00',
      'duration': '9 jam',
      'status': 'present',
      'location': 'Yogyakarta',
    },
    {
      'event': 'Business Strategy Workshop',
      'date': '28 Des 2024',
      'checkIn': '09:30',
      'checkOut': '16:30',
      'duration': '7 jam',
      'status': 'present',
      'location': 'Jakarta',
    },
  ];

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);

    return Scaffold(
      backgroundColor: Colors.green.shade50,
      body: SafeArea(
        child: Column(
          children: [
            // Header
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [Colors.white, Colors.green.shade50],
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.green.withOpacity(0.1),
                    blurRadius: 20,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: Row(
                children: [
                  Text(
                    'Kehadiran',
                    style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: Colors.grey.shade800,
                    ),
                  ),
                  const Spacer(),
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: Colors.green.shade50,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(
                      Icons.check_circle,
                      color: Colors.green.shade600,
                      size: 20,
                    ),
                  ),
                ],
              ),
            ),

            // Stats Cards
            Padding(
              padding: const EdgeInsets.all(20),
              child: Row(
                children: [
                  Expanded(
                    child: _buildStatCard(
                      context,
                      '${_attendanceRecords.length}',
                      'Total Event',
                      Icons.event_outlined,
                      Colors.blue,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: _buildStatCard(
                      context,
                      '100%',
                      'Kehadiran',
                      Icons.check_circle_outline,
                      Colors.green,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: _buildStatCard(
                      context,
                      '54h',
                      'Total Jam',
                      Icons.access_time_outlined,
                      Colors.orange,
                    ),
                  ),
                ],
              ),
            ),

            // QR Scanner Button
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Colors.green.shade500, Colors.teal.shade500],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.green.withOpacity(0.4),
                      blurRadius: 20,
                      offset: const Offset(0, 8),
                    ),
                    BoxShadow(
                      color: Colors.teal.withOpacity(0.2),
                      blurRadius: 15,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    Icon(Icons.qr_code_scanner, color: Colors.white, size: 32),
                    const SizedBox(height: 12),
                    Text(
                      'Scan QR untuk Check-in',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Tap untuk membuka scanner',
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.8),
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 20),

            // Attendance Records
            Expanded(
              child: ListView.builder(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                itemCount: _attendanceRecords.length,
                itemBuilder: (context, index) {
                  final record = _attendanceRecords[index];
                  return _buildAttendanceCard(context, record);
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatCard(
    BuildContext context,
    String value,
    String label,
    IconData icon,
    Color color,
  ) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.bold,
              color: Colors.grey.shade800,
            ),
          ),
          Text(
            label,
            style: Theme.of(
              context,
            ).textTheme.bodySmall?.copyWith(color: Colors.grey.shade500),
          ),
        ],
      ),
    );
  }

  Widget _buildAttendanceCard(
    BuildContext context,
    Map<String, dynamic> record,
  ) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.green.shade50,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(
                    Icons.check_circle,
                    color: Colors.green.shade600,
                    size: 20,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        record['event'],
                        style: Theme.of(context).textTheme.titleMedium
                            ?.copyWith(
                              fontWeight: FontWeight.bold,
                              color: Colors.grey.shade800,
                            ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        record['date'],
                        style: TextStyle(
                          color: Colors.grey.shade500,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.green.shade50,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.green.shade200),
                  ),
                  child: Text(
                    'Hadir',
                    style: TextStyle(
                      color: Colors.green.shade600,
                      fontSize: 10,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Time Details
            Row(
              children: [
                Expanded(
                  child: _buildTimeInfo(
                    'Check-in',
                    record['checkIn'],
                    Icons.login,
                    Colors.blue,
                  ),
                ),
                Expanded(
                  child: _buildTimeInfo(
                    'Check-out',
                    record['checkOut'],
                    Icons.logout,
                    Colors.orange,
                  ),
                ),
                Expanded(
                  child: _buildTimeInfo(
                    'Durasi',
                    record['duration'],
                    Icons.access_time,
                    Colors.green,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Location
            Row(
              children: [
                Icon(
                  Icons.location_on_outlined,
                  size: 14,
                  color: Colors.grey.shade500,
                ),
                const SizedBox(width: 4),
                Text(
                  record['location'],
                  style: TextStyle(color: Colors.grey.shade500, fontSize: 12),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTimeInfo(String label, String time, IconData icon, Color color) {
    return Column(
      children: [
        Icon(icon, color: color, size: 16),
        const SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(color: Colors.grey.shade500, fontSize: 10),
        ),
        Text(
          time,
          style: TextStyle(
            color: Colors.grey.shade800,
            fontSize: 12,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }
}
