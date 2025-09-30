const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Subscription = require('../models/Subscription');
const User = require('../models/user');
const Payment = require('../models/Payment');
const Product = require('../models/product'); // Ajoute les modèles nécessaires
const Workshop = require('../models/workshop');
const mongoose = require('mongoose');

// Route de test pour lister tous les artisans
router.get('/artisans-list', async (req, res) => {
  try {
    const artisans = await User.find({ role: 'artisan' }).select('_id nom prenom email profileImage bio');
    res.json(artisans);
  } catch (error) {
    console.error('Erreur lors de la récupération de la liste des artisans:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération de la liste des artisans' });
  }
});

// Route pour récupérer les détails d'un artisan spécifique
router.get('/artisan/:artisanId', async (req, res) => {
  try {
    // Temporairement désactivé pour le debug
    // if (req.user.role !== 'admin') {
    //   return res.status(403).json({ error: 'Accès interdit : Admin uniquement' });
    // }

    const { artisanId } = req.params;
    
    // Vérifier que l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(artisanId)) {
      return res.status(400).json({ error: 'ID d\'artisan invalide' });
    }

    // Récupérer les détails de l'artisan
    const artisan = await User.findById(artisanId).select('_id nom prenom email role bio profileImage presentation parcours specialite experience createdAt');
    
    if (!artisan) {
      return res.status(404).json({ error: 'Artisan non trouvé' });
    }

    if (artisan.role !== 'artisan') {
      return res.status(400).json({ error: 'L\'utilisateur n\'est pas un artisan' });
    }

    // Récupérer le profil de l'artisan (pour historique, bio et photo)
    const Profile = require('../models/Profile');
    const profile = await Profile.findOne({ userId: artisanId });

    // Récupérer les statistiques de l'artisan
    const [productsCount, workshopsCount] = await Promise.all([
      Product.countDocuments({ artisanId: artisanId }),
      Workshop.countDocuments({ artisanId: artisanId })
    ]);

    const artisanData = {
      ...artisan.toObject(),
      productsCount,
      workshopsCount,
      // Ajouter les données du profil si elles existent
      ...(profile && {
        historique: profile.historique || [],
        bio: profile.bio || artisan.bio,
        photo: profile.photo || null
      })
    };

    res.json(artisanData);
  } catch (error) {
    console.error('Erreur lors de la récupération des détails de l\'artisan:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des détails de l\'artisan' });
  }
});
// Route pour le suivi des abonnements et paiements des artisans
router.get('/artisans-subscriptions', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès interdit : Admin uniquement' });
    }

    const artisans = await User.find({ role: 'artisan' }).select('_id nom prenom email stripeCustomerId paymentStatus');
    console.log('Raw artisans data with stripeCustomerId:', artisans);

    const artisansData = await Promise.all(artisans.map(async (artisan) => {
      const subscription = await Subscription.findOne({ artisanId: artisan._id }).sort({ createdAt: -1 });
      // Rechercher les paiements où l'artisan est impliqué via items
      const payments = await Payment.find({
        'items.artisanId': artisan._id
      }).sort({ createdAt: -1 }).limit(5);

      let nextPaymentDate = null;
      let lastPaymentDate = null;
      if (subscription && subscription.status === 'paid') {
        nextPaymentDate = subscription.plan === 'annual'
          ? new Date(new Date(subscription.expiryDate).getTime() + 365 * 24 * 60 * 60 * 1000)
          : new Date(new Date(subscription.expiryDate).getTime() + 30 * 24 * 60 * 60 * 1000);
        lastPaymentDate = payments.length > 0 ? payments[0].createdAt : subscription.createdAt;
      }

      return {
        artisanId: artisan._id,
        nom: artisan.nom || 'N/A',
        prenom: artisan.prenom || 'N/A',
        email: artisan.email,
        stripeId: artisan.stripeCustomerId || 'Non défini',
        paymentStatus: artisan.paymentStatus,
        subscription: subscription ? {
          plan: subscription.plan,
          amount: subscription.amount,
          status: subscription.status,
          expiryDate: subscription.expiryDate,
          nextPaymentDate: nextPaymentDate ? nextPaymentDate.toISOString() : null,
          lastPaymentDate: lastPaymentDate ? lastPaymentDate.toISOString() : null,
        } : null,
        payments: payments.map(p => ({
          paymentId: p.paymentIntentId,
          amount: p.amount,
          status: p.status,
          createdAt: p.createdAt,
        })),
      };
    }));

    res.json(artisansData);
  } catch (error) {
    console.error('Erreur lors du suivi des abonnements :', error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Delete an artisan
router.delete('/artisans/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès interdit : Admin uniquement' });
    }

    const artisan = await User.findById(req.params.id);
    if (!artisan || artisan.role !== 'artisan') {
      return res.status(404).json({ error: 'Artisan non trouvé.' });
    }

    // Supprimer les abonnements
    await Subscription.deleteOne({ artisanId: artisan._id });

    // Supprimer les paiements liés
    await Payment.deleteMany({ 'items.artisanId': artisan._id });

    // Supprimer les produits liés
    await Product.deleteMany({ artisanId: artisan._id });

    // Supprimer les ateliers liés
    await Workshop.deleteMany({ artisanId: artisan._id });

    // Supprimer l'utilisateur artisan
    await User.deleteOne({ _id: artisan._id });

    res.json({ message: 'Artisan supprimé avec succès.' });
  } catch (error) {
    console.error('Error deleting artisan:', error.message);
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'artisan.' });
  }});


