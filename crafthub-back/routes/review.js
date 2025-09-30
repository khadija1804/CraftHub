const express = require('express');
  const router = express.Router();
  const auth = require('../middleware/auth');
  const Review = require('../models/review');

  router.post('/', auth, async (req, res) => {
    const { productId, workshopId, rating, comment } = req.body;
    try {
      if ((productId && workshopId) || (!productId && !workshopId)) {
        return res.status(400).json({ error: 'A review must be linked to either a product or a workshop, but not both or neither' });
      }
      const review = new Review({ productId, workshopId, userId: req.user.id, rating, comment });
      await review.save();
      res.status(201).json(review);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  router.get('/product/:productId', async (req, res) => {
    try {
      const reviews = await Review.find({ productId: req.params.productId });
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/workshop/:workshopId', async (req, res) => {
    try {
      const reviews = await Review.find({ workshopId: req.params.workshopId });
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  module.exports = router;