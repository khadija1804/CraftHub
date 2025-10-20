# 🧠 Architecture Logique CraftHub avec n8n

## Vue d'ensemble

Cette architecture logique présente l'organisation des composants fonctionnels, des flux de données et des interactions logiques de la plateforme CraftHub avec l'intégration de n8n.

## 🏗️ Architecture Logique Complète

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              CRAFTHUB LOGICAL ARCHITECTURE                      │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                                PRESENTATION LAYER                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                    React.js Frontend Components                        │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐      │   │
│  │  │   Pages     │ │ Components  │ │   Services  │ │    Hooks    │      │   │
│  │  │             │ │             │ │             │ │             │      │   │
│  │  │ • Home      │ │ • Header    │ │ • API       │ │ • useAuth   │      │   │
│  │  │ • Products  │ │ • Footer    │ │ • AI        │ │ • useCart   │      │   │
│  │  │ • Workshops │ │ • Modals    │ │ • Stripe    │ │ • useNotify │      │   │
│  │  │ • Profile   │ │ • Spinners  │ │ • n8n       │ │ • useData   │      │   │
│  │  │ • Admin     │ │ • Toast     │ │             │ │             │      │   │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘      │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                   HTTP/API
                                      │
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              BUSINESS LOGIC LAYER                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                    Node.js Backend Services                            │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐      │   │
│  │  │   Routes    │ │ Middleware  │ │   Models    │ │   Jobs      │      │   │
│  │  │             │ │             │ │             │ │             │      │   │
│  │  │ • Auth      │ │ • JWT Auth  │ │ • User      │ │ • Expire    │      │   │
│  │  │ • Products  │ │ • CORS      │ │ • Product   │ │   Bookings  │      │   │
│  │  │ • Workshops │ │ • Multer    │ │ • Workshop  │ │ • Mark      │      │   │
│  │  │ • Payments  │ │ • Validation│ │ • Booking   │ │   Expired   │      │   │
│  │  │ • Admin     │ │ • Rate Limit│ │ • Payment   │ │ • Cleanup   │      │   │
│  │  │ • Cart      │ │ • Error     │ │ • Review    │ │             │      │   │
│  │  │ • Favorites │ │             │ │ • Favorite  │ │             │      │   │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘      │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
                    │                                    │
                    │                                    │
                 HTTP/API                             Event Triggers
                    │                                    │
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              AI SERVICES LAYER                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                    Python AI Microservices                             │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐      │   │
│  │  │Translator   │ │Scraper      │ │Resume       │ │Image        │      │   │
│  │  │Service      │ │Service      │ │Service      │ │Analyzer     │      │   │
│  │  │             │ │             │ │             │ │Service      │      │   │
│  │  │ • FR→EN     │ │ • Web       │ │ • Text      │ │ • Object    │      │   │
│  │  │ • EN→FR     │ │   Scraping  │ │   Summary   │ │   Detection │      │   │
│  │  │ • AR→FR     │ │ • Data      │ │ • Review    │ │ • Tag       │      │   │
│  │  │ • FR→AR     │ │   Extraction│ │   Analysis  │ │   Generation│      │   │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘      │   │
│  │  ┌─────────────┐ ┌─────────────┐                                      │   │
│  │  │AI Main      │ │Recommendation│                                     │   │
│  │  │Service      │ │Service      │                                     │   │
│  │  │             │ │             │                                     │   │
│  │  │ • SEO Gen   │ │ • Collab    │                                     │   │
│  │  │ • Content   │ │   Filtering │                                     │   │
│  │  │ • Analysis  │ │ • Content   │                                     │   │
│  │  │ • RAG       │ │   Based     │                                     │   │
│  │  └─────────────┘ └─────────────┘                                      │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                              N8N WORKFLOW LAYER                                │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                    n8n Workflow Engine                                 │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐      │   │
│  │  │   Triggers  │ │   Actions   │ │  Integrations│ │   Webhooks  │      │   │
│  │  │             │ │             │ │             │ │             │      │   │
│  │  │ • Schedule  │ │ • Email     │ │ • Stripe    │ │ • Product   │      │   │
│  │  │ • Webhook   │ │ • Database  │ │ • MongoDB   │ │   Events    │      │   │
│  │  │ • Manual    │ │ • API Call  │ │ • Gmail     │ │ • Order     │      │   │
│  │  │ • Event     │ │ • File      │ │ • Slack     │ │   Events    │      │   │
│  │  │ • Cron      │ │ • HTTP      │ │ • Discord   │ │ • User      │      │   │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘      │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
                    │                                    │
                    │                                    │
                 HTTP/API                             Event Streams
                    │                                    │
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              DATA ACCESS LAYER                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                    MongoDB Database                                    │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐      │   │
│  │  │Collections  │ │   Indexes   │ │   Schemas   │ │   Methods   │      │   │
│  │  │             │ │             │ │             │ │             │      │   │
│  │  │ • users     │ │ • email     │ │ • User      │ │ • isActive  │      │   │
│  │  │ • products  │ │ • artisanId │ │ • Product   │ │ • validate  │      │   │
│  │  │ • workshops │ │ • category  │ │ • Workshop  │ │ • preSave   │      │   │
│  │  │ • bookings  │ │ • date      │ │ • Booking   │ │ • postSave  │      │   │
│  │  │ • payments  │ │ • status    │ │ • Payment   │ │ • findActive│      │   │
│  │  │ • reviews   │ │ • createdAt │ │ • Review    │ │             │      │   │
│  │  │ • favorites │ │             │ │ • Favorite  │ │             │      │   │
│  │  │ • subscriptions│           │ │ • Subscription│             │      │   │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘      │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 🔄 Flux de Données Logiques

