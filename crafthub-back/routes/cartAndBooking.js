const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Cart = require('../models/cart');
const Booking = require('../models/booking');
const Workshop = require('../models/workshop');
const mongoose = require('mongoose');
const cron = require('node-cron');

const HOLD_MINUTES = 5;
// Ajouter un produit au panier
router.post('/cart/add', auth, async (req, res) => {
  try {
    const { productId, quantity, artisanId } = req.body;
    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      cart = new Cart({ userId: req.user.id, items: [] });
    }

    const existingItem = cart.items.find(item => item.productId.toString() === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ productId, quantity, artisanId }); // Stocker artisanId
    }

    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Récupérer le panier
// Récupérer le panier
router.get('/cart', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id }).populate('items.productId', 'name price artisanId'); // Spécifier les champs
    res.json(cart ? { items: cart.items } : { items: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Supprimer un produit du panier
router.delete('/cart/remove/:productId', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (cart) {
      cart.items = cart.items.filter(item => item.productId.toString() !== req.params.productId);
      await cart.save();
      res.json(cart);
    } else {
      res.status(404).json({ error: 'Cart not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ajouter une réservation
router.post('/bookings/add', auth, async (req, res) => {
  try {
    const { workshopId, quantity = 1 } = req.body;
    if (!workshopId || !Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({ error: 'Paramètres invalides' });
    }

    const ws = await Workshop.findOneAndUpdate(
      { _id: workshopId, places: { $gte: quantity } },
      { $inc: { places: -quantity } },
      { new: true }
    );
    if (!ws) return res.status(400).json({ error: 'Pas assez de places disponibles' });

    const booking = await Booking.create({
      userId: req.user.id,
      workshopId,
      quantity,
      status: 'pending',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    return res.json({ data: booking });
  } catch (e) {
    if (req.body?.workshopId && req.body?.quantity) {
      await Workshop.updateOne(
        { _id: req.body.workshopId },
        { $inc: { places: req.body.quantity } }
      );
    }
    return res.status(500).json({ error: 'Erreur lors de la réservation', details: e.message });
  }
});


// Récupérer les réservations
router.get('/bookings', auth, async (req, res) => {
  try {
    const list = await Booking.find({ userId: req.user.id, status: 'pending' })
      .populate('workshopId');
    console.log(`[GET /bookings] user=${req.user.id} -> ${list.length} pending`);
    res.json(list);
  } catch (e) {
    res.status(500).json({ error: 'Erreur de récupération', details: e.message });
  }
});

// Annuler une réservation
router.delete('/bookings/remove/:bookingId', auth, async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.bookingId, userId: req.user.id });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const workshop = await Workshop.findById(booking.workshopId);
    if (workshop) {
      workshop.places += booking.quantity;
      await workshop.save();
    } else {
      console.warn(`Workshop not found for booking ${booking._id}, places not restored`);
    }

    // Supprimer la réservation
    await Booking.findOneAndDelete({ _id: req.params.bookingId, userId: req.user.id });
    console.log('Booking removed:', req.params.bookingId);
    res.json({ message: 'Réservation annulée' });
  } catch (error) {
    console.error('Error removing booking:', error);
    res.status(500).json({ error: 'Erreur lors de l\'annulation', details: error.message });
  }
});

router.delete('/bookings/remove/:bookingId', auth, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const booking = await Booking.findOne({ _id: req.params.bookingId, userId: req.user.id }).session(session);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const workshop = await Workshop.findById(booking.workshopId).session(session);
    if (workshop) {
      workshop.places += booking.quantity;
      await workshop.save({ session });
    } else {
      console.warn(`Workshop not found for booking ${booking._id}, places not restored`);
    }

    await booking.remove({ session });
    await session.commitTransaction();
    res.json({ message: 'Réservation annulée' });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ error: 'Erreur lors de l\'annulation' });
  } finally {
    session.endSession();
  }
});
router.post('/bookings/add', auth, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { workshopId, quantity } = req.body;
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({ error: 'Quantité invalide' });
    }
    const workshop = await Workshop.findById(workshopId).session(session);

    if (!workshop) return res.status(404).json({ error: 'Workshop not found' });
    if (workshop.places < quantity) return res.status(400).json({ error: 'Pas assez de places disponibles' });

    workshop.places -= quantity;
    await workshop.save({ session });

    const booking = new Booking({
      userId: req.user.id,
      workshopId,
      quantity,
    });
    await booking.save({ session });

    await session.commitTransaction();
    res.json(booking);
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ error: 'Erreur lors de la réservation' });
  } finally {
    session.endSession();
  }
});


router.post('/bookings/confirm', auth, async (req, res) => {
  try {
    const { bookingIds = [] } = req.body;
    if (!Array.isArray(bookingIds) || bookingIds.length === 0) {
      return res.status(400).json({ error: 'Aucun booking spécifié' });
    }

    const now = new Date();
    const bookings = await Booking.find({ _id: { $in: bookingIds }, userId: req.user.id });

    for (const b of bookings) {
      if (b.status !== 'pending') continue;         // déjà traité
      if (b.expiresAt <= now) {
        // Trop tard : par sécurité, on rerend les places (si jamais non rendu)
        const ws = await Workshop.findById(b.workshopId).select('places');
        if (ws) { ws.places += b.quantity; await ws.save(); }
        b.status = 'expired';
        await b.save();
        continue;
      }
      // OK paiement dans les temps
      b.status = 'confirmed';
      await b.save();
      // Rien à faire sur places (déjà déduites)
    }

    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Erreur lors de la confirmation', details: e.message });
  }
});
router.get('/bookings', auth, async (req, res) => {
  try {
    const list = await Booking.find({ userId: req.user.id, status: 'pending' })
      .populate('workshopId'); // si tu affiches titre/prix/date côté front
    res.json(list);
  } catch (e) {
    res.status(500).json({ error: 'Erreur de récupération', details: e.message });
  }
});
// Vider le panier
router.post('/cart/clear', auth, async (req, res) => {
  try {
    const cart = await Cart.findOneAndUpdate(
      { userId: req.user.id },
      { $set: { items: [] } },
      { new: true, upsert: true }
    );
    res.json({ message: 'Panier vidé avec succès', cart });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors du vidage du panier', details: error.message });
  }
});

// Supprimer un produit du panier (amélioré)
router.delete('/cart/remove/:productId', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    const initialItemCount = cart.items.length;
    cart.items = cart.items.filter(item => item.productId.toString() !== req.params.productId);

    if (cart.items.length === initialItemCount) {
      return res.status(404).json({ error: 'Produit non trouvé dans le panier' });
    }

    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
module.exports = router;