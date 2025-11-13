<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sertifikat Kehadiran</title>
    <style>
        @page {
            margin: 0;
            size: A4 landscape;
        }
        
        body {
            margin: 0;
            padding: 0;
            font-family: 'Times New Roman', serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .certificate-container {
            width: 90%;
            max-width: 1000px;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            padding: 60px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        .certificate-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: 
                radial-gradient(circle at 20% 20%, rgba(102, 126, 234, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, rgba(118, 75, 162, 0.1) 0%, transparent 50%);
            pointer-events: none;
        }
        
        .certificate-header {
            margin-bottom: 40px;
            position: relative;
            z-index: 1;
        }
        
        .certificate-title {
            font-size: 48px;
            font-weight: bold;
            color: #667eea;
            margin: 0 0 20px 0;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
            letter-spacing: 2px;
        }
        
        .certificate-subtitle {
            font-size: 24px;
            color: #764ba2;
            margin: 0 0 30px 0;
            font-style: italic;
        }
        
        .certificate-divider {
            width: 200px;
            height: 4px;
            background: linear-gradient(90deg, #667eea, #764ba2);
            margin: 0 auto 40px auto;
            border-radius: 2px;
        }
        
        .certificate-content {
            margin: 40px 0;
            position: relative;
            z-index: 1;
        }
        
        .certificate-text {
            font-size: 20px;
            line-height: 1.8;
            color: #333;
            margin: 20px 0;
        }
        
        .participant-name {
            font-size: 36px;
            font-weight: bold;
            color: #667eea;
            margin: 30px 0;
            text-decoration: underline;
            text-decoration-color: #764ba2;
            text-underline-offset: 10px;
        }
        
        .event-details {
            background: #f8f9fa;
            padding: 30px;
            border-radius: 15px;
            margin: 40px 0;
            border-left: 5px solid #667eea;
        }
        
        .event-title {
            font-size: 28px;
            font-weight: bold;
            color: #333;
            margin: 0 0 20px 0;
        }
        
        .event-info {
            display: flex;
            justify-content: space-around;
            flex-wrap: wrap;
            margin: 20px 0;
        }
        
        .event-info-item {
            margin: 10px;
            text-align: center;
        }
        
        .event-info-label {
            font-size: 14px;
            color: #666;
            margin-bottom: 5px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .event-info-value {
            font-size: 18px;
            font-weight: bold;
            color: #333;
        }
        
        .certificate-footer {
            margin-top: 50px;
            display: flex;
            justify-content: space-between;
            align-items: end;
            position: relative;
            z-index: 1;
        }
        
        .signature-section {
            text-align: center;
            flex: 1;
        }
        
        .signature-line {
            width: 200px;
            height: 2px;
            background: #333;
            margin: 0 auto 10px auto;
        }
        
        .signature-label {
            font-size: 16px;
            color: #666;
            margin: 0;
        }
        
        .certificate-number {
            position: absolute;
            bottom: 20px;
            right: 20px;
            font-size: 12px;
            color: #999;
            font-family: 'Courier New', monospace;
        }
        
        .decorative-border {
            position: absolute;
            top: 20px;
            left: 20px;
            right: 20px;
            bottom: 20px;
            border: 3px solid #667eea;
            border-radius: 15px;
            pointer-events: none;
        }
        
        .corner-decoration {
            position: absolute;
            width: 60px;
            height: 60px;
            border: 3px solid #764ba2;
        }
        
        .corner-decoration.top-left {
            top: 20px;
            left: 20px;
            border-right: none;
            border-bottom: none;
        }
        
        .corner-decoration.top-right {
            top: 20px;
            right: 20px;
            border-left: none;
            border-bottom: none;
        }
        
        .corner-decoration.bottom-left {
            bottom: 20px;
            left: 20px;
            border-right: none;
            border-top: none;
        }
        
        .corner-decoration.bottom-right {
            bottom: 20px;
            right: 20px;
            border-left: none;
            border-top: none;
        }
    </style>
</head>
<body>
    <div class="certificate-container">
        <!-- Decorative Border -->
        <div class="decorative-border"></div>
        
        <!-- Corner Decorations -->
        <div class="corner-decoration top-left"></div>
        <div class="corner-decoration top-right"></div>
        <div class="corner-decoration bottom-left"></div>
        <div class="corner-decoration bottom-right"></div>
        
        <!-- Certificate Header -->
        <div class="certificate-header">
            <h1 class="certificate-title">SERTIFIKAT KEHADIRAN</h1>
            <p class="certificate-subtitle">Certificate of Attendance</p>
            <div class="certificate-divider"></div>
        </div>
        
        <!-- Certificate Content -->
        <div class="certificate-content">
            <p class="certificate-text">
                Diberikan kepada:
            </p>
            
            <div class="participant-name">
                {{ $participant->name }}
            </div>
            
            <p class="certificate-text">
                Atas kehadiran dan partisipasinya dalam:
            </p>
            
            <div class="event-details">
                <h2 class="event-title">{{ $event->title }}</h2>
                
                <div class="event-info">
                    <div class="event-info-item">
                        <div class="event-info-label">Tanggal</div>
                        <div class="event-info-value">{{ \Carbon\Carbon::parse($event->date)->format('d F Y') }}</div>
                    </div>
                    <div class="event-info-item">
                        <div class="event-info-label">Waktu</div>
                        <div class="event-info-value">
                            {{ \Carbon\Carbon::parse($event->start_time)->format('H:i') }} - 
                            {{ \Carbon\Carbon::parse($event->end_time)->format('H:i') }} WIB
                        </div>
                    </div>
                    <div class="event-info-item">
                        <div class="event-info-label">Lokasi</div>
                        <div class="event-info-value">{{ $event->location }}</div>
                    </div>
                </div>
            </div>
            
            <p class="certificate-text">
                Sertifikat ini diberikan sebagai bukti resmi kehadiran dan partisipasi dalam event tersebut.
            </p>
        </div>
        
        <!-- Certificate Footer -->
        <div class="certificate-footer">
            <div class="signature-section">
                <div class="signature-line"></div>
                <p class="signature-label">Penyelenggara Event</p>
            </div>
            
            <div class="signature-section">
                <div class="signature-line"></div>
                <p class="signature-label">Tanggal Terbit</p>
                <p style="margin: 5px 0 0 0; font-weight: bold; color: #333;">
                    {{ \Carbon\Carbon::now()->format('d F Y') }}
                </p>
            </div>
        </div>
        
        <!-- Certificate Number -->
        <div class="certificate-number">
            No: {{ $certificateNumber }}
        </div>
    </div>
</body>
</html>