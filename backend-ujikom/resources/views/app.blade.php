<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Sistem Manajemen Event</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sistem Manajemen Event</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-100">
    <div class="container mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold text-center mb-8">Sistem Manajemen Event</h1>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Card Daftar Event -->
            <div class="bg-white rounded-lg shadow-md p-6">
                <h2 class="text-xl font-semibold mb-4">Daftar Event</h2>
                <div id="events-list" class="space-y-4">
                    <p>Memuat daftar event...</p>
                </div>
            </div>

            <!-- Card Login -->
            <div class="bg-white rounded-lg shadow-md p-6">
                <h2 class="text-xl font-semibold mb-4">Login</h2>
                <form id="login-form" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" name="email" required 
                               class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Password</label>
                        <input type="password" name="password" required 
                               class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                    </div>
                    <button type="submit" 
                            class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
                        Login
                    </button>
                </form>
            </div>

            <!-- Card Info -->
            <div class="bg-white rounded-lg shadow-md p-6">
                <h2 class="text-xl font-semibold mb-4">Informasi</h2>
                <p class="mb-4">Gunakan API endpoint berikut untuk mengakses sistem:</p>
                <div class="bg-gray-100 p-4 rounded-md overflow-x-auto">
                    <code class="text-sm">
                        POST /api/register<br>
                        POST /api/login<br>
                        GET /api/events<br>
                        POST /api/events/{id}/register<br>
                        POST /api/events/{id}/attendance
                    </code>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Load events on page load
        fetch('/api/events')
            .then(response => response.json())
            .then(data => {
                const eventsList = document.getElementById('events-list');
                if (data.data && data.data.length > 0) {
                    eventsList.innerHTML = data.data.map(event => `
                        <div class="border-b pb-2">
                            <h3 class="font-medium">${event.title}</h3>
                            <p class="text-sm text-gray-600">${event.event_date} • ${event.location}</p>
                        </div>
                    `).join('');
                } else {
                    eventsList.innerHTML = '<p>Tidak ada event yang tersedia.</p>';
                }
            });

        // Handle login form
        document.getElementById('login-form').addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            const data = Object.fromEntries(formData.entries());
            
            fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    ...data,
                    device_name: 'web-browser'
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.token) {
                    alert('Login berhasil! Token: ' + data.token);
                    // Simpan token untuk request selanjutnya
                    localStorage.setItem('token', data.token);
                } else {
                    alert(data.message || 'Login gagal');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Terjadi kesalahan saat login');
            });
        });
    </script>
</body>
</html>
