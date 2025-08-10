@echo off
REM Fantasy Football Lottery Draft - Windows Start Script

echo 🏆 Starting Fantasy Football Lottery Draft Application...
echo ==================================================

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed or not in PATH
    pause
    exit /b 1
)

echo ✅ All dependencies found
echo.

REM Create logs directory
if not exist logs mkdir logs

echo 🐍 Starting Python Flask Backend (port 5000)...
cd backend
start "Backend Server" cmd /c "python app.py > ../logs/backend.log 2>&1"
cd ..

REM Wait for backend to start
timeout /t 3 /nobreak >nul

echo ⚛️ Starting React Frontend (port 3000)...
cd frontend
start "Frontend Server" cmd /c "npm start > ../logs/frontend.log 2>&1"
cd ..

echo.
echo 🚀 Application is starting up...
echo.
echo 📋 URLs:
echo   - Frontend (React): http://localhost:3000
echo   - Backend API: http://localhost:5000
echo.
echo 📝 Logs:
echo   - Backend: logs/backend.log
echo   - Frontend: logs/frontend.log
echo.
echo ⏳ Please wait 30-60 seconds for services to start...
echo.
echo ✅ Both servers are starting in separate windows
echo    Frontend will automatically open in your browser
echo.
echo 🛑 To stop: Close both server windows or run stop.bat
echo.
pause
