#!/bin/bash

echo "🚀 Starting FlowChat Analytics Services..."
echo ""

# Start Vanna AI Service
echo "📊 Starting Vanna AI Service on port 8000..."
cd services/vanna
python main.py > vanna.log 2>&1 &
VANNA_PID=$!
echo "✅ Vanna AI started (PID: $VANNA_PID)"
cd ../..

# Wait for Vanna to initialize
echo "⏳ Waiting for Vanna AI to initialize (30s)..."
sleep 30

# Start Backend API
echo "🔧 Starting Backend API on port 4000..."
cd apps/api
npm run dev > backend.log 2>&1 &
BACKEND_PID=$!
echo "✅ Backend API started (PID: $BACKEND_PID)"
cd ../..

echo ""
echo "✨ All services started successfully!"
echo ""
echo "Services:"
echo "  - Backend API: http://localhost:4000"
echo "  - Vanna AI:    http://localhost:8000"
echo ""
echo "Logs:"
echo "  - Vanna AI: services/vanna/vanna.log"
echo "  - Backend:  apps/api/backend.log"
echo ""
echo "To run tests:"
echo "  cd apps/api && npm test"
echo ""
echo "To stop services:"
echo "  kill $VANNA_PID $BACKEND_PID"
