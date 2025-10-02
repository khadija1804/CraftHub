@echo off
echo 🐳 Building CraftHub Docker Images...

echo 📦 Building frontend image...
docker build -t crafthub-frontend ./client

echo 📦 Building backend image...
docker build -t crafthub-backend ./crafthub-back

echo ✅ Docker images built successfully!
echo.
echo 🚀 To start the application, run:
echo    docker-compose up -d
echo.
echo 🔍 To view logs, run:
echo    docker-compose logs -f
echo.
echo 🛑 To stop the application, run:
echo    docker-compose down
pause