// Nouvelle route pour les statistiques
router.get('/artisans-statistics', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès interdit : Admin uniquement' });
    }

    // 1. Nombre total d'artisans
    const totalArtisans = await User.countDocuments({ role: 'artisan' });

    // 2. Nombre total de paiements et chiffre d'affaires
    const payments = await Payment.find();
    const totalPayments = payments.length;
    const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0) / 100; // Diviser par 100 si amount est en cents

    // 3. Montant moyen par paiement
    const averagePayment = totalPayments > 0 ? totalRevenue / totalPayments : 0;

    // 4. Paiements par artisan
    const paymentsByArtisan = await Payment.aggregate([
      { $match: { 'items.artisanId': { $exists: true } } },
      { $group: {
        _id: '$items.artisanId',
        paymentCount: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }},
      { $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'artisan'
      }},
      { $unwind: '$artisan' },
      { $project: {
        artisanId: '$_id',
        artisanName: { $concat: ['$artisan.nom', ' ', '$artisan.prenom'] },
        paymentCount: 1,
        totalAmount: 1
      }}
    ]);

    // 5. Tendance temporelle (par jour)
    const paymentsByDay = await Payment.aggregate([
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        paymentCount: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }},
      { $sort: { _id: 1 } }
    ]);

    // 6. Statut des paiements
    const paymentStatus = await Payment.aggregate([
      { $group: {
        _id: '$status',
        count: { $sum: 1 }
      }}
    ]);

    const statistics = {
      totalArtisans,
      totalPayments,
      totalRevenue,
      averagePayment: Number(averagePayment.toFixed(2)),
      paymentsByArtisan,
      paymentsByDay,
      paymentStatus
    };

    res.json(statistics);
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques :', error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour les statistiques des catégories
router.get('/category-statistics', auth, async (req, res) => {
  try {
    console.log('=== DÉBUT STATISTIQUES CATÉGORIES ===');
    console.log('User role:', req.user?.role);
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès interdit : Admin uniquement' });
    }

    console.log('Début du calcul des statistiques des catégories...');

    // Test de connexion à la base de données
    const totalProducts = await Product.countDocuments();
    const totalWorkshops = await Workshop.countDocuments();
    const totalArtisans = await User.countDocuments({ role: 'artisan' });

    console.log('Statistiques de base:', { totalProducts, totalWorkshops, totalArtisans });

    // Données de test si pas de données
    if (totalProducts === 0 && totalWorkshops === 0) {
      console.log('Aucune donnée trouvée, retour de données de test');
      const testStatistics = {
        summary: {
          totalProducts: 0,
          totalWorkshops: 0,
          totalArtisans: totalArtisans,
          totalCategories: 0
        },
        topCategories: [],
        productStats: [],
        workshopStats: [],
        topArtisans: []
      };
      return res.json(testStatistics);
    }

    // Statistiques des produits par catégorie
    const products = await Product.find({}, 'category price artisanId stock').lean();
    console.log('Produits trouvés:', products.length);
    
    const productStats = {};
    
    products.forEach(product => {
      if (!productStats[product.category]) {
        productStats[product.category] = {
          category: product.category,
          productCount: 0,
          totalRevenue: 0,
          averagePrice: 0,
          uniqueArtisans: new Set()
        };
      }
      productStats[product.category].productCount++;
      productStats[product.category].totalRevenue += (product.price * (product.stock || 0));
      productStats[product.category].uniqueArtisans.add(product.artisanId.toString());
    });

    // Convertir les Set en nombres et calculer les moyennes
    Object.keys(productStats).forEach(category => {
      const stat = productStats[category];
      stat.uniqueArtisans = stat.uniqueArtisans.size;
      stat.averagePrice = stat.productCount > 0 ? Math.round((stat.totalRevenue / stat.productCount) * 100) / 100 : 0;
      stat.totalRevenue = Math.round(stat.totalRevenue * 100) / 100;
    });

    const productStatsArray = Object.values(productStats).sort((a, b) => b.productCount - a.productCount);
    console.log('Statistiques produits calculées:', productStatsArray.length);

    // Statistiques des ateliers par catégorie
    const workshops = await Workshop.find({}, 'category price artisanId').lean();
    console.log('Ateliers trouvés:', workshops.length);
    
    const workshopStats = {};
    
    workshops.forEach(workshop => {
      if (!workshopStats[workshop.category]) {
        workshopStats[workshop.category] = {
          category: workshop.category,
          workshopCount: 0,
          totalRevenue: 0,
          averagePrice: 0,
          uniqueArtisans: new Set()
        };
      }
      workshopStats[workshop.category].workshopCount++;
      workshopStats[workshop.category].totalRevenue += workshop.price;
      workshopStats[workshop.category].uniqueArtisans.add(workshop.artisanId.toString());
    });

    // Convertir les Set en nombres et calculer les moyennes
    Object.keys(workshopStats).forEach(category => {
      const stat = workshopStats[category];
      stat.uniqueArtisans = stat.uniqueArtisans.size;
      stat.averagePrice = stat.workshopCount > 0 ? Math.round((stat.totalRevenue / stat.workshopCount) * 100) / 100 : 0;
      stat.totalRevenue = Math.round(stat.totalRevenue * 100) / 100;
    });

    const workshopStatsArray = Object.values(workshopStats).sort((a, b) => b.workshopCount - a.workshopCount);
    console.log('Statistiques ateliers calculées:', workshopStatsArray.length);

    // Top 5 des catégories les plus populaires
    const allCategories = [...productStatsArray, ...workshopStatsArray];
    const categorySummary = {};

    allCategories.forEach(item => {
      if (!categorySummary[item.category]) {
        categorySummary[item.category] = {
          category: item.category,
          totalItems: 0,
          totalRevenue: 0,
          totalArtisans: 0,
          productCount: 0,
          workshopCount: 0
        };
      }
      
      categorySummary[item.category].totalItems += item.productCount || item.workshopCount || 0;
      categorySummary[item.category].totalRevenue += item.totalRevenue || 0;
      categorySummary[item.category].totalArtisans += item.uniqueArtisans || 0;
      if (item.productCount) categorySummary[item.category].productCount = item.productCount;
      if (item.workshopCount) categorySummary[item.category].workshopCount = item.workshopCount;
    });

    const topCategories = Object.values(categorySummary)
      .sort((a, b) => b.totalItems - a.totalItems)
      .slice(0, 5);

    console.log('Top catégories calculées:', topCategories.length);

    // Statistiques par artisan
    const artisans = await User.find({ role: 'artisan' }, 'prenom nom').lean();
    console.log('Artisans trouvés:', artisans.length);
    
    const artisanStats = [];

    for (const artisan of artisans) {
      const artisanProducts = await Product.countDocuments({ artisanId: artisan._id });
      const artisanWorkshops = await Workshop.countDocuments({ artisanId: artisan._id });
      
      // Récupérer les catégories uniques
      const productCategories = await Product.distinct('category', { artisanId: artisan._id });
      const workshopCategories = await Workshop.distinct('category', { artisanId: artisan._id });
      const allCategories = [...new Set([...productCategories, ...workshopCategories])];

      artisanStats.push({
        artisanName: `${artisan.prenom} ${artisan.nom}`,
        productCount: artisanProducts,
        workshopCount: artisanWorkshops,
        totalItems: artisanProducts + artisanWorkshops,
        categories: allCategories
      });
    }

    artisanStats.sort((a, b) => b.totalItems - a.totalItems);
    const topArtisans = artisanStats.slice(0, 10);

    console.log('Top artisans calculés:', topArtisans.length);

    const statistics = {
      summary: {
        totalProducts,
        totalWorkshops,
        totalArtisans,
        totalCategories: Object.keys(categorySummary).length
      },
      topCategories,
      productStats: productStatsArray,
      workshopStats: workshopStatsArray,
      topArtisans
    };

    console.log('=== STATISTIQUES CALCULÉES AVEC SUCCÈS ===');
    console.log('Résumé:', statistics.summary);
    res.json(statistics);
  } catch (error) {
    console.error('=== ERREUR STATISTIQUES CATÉGORIES ===');
    console.error('Erreur complète:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      error: 'Erreur serveur lors du calcul des statistiques',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Route existante pour supprimer un artisan
router.delete('/artisans/:id', auth, async (req, res) => {
  // [Code existant reste inchangé]
});
module.exports = router;