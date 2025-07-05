#!/bin/bash

# AWS SAP-C02 Exam Prep App - Stop Script
echo "⏹️  Stopping AWS SAP-C02 Exam Preparation App..."
echo "================================================"

# Find and kill any running npm dev processes for this app
PIDS=$(ps aux | grep "npm run dev" | grep -v grep | awk '{print $2}')

if [ -z "$PIDS" ]; then
    echo "ℹ️  No running app processes found."
else
    echo "🔍 Found running processes: $PIDS"
    for PID in $PIDS; do
        echo "🛑 Stopping process $PID..."
        kill $PID 2>/dev/null
    done
    
    # Wait a moment and force kill if necessary
    sleep 2
    
    # Check for any remaining processes and force kill
    REMAINING=$(ps aux | grep "npm run dev" | grep -v grep | awk '{print $2}')
    if [ ! -z "$REMAINING" ]; then
        echo "🔨 Force stopping remaining processes..."
        for PID in $REMAINING; do
            kill -9 $PID 2>/dev/null
        done
    fi
fi

# Also stop any Vite processes
VITE_PIDS=$(ps aux | grep "vite" | grep -v grep | awk '{print $2}')
if [ ! -z "$VITE_PIDS" ]; then
    echo "🔍 Found Vite processes: $VITE_PIDS"
    for PID in $VITE_PIDS; do
        echo "🛑 Stopping Vite process $PID..."
        kill $PID 2>/dev/null
    done
fi

echo "✅ App stopped successfully!"
echo "================================================"
