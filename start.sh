#!/bin/bash

# Fantasy Football Lottery Draft - Start Script
echo "🏆 Starting Fantasy Football Lottery Draft Application..."
echo "=================================================="

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if required tools are installed
echo "Checking dependencies..."

if ! command_exists python; then
    echo "❌ Python is not installed or not in PATH"
    exit 1
fi

if ! command_exists node; then
    echo "❌ Node.js is not installed or not in PATH"
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm is not installed or not in PATH"
    exit 1
fi

echo "✅ All dependencies found"
echo ""

# Create log directory
mkdir -p logs

# Start backend in background
echo "🐍 Starting Python Flask Backend (port 5000)..."
cd backend
python app.py > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend in background
echo "⚛️  Starting React Frontend (port 3000)..."
cd frontend
npm start > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

echo ""
echo "🚀 Application is starting up..."
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "📋 URLs:"
echo "  - Frontend (React): http://localhost:3000"
echo "  - Backend API: http://localhost:5000"
echo ""
echo "📝 Logs:"
echo "  - Backend: logs/backend.log"
echo "  - Frontend: logs/frontend.log"
echo ""
echo "⏳ Waiting for services to start (this may take 30-60 seconds)..."
echo ""
echo "🛑 To stop the application, press Ctrl+C or run: ./stop.sh"
echo ""

# Wait for user interrupt
trap 'echo ""; echo "🛑 Stopping application..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo "✅ Application stopped"; exit 0' INT

# Keep script running and show status
echo "✅ Application should be ready soon!"
echo "   Open your browser to: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop the application..."

# Wait indefinitely
wait
