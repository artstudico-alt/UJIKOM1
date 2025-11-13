@echo off
echo ========================================
echo   Starting Laravel Backend Server
echo ========================================
echo.
echo Backend will run on: 0.0.0.0:8000
echo Accessible from: http://172.16.2.54:8000
echo API Endpoint: http://172.16.2.54:8000/api
echo.
echo Press Ctrl+C to stop the server
echo.
php artisan serve --host=0.0.0.0 --port=8000

