<<<<<<< HEAD
# 🎨 CraftHub - Artisan Marketplace Platform

CraftHub is a comprehensive e-commerce platform designed specifically for artisans and craft enthusiasts. It provides a complete ecosystem for buying, selling, and discovering handmade products and workshops.

## 🌟 Features

### For Artisans
- **Product Management**: Add, edit, and manage handmade products with detailed descriptions and images
- **Workshop Creation**: Create and manage workshops for teaching craft skills
- **Order Management**: Track orders and manage customer interactions
- **Analytics Dashboard**: View sales statistics and performance metrics
- **Subscription System**: Premium features and subscription management
- **Profile Management**: Customizable artisan profiles with portfolios

### For Customers
- **Product Discovery**: Browse and search through handmade products
- **Workshop Booking**: Book and attend craft workshops
- **Recommendation System**: AI-powered product recommendations
- **Favorites & Cart**: Save favorite items and manage shopping cart
- **User Reviews**: Rate and review products and workshops
- **Category Browsing**: Explore products by categories

### For Administrators
- **User Management**: Manage artisans, customers, and admin accounts
- **Content Moderation**: Review and approve products and workshops
- **Analytics & Reports**: Comprehensive platform statistics
- **Subscription Tracking**: Monitor subscription status and payments
- **Category Management**: Organize and manage product categories

## 🏗️ Architecture

CraftHub is built using a microservices architecture with the following components:

### Frontend (React.js)
- **Location**: `client/`
- **Technology**: React 19.1.1, React Router, Axios
- **UI Framework**: Custom CSS with Tailwind CSS
- **Features**: Responsive design, real-time updates, modern UI/UX

### Backend API (Node.js)
- **Location**: `crafthub-back/`
- **Technology**: Express.js, Sequelize ORM
- **Database**: SQLite (development), PostgreSQL (production)
- **Authentication**: JWT-based authentication
- **Payment**: Stripe integration for payments and subscriptions

### AI Services (Python)
- **Location**: `crafthub-python/`
- **Technology**: Flask, Hugging Face Transformers
- **Features**: 
  - AI-powered product description generation
  - Multi-language translation
  - Image analysis and processing
  - SEO optimization for product listings

### Recommendation Engine (Python)
- **Location**: `recommandation/`
- **Technology**: Flask, scikit-learn, MongoDB
- **Features**: 
  - Collaborative filtering
  - Content-based recommendations
  - User behavior analysis
  - Real-time recommendation updates

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Python (v3.8 or higher)
- MongoDB (for recommendation engine)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/khadija1804/CraftHub.git
   cd CraftHub
   ```

2. **Install Frontend Dependencies**
   ```bash
   cd client
   npm install
   ```

3. **Install Backend Dependencies**
   ```bash
   cd ../crafthub-back
   npm install
   ```

4. **Install Python Dependencies**
   ```bash
   cd ../crafthub-python
   pip install -r requirements.txt
   ```

5. **Install Recommendation Engine Dependencies**
   ```bash
   cd ../recommandation
   pip install -r requirements.txt
   ```

### Environment Setup

1. **Backend Environment Variables**
   Create a `.env` file in `crafthub-back/`:
   ```env
   PORT=5000
   JWT_SECRET=your_jwt_secret
   STRIPE_SECRET_KEY=your_stripe_secret_key
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=crafthub
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   ```

2. **Python AI Service Environment**
   Create a `.env` file in `crafthub-python/`:
   ```env
   FLASK_ENV=development
   HUGGINGFACE_API_KEY=your_huggingface_api_key
   ```

3. **Recommendation Engine Environment**
   Create a `.env` file in `recommandation/`:
   ```env
   MONGO_URI=mongodb://localhost:27017/craft_hub
   ```

### Running the Application

1. **Start the Backend API**
   ```bash
   cd crafthub-back
   npm start
   ```
   The API will be available at `http://localhost:5000`

2. **Start the Frontend**
   ```bash
   cd client
   npm start
   ```
   The frontend will be available at `http://localhost:3000`

