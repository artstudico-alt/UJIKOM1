<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sertifikat Event</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .container {
            background: white;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #667eea;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #667eea;
            margin: 0;
            font-size: 28px;
        }
        .header p {
            color: #666;
            margin: 10px 0 0 0;
            font-size: 16px;
        }
        .content {
            margin-bottom: 30px;
        }
        .greeting {
            font-size: 18px;
            margin-bottom: 20px;
            color: #333;
        }
        .event-info {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #667eea;
        }
        .event-info h3 {
            color: #667eea;
            margin: 0 0 15px 0;
            font-size: 20px;
        }
        .info-row {
            display: flex;
            margin-bottom: 10px;
            align-items: center;
        }
        .info-label {
            font-weight: bold;
            width: 120px;
            color: #555;
        }
        .info-value {
            color: #333;
            flex: 1;
        }
        .certificate-info {
            background: #e8f4fd;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border: 1px solid #b3d9ff;
        }
        .certificate-info h3 {
            color: #1976d2;
            margin: 0 0 15px 0;
            font-size: 18px;
        }
        .certificate-number {
            font-family: 'Courier New', monospace;
            background: white;
            padding: 10px;
            border-radius: 4px;
            border: 1px solid #ddd;
            font-size: 14px;
            color: #333;
        }
        .message {
            margin: 20px 0;
            font-size: 16px;
            line-height: 1.8;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 14px;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 25px;
            font-weight: bold;
            margin: 20px 0;
            transition: transform 0.2s;
        }
        .button:hover {
            transform: translateY(-2px);
        }
        .highlight {
            color: #667eea;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Sertifikat Event</h1>
            <p>Selamat! Sertifikat Anda telah siap</p>
        </div>

        <div class="content">
            <div class="greeting">
                Halo <span class="highlight">{{ $participant->name }}</span>,
            </div>

            <div class="message">
                Kami dengan senang hati menginformasikan bahwa sertifikat kehadiran Anda untuk event berikut telah berhasil digenerate dan dilampirkan dalam email ini.
            </div>

            <div class="event-info">
                <h3>📅 Informasi Event</h3>
                <div class="info-row">
                    <div class="info-label">Event:</div>
                    <div class="info-value"><strong>{{ $event->title }}</strong></div>
                </div>
                <div class="info-row">
                    <div class="info-label">Tanggal:</div>
                    <div class="info-value">{{ \Carbon\Carbon::parse($event->date)->format('d F Y') }}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Lokasi:</div>
                    <div class="info-value">{{ $event->location }}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Waktu:</div>
                    <div class="info-value">
                        {{ \Carbon\Carbon::parse($event->start_time)->format('H:i') }} - 
                        {{ \Carbon\Carbon::parse($event->end_time)->format('H:i') }} WIB
                    </div>
                </div>
            </div>

            <div class="certificate-info">
                <h3>📜 Informasi Sertifikat</h3>
                <div class="info-row">
                    <div class="info-label">Nomor Sertifikat:</div>
                    <div class="info-value">
                        <div class="certificate-number">{{ $certificate->certificate_number }}</div>
                    </div>
                </div>
                <div class="info-row">
                    <div class="info-label">Tanggal Terbit:</div>
                    <div class="info-value">{{ \Carbon\Carbon::parse($certificate->issued_at)->format('d F Y, H:i') }} WIB</div>
                </div>
            </div>

            <div class="message">
                <p>Sertifikat ini merupakan bukti resmi kehadiran Anda pada event <strong>{{ $event->title }}</strong>. Anda dapat menyimpan file PDF yang dilampirkan sebagai arsip pribadi.</p>
                
                <p>Jika Anda mengalami kesulitan dalam mengakses atau mendownload sertifikat, silakan hubungi tim support kami.</p>
            </div>

            <div style="text-align: center;">
                <a href="{{ $certificate->certificate_path }}" class="button" target="_blank">
                    📥 Download Sertifikat
                </a>
            </div>
        </div>

        <div class="footer">
            <p><strong>EventHub Management System</strong></p>
            <p>Terima kasih telah berpartisipasi dalam event kami!</p>
            <p style="font-size: 12px; color: #999;">
                Email ini dikirim secara otomatis. Mohon tidak membalas email ini.
            </p>
        </div>
    </div>
</body>
</html>
