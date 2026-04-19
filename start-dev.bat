@echo off
echo ===================================================
echo     Starting SahulatHub Project - Fast Boot
echo ===================================================

echo [1/3] Starting Next.js Frontend...
start "SahulatHub Frontend" cmd /k "npm run dev"

echo [2/3] Starting Node.js Backend...
cd sahulathub-backend
start "SahulatHub Backend" cmd /k "npm run dev"
cd ..

echo [3/3] Starting Python AI Microservice...
cd sahulathub-ai
start "SahulatHub AI" cmd /k "python main.py"
cd ..

echo.
echo All servers are booting up! It should only take a few seconds.
echo Frontend: http://localhost:3000 (or 3001)
echo Backend:  http://localhost:5000
echo AI API:   http://localhost:8001
echo ===================================================
