# 🏗️ Architecture Physique CraftHub avec n8n

## Vue d'ensemble

Cette architecture physique présente l'intégration de n8n dans la plateforme CraftHub pour l'automatisation des workflows et l'orchestration des services.

## Architecture Physique Complète

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              CRAFTHUB PLATFORM + N8N                           │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                                FRONTEND LAYER                                   │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                    React.js Application (Nginx)                        │   │
│  │                         Port: 80 (HTTP)                               │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐      │   │
│  │  │   Pages     │ │ Components  │ │   Services  │ │    Utils    │      │   │
│  │  │             │ │             │ │             │ │             │      │   │
│  │  │ • Home      │ │ • Header    │ │ • API calls │ │ • Auth      │      │   │
│  │  │ • Products  │ │ • Footer    │ │ • AI calls  │ │ • Routes    │      │   │
│  │  │ • Workshops │ │ • Modals    │ │ • Stripe    │ │ • Workshop  │      │   │
│  │  │ • Profile   │ │ • Spinners  │ │             │ │   Utils     │      │   │
│  │  │ • Admin     │ │ • Toast     │ │             │ │             │      │   │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘      │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                   HTTP/HTTPS
                                      │
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              BACKEND API LAYER                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                   Node.js + Express.js                                 │   │
│  │                        Port: 5000                                      │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐      │   │
│  │  │   Routes    │ │   Models    │ │ Middleware  │ │    Jobs     │      │   │
│  │  │             │ │             │ │             │ │             │      │   │
│  │  │ • Auth      │ │ • User      │ │ • Auth      │ │ • Expire    │      │   │
│  │  │ • Products  │ │ • Product   │ │ • CORS      │ │   Bookings  │      │   │
│  │  │ • Workshops │ │ • Workshop  │ │ • Multer    │ │ • Mark      │      │   │
│  │  │ • Payments  │ │ • Booking   │ │             │ │   Expired   │      │   │
│  │  │ • Admin     │ │ • Payment   │ │             │ │             │      │   │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘      │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
                    │                                    │
                    │                                    │
                 HTTP/API                             HTTP/API
                    │                                    │
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              AI SERVICES LAYER                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │        Python Microservices (Flask)                                   │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐      │   │
│  │  │Translator   │ │Scraper      │ │Resume       │ │Image        │      │   │
│  │  │Port: 5010   │ │Port: 5005   │ │Port: 5003   │ │Analyzer     │      │   │
│  │  │             │ │             │ │             │ │Port: 5007   │      │   │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘      │   │
│  │  ┌─────────────┐ ┌─────────────┐                                      │   │
│  │  │AI Main      │ │Recommendation│                                     │   │
│  │  │Port: 5011   │ │Port: 5001   │                                     │   │
│  │  └─────────────┘ └─────────────┘                                      │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                              N8N WORKFLOW LAYER                                │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                    n8n Workflow Automation                             │   │
│  │                        Port: 5678                                      │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐      │   │
│  │  │   Triggers  │ │   Actions   │ │  Integrations│ │   Webhooks  │      │   │
│  │  │             │ │             │ │             │ │             │      │   │
│  │  │ • Schedule  │ │ • Email     │ │ • Stripe    │ │ • Product   │      │   │
│  │  │ • Webhook   │ │ • Database  │ │ • MongoDB   │ │   Updates   │      │   │
│  │  │ • Manual    │ │ • API Call  │ │ • Gmail     │ │ • Order     │      │   │
│  │  │ • Event     │ │ • File      │ │ • Slack     │ │   Processing│      │   │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘      │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
                    │                                    │
                    │                                    │
                 HTTP/API                             HTTP/API
                    │                                    │
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              DATABASE LAYER                                     │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │         MongoDB (Primary)              │     PostgreSQL (Optional)     │   │
│  │         Port: 27017                    │     Port: 5432                │   │
│  │  ┌─────────────────────────────────┐   │   ┌─────────────────────────┐ │   │
│  │  │ • Users & Authentication        │   │   │ • Recommendation Data   │ │   │
│  │  │ • Products & Categories         │   │   │ • User Behavior Analytics│ │   │
│  │  │ • Workshops & Bookings          │   │   │ • ML Model Data         │ │   │
│  │  │ • Orders & Payments             │   │   │ • Performance Metrics   │ │   │
│  │  │ • Reviews & Favorites           │   │   │                         │ │   │
│  │  │ • Subscriptions                 │   │   │                         │ │   │
│  │  │ • n8n Workflow Data             │   │   │                         │ │   │
│  │  └─────────────────────────────────┘   │   └─────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                           EXTERNAL SERVICES LAYER                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────────┐ │
│  │   Stripe    │ │Hugging Face │ │    Gmail    │ │    Slack    │ │    n8n    │ │
│  │             │ │             │ │             │ │             │ │           │ │
│  │ • Payments  │ │ • AI Models │ │ • Email     │ │ • Notifications│ • Workflow│ │
│  │ • Webhooks  │ │ • Transformers│ • Notifications│ • Alerts    │   Engine   │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ └───────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                              DOCKER CONTAINERS                                 │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────────┐ │
│  │  Frontend   │ │   Backend   │ │   MongoDB   │ │     n8n     │ │  Python   │ │
│  │ Container   │ │  Container  │ │  Container  │ │ Container   │ │Services   │ │
│  │             │ │             │ │             │ │             │ │Container  │ │
│  │ nginx:80    │ │ node:5000   │ │ mongo:27017 │ │ n8n:5678    │ │flask:5001-│ │
│  │             │ │             │ │             │ │             │ │5011       │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ └───────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 🔄 Flux de Données avec n8n

