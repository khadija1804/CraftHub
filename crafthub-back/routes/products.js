const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Product = require('../models/product');
const Comment = require('../models/comment');
const Subscription = require('../models/Subscription');
const multer = require('multer');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get('/public', async (req, res) => {
  try {
    const products = await Product.find().populate('artisanId', 'nom prenom');
    console.log('Products fetched:', products);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.get('/', auth, async (req, res) => {
  try {
    const products = await Product.find({ artisanId: req.user.id });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', auth, upload.array('images', 3), async (req, res) => {
  console.log('Received body:', req.body); // Débogage
  console.log('Received files:', req.files); // Débogage
  console.log('Raw headers:', req.headers); // Débogage supplémentaire
  const { name, price, category, description, stock, material, size } = req.body;
  try {
    if (req.user.role !== 'artisan') {
      return res.status(403).json({ error: 'Only artisans can add products' });
    }

    // Vérifier l'abonnement de l'artisan
    const subscription = await Subscription.findOne({ 
      artisanId: req.user.id 
    }).sort({ createdAt: -1 });

    if (!subscription || subscription.status !== 'paid' || subscription.expiryDate <= new Date()) {
      return res.status(403).json({ 
        error: 'Vous devez avoir un abonnement actif pour ajouter des produits',
        requiresSubscription: true
      });
    }
    const images = req.files ? req.files.map(file => ({
      data: file.buffer,
      contentType: file.mimetype,
    })) : [];
    if (!description || description.trim() === '') {
      return res.status(400).json({ error: 'Description is required and cannot be empty.' });
    }
    const product = new Product({
      name: name || '',
      price: parseFloat(price) || 0,
      category: category || '',
      description: description || '',
      stock: parseInt(stock) || 0,
      material: material || 'Unknown', // Valeur par défaut si non fourni
      size: size || 'M',              // Valeur par défaut si non fourni
      images,
      artisanId: req.user.id,
    });
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, artisanId: req.user.id });
    if (!product) return res.status(404).json({ error: 'Product not found or not authorized' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', auth, upload.array('images', 3), async (req, res) => {
  const { name, price, category, stock, description, material, size } = req.body;
  try {
    const product = await Product.findOne({ _id: req.params.id, artisanId: req.user.id });
    if (!product) return res.status(404).json({ error: 'Product not found or not authorized' });
    product.name = name || product.name;
    product.price = price || product.price;
    product.category = category || product.category;
    product.stock = stock !== undefined ? stock : product.stock;
    product.description = description || product.description;
    product.material = material || product.material || 'Unknown';
    product.size = size || product.size || 'M';
    if (req.files && req.files.length > 0) {
      product.images = req.files.map(file => ({
        data: file.buffer,
        contentType: file.mimetype,
      }));
    }
    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, artisanId: req.user.id });
    if (!product) return res.status(404).json({ error: 'Product not found or not authorized' });
    await Product.deleteOne({ _id: req.params.id, artisanId: req.user.id });
    res.status(200).json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Public route for images
router.get('/public/images/:id/:index', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    const index = parseInt(req.params.index, 10);
    if (isNaN(index) || index < 0 || index >= product.images.length) {
      return res.status(404).json({ error: 'Image index out of range' });
    }
    const image = product.images[index];
    res.set('Content-Type', image.contentType);
    res.send(image.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Auth-protected route for images (for artisans)
router.get('/:id/images/:index', auth, async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, artisanId: req.user.id });
    if (!product) return res.status(404).json({ error: 'Product not found or not authorized' });
    const index = parseInt(req.params.index, 10);
    if (isNaN(index) || index < 0 || index >= product.images.length) {
      return res.status(404).json({ error: 'Image index out of range' });
    }
    const image = product.images[index];
    res.set('Content-Type', image.contentType);
    res.send(image.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/public/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('artisanId', 'nom prenom');
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/comments', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Comment text is required' });
    const comment = new Comment({
      productId: req.params.id,
      userId: req.user.id,
      text,
    });
    await comment.save();
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: error.message });
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

router.get('/:id/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ productId: req.params.id }).populate('userId', 'nom prenom');
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/by-artisan/:artisanId', async (req, res) => {
  try {
    const products = await Product.find({ artisanId: req.params.artisanId }).populate('artisanId', 'nom prenom');
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.get('/product/name/:productId', auth, async (req, res) => {
  try {
    const productId = req.params.productId;
    console.log('Recherche du produit avec ID:', productId); // Log pour débogage
    const product = await Product.findById(productId).select('name');
    if (!product || !product.name) {
      console.warn(`Produit non trouvé ou nom manquant pour ID ${productId}`);
      return res.status(404).json({ error: 'Produit non trouvé ou nom manquant' });
    }
    console.log('Produit trouvé:', product);
    res.json({ name: product.name });
  } catch (error) {
    console.error('Erreur lors de la récupération du nom du produit :', error.message);
    res.status(500).json({ error: error.message });
  }
});
module.exports = router;