### 1. **Flux d'Authentification**
```
User Login → JWT Middleware → User Validation → Token Generation → Frontend Storage
     │
     └── n8n Webhook → User Activity Log → Analytics Update
```

### 2. **Flux de Création de Produit**
```
Artisan Input → Validation → AI Enhancement → Database Save → n8n Trigger
     │              │              │              │              │
     │              │              │              │              └── Email Notification
     │              │              │              │              └── SEO Optimization
     │              │              │              │              └── Recommendation Update
     │              │              │              │
     │              │              │              └── Product Created Event
     │              │              │
     │              │              └── AI Description Generation
     │              │              └── Image Analysis
     │              │              └── Translation
     │              │
     │              └── Role Validation
     │              └── Subscription Check
     │              └── Input Sanitization
     │
     └── Form Submission
```

### 3. **Flux de Commande**
```
Order Creation → Payment Processing → Inventory Update → Notification Chain
     │                │                    │                    │
     │                │                    │                    ├── Email Client
     │                │                    │                    ├── Notify Artisan
     │                │                    │                    ├── Update Analytics
     │                │                    │                    └── Generate Invoice
     │                │
     │                ├── Stripe Payment
     │                ├── Payment Validation
     │                └── Payment Confirmation
     │
     └── Cart Validation
     └── Stock Check
     └── Price Calculation
```

## 🎯 Composants Logiques Principaux

### **1. Gestion des Utilisateurs**
```javascript
// Modèle User
{
  nom: String,
  prenom: String,
  email: String (unique),
  password: String (hashed),
  role: ['client', 'artisan', 'admin'],
  resetPasswordToken: String,
  resetPasswordExpires: Date
}

// Logique d'authentification
- JWT Token Generation
- Password Hashing (bcrypt)
- Role-based Access Control
- Password Reset Flow
```

### **2. Gestion des Produits**
```javascript
// Modèle Product
{
  name: String,
  price: Number,
  category: String,
  stock: Number,
  description: String,
  images: [Buffer],
  artisanId: ObjectId,
  material: String,
  size: String,
  createdAt: Date
}

// Logique métier
- Artisan Authorization
- Subscription Validation
- AI Enhancement Integration
- Stock Management
```

### **3. Gestion des Ateliers**
```javascript
// Modèle Workshop
{
  title: String,
  price: Number,
  category: String,
  places: Number,
  description: String,
  images: [Buffer],
  date: Date,
  booking_time: String,
  duration: Number,
  location: String,
  artisanId: ObjectId,
  createdAt: Date
}

// Logique métier
- Subscription Requirement
- Capacity Management
- Booking Validation
- Schedule Management
```

