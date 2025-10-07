#!/bin/bash

echo "========================================"
echo "  CRAFT HUB - LANCEMENT COMPLET"
echo "========================================"
echo

echo "Démarrage de tous les services..."
echo

echo "[1/8] Base de données MongoDB..."
docker-compose up -d mongo

echo "[2/8] Backend Node.js..."
docker-compose up -d backend

echo "[3/8] Frontend React..."
docker-compose up -d frontend

echo "[4/8] Service AI Principal..."
docker-compose up -d python-ai-main

echo "[5/8] Service de Recommandation..."
docker-compose up -d python-recommendation

echo "[6/8] Service de Traduction..."
docker-compose up -d python-translator

echo "[7/8] Service de Scraping..."
docker-compose up -d python-scraper

echo "[8/8] Service de Resume..."
docker-compose up -d python-resume

echo "[9/8] Service d'Analyse d'Images..."
docker-compose up -d python-image-analyzer

echo
echo "========================================"
echo "  TOUS LES SERVICES DÉMARRÉS!"
echo "========================================"
echo
echo "Services disponibles:"
echo "- Frontend:           http://localhost:80"
echo "- Backend:            http://localhost:5000"
echo "- MongoDB:            http://localhost:27017"
echo "- AI Principal:       http://localhost:5011"
echo "- Recommandation:     http://localhost:5001"
echo "- Traduction:         http://localhost:5010"
echo "- Scraping:           http://localhost:5005"
echo "- Resume:             http://localhost:5003"
echo "- Analyse Images:     http://localhost:5007"
echo
echo "Pour voir les logs: docker-compose logs -f"
echo "Pour arrêter: docker-compose down"
echo

