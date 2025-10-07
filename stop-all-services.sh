#!/bin/bash

echo "========================================"
echo "  CRAFT HUB - ARRÊT DES SERVICES"
echo "========================================"
echo

echo "Arrêt de tous les services..."
docker-compose down

echo
echo "========================================"
echo "  TOUS LES SERVICES ARRÊTÉS!"
echo "========================================"
echo

