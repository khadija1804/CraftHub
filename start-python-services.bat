@echo off
echo ========================================
echo   CRAFT HUB - Python Services Manager
echo ========================================
echo.

echo Demarrage des services Python...
echo.

echo [1/6] Service de Recommandation (Port 5001)...
docker-compose up -d python-recommendation

echo [2/6] Service AI Principal (Port 5011)...
docker-compose up -d python-ai-main

echo [3/6] Service de Traduction (Port 5010)...
docker-compose up -d python-translator

echo [4/6] Service de Scraping (Port 5005)...
docker-compose up -d python-scraper

echo [5/6] Service de Resume (Port 5003)...
docker-compose up -d python-resume

echo [6/6] Service d'Analyse d'Images (Port 5007)...
docker-compose up -d python-image-analyzer

echo.
echo ========================================
echo   Services Python demarres avec succes!
echo ========================================
echo.
echo Services disponibles:
echo - Recommandation:    http://localhost:5001
echo - AI Principal:      http://localhost:5011
echo - Traduction:        http://localhost:5010
echo - Scraping:          http://localhost:5005
echo - Resume:            http://localhost:5003
echo - Analyse Images:    http://localhost:5007
echo.
echo Pour voir les logs: docker-compose logs -f python-*
echo Pour arreter: docker-compose stop python-*
echo.
pause
