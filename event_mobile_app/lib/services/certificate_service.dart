import 'dart:io';
import 'package:path_provider/path_provider.dart';
import 'package:dio/dio.dart';
import '../models/certificate.dart';
import 'api_service.dart';

class CertificateService {
  static Future<List<Certificate>> getUserCertificates() async {
    try {
      final response = await ApiService.getUserCertificates();
      
      if (response['success'] == true) {
        final List<dynamic> certificatesData = response['data'];
        return certificatesData.map((json) => Certificate.fromJson(json)).toList();
      }
      return [];
    } catch (e) {
      print('Get user certificates error: $e');
      return [];
    }
  }

  static Future<String?> downloadCertificate(int certificateId) async {
    try {
      final response = await ApiService.downloadCertificate(certificateId);
      
      if (response['success'] == true) {
        final downloadUrl = response['data']['download_url'];
        final fileName = response['data']['file_name'];
        
        // Download file
        final dio = Dio();
        final directory = await getApplicationDocumentsDirectory();
        final filePath = '${directory.path}/certificates/$fileName';
        
        // Create certificates directory if it doesn't exist
        final certificatesDir = Directory('${directory.path}/certificates');
        if (!await certificatesDir.exists()) {
          await certificatesDir.create(recursive: true);
        }
        
        await dio.download(downloadUrl, filePath);
        return filePath;
      }
      return null;
    } catch (e) {
      print('Download certificate error: $e');
      return null;
    }
  }

  static Future<bool> verifyCertificate(String certificateNumber) async {
    try {
      // This would typically call an API to verify the certificate
      // For now, we'll just return true if the certificate number is not empty
      return certificateNumber.isNotEmpty;
    } catch (e) {
      print('Verify certificate error: $e');
      return false;
    }
  }

  static List<Certificate> filterCertificatesByStatus(List<Certificate> certificates, String status) {
    switch (status) {
      case 'active':
        return certificates.where((cert) => cert.isActive).toList();
      case 'expired':
        return certificates.where((cert) => cert.isExpired).toList();
      case 'revoked':
        return certificates.where((cert) => cert.isRevoked).toList();
      default:
        return certificates;
    }
  }

  static List<Certificate> sortCertificatesByDate(List<Certificate> certificates, {bool ascending = true}) {
    certificates.sort((a, b) {
      if (ascending) {
        return a.issuedAt.compareTo(b.issuedAt);
      } else {
        return b.issuedAt.compareTo(a.issuedAt);
      }
    });
    return certificates;
  }

  static Map<String, int> getCertificateStats(List<Certificate> certificates) {
    int active = 0;
    int expired = 0;
    int revoked = 0;
    
    for (var cert in certificates) {
      if (cert.isActive) active++;
      if (cert.isExpired) expired++;
      if (cert.isRevoked) revoked++;
    }
    
    return {
      'active': active,
      'expired': expired,
      'revoked': revoked,
      'total': certificates.length,
    };
  }

  static Future<bool> deleteCertificateFile(String filePath) async {
    try {
      final file = File(filePath);
      if (await file.exists()) {
        await file.delete();
        return true;
      }
      return false;
    } catch (e) {
      print('Delete certificate file error: $e');
      return false;
    }
  }

  static Future<List<String>> getCertificateFiles() async {
    try {
      final directory = await getApplicationDocumentsDirectory();
      final certificatesDir = Directory('${directory.path}/certificates');
      
      if (await certificatesDir.exists()) {
        final files = await certificatesDir.list().toList();
        return files
            .where((file) => file is File)
            .map((file) => file.path)
            .toList();
      }
      return [];
    } catch (e) {
      print('Get certificate files error: $e');
      return [];
    }
  }
}
