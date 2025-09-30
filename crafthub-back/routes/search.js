const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const Workshop = require('../models/workshop');

router.get('/products', async (req, res) => {
  const { query } = req.query;
  try {
    const products = await Product.find({ $text: { $search: query } });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/workshops', async (req, res) => {
  const { query } = req.query;
  try {
    const workshops = await Workshop.find({ $text: { $search: query } });
    res.json(workshops);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;