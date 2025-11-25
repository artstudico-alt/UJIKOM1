<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificate - {{ $certificate->certificate_number }}</title>
    <style>
        @page {
            margin: 0;
            size: A4 landscape;
        }

        body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        img {
            max-width: 100%;
            max-height: 100vh;
            width: auto;
            height: auto;
            display: block;
            margin: 0 auto;
        }
    </style>
</head>
<body>
    <img src="{{ $imagePath }}" alt="Certificate {{ $certificate->certificate_number }}">
</body>
</html>
