<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>@yield('title', config('app.name')) - Admin Panel</title>

    <!-- Favicon -->
    <link rel="shortcut icon" href="{{ asset('favicon.ico') }}">

    <!-- Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">

    <!-- Styles -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css" rel="stylesheet" />
    <link href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css" rel="stylesheet">
    <link href="{{ asset('css/app.css') }}" rel="stylesheet">
    <link href="{{ asset('css/admin.css') }}?v={{ time() }}" rel="stylesheet">

    <style>
        /* Force override untuk memastikan perubahan terlihat - update {{ rand(1000, 9999) }} */
        body {
            overflow-x: hidden;
        }
        
        .admin-sidebar {
            background: linear-gradient(180deg, #2c3e50 0%, #34495e 100%) !important;
            width: 220px !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            height: 100vh !important;
            z-index: 1000 !important;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1) !important;
            transition: all 0.3s ease !important;
        }

        .admin-main {
            margin-left: 220px !important;
            flex: 1 !important;
            display: flex !important;
            flex-direction: column !important;
            min-height: 100vh !important;
            width: calc(100% - 220px) !important;
            transition: all 0.3s ease !important;
        }

        .admin-header {
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%) !important;
            color: white !important;
            padding: 0.75rem 1rem !important;
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1) !important;
            position: sticky !important;
            top: 0 !important;
            z-index: 100 !important;
            width: 100% !important;
        }

        .admin-content {
            flex: 1 !important;
            padding: 1rem !important;
            background-color: #f5f5f5 !important;
            width: 100% !important;
            overflow-x: hidden !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
        }
        
        .container-fluid, .container {
            padding-right: 0.75rem !important;
            padding-left: 0.75rem !important;
            margin-right: auto !important;
            margin-left: auto !important;
            width: 100% !important;
            max-width: 100% !important;
        }
        
        .row {
            margin-right: -0.375rem !important;
            margin-left: -0.375rem !important;
        }
        
        .col, .col-1, .col-2, .col-3, .col-4, .col-5, .col-6, .col-7, .col-8, .col-9, .col-10, .col-11, .col-12, 
        .col-sm, .col-sm-1, .col-sm-2, .col-sm-3, .col-sm-4, .col-sm-5, .col-sm-6, .col-sm-7, .col-sm-8, .col-sm-9, .col-sm-10, .col-sm-11, .col-sm-12, 
        .col-md, .col-md-1, .col-md-2, .col-md-3, .col-md-4, .col-md-5, .col-md-6, .col-md-7, .col-md-8, .col-md-9, .col-md-10, .col-md-11, .col-md-12, 
        .col-lg, .col-lg-1, .col-lg-2, .col-lg-3, .col-lg-4, .col-lg-5, .col-lg-6, .col-lg-7, .col-lg-8, .col-lg-9, .col-lg-10, .col-lg-11, .col-lg-12, 
        .col-xl, .col-xl-1, .col-xl-2, .col-xl-3, .col-xl-4, .col-xl-5, .col-xl-6, .col-xl-7, .col-xl-8, .col-xl-9, .col-xl-10, .col-xl-11, .col-xl-12 {
            padding-right: 0.375rem !important;
            padding-left: 0.375rem !important;
        }
        
        /* Card styles */
        .card {
            margin-bottom: 0.75rem !important;
            border-radius: 0.5rem !important;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05) !important;
        }
        
        .card-header {
            padding: 0.75rem !important;
            font-size: 0.9rem !important;
        }
        
        .card-body {
            padding: 0.75rem !important;
        }
        
        /* Button styles */
        .btn {
            padding: 0.375rem 0.75rem !important;
            font-size: 0.875rem !important;
        }
        
        /* Table styles */
        .table th, .table td {
            padding: 0.5rem 0.75rem !important;
            font-size: 0.875rem !important;
        }
        
        /* Form styles */
        .form-control, .form-select {
            padding: 0.375rem 0.75rem !important;
            font-size: 0.875rem !important;
        }

        .brand-link {
            display: flex !important;
            align-items: center !important;
            text-decoration: none !important;
            color: white !important;
            transition: all 0.3s ease !important;
        }

        .brand-icon {
            width: 48px !important;
            height: 48px !important;
            background: #667eea !important;
            border-radius: 8px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            margin-right: 1rem !important;
            font-size: 1.5rem !important;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3) !important;
        }

        .nav-link {
            display: flex !important;
            align-items: center !important;
            padding: 1rem 1.5rem !important;
            color: rgba(255,255,255,0.8) !important;
            text-decoration: none !important;
            border-radius: 8px !important;
            transition: all 0.3s ease !important;
            position: relative !important;
            overflow: hidden !important;
        }

        .nav-link:hover {
            background: rgba(255,255,255,0.1) !important;
            color: white !important;
            transform: translateX(4px) !important;
        }

        .nav-link.active {
            background: rgba(255, 215, 0, 0.2) !important;
            border: 1px solid rgba(255, 215, 0, 0.3) !important;
            color: #667eea !important;
            box-shadow: 0 4px 12px rgba(255, 215, 0, 0.2) !important;
        }

        /* Force body styling */
        body.admin-body {
            font-family: 'Inter', 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
            background-color: #f5f5f5 !important;
            color: #333 !important;
            line-height: 1.6 !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow-x: hidden !important;
        }

        /* Force page title styling */
        .page-title h1 {
            font-size: 1.75rem !important;
            font-weight: 700 !important;
            margin: 0 !important;
            line-height: 1.2 !important;
            color: white !important;
        }

        .page-subtitle {
            font-size: 0.875rem !important;
            opacity: 0.8 !important;
            margin: 0.25rem 0 0 0 !important;
            color: white !important;
        }

        /* Force button styling */
        .btn {
            border-radius: 8px !important;
            font-weight: 500 !important;
            padding: 0.75rem 1.5rem !important;
            transition: all 0.3s ease !important;
            border: none !important;
            position: relative !important;
            overflow: hidden !important;
        }

        .btn-primary {
            background: #667eea !important;
            color: white !important;
        }

        .btn-primary:hover {
            background: #5a6fd8 !important;
            transform: translateY(-2px) !important;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3) !important;
        }

        /* TESTING - Force visible changes */
        .admin-sidebar {
            background: linear-gradient(45deg, #ff6b6b, #4ecdc4) !important;
            border-right: 5px solid #ff6b6b !important;
        }

        .admin-header {
            background: linear-gradient(45deg, #667eea, #764ba2) !important;
            border-bottom: 3px solid #ff6b6b !important;
        }

        .admin-content {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%) !important;
        }

        .brand-icon {
            background: #ff6b6b !important;
            animation: pulse 2s infinite !important;
        }

        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
        
        /* Media queries untuk responsivitas */
        @media (max-width: 1200px) {
            .admin-content {
                padding: 1.5rem !important;
            }
        }
        
        @media (max-width: 992px) {
            .admin-sidebar {
                width: 240px !important;
            }
            
            .admin-main {
                margin-left: 240px !important;
                width: calc(100% - 240px) !important;
            }
        }
        
        @media (max-width: 768px) {
            .admin-sidebar {
                transform: translateX(-100%) !important;
                width: 280px !important;
            }
            
            .admin-sidebar.show {
                transform: translateX(0) !important;
            }
            
            .admin-main {
                margin-left: 0 !important;
                width: 100% !important;
            }
            
            .admin-header {
                padding: 1rem !important;
            }
            
            .sidebar-toggle {
                display: block !important;
            }
        }
        
        @media (max-width: 576px) {
            .admin-content {
                padding: 1rem !important;
            }
            
            .page-title h1 {
                font-size: 1.5rem !important;
            }
            
            .header-actions {
                gap: 0.5rem !important;
            }
        }
    </style>

    @stack('styles')
</head>
<body class="admin-body">
    <div class="admin-wrapper">
        <!-- Sidebar -->
        <div class="admin-sidebar">
            <div class="sidebar-header">
                <a href="{{ route('admin.dashboard') }}" class="brand-link">
                    <div class="brand-icon">
                        <i class="fas fa-calendar-alt"></i>
                    </div>
                    <div class="brand-text">
                        <span class="brand-title">{{ config('app.name') }}</span>
                        <span class="brand-subtitle">Admin Panel</span>
                    </div>
                </a>
                <!-- TESTING MESSAGE -->
                <div style="background: #ff6b6b !important; color: white !important; padding: 1rem !important; margin-top: 1rem !important; border-radius: 8px !important; text-align: center !important; font-weight: bold !important;">
                    🎉 SIDEBAR BARU! 🎉
                </div>
            </div>

            <nav class="sidebar-nav">
                <ul class="nav-list">
                    <li class="nav-item">
                        <a href="{{ route('admin.dashboard') }}" class="nav-link {{ request()->routeIs('admin.dashboard') ? 'active' : '' }}">
                            <i class="nav-icon fas fa-tachometer-alt"></i>
                            <span class="nav-text">Dashboard</span>
                            <span class="nav-description">Overview & Analytics</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="{{ route('admin.events.index') }}" class="nav-link {{ request()->routeIs('admin.events.*') ? 'active' : '' }}">
                            <i class="nav-icon fas fa-calendar-alt"></i>
                            <span class="nav-text">Events</span>
                            <span class="nav-description">Manage Events</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="{{ route('admin.participants.index') }}" class="nav-link {{ request()->routeIs('admin.participants.*') ? 'active' : '' }}">
                            <i class="nav-icon fas fa-users"></i>
                            <span class="nav-text">Participants</span>
                            <span class="nav-description">Manage Participants</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="#" class="nav-link">
                            <i class="nav-icon fas fa-users"></i>
                            <span class="nav-text">Participants</span>
                            <span class="nav-description">View Participants</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="#" class="nav-link">
                            <i class="nav-icon fas fa-certificate"></i>
                            <span class="nav-text">Certificates</span>
                            <span class="nav-description">Manage Certificates</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="#" class="nav-link">
                            <i class="nav-icon fas fa-chart-bar"></i>
                            <span class="nav-text">Reports</span>
                            <span class="nav-description">Analytics & Reports</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="#" class="nav-link">
                            <i class="nav-icon fas fa-cog"></i>
                            <span class="nav-text">Settings</span>
                            <span class="nav-description">System Configuration</span>
                        </a>
                    </li>
                </ul>
            </nav>

            <div class="sidebar-footer">
                <div class="admin-status">
                    <div class="status-icon">
                        <i class="fas fa-shield-alt"></i>
                    </div>
                    <div class="status-text">
                        <span class="status-label">Admin Status</span>
                        <span class="status-badge">Super Admin</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Main Content -->
        <div class="admin-main">
            <!-- Top Navigation -->
            <header class="admin-header">
                <div class="header-left">
                    <button class="sidebar-toggle d-md-none" id="sidebarToggle">
                        <i class="fas fa-bars"></i>
                    </button>
                    <div class="page-title">
                        <h1>@yield('page-title', 'Dashboard')</h1>
                        <p class="page-subtitle">@yield('page-subtitle', 'Welcome to Admin Panel')</p>
                        <!-- TESTING MESSAGE -->
                        <div style="background: #ff6b6b !important; color: white !important; padding: 0.5rem !important; margin-top: 0.5rem !important; border-radius: 4px !important; font-size: 0.8rem !important; text-align: center !important;">
                            🎉 HEADER BARU! 🎉
                        </div>
                    </div>
                </div>

                <div class="header-right">
                    <div class="header-actions">
                        <button class="action-btn notification-btn" title="Notifications">
                            <i class="fas fa-bell"></i>
                            <span class="notification-badge">4</span>
                        </button>

                        <div class="user-dropdown">
                            <button class="user-profile" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                                <div class="user-avatar">
                                    <img src="https://ui-avatars.com/api/?name={{ urlencode(auth()->user()->name) }}&background=667eea&color=fff" alt="{{ auth()->user()->name }}">
                                </div>
                                <div class="user-info">
                                    <span class="user-name">{{ auth()->user()->name }}</span>
                                    <span class="user-role">Super Admin</span>
                                </div>
                                <i class="fas fa-chevron-down"></i>
                            </button>
                            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                                <li><a class="dropdown-item" href="#"><i class="fas fa-user me-2"></i> Profile</a></li>
                                <li><a class="dropdown-item" href="#"><i class="fas fa-cog me-2"></i> Settings</a></li>
                                <li><hr class="dropdown-divider"></li>
                                <li>
                                    <form method="POST" action="{{ route('logout') }}">
                                        @csrf
                                        <button type="submit" class="dropdown-item">
                                            <i class="fas fa-sign-out-alt me-2"></i> Logout
                                        </button>
                                    </form>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </header>

            <!-- Page Content -->
            <main class="admin-content">
                @if(session('success'))
                    <div class="alert alert-success alert-dismissible fade show mb-4" role="alert">
                        <i class="fas fa-check-circle me-2"></i>
                        {{ session('success') }}
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>
                @endif

                @if(session('error'))
                    <div class="alert alert-danger alert-dismissible fade show mb-4" role="alert">
                        <i class="fas fa-exclamation-circle me-2"></i>
                        {{ session('error') }}
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>
                @endif

                @yield('content')
            </main>
        </div>
    </div>

    <!-- Scripts -->
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

    <script>
        // Initialize components
        $(document).ready(function() {
            // Initialize Select2
            $('.select2').select2({
                theme: 'bootstrap-5',
                width: '100%'
            });

            // Initialize date picker
            $('.datepicker').flatpickr({
                dateFormat: 'Y-m-d',
                allowInput: true,
                locale: 'id'
            });

            // Initialize time picker
            $('.timepicker').flatpickr({
                enableTime: true,
                noCalendar: true,
                dateFormat: 'H:i',
                time_24hr: true
            });

            // Toggle sidebar on mobile
            $('#sidebarToggle').on('click', function() {
                $('.admin-sidebar').toggleClass('show');
                $('body').toggleClass('sidebar-open');
            });

            // Close sidebar when clicking outside on mobile
            $(document).on('click', function(e) {
                if ($(window).width() < 768) {
                    if (!$(e.target).closest('.admin-sidebar, #sidebarToggle').length) {
                        $('.admin-sidebar').removeClass('show');
                        $('body').removeClass('sidebar-open');
                    }
                }
            });

            // Auto-hide alerts after 5 seconds
            setTimeout(function() {
                $('.alert').fadeOut();
            }, 5000);

            // Handle delete confirmation
            $('.delete-btn').on('click', function(e) {
                e.preventDefault();
                const form = $(this).closest('form');

                Swal.fire({
                    title: 'Apakah Anda yakin?',
                    text: "Tindakan ini tidak dapat dibatalkan!",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#667eea',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Ya, hapus!',
                    cancelButtonText: 'Batal'
                }).then((result) => {
                    if (result.isConfirmed) {
                        form.submit();
                    }
                });
            });

            // Smooth scroll for anchor links
            $('a[href^="#"]').on('click', function(event) {
                var target = $(this.getAttribute('href'));
                if (target.length) {
                    event.preventDefault();
                    $('html, body').stop().animate({
                        scrollTop: target.offset().top - 100
                    }, 1000);
                }
            });
        });
    </script>

    @stack('scripts')
</body>
</html>
