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
                @if (session('status') == 'verification-link-sent')
                    <div class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded">
                        <div class="flex">
                            <div class="flex-shrink-0">
                                <i class="fas fa-check-circle"></i>
                            </div>
                            <div class="ml-3">
                                <p class="text-sm font-medium">
                                    Tautan verifikasi baru telah dikirim ke alamat email Anda.
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

                <!-- OTP Form -->
                <form method="POST" action="{{ route('verification.verify') }}" class="space-y-4" id="verificationForm">
                    @csrf
                    
                    <div>
                        <label for="code" class="block text-sm font-medium text-gray-700 mb-2">
                            Kode Verifikasi (6 digit)
                        </label>
                        <div class="flex space-x-2">
                            <input type="text" id="code1" name="code1" maxlength="1" 
                                   class="w-12 h-12 text-2xl text-center border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                   onkeyup="moveToNext(this, 'code2')" 
                                   oninput="this.value = this.value.replace(/[^0-9]/g, '')" 
                                   autofocus>
                            <input type="text" id="code2" name="code2" maxlength="1" 
                                   class="w-12 h-12 text-2xl text-center border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                   onkeyup="moveToNext(this, 'code3')" 
                                   oninput="this.value = this.value.replace(/[^0-9]/g, '')">
                            <input type="text" id="code3" name="code3" maxlength="1" 
                                   class="w-12 h-12 text-2xl text-center border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                   onkeyup="moveToNext(this, 'code4')" 
                                   oninput="this.value = this.value.replace(/[^0-9]/g, '')">
                            <span class="self-center text-gray-400">-</span>
                            <input type="text" id="code4" name="code4" maxlength="1" 
                                   class="w-12 h-12 text-2xl text-center border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                   onkeyup="moveToNext(this, 'code5')" 
                                   oninput="this.value = this.value.replace(/[^0-9]/g, '')">
                            <input type="text" id="code5" name="code5" maxlength="1" 
                                   class="w-12 h-12 text-2xl text-center border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                   onkeyup="moveToNext(this, 'code6')" 
                                   oninput="this.value = this.value.replace(/[^0-9]/g, '')">
                            <input type="text" id="code6" name="code6" maxlength="1" 
                                   class="w-12 h-12 text-2xl text-center border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                   onkeyup="moveToNext(this, null)" 
                                   oninput="this.value = this.value.replace(/[^0-9]/g, '')">
                        </div>
                        <input type="hidden" name="code" id="full-code">
                        @error('code')
                            <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                        @enderror
                    </div>

                    <div class="mt-6">
                        <button type="button" onclick="combineOtp(); document.getElementById('verificationForm').submit();" class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
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
        // Combine OTP from individual fields
        function combineOtp() {
            const code1 = document.getElementById('code1').value || '';
            const code2 = document.getElementById('code2').value || '';
            const code3 = document.getElementById('code3').value || '';
            const code4 = document.getElementById('code4').value || '';
            const code5 = document.getElementById('code5').value || '';
            const code6 = document.getElementById('code6').value || '';
            
            const fullCode = code1 + code2 + code3 + code4 + code5 + code6;
            document.getElementById('full-code').value = fullCode;
            return fullCode;
        }

        // Auto move to next input
        function moveToNext(current, nextFieldID) {
            // Only allow numbers
            current.value = current.value.replace(/[^0-9]/g, '');
            
            if (current.value.length >= current.maxLength) {
                if (nextFieldID) {
                    document.getElementById(nextFieldID).focus();
                } else {
                    // If this is the last field, combine OTP and submit
                    combineOtp();
                    document.getElementById('verificationForm').submit();
                }
            }
            
            // Auto focus first empty field if current is deleted
            if (current.value.length === 0 && current.previousElementSibling) {
                current.previousElementSibling.focus();
            }
        }
        
        // Countdown timer for resend button
        function startResendCountdown() {
            let timeLeft = 60;
            const countdownElement = document.getElementById('countdown');
            const resendButton = document.getElementById('resendButton');
            
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

        // Initialize the resend button countdown
        document.addEventListener('DOMContentLoaded', function() {
            startResendCountdown();
            
            // Handle form submission
            document.getElementById('verificationForm').addEventListener('submit', function(e) {
                // Combine OTP before form submission
                combineOtp();
                
                // Show loading state
                const submitButton = this.querySelector('button[type="submit"]');
                if (submitButton) {
                    submitButton.disabled = true;
                    submitButton.innerHTML = 'Memverifikasi...';
                }
            });
            
            // Handle resend button click
            document.querySelector('form[action$="verification-notification"]').addEventListener('submit', function(e) {
                const button = this.querySelector('button[type="submit"]');
                if (button) {
                    button.disabled = true;
                    button.innerHTML = 'Mengirim ulang...';
                }
            });
        });
    </script>
</body>
</html>
