<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Token Daftar Hadir</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .content {
            background: #f8f9fa;
            padding: 30px;
            border-radius: 0 0 10px 10px;
        }
        .token-box {
            background: white;
            border: 2px solid #667eea;
            border-radius: 10px;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
        }
        .token {
            font-size: 32px;
            font-weight: bold;
            color: #667eea;
            letter-spacing: 3px;
            font-family: 'Courier New', monospace;
        }
        .event-info {
            background: white;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .info-item {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
        }
        .info-label {
            font-weight: bold;
            color: #555;
        }
        .info-value {
            color: #333;
        }
        .instructions {
            background: #e3f2fd;
            border-left: 4px solid #2196f3;
            padding: 15px;
            margin: 20px 0;
        }
        .warning {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎫 Token Daftar Hadir</h1>
        <p>Selamat! Anda telah berhasil mendaftar untuk mengikuti kegiatan</p>
    </div>

    <div class="content">
        <h2>Halo, {{ $participant->name }}!</h2>
        
        <p>Terima kasih telah mendaftar untuk mengikuti kegiatan <strong>{{ $event->title }}</strong>. 
        Berikut adalah token daftar hadir Anda:</p>

        <div class="token-box">
            <h3>🔑 Token Daftar Hadir Anda</h3>
            <div class="token">{{ $token }}</div>
            <p><small>Simpan token ini dengan baik!</small></p>
        </div>

        <div class="event-info">
            <h3>📅 Informasi Kegiatan</h3>
            <div class="info-item">
                <span class="info-label">Nama Kegiatan:</span>
                <span class="info-value">{{ $event->title }}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Tanggal:</span>
                <span class="info-value">{{ \Carbon\Carbon::parse($event->date)->format('d F Y') }}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Waktu:</span>
                <span class="info-value">{{ $event->start_time }} - {{ $event->end_time }}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Lokasi:</span>
                <span class="info-value">{{ $event->location }}</span>
            </div>
        </div>

        <div class="instructions">
            <h3>📝 Cara Menggunakan Token</h3>
            <ol>
                <li><strong>Datang ke lokasi kegiatan</strong> pada tanggal dan waktu yang telah ditentukan</li>
                <li><strong>Buka halaman daftar hadir</strong> di website atau aplikasi</li>
                <li><strong>Masukkan token</strong> yang Anda terima melalui email ini</li>
                <li><strong>Klik "Daftar Hadir"</strong> untuk mengkonfirmasi kehadiran Anda</li>
                <li><strong>Setelah daftar hadir berhasil</strong>, Anda dapat mengunduh sertifikat</li>
            </ol>
        </div>

        <div class="warning">
            <h4>⚠️ Penting!</h4>
            <ul>
                <li>Token ini berlaku selama <strong>7 hari</strong> sejak diterima</li>
                <li>Token hanya dapat digunakan <strong>sekali</strong> untuk daftar hadir</li>
                <li>Jangan bagikan token ini kepada orang lain</li>
                <li>Pastikan Anda hadir pada waktu yang telah ditentukan</li>
            </ul>
        </div>

        <div class="footer">
            <p>Jika Anda memiliki pertanyaan, silakan hubungi panitia melalui email atau kontak yang tersedia.</p>
            <p><strong>Terima kasih dan selamat mengikuti kegiatan!</strong></p>
        </div>
    </div>
</body>
</html>
