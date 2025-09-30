const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Payment = require('../models/Payment');
const User = require('../models/user');
const mongoose = require('mongoose'); // Déjà inclus

// Route pour les statistiques de l'artisan connecté
router.get('/my-statistics', auth, async (req, res) => {
  try {
    console.log('req.user reçu:', req.user); // Log détaillé de req.user
    const artisanId = new mongoose.Types.ObjectId(req.user.id); // Correction ici
    console.log('Artisan ID converti:', artisanId); // Vérifie la conversion
    const artisan = await User.findById(artisanId);
    console.log('Artisan trouvé:', artisan); // Log après la recherche

    if (!artisan) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    if (artisan.role !== 'artisan') {
      console.log('Rôle de l\'artisan:', artisan.role);
      return res.status(403).json({ error: 'Accès interdit : Artisan uniquement' });
    }

    // Statistiques pour cet artisan
    const artisanStats = await Payment.aggregate([
      { $match: { 'items.artisanId': artisan._id } },
      { $group: {
        _id: null,
        paymentCount: { $sum: 1 },
        totalRevenue: { $sum: '$amount' },
        lastActivity: { $max: '$createdAt' },
        productsSold: { $push: '$items' }
      }}
    ]);

    // Formater les résultats
    const stats = artisanStats.length > 0 ? artisanStats[0] : { paymentCount: 0, totalRevenue: 0, lastActivity: null, productsSold: [] };
    stats.totalRevenue = stats.totalRevenue / 100; // Convertir en dollars
    stats.productsByName = {};
    stats.productsSold.forEach(item => {
      item.forEach(prod => {
        if (prod.name) {
          stats.productsByName[prod.name] = (stats.productsByName[prod.name] || 0) + (prod.quantity || 1);
        }
      });
    });

    res.json({
      artisanName: `${artisan.nom || 'N/A'} ${artisan.prenom || 'N/A'}`,
      paymentCount: stats.paymentCount,
      totalRevenue: Number(stats.totalRevenue.toFixed(2)),
      lastActivity: stats.lastActivity ? new Date(stats.lastActivity).toISOString() : null,
      topProducts: Object.entries(stats.productsByName)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5) // Top 5 produits
        .map(([name, quantity]) => ({ name, quantity }))
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques de l\'artisan :', error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;