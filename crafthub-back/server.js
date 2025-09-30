const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db'); // Chemin correct

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '100mb' })); // Augmente la limite à 10 MB
app.use(express.urlencoded({ limit: '200mb', extended: true }));

// Charger les variables d'environnement
require('dotenv').config();

// Connexion à la base de données
connectDB(); // Appelle la fonction

// Charger les modèles (assure que tous les modèles sont enregistrés)
require('./models/user');
require('./models/product');
require('./models/workshop');
require('./models/Profile');
require('./models/comment'); // Si encore utilisé
require('./models/Subscription');
require('./models/cart');
require('./models/booking');
require('./models/Favorite');
require('./jobs/expireBookings');
// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/workshops', require('./routes/workshops'));
app.use('/api/search', require('./routes/search'));
app.use('/api/reviews', require('./routes/review'));
app.use('/api/profile', require('./routes/profile')); // Nouvelle route pour les profils
app.use('/api/payments', require('./routes/payments')); // Correction du chemin
app.use('/api/subscription', require('./routes/subscription'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/artisan', require('./routes/artisan'));
app.use('/api', require('./routes/cartAndBooking'));
app.use('/api/favorites',require('./routes/favorites'));
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));