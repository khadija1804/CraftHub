@echo off
echo ========================================
echo   CRAFT HUB - ARRET DES SERVICES
echo ========================================
echo.

echo Arret de tous les services...
docker-compose down

echo.
echo ========================================
echo   TOUS LES SERVICES ARRETES!
echo ========================================
echo.
pause

