#!/bin/bash

# Kill ports 8080 (Go), 5173 (Vite), 8000 (Python) if running
lsof -ti:8080 | xargs kill -9 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null
lsof -ti:8000 | xargs kill -9 2>/dev/null

echo "Starting Backend..."
cd backend
go run . &
BACKEND_PID=$!
cd ..

echo "Starting User Provider (Python Server)..."
cd frontend-user
python3 -m http.server 8000 &
USER_SERVER_PID=$!
cd ..

echo "Starting Frontend Admin..."
cd frontend-admin
npm run dev -- --host &
FRONTEND_PID=$!
cd ..

echo "Waiting for services to start..."
sleep 5

# Open Browsers
echo "Opening Admin Dashboard..."
open "http://localhost:5173"

echo "Opening User Provider..."
open "http://localhost:8000"

echo "Services running. Press Ctrl+C to stop."

# Wait for Ctrl+C
trap "kill $BACKEND_PID $USER_SERVER_PID $FRONTEND_PID; exit" INT
wait
