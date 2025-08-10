#!/bin/bash

# Fantasy Football Lottery Draft - Stop Script
echo "🛑 Stopping Fantasy Football Lottery Draft Application..."

# Kill processes by port
echo "Stopping backend (port 5000)..."
lsof -ti:5000 | xargs kill -9 2>/dev/null || echo "Backend not running on port 5000"

echo "Stopping frontend (port 3000)..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || echo "Frontend not running on port 3000"

# Also kill by process name as backup
pkill -f "python app.py" 2>/dev/null
pkill -f "npm start" 2>/dev/null
pkill -f "react-scripts start" 2>/dev/null

echo "✅ Application stopped"
