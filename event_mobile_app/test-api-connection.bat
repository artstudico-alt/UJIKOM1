@echo off
echo ========================================
echo   Testing API Connection
echo ========================================
echo.
echo Testing backend connection...
echo.

echo 1. Testing GET /api/events
curl -s http://172.16.2.54:8000/api/events
echo.
echo.

echo 2. Testing POST /api/login
curl -s -X POST http://172.16.2.54:8000/api/login -H "Content-Type: application/json" -d "{\"email\":\"2sc00nd@gmail.com\",\"password\":\"password123\"}"
echo.
echo.

echo ========================================
echo   Test Complete!
echo ========================================
pause

