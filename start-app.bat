@echo off
REM AWS SAP-C02 Exam Prep App - Start Script (Windows)
echo 🚀 Starting AWS SAP-C02 Exam Preparation App...
echo ================================================

REM Check if package.json exists
if not exist "package.json" (
    echo ❌ Error: package.json not found. Please run this script from the app directory.
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
)

REM Start the development server
echo 🌐 Starting development server...
echo 📍 App will be available at: http://localhost:5173
echo ⏹️  Press Ctrl+C to stop the server
echo ================================================

npm run dev
