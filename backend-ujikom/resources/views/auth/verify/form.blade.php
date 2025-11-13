<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verifikasi Email - {{ config('app.name') }}</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
</head>
<body class="bg-gray-100">
    <div class="min-h-screen flex items-center justify-center p-4">
        <div class="bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden">
            <!-- Header -->
            <div class="bg-blue-600 text-white p-6 text-center">
                <div class="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-envelope-open-text text-2xl"></i>
                </div>
                <h1 class="text-2xl font-bold">Verifikasi Email Anda</h1>
                <p class="text-blue-100 mt-2">Kami telah mengirim kode verifikasi ke email Anda</p>
            </div>
            
            <!-- Content -->
            <div class="p-6">
                @if (session('status'))
                    <div class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded">
                        <div class="flex">
                            <div class="flex-shrink-0">
                                <i class="fas fa-check-circle"></i>
                            </div>
                            <div class="ml-3">
                                <p class="text-sm font-medium">
                                    {{ session('status') }}
                                </p>
                            </div>
                        </div>
                    </div>
                @endif

                @if (session('error'))
                    <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
                        <div class="flex">
                            <div class="flex-shrink-0">
                                <i class="fas fa-exclamation-circle"></i>
                            </div>
                            <div class="ml-3">
                                <p class="text-sm font-medium">
                                    {{ session('error') }}
                                </p>
                            </div>
                        </div>
                    </div>
                @endif

                <div class="text-center mb-6">
                    <p class="text-gray-700 mb-4">
                        Silakan periksa kotak masuk email Anda dan masukkan kode verifikasi 6 digit yang telah kami kirim ke:
                    </p>
                    <p class="font-semibold text-gray-900">{{ auth()->user()->email }}</p>
                    
                    <div class="mt-4 text-sm text-gray-600">
                        <p>Belum menerima email?</p>
                        <form method="POST" action="{{ route('verification.send') }}" class="mt-2">
                            @csrf
                            <button type="submit" class="text-blue-600 hover:text-blue-800 font-medium" id="resendButton">
                                Kirim ulang kode verifikasi
                            </button>
                            <p id="countdown">Sekarang</p>
                        </form>
                    </div>
                </div>

                <!-- OTP Form - Simplified -->
                <form method="POST" action="{{ route('verification.verify') }}" class="space-y-4" id="verificationForm">
                    @csrf
                    <input type="hidden" name="email" value="{{ auth()->user()->email }}">
                    
                    <div>
                        <label for="code" class="block text-sm font-medium text-gray-700 mb-2">
                            Kode Verifikasi (6 digit)
                        </label>
                        <input type="text" 
                               id="otpInput" 
                               name="code" 
                               maxlength="6" 
                               class="w-full h-12 text-2xl text-center border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                               placeholder="123456"
                               autofocus
                               oninput="this.value = this.value.replace(/[^0-9]/g, '')">
                        @error('code')
                            <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                        @enderror
                    </div>

                    <div class="mt-6">
                        <button type="submit" class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            Verifikasi Email
                        </button>
                    </div>
                </form>

                <div class="mt-6 text-center text-sm">
                    <p class="text-gray-600">
                        Kode verifikasi akan kedaluwarsa dalam <span id="countdown" class="font-semibold">05:00</span>
                    </p>
                </div>
            </div>

            <!-- Footer -->
            <div class="bg-gray-50 px-6 py-4 text-center">
                <p class="text-xs text-gray-500">
                    {{ date('Y') }} {{ config('app.name') }}. All rights reserved.
                </p>
            </div>
        </div>
    </div>

    <script>
        console.log('JavaScript loaded successfully!');
        
        // Countdown timer for resend button
        function startResendCountdown() {
            let timeLeft = 60;
            const countdownElement = document.getElementById('countdown');
            const resendButton = document.getElementById('resendButton');
            
            if (countdownElement && resendButton) {
                const countdownInterval = setInterval(() => {
                    timeLeft--;
                    countdownElement.textContent = timeLeft;
                    
                    if (timeLeft <= 0) {
                        clearInterval(countdownInterval);
                        resendButton.disabled = false;
                        countdownElement.textContent = 'Sekarang';
                    }
                }, 1000);
            }
        }

        // Initialize when page loads
        document.addEventListener('DOMContentLoaded', function() {
            console.log('DOM loaded, initializing...');
            
            startResendCountdown();
            
            // Handle form submission
            const form = document.getElementById('verificationForm');
            if (form) {
                form.addEventListener('submit', function(e) {
                    console.log('Form submitted!');
                    console.log('OTP Code:', document.getElementById('otpInput').value);
                    console.log('Email:', document.querySelector('input[name="email"]').value);
                    
                    // Show loading state
                    const submitButton = this.querySelector('button[type="submit"]');
                    if (submitButton) {
                        submitButton.disabled = true;
                        submitButton.innerHTML = 'Memverifikasi...';
                    }
                });
            } else {
                console.error('Form not found!');
            }
            
            // Handle resend button click
            const resendForm = document.querySelector('form[action*="verification-notification"]');
            if (resendForm) {
                resendForm.addEventListener('submit', function(e) {
                    const button = this.querySelector('button[type="submit"]');
                    if (button) {
                        button.disabled = true;
                        button.innerHTML = 'Mengirim ulang...';
                    }
                });
            }
        });
        
        // Test function
        function testConsole() {
            console.log('Test function called!');
            alert('Console test works!');
        }
    </script>
    
    <!-- Test button for debugging -->
    <div style="position: fixed; top: 10px; right: 10px; z-index: 9999;">
        <button onclick="testConsole()" style="background: red; color: white; padding: 5px; border: none; border-radius: 3px;">
            Test Console
        </button>
    </div>
</body>
</html>
