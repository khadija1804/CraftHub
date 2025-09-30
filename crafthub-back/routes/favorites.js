const express = require('express');
const router = express.Router();
const Favorite = require('../models/Favorite');
const Product = require('../models/product'); // Assure-toi que ces modèles sont définis
const Workshop = require('../models/workshop');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  const userId = req.user.id;

  try {
    const favorites = await Favorite.find({ userId }).lean();

    const enrichedFavorites = await Promise.all(favorites.map(async (fav) => {
      let itemDetails = {};
      if (fav.itemType === 'product') {
        itemDetails = await Product.findById(fav.itemId).select('name price images artisanId').lean() || {};
      } else if (fav.itemType === 'workshop') {
        itemDetails = await Workshop.findById(fav.itemId).select('title price images artisanId date').lean() || {};
      }
      return {
        ...fav,
        ...itemDetails,
        imageUrl: itemDetails.images && itemDetails.images.length > 0 
          ? `/api/${fav.itemType === 'product' ? 'products' : 'workshops'}/public/images/${fav.itemId}/0`
          : '/placeholder-image.jpg'
      };
    }));

    res.json(enrichedFavorites);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des favoris' });
  }
});

router.post('/add', auth, async (req, res) => {
  const { itemId, itemType } = req.body;
  const userId = req.user.id;

  if (!itemId || !itemType) {
    return res.status(400).json({ error: 'itemId et itemType sont requis' });
  }

  try {
    const existingFavorite = await Favorite.findOne({ userId, itemId, itemType });
    if (existingFavorite) {
      return res.status(400).json({ error: 'Déjà dans les favoris' });
    }

    const favorite = new Favorite({ userId, itemId, itemType });
    await favorite.save();
    res.json({ message: 'Ajouté aux favoris', favorite });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de l\'ajout aux favoris' });
  }
});

router.delete('/remove', auth, async (req, res) => {
  const { itemId, itemType } = req.body;
  const userId = req.user.id;

  if (!itemId || !itemType) {
    return res.status(400).json({ error: 'itemId et itemType sont requis' });
  }

  try {
    const result = await Favorite.deleteOne({ userId, itemId, itemType });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Favori non trouvé' });
    }
    res.json({ message: 'Retiré des favoris' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression des favoris' });
  }
});

module.exports = router;