### **4. Système de Paiements**
```javascript
// Modèle Payment
{
  userId: ObjectId,
  items: [{
    productId: ObjectId,
    workshopId: ObjectId,
    artisanId: ObjectId,
    quantity: Number,
    price: Number
  }],
  totalAmount: Number,
  status: String,
  stripePaymentId: String,
  createdAt: Date
}

// Logique métier
- Stripe Integration
- Payment Validation
- Order Processing
- Refund Handling
```

### **5. Système d'Abonnements**
```javascript
// Modèle Subscription
{
  artisanId: ObjectId,
  plan: ['monthly', 'annual'],
  amount: Number,
  expiryDate: Date,
  status: ['pending', 'paid', 'expired'],
  createdAt: Date,
  updatedAt: Date
}

// Logique métier
- Plan Validation
- Expiry Management
- Feature Access Control
- Auto-renewal Logic
```

## 🤖 Intégration n8n - Workflows Logiques

### **1. Workflow de Nouvelle Commande**
```yaml
Trigger: Webhook - Order Created
Actions:
  - Email Notification (Client)
  - Email Notification (Artisan)
  - Slack Notification (Admin)
  - Inventory Update
  - Analytics Update
  - Invoice Generation
```

### **2. Workflow de Nouveau Produit**
```yaml
Trigger: Webhook - Product Created
Actions:
  - AI Description Enhancement
  - SEO Optimization
  - Image Analysis
  - Category Validation
  - Recommendation Update
  - Admin Notification
```

### **3. Workflow de Réservation d'Atelier**
```yaml
Trigger: Webhook - Workshop Booking
Actions:
  - Email Confirmation
  - Calendar Integration
  - Reminder Setup (24h before)
  - Capacity Update
  - Payment Processing
  - Follow-up Email (Post-workshop)
```

### **4. Workflow de Gestion des Abonnements**
```yaml
Trigger: Cron - Daily Check
Actions:
  - Check Expired Subscriptions
  - Send Renewal Reminders
  - Disable Features for Expired
  - Generate Reports
  - Update Analytics
```

### **5. Workflow de Notifications Utilisateur**
```yaml
Trigger: Event - User Action
Actions:
  - Welcome Email (New User)
  - Order Confirmation
  - Workshop Reminders
  - Subscription Alerts
  - Marketing Emails
```

## 🔧 Patterns Architecturaux

### **1. Microservices Pattern**
- Services AI indépendants
- Communication via HTTP/API
- Déploiement containerisé
- Scaling horizontal

### **2. Event-Driven Architecture**
- n8n comme orchestrateur
- Webhooks pour les événements
- Asynchronous processing
- Loose coupling

### **3. Repository Pattern**
- Modèles MongoDB
- Abstraction des données
- Validation centralisée
- Business logic encapsulation

### **4. Middleware Pattern**
- Authentication middleware
- Validation middleware
- Error handling middleware
- CORS middleware

### **5. Observer Pattern**
- n8n workflows
- Event listeners
- Notification system
- Real-time updates

## 📊 Gestion des États

### **États des Commandes**
```
pending → processing → paid → shipped → delivered
    ↓         ↓          ↓        ↓         ↓
  n8n      n8n       n8n     n8n      n8n
```

### **États des Abonnements**
```
pending → paid → active → expired → cancelled
    ↓       ↓       ↓        ↓         ↓
  n8n    n8n     n8n      n8n       n8n
```

### **États des Ateliers**
```
scheduled → booking → confirmed → completed
     ↓         ↓         ↓          ↓
   n8n       n8n       n8n        n8n
```

## 🔒 Sécurité Logique

### **1. Authentification**
- JWT tokens
- Password hashing
- Session management
- Token expiration

### **2. Autorisation**
- Role-based access
- Resource ownership
- Feature permissions
- API rate limiting

### **3. Validation**
- Input sanitization
- Data validation
- SQL injection prevention
- XSS protection

### **4. Audit**
- Activity logging
- Error tracking
- Performance monitoring
- Security alerts

Cette architecture logique fournit une base solide pour comprendre les interactions entre les composants, les flux de données et l'intégration de n8n dans votre plateforme CraftHub.
