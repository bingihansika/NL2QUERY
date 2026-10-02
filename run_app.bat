@echo off
echo ===================================================
echo Starting NL2QUERY AI Query Engine Application...
echo ===================================================

echo Starting FastAPI Backend Server on http://localhost:8000 ...
start "NL2QUERY Backend" cmd /k "cd backend && python -m uvicorn app.main:app --reload --port 8000"

timeout /t 3 /nobreak > NUL

echo Starting Vite React Frontend on http://localhost:3000 ...
start "NL2QUERY Frontend" cmd /k "cd frontend && npm run dev"

echo ===================================================
echo NL2QUERY Application is launching!
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo ===================================================