```
┌─────────────┐    HTTP Requests    ┌─────────────┐
│   Client    │ ──────────────────→ │   Backend   │
│  (React)    │ ←────────────────── │  (Node.js)  │
└─────────────┘    JSON Responses   └─────────────┘
       │                                    │
       │                                    │
       │ AI Requests                        │ Database
       │                                    │ Operations
       ↓                                    ↓
┌─────────────┐                    ┌─────────────┐
│ AI Services │                    │  MongoDB    │
│  (Python)   │                    │             │
└─────────────┘                    └─────────────┘
       │                                    │
       │                                    │
       │ n8n Webhooks                      │ n8n Triggers
       │                                    │
       ↓                                    ↓
┌─────────────┐    Workflow         ┌─────────────┐
│     n8n     │ ←─────────────────→ │  External   │
│ Workflows   │    Automation       │  Services   │
└─────────────┘                     └─────────────┘
```

## 🎯 Intégration n8n dans CraftHub

### Workflows n8n Principaux :

#### 1. **Gestion des Commandes**
- **Trigger** : Nouvelle commande créée
- **Actions** : 
  - Email de confirmation client
  - Notification Slack pour l'artisan
  - Mise à jour du stock automatique
  - Génération de facture PDF

#### 2. **Système de Recommandations**
- **Trigger** : Nouveau produit ajouté
- **Actions** : 
  - Analyse IA du produit
  - Génération de descriptions SEO
  - Optimisation des tags et catégories
  - Mise à jour du système de recommandations

#### 3. **Notifications Utilisateurs**
- **Trigger** : Événements utilisateur (inscription, commande, etc.)
- **Actions** : 
  - Emails automatiques de bienvenue
  - Notifications push pour les commandes
  - Rappels pour les ateliers
  - Emails de suivi post-achat

#### 4. **Rapports et Analytics**
- **Trigger** : Planifié (quotidien/hebdomadaire)
- **Actions** : 
  - Génération de rapports de vente
  - Envoi par email aux administrateurs
  - Mise à jour des tableaux de bord
  - Analyse des tendances

#### 5. **Intégration Paiements**
- **Trigger** : Webhook Stripe
- **Actions** : 
  - Mise à jour statut commande
  - Envoi facture automatique
  - Notification de paiement
  - Déclenchement de la logistique

#### 6. **Gestion des Ateliers**
- **Trigger** : Réservation d'atelier
- **Actions** : 
  - Confirmation par email
  - Ajout au calendrier
  - Rappel 24h avant
  - Suivi post-atelier

## 🔧 Configuration Docker Compose avec n8n

Pour intégrer n8n dans votre architecture existante, ajoutez ce service à votre `docker-compose.yml` :

```yaml
  # n8n Workflow Automation
  n8n:
    image: n8nio/n8n:latest
    container_name: crafthub-n8n
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=your_password
      - N8N_HOST=localhost
      - N8N_PORT=5678
      - N8N_PROTOCOL=http
      - WEBHOOK_URL=http://localhost:5678/
      - GENERIC_TIMEZONE=Europe/Paris
    ports:
      - "5678:5678"
    volumes:
      - n8n_data:/home/node/.n8n
      - ./n8n-workflows:/home/node/.n8n/workflows
    restart: unless-stopped
    depends_on:
      - mongo
      - backend
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:5678/healthz"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  mongo_data:
  n8n_data:
```

## 📊 Avantages de l'Intégration n8n

1. **Automatisation des Processus** : Réduction des tâches manuelles
2. **Intégration Facile** : Connecteurs prêts à l'emploi
3. **Scalabilité** : Gestion des workflows complexes
4. **Monitoring** : Suivi en temps réel des automations
5. **Flexibilité** : Modification facile des workflows
6. **Fiabilité** : Gestion des erreurs et retry automatique

## 🚀 Déploiement

1. **Ajouter n8n au docker-compose.yml**
2. **Configurer les variables d'environnement**
3. **Créer les workflows n8n**
4. **Tester les intégrations**
5. **Déployer en production**

Cette architecture physique intègre n8n comme couche d'automatisation et d'orchestration entre vos services existants, permettant une gestion automatisée des workflows métier de votre plateforme CraftHub.
