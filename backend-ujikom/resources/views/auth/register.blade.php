<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Register - Event Management</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-100">
    <div class="min-h-screen flex items-center justify-center">
        <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
            <h1 class="text-2xl font-bold text-center mb-6">Create an Account</h1>
            
            @if ($errors->any())
                <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
                    <div class="flex">
                        <div class="flex-shrink-0">
                            <svg class="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                            </svg>
                        </div>
                        <div class="ml-3">
                            <p class="text-sm font-medium">
                                Terjadi kesalahan dengan input Anda.
                            </p>
                            <div class="mt-2 text-sm text-red-700">
                                <ul class="list-disc pl-5 space-y-1">
                                    @foreach ($errors->all() as $error)
                                        <li>{{ $error }}</li>
                                    @endforeach
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            @endif

            @if (session('status'))
                <div class="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4 rounded">
                    <div class="flex">
                        <div class="flex-shrink-0">
                            <svg class="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                            </svg>
                        </div>
                        <div class="ml-3">
                            <p class="text-sm font-medium">
                                {{ session('status') }}
                            </p>
                        </div>
                    </div>
                </div>
            @endif

            <form action="{{ route('register.submit') }}" method="POST" novalidate>
                @csrf
                
                <!-- Nama Lengkap -->
                <div class="mb-4">
                    <label for="name" class="block text-gray-700 text-sm font-bold mb-2">Nama Lengkap</label>
                    <input type="text" id="name" name="name" required 
                           class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                           value="{{ old('name') }}">
                </div>

                <div class="mb-4">
                    <label for="email" class="block text-gray-700 text-sm font-bold mb-2">Email</label>
                    <input type="email" id="email" name="email" required
                           class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                </div>

                <div class="mb-4">
                    <label for="password" class="block text-gray-700 text-sm font-bold mb-2">Password</label>
                    <input type="password" id="password" name="password" required
                           class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-1 leading-tight focus:outline-none focus:shadow-outline"
                           pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}"
                           title="Password harus minimal 8 karakter dan mengandung setidaknya 1 huruf besar, 1 huruf kecil, 1 angka, dan 1 karakter khusus">
                    <p class="text-xs text-gray-600">
                        Password harus minimal 8 karakter dan mengandung setidaknya:
                        <span id="length" class="text-red-500">• 8 karakter</span>,
                        <span id="uppercase" class="text-red-500">• 1 huruf besar</span>,
                        <span id="lowercase" class="text-red-500">• 1 huruf kecil</span>,
                        <span id="number" class="text-red-500">• 1 angka</span>,
                        <span id="special" class="text-red-500">• 1 karakter khusus</span>
                    </p>
                </div>

                <div class="mb-4">
                    <label for="password_confirmation" class="block text-gray-700 text-sm font-bold mb-2">Konfirmasi Password</label>
                    <input type="password" id="password_confirmation" name="password_confirmation" required
                           class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                           oninput="checkPasswordMatch(this)">
                    <p id="password-match" class="text-xs mt-1"></p>
                </div>

                <div class="mb-4">
                    <label for="phone" class="block text-gray-700 text-sm font-bold mb-2">Nomor Telepon</label>
                    <input type="text" id="phone" name="phone" required
                           class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                           value="{{ old('phone') }}">
                </div>

                <div class="mb-4">
                    <label for="address" class="block text-gray-700 text-sm font-bold mb-2">Alamat</label>
                    <textarea id="address" name="address" required rows="3"
                           class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">{{ old('address') }}</textarea>
                </div>

                <div class="mb-6">
                    <label for="education" class="block text-gray-700 text-sm font-bold mb-2">Education Level</label>
                    <select id="education" name="education" required
                            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                        <option value="">Select Education Level</option>
                        <option value="High School">High School</option>
                        <option value="Associate Degree">Associate Degree</option>
                        <option value="Bachelor's Degree">Bachelor's Degree</option>
                        <option value="Master's Degree">Master's Degree</option>
                        <option value="Doctorate">Doctorate</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                <div class="flex items-center justify-between">
                    <button type="submit" 
                            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full">
                        Register
                    </button>
                </div>
            </form>

            <div class="mt-4 text-center">
                <p class="text-sm text-gray-600">
                    Already have an account? 
                    <a href="{{ route('login') }}" class="text-blue-500 hover:text-blue-700">Login here</a>
                </p>
            </div>
        </div>
    </div>
    
    <script>
        // Validasi password
        const password = document.getElementById('password');
        const length = document.getElementById('length');
        const uppercase = document.getElementById('uppercase');
        const lowercase = document.getElementById('lowercase');
        const number = document.getElementById('number');
        const special = document.getElementById('special');
        
        password.addEventListener('input', function() {
            const value = this.value;
            
            // Validasi panjang
            if (value.length >= 8) {
                length.classList.remove('text-red-500');
                length.classList.add('text-green-500');
            } else {
                length.classList.remove('text-green-500');
                length.classList.add('text-red-500');
            }
            
            // Validasi huruf besar
            if (/[A-Z]/.test(value)) {
                uppercase.classList.remove('text-red-500');
                uppercase.classList.add('text-green-500');
            } else {
                uppercase.classList.remove('text-green-500');
                uppercase.classList.add('text-red-500');
            }
            
            // Validasi huruf kecil
            if (/[a-z]/.test(value)) {
                lowercase.classList.remove('text-red-500');
                lowercase.classList.add('text-green-500');
            } else {
                lowercase.classList.remove('text-green-500');
                lowercase.classList.add('text-red-500');
            }
            
            // Validasi angka
            if (/[0-9]/.test(value)) {
                number.classList.remove('text-red-500');
                number.classList.add('text-green-500');
            } else {
                number.classList.remove('text-green-500');
                number.classList.add('text-red-500');
            }
            
            // Validasi karakter khusus
            if (/[^A-Za-z0-9]/.test(value)) {
                special.classList.remove('text-red-500');
                special.classList.add('text-green-500');
            } else {
                special.classList.remove('text-green-500');
                special.classList.add('text-red-500');
            }
        });
        
        // Cek kecocokan password
        function checkPasswordMatch(confirmPassword) {
            const matchText = document.getElementById('password-match');
            
            if (password.value === confirmPassword.value) {
                matchText.textContent = 'Password cocok!';
                matchText.className = 'text-xs mt-1 text-green-600';
                confirmPassword.setCustomValidity('');
            } else {
                matchText.textContent = 'Password tidak cocok!';
                matchText.className = 'text-xs mt-1 text-red-600';
                confirmPassword.setCustomValidity('Password tidak cocok');
            }
        }
    </script>
</body>
</html>