3. **Start the AI Service**
   ```bash
   cd crafthub-python
   python app.py
   ```
   The AI service will be available at `http://localhost:5010`

4. **Start the Recommendation Engine**
   ```bash
   cd recommandation
   python recommendation.py
   ```
   The recommendation service will be available at `http://localhost:5001`

## 📁 Project Structure

```
CraftHub/
├── client/                     # React.js Frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/             # Page components
│   │   ├── services/          # API services
│   │   ├── hooks/             # Custom React hooks
│   │   └── utils/             # Utility functions
│   └── public/                # Static assets
├── crafthub-back/             # Node.js Backend API
│   ├── models/                # Database models
│   ├── routes/                # API routes
│   ├── middleware/            # Custom middleware
│   ├── config/                # Configuration files
│   └── jobs/                  # Background jobs
├── crafthub-python/           # Python AI Services
│   ├── app.py                 # Main Flask application
│   ├── image_analyzer.py      # Image analysis service
│   ├── real_ai_service.py     # AI service implementation
│   └── scraper.py             # Web scraping utilities
├── recommandation/            # Recommendation Engine
│   └── recommendation.py      # ML-based recommendation service
└── README.md                  # This file
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/products/:id` - Get product details

### Workshops
- `GET /api/workshops` - Get all workshops
- `POST /api/workshops` - Create new workshop
- `PUT /api/workshops/:id` - Update workshop
- `DELETE /api/workshops/:id` - Delete workshop
- `GET /api/workshops/:id` - Get workshop details

### AI Services
- `POST /ai/generate-rag` - Generate SEO-optimized product descriptions
- `POST /ai/translate` - Translate text between languages
- `GET /ai/health` - AI service health check

### Recommendations
- `POST /recommend` - Get personalized product recommendations

## 🎨 Key Features

### Multi-Role System
- **Artisans**: Can create and manage products/workshops
- **Customers**: Can browse, purchase, and book workshops
- **Administrators**: Can manage the entire platform

### Advanced Search & Filtering
- Category-based filtering
- Price range filtering
- Location-based search
- Advanced text search with AI

### Payment Integration
- Stripe payment processing
- Subscription management
- Secure payment handling

### Real-time Features
- Live order updates
- Real-time notifications
- Dynamic recommendation updates

## 🛠️ Technologies Used

### Frontend
- React 19.1.1
- React Router DOM
- Axios for API calls
- Chart.js for analytics
- React Toastify for notifications
- Tailwind CSS for styling

### Backend
- Node.js with Express.js
- Sequelize ORM
- JWT for authentication
- Stripe for payments
- SQLite/PostgreSQL database
- Multer for file uploads

### AI & ML
- Python Flask
- Hugging Face Transformers
- scikit-learn for ML
- MongoDB for recommendation data
- Image processing libraries

### DevOps & Tools
- Git for version control
- npm for package management
- pip for Python dependencies
- Environment-based configuration

## 📊 Database Schema

The application uses multiple databases:
- **SQLite/PostgreSQL**: Main application data (users, products, orders)
- **MongoDB**: Recommendation engine data and analytics

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Input validation and sanitization
- Secure file upload handling
- Environment variable protection

## 🚀 Deployment

### Production Deployment
1. Set up production databases (PostgreSQL, MongoDB)
2. Configure environment variables
3. Build the React frontend: `npm run build`
4. Deploy backend API to your server
5. Deploy AI services to Python-compatible hosting
6. Configure reverse proxy (nginx recommended)

### Docker Support
The application can be containerized using Docker for easier deployment and scaling.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Khadija** - *Initial work* - [khadija1804](https://github.com/khadija1804)

## 🙏 Acknowledgments

- React community for the amazing framework
- Stripe for payment processing
- Hugging Face for AI models
- All contributors and testers

## 📞 Support

For support, email support@crafthub.com or create an issue in the repository.

---

**CraftHub** - Where creativity meets commerce! 🎨✨
=======
# CraftHub
>>>>>>> 529ebed35c4be0501b0a309e4517338fb0ddc201
