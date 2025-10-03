const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Workshop = require('../models/workshop');
const Comment = require('../models/comment');
const Subscription = require('../models/Subscription');
const multer = require('multer');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get('/public', async (req, res) => {
  try {
    const workshops = await Workshop.find().populate('artisanId', 'nom prenom');
    res.json(workshops);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const workshops = await Workshop.find({ artisanId: req.user.id });
    res.json(workshops);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', auth, upload.array('images', 3), async (req, res) => {
  console.log('Received body:', req.body); // Débogage
  console.log('Received files:', req.files); // Débogage
  const { title, date, booking_time, duration, location, category, price, description, places } = req.body;
  try {
    if (req.user.role !== 'artisan') {
      return res.status(403).json({ error: 'Only artisans can add workshops' });
    }

    // Vérifier l'abonnement de l'artisan
    const subscription = await Subscription.findOne({ 
      artisanId: req.user.id 
    }).sort({ createdAt: -1 });

    if (!subscription || subscription.status !== 'paid' || subscription.expiryDate <= new Date()) {
      return res.status(403).json({ 
        error: 'Vous devez avoir un abonnement actif pour ajouter des ateliers',
        requiresSubscription: true
      });
    }
    const images = req.files ? req.files.map(file => ({
      data: file.buffer,
      contentType: file.mimetype,
    })) : [];
    const workshop = new Workshop({
      title: title || '',
      description: description || '', // Doit être rempli
      price: parseFloat(price) || 0,
      category: category || '',
      date: date || new Date(),
      booking_time: booking_time || '',
      duration: parseInt(duration) || 0,
      location: location || '',
      places: parseInt(places) || 0,
      images,
      artisanId: req.user.id,
    });
    await workshop.save();
    res.status(201).json(workshop);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const workshop = await Workshop.findOne({ _id: req.params.id, artisanId: req.user.id });
    if (!workshop) return res.status(404).json({ error: 'Workshop not found or not authorized' });
    res.json(workshop);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', auth, upload.array('images', 3), async (req, res) => {
  const { title, date, booking_time, duration, location, category, price, description } = req.body;
  try {
    const workshop = await Workshop.findOne({ _id: req.params.id, artisanId: req.user.id });
    if (!workshop) return res.status(404).json({ error: 'Workshop not found or not authorized' });
    workshop.title = title || workshop.title;
    workshop.date = date || workshop.date;
    workshop.booking_time = booking_time || workshop.booking_time;
    workshop.duration = duration || workshop.duration;
    workshop.location = location || workshop.location;
    workshop.category = category || workshop.category;
    workshop.price = price || workshop.price;
    workshop.description = description || workshop.description;
    if (req.files && req.files.length > 0) {
      workshop.images = req.files.map(file => ({
        data: file.buffer,
        contentType: file.mimetype,
      }));
    }
    await workshop.save();
    res.json(workshop);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const workshop = await Workshop.findOne({ _id: req.params.id, artisanId: req.user.id });
    if (!workshop) return res.status(404).json({ error: 'Workshop not found or not authorized' });
    await Workshop.deleteOne({ _id: req.params.id, artisanId: req.user.id });
    res.status(200).json({ message: 'Workshop deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Routes pour images (public et auth)
router.get('/public/images/:id/:index', async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id);
    if (!workshop) return res.status(404).json({ error: 'Workshop not found' });
    const index = parseInt(req.params.index, 10);
    if (isNaN(index) || index < 0 || index >= workshop.images.length) {
      return res.status(404).json({ error: 'Image index out of range' });
    }
    const image = workshop.images[index];
    res.set('Content-Type', image.contentType);
    res.send(image.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/images/:index', auth, async (req, res) => {
  try {
    const workshop = await Workshop.findOne({ _id: req.params.id, artisanId: req.user.id });
    if (!workshop) return res.status(404).json({ error: 'Workshop not found or not authorized' });
    const index = parseInt(req.params.index, 10);
    if (isNaN(index) || index < 0 || index >= workshop.images.length) {
      return res.status(404).json({ error: 'Image index out of range' });
    }
    const image = workshop.images[index];
    res.set('Content-Type', image.contentType);
    res.send(image.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/public/:id', async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id).populate('artisanId', 'nom prenom');
    if (!workshop) return res.status(404).json({ error: 'Workshop not found' });
    res.json(workshop);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/comments', auth, async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id);
    if (!workshop) return res.status(404).json({ error: 'Workshop not found' });
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Comment text is required' });
    const comment = new Comment({
      workshopId: req.params.id,
      userId: req.user.id,
      text,
    });
    await comment.save();
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ workshopId: req.params.id }).populate('userId', 'nom prenom');
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/by-artisan/:artisanId', async (req, res) => {
  try {
    const workshops = await Workshop.find({ artisanId: req.params.artisanId }).populate('artisanId', 'nom prenom');
    res.json(workshops);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.put('/update-places/:id', auth, async (req, res) => {
  try {
    const { places } = req.body; // Nombre de places à soustraire
    const workshop = await Workshop.findById(req.params.id);
    if (!workshop) return res.status(404).json({ error: 'Workshop not found' });

    // Vérifier si le nombre de places est valide
    if (workshop.places < places) {
      return res.status(400).json({ error: 'Pas assez de places disponibles' });
    }

    workshop.places -= places;
    await workshop.save();
    res.json({ message: 'Places mises à jour avec succès', updatedPlaces: workshop.places });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/artisans/:artisanId/workshops-stats', auth, async (req, res) => {
  try {
    const artisanId = req.params.artisanId;

    // Vérifier si l'utilisateur a l'autorisation (admin ou l'artisan lui-même)
    if (req.user.role !== 'admin' && req.user.id !== artisanId) {
      return res.status(403).json({ error: 'Accès interdit' });
    }

    // Récupérer les ateliers de l'artisan
    const workshops = await Workshop.find({ artisanId }).lean();

    if (!workshops || workshops.length === 0) {
      return res.json({
        artisanId,
        totalWorkshops: 0,
        statsByCategory: {},
        placesByCategory: {},
        averageFillRate: 0,
        totalComments: 0,
      });
    }

    // Calculer les statistiques
    const totalWorkshops = workshops.length;

    // Statistiques par catégorie (nombre d'ateliers)
    const statsByCategory = workshops.reduce((acc, workshop) => {
      acc[workshop.category] = (acc[workshop.category] || 0) + 1;
      return acc;
    }, {});

    // Places restantes par catégorie
    const placesByCategory = workshops.reduce((acc, workshop) => {
      acc[workshop.category] = (acc[workshop.category] || 0) + workshop.places;
      return acc;
    }, {});

    // Taux moyen de remplissage (approximation basée sur une capacité maximale hypothétique)
    const totalPlaces = workshops.reduce((sum, workshop) => sum + workshop.places, 0);
    const averageFillRate = totalPlaces > 0 ? ((workshops.length * 10 - totalPlaces) / (workshops.length * 10)) * 100 : 0; // Hypothèse : 10 places max

    // Nombre total de commentaires
    const workshopIds = workshops.map(w => w._id);
    const totalComments = await Comment.countDocuments({ workshopId: { $in: workshopIds } });

    res.json({
      artisanId,
      totalWorkshops,
      statsByCategory,
      placesByCategory,
      averageFillRate: Number(averageFillRate.toFixed(2)),
      totalComments,
    });
  } catch (error) {
    console.error('Error fetching workshop stats:', error.message);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques des ateliers' });
  }
});

router.delete('/:id/comments/:commentId', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    if (comment.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only the author can delete this comment' });
    }
    await Comment.deleteOne({ _id: req.params.commentId });
    res.status(200).json({ message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id/comments/:commentId', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    if (comment.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only the author can modify this comment' });
    }
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Comment text is required' });
    comment.text = text;
    await comment.save();
    res.json(comment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
module.exports = router;