const express = require('express');
  const router = express.Router();
  const Product = require('../models/product');
  const Workshop = require('../models/workshop');

  router.get('/products', async (req, res) => {
    try {
      const { query } = req.query;
      const products = query 
        ? await Product.find({ name: new RegExp(query, 'i') }) // Recherche simple par nom
        : await Product.find();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/workshops', async (req, res) => {
    try {
      const { query } = req.query;
      const workshops = query 
        ? await Workshop.find({ title: new RegExp(query, 'i') }) // Recherche simple par titre
        : await Workshop.find();
      res.json(workshops);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  module.exports = router;