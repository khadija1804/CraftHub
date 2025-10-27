const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Payment = require('../models/payment');
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

    // Statistiques pour cet artisan - PRODUITS SEULEMENT
    const productStats = await Payment.aggregate([
      { $match: { 
        'items.artisanId': artisan._id,
        type: 'cart' // Seulement les commandes de produits
      }},
      { $group: {
        _id: null,
        paymentCount: { $sum: 1 },
        totalRevenue: { $sum: '$amount' },
        lastActivity: { $max: '$createdAt' },
        productsSold: { $push: '$items' }
      }}
    ]);

    // Statistiques pour cet artisan - ATELIERS SEULEMENT
    const workshopStats = await Payment.aggregate([
      { $match: { 
        'items.artisanId': artisan._id,
        type: 'reservation' // Seulement les réservations d'ateliers
      }},
      { $group: {
        _id: null,
        paymentCount: { $sum: 1 },
        totalRevenue: { $sum: '$amount' },
        lastActivity: { $max: '$createdAt' },
        workshopsSold: { $push: '$items' }
      }}
    ]);

    // Formater les résultats des produits
    const productData = productStats.length > 0 ? productStats[0] : { paymentCount: 0, totalRevenue: 0, lastActivity: null, productsSold: [] };
    productData.totalRevenue = productData.totalRevenue / 100; // Convertir en dollars
    productData.productsByName = {};
    productData.productsSold.forEach(item => {
      item.forEach(prod => {
        if (prod.name) {
          productData.productsByName[prod.name] = (productData.productsByName[prod.name] || 0) + (prod.quantity || 1);
        }
      });
    });

    // Formater les résultats des ateliers
    const workshopData = workshopStats.length > 0 ? workshopStats[0] : { paymentCount: 0, totalRevenue: 0, lastActivity: null, workshopsSold: [] };
    workshopData.totalRevenue = workshopData.totalRevenue / 100; // Convertir en dollars
    workshopData.workshopsByName = {};
    workshopData.workshopsSold.forEach(item => {
      item.forEach(workshop => {
        if (workshop.title) {
          workshopData.workshopsByName[workshop.title] = (workshopData.workshopsByName[workshop.title] || 0) + (workshop.quantity || 1);
        }
      });
    });

    // Récupérer le nombre total d'ateliers créés par cet artisan
    const Workshop = require('../models/workshop');
    const totalWorkshopsCreated = await Workshop.countDocuments({ artisanId: artisan._id });

    // Calculer les totaux combinés
    const totalPaymentCount = productData.paymentCount + workshopData.paymentCount;
    const totalRevenue = productData.totalRevenue + workshopData.totalRevenue;
    const lastActivity = productData.lastActivity && workshopData.lastActivity 
      ? (new Date(productData.lastActivity) > new Date(workshopData.lastActivity) ? productData.lastActivity : workshopData.lastActivity)
      : (productData.lastActivity || workshopData.lastActivity);

    res.json({
      artisanName: `${artisan.nom || 'N/A'} ${artisan.prenom || 'N/A'}`,
      paymentCount: totalPaymentCount,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      lastActivity: lastActivity ? new Date(lastActivity).toISOString() : null,
      totalWorkshopsCreated: totalWorkshopsCreated, // Nombre total d'ateliers créés
      topProducts: Object.entries(productData.productsByName)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5) // Top 5 produits
        .map(([name, quantity]) => ({ name, quantity })),
      topWorkshops: Object.entries(workshopData.workshopsByName)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5) // Top 5 ateliers
        .map(([title, quantity]) => ({ name: title, quantity }))
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques de l\'artisan :', error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;