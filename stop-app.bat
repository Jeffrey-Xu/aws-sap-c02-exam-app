@echo off
REM AWS SAP-C02 Exam Prep App - Stop Script (Windows)
echo ⏹️  Stopping AWS SAP-C02 Exam Preparation App...
echo ================================================

REM Kill npm and node processes related to the app
taskkill /f /im node.exe 2>nul
taskkill /f /im npm.cmd 2>nul

echo ✅ App stopped successfully!
echo ================================================
pause
