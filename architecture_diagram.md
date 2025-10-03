# 🏗️ Architecture CraftHub - Diagramme Visuel

## Diagramme d'Architecture Globale

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CRAFTHUB PLATFORM                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                                FRONTEND                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    React.js Application                             │   │
│  │                         Port: 3000/80                               │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐  │   │
│  │  │   Pages     │ │ Components  │ │   Services  │ │    Utils    │  │   │
│  │  │             │ │             │ │             │ │             │  │   │
│  │  │ • Home      │ │ • Header    │ │ • API calls │ │ • Auth      │  │   │
│  │  │ • Products  │ │ • Footer    │ │ • AI calls  │ │ • Routes    │  │   │
│  │  │ • Workshops │ │ • Modals    │ │ • Stripe    │ │ • Workshop  │  │   │
│  │  │ • Profile   │ │ • Spinners  │ │             │ │   Utils     │  │   │
│  │  │ • Admin     │ │ • Toast     │ │             │ │             │  │   │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                   HTTP/HTTPS
                                      │
┌─────────────────────────────────────────────────────────────────────────────┐
│                              BACKEND API                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                   Node.js + Express.js                             │   │
│  │                        Port: 5000                                  │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐  │   │
│  │  │   Routes    │ │   Models    │ │ Middleware  │ │    Jobs     │  │   │
│  │  │             │ │             │ │             │ │             │  │   │
│  │  │ • Auth      │ │ • User      │ │ • Auth      │ │ • Expire    │  │   │
│  │  │ • Products  │ │ • Product   │ │ • CORS      │ │   Bookings  │  │   │
│  │  │ • Workshops │ │ • Workshop  │ │ • Multer    │ │ • Mark      │  │   │
│  │  │ • Payments  │ │ • Booking   │ │             │ │   Expired   │  │   │
│  │  │ • Admin     │ │ • Payment   │ │             │ │             │  │   │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                    │                                    │
                    │                                    │
                 HTTP/API                             HTTP/API
                    │                                    │
┌─────────────────────────────────────────┐ ┌─────────────────────────────────┐
│            AI SERVICES                  │ │      RECOMMENDATION ENGINE      │
│  ┌─────────────────────────────────┐   │ │  ┌─────────────────────────────┐ │
│  │        Python + Flask           │   │ │  │      Python + Flask         │ │
│  │         Port: 5010              │   │ │  │        Port: 5001           │ │
│  │                                 │   │ │  │                             │ │
│  │ • Description Generation        │   │ │  │ • Collaborative Filtering   │ │
│  │ • Multi-language Translation    │   │ │  │ • Content-based Filtering   │ │
│  │ • Image Analysis                │   │ │  │ • User Behavior Analysis    │ │
│  │ • SEO Optimization              │   │ │  │ • Real-time Updates         │ │
│  │ • Web Scraping                  │   │ │  │                             │ │
│  └─────────────────────────────────┘   │ │  └─────────────────────────────┘ │
└─────────────────────────────────────────┘ └─────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATABASES                                      │
│  ┌─────────────────────────────────┐     ┌─────────────────────────────────┐ │
│  │         SQLite/PostgreSQL       │     │            MongoDB              │ │
│  │                                 │     │                                 │ │
│  │ • Users & Authentication        │     │ • Recommendation Data           │ │
│  │ • Products & Categories         │     │ • User Behavior Analytics       │ │
│  │ • Workshops & Bookings          │     │ • ML Model Data                 │ │
│  │ • Orders & Payments             │     │ • Performance Metrics           │ │
│  │ • Reviews & Favorites           │     │                                 │ │
│  │ • Subscriptions                 │     │                                 │ │
│  └─────────────────────────────────┘     └─────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           EXTERNAL SERVICES                                 │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────┐ │
│  │     Stripe      │ │   Hugging Face  │ │      Gmail      │ │   Docker    │ │
│  │                 │ │                 │ │                 │ │             │ │
│  │ • Payments      │ │ • AI Models     │ │ • Email Service │ │ • Container │ │
│  │ • Subscriptions │ │ • Transformers  │ │ • Notifications │ │ • Deployment│ │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Diagramme de Flux de Données

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
│ AI Services │                    │  SQLite/    │
│  (Python)   │                    │ PostgreSQL  │
└─────────────┘                    └─────────────┘
       │
       │ Recommendations
       │
       ↓
┌─────────────┐    ML Data    ┌─────────────┐
│Recommendation│ ←──────────→ │   MongoDB   │
│   Engine    │              │             │
│  (Python)   │              │             │
└─────────────┘              └─────────────┘
```

## Diagramme des Rôles Utilisateurs

```
┌─────────────────────────────────────────────────────────────────┐
│                        CRAFTHUB USERS                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   ARTISAN   │         │   CLIENT    │         │    ADMIN    │
│             │         │             │         │             │
│ • Products  │         │ • Browse    │         │ • Users     │
│ • Workshops │         │ • Purchase  │         │ • Content   │
│ • Orders    │         │ • Book      │         │ • Analytics │
│ • Stats     │         │ • Reviews   │         │ • Reports   │
│ • Profile   │         │ • Favorites │         │ • Settings  │
└─────────────┘         └─────────────┘         └─────────────┘
       │                       │                       │
       └───────────────────────┼───────────────────────┘
                               │
                    ┌─────────────┐
                    │   BACKEND   │
                    │   SYSTEM    │
                    └─────────────┘
```

## Diagramme de Déploiement Docker

```
┌─────────────────────────────────────────────────────────────────┐
│                      DOCKER COMPOSE                            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Frontend   │    │   Backend   │    │   MongoDB   │
│ Container   │    │  Container  │    │  Container  │
│             │    │             │    │             │
│ nginx:80    │    │ node:5000   │    │ mongo:27017 │
│             │    │             │    │             │
│ React App   │    │ Express API │    │ Database    │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       └─────────────────────────────────────────┘
                          │
                   Docker Network
                          │
              ┌─────────────────────┐
              │   Volume Mapping    │
              │                     │
              │ • uploads/          │
              │ • mongo_data/       │
              └─────────────────────┘
```
