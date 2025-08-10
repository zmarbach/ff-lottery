# Fantasy Football Lottery Draft - React + Python

A modern web application for running fantasy football lottery drafts with a React frontend and Python Flask backend.

## 🚀 Quick Start

**Windows:**
```bash
# Double-click start.bat or run in terminal:
start.bat
```

**Linux/Mac:**
```bash
./start.sh
```

**To Stop:**
```bash
# Windows
stop.bat

# Linux/Mac  
./stop.sh
```

## 🔧 Setup Instructions (First Time)

### Prerequisites
- **Python 3.7+** with pip
- **Node.js 14+** with npm

### Installation
```bash
# Install Python dependencies
cd backend
pip install -r requirements.txt
cd ..

# Install React dependencies
cd frontend
npm install
cd ..

# Or install everything at once:
npm run install:all
```

## 📱 Usage

1. **Start the application** using any method above
2. **Open your browser** to http://localhost:3000
3. **Click "Generate Next Pick"** to randomly select the next draft pick

## 🌐 URLs

- **Frontend (React)**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 🚦 Troubleshooting

**Port already in use:**
- Run the stop script to kill existing processes
- Or manually kill processes on ports 3000 and 5000

**Dependencies missing:**
- Run `npm run install:all` to install all dependencies

**CSV file not found:**
- The app will use sample data if `draft_perc.csv` is missing
- Ensure the CSV is in the `backend/` directory
