#!/bin/bash

# AWS SAP-C02 Exam Prep App - Start Script
echo "🚀 Starting AWS SAP-C02 Exam Preparation App..."
echo "================================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the app directory."
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the development server
echo "🌐 Starting development server..."
echo "📍 App will be available at: http://localhost:5173"
echo "⏹️  Press Ctrl+C or 'q + enter' to stop the server"
echo "================================================"

npm run dev
