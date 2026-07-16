@echo off
setlocal enabledelayedexpansion

echo ==========================================
echo   AI Interview Simulator Project Launcher
echo ==========================================
echo.

:: 1. Start the Backend
echo [1/3] Starting backend server in a new window...
start "AI Interview Simulator Backend" cmd /k "cd 20_Testing && node server.js"

:: 2. Wait for Backend (Port 5000)
echo [2/3] Waiting for backend to start on port 5000...
set /a count=0
set /a max_wait=30

:wait_loop
powershell -Command "try { $conn = New-Object System.Net.Sockets.TcpClient('127.0.0.1', 5000); $conn.Close(); exit 0 } catch { exit 1 }"
if %errorlevel% equ 0 (
    echo.
    echo Backend is running on port 5000.
    goto start_frontend
)

set /a count+=1
if !count! geq !max_wait! (
    echo.
    echo [ERROR] Backend failed to start on port 5000 within 30 seconds.
    echo Please check the "AI Interview Simulator Backend" terminal for details.
    pause
    exit /b 1
)

<nul set /p =.
powershell -Command "Start-Sleep -Seconds 1"
goto wait_loop

:start_frontend
:: 3. Start the Frontend
echo [3/3] Starting frontend server...
start "AI Interview Simulator Frontend" cmd /k "cd 02_Frontend_Foundation\web && npm run dev"

:: 4. Open Default Browser
echo.
echo Launching default browser to http://localhost:3000...
powershell -Command "Start-Sleep -Seconds 3"
start http://localhost:3000

echo.
echo ==========================================
echo   Both servers launched successfully!
echo   Keep the separate terminals open.
echo ==========================================
echo.
