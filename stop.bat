@echo off
REM Fantasy Football Lottery Draft - Windows Stop Script

echo 🛑 Stopping Fantasy Football Lottery Draft Application...

REM Kill processes on specific ports
echo Stopping backend (port 5000)...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5000" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>&1

echo Stopping frontend (port 3000)...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>&1

REM Also kill by process name as backup
taskkill /f /im "python.exe" /fi "WINDOWTITLE eq Backend Server" >nul 2>&1
taskkill /f /im "node.exe" /fi "WINDOWTITLE eq Frontend Server" >nul 2>&1

echo ✅ Application stopped
pause
