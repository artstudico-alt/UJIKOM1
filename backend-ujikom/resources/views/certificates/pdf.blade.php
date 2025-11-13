<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sertifikat - {{ $certificate->participant_name }}</title>
    <style>
        @page {
            margin: 0;
            size: A4 landscape;
        }
        
        body {
            margin: 0;
            padding: 0;
            font-family: 'Arial', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .certificate-container {
            width: 100%;
            max-width: 100%;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
            position: relative;
        }
        
        .certificate-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            position: relative;
        }
        
        .certificate-header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="2" fill="rgba(255,255,255,0.1)"/><circle cx="80" cy="80" r="2" fill="rgba(255,255,255,0.1)"/><circle cx="40" cy="60" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="60" cy="40" r="1" fill="rgba(255,255,255,0.1)"/></svg>');
            opacity: 0.3;
        }
        
        .certificate-title {
            font-size: 36px;
            font-weight: bold;
            margin: 0 0 10px 0;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            position: relative;
            z-index: 1;
        }
        
        .certificate-subtitle {
            font-size: 18px;
            opacity: 0.9;
            margin: 0;
            position: relative;
            z-index: 1;
        }
        
        .certificate-body {
            padding: 40px;
            text-align: center;
        }
        
        .certificate-text {
            font-size: 24px;
            color: #333;
            margin: 20px 0;
            line-height: 1.6;
        }
        
        .participant-name {
            font-size: 32px;
            font-weight: bold;
            color: #667eea;
            margin: 20px 0;
            text-decoration: underline;
            text-decoration-color: #667eea;
            text-underline-offset: 8px;
        }
        
        .event-details {
            background: #f8f9fa;
            border-radius: 15px;
            padding: 30px;
            margin: 30px 0;
            border-left: 5px solid #667eea;
        }
        
        .event-title {
            font-size: 22px;
            font-weight: bold;
            color: #333;
            margin: 0 0 15px 0;
        }
        
        .event-date {
            font-size: 18px;
            color: #666;
            margin: 0;
        }
        
        .certificate-number {
            background: #e3f2fd;
            border-radius: 10px;
            padding: 15px;
            margin: 20px 0;
            border: 2px solid #2196f3;
        }
        
        .certificate-number-label {
            font-size: 14px;
            color: #666;
            margin: 0 0 5px 0;
        }
        
        .certificate-number-value {
            font-size: 16px;
            font-weight: bold;
            color: #2196f3;
            font-family: 'Courier New', monospace;
        }
        
        .certificate-footer {
            background: #f5f5f5;
            padding: 20px;
            text-align: center;
            border-top: 1px solid #ddd;
        }
        
        .issued-date {
            font-size: 14px;
            color: #666;
            margin: 0;
        }
        
        .certificate-logo {
            position: absolute;
            top: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            background: rgba(255,255,255,0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
        }
        
        .border-decoration {
            position: absolute;
            top: 10px;
            left: 10px;
            right: 10px;
            bottom: 10px;
            border: 3px solid #667eea;
            border-radius: 15px;
            pointer-events: none;
        }
        
        .corner-decoration {
            position: absolute;
            width: 30px;
            height: 30px;
            border: 3px solid #667eea;
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
        <!-- Border Decoration -->
        <div class="border-decoration"></div>
        <div class="corner-decoration top-left"></div>
        <div class="corner-decoration top-right"></div>
        <div class="corner-decoration bottom-left"></div>
        <div class="corner-decoration bottom-right"></div>
        
        <!-- Certificate Header -->
        <div class="certificate-header">
            <div class="certificate-logo">🎓</div>
            <h1 class="certificate-title">SERTIFIKAT PENGHARGAAN</h1>
            <p class="certificate-subtitle">Certificate of Achievement</p>
        </div>
        
        <!-- Certificate Body -->
        <div class="certificate-body">
            <p class="certificate-text">
                Diberikan kepada:
            </p>
            
            <div class="participant-name">
                {{ $certificate->participant_name }}
            </div>
            
            <p class="certificate-text">
                Atas kehadiran dan partisipasi aktif dalam:
            </p>
            
            <div class="event-details">
                <h2 class="event-title">{{ $certificate->event_title }}</h2>
                <p class="event-date">
                    {{ \Carbon\Carbon::parse($certificate->event_date)->format('d F Y') }}
                </p>
            </div>
            
            <div class="certificate-number">
                <p class="certificate-number-label">Nomor Sertifikat:</p>
                <p class="certificate-number-value">{{ $certificate->certificate_number }}</p>
            </div>
        </div>
        
        <!-- Certificate Footer -->
        <div class="certificate-footer">
            <p class="issued-date">
                Diterbitkan pada: {{ \Carbon\Carbon::parse($certificate->issued_at)->format('d F Y') }}
            </p>
        </div>
    </div>
</body>
</html>
