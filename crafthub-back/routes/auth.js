const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const auth = require('../middleware/auth');

const multer = require('multer');
const crypto = require('crypto');
const upload = multer();
const nodemailer = require('nodemailer');

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false, // Use TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  logger: true,
  debug: true,
});

router.post('/register', async (req, res) => {
  const { email, password, role, nom, prenom } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const validRoles = ['client', 'artisan', 'admin'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: 'Invalid role. Must be client, artisan, or admin.' });
  }

  try {
    const paymentStatus = role === 'artisan' ? 'unpaid' : undefined;
    const user = new User({ email, password, role, nom, prenom, paymentStatus });
    await user.save();
    const token = jwt.sign({ id: user._id, role: user.role, paymentStatus: user.paymentStatus }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Rediriger les artisans vers le formulaire de paiement
    if (role === 'artisan') {
      return res.status(201).json({ user, token, redirectTo: '/payment-form' });
    }

    res.status(201).json({ user, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id, role: user.role, paymentStatus: user.paymentStatus }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ user, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/update-payment', auth, async (req, res) => {
  const { userId, paymentStatus } = req.body || {};

  if (!userId || !paymentStatus) {
    return res.status(400).json({ error: 'userId and paymentStatus are required' });
  }

  try {
    const user = await User.findById(userId);
    if (!user || user.role !== 'artisan') {
      return res.status(404).json({ error: 'Artisan not found' });
    }
    if (!['paid', 'unpaid'].includes(paymentStatus)) {
      return res.status(400).json({ error: 'Invalid payment status' });
    }
    user.paymentStatus = paymentStatus;
    await user.save();
    const token = jwt.sign({ id: user._id, role: user.role, paymentStatus: user.paymentStatus }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ user, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/profile', auth, upload.none(), async (req, res) => {
  const { email, password, newPassword } = req.body || {};
  console.log('Received data:', { email, password, newPassword });

  if (!email || !password || !newPassword) {
    return res.status(400).json({ error: 'Email, current password, and new password are required' });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ error: 'Invalid current password' });
    }

    if (email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }

    user.email = email;
    user.password = newPassword;
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role, paymentStatus: user.paymentStatus }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ user, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Route pour mot de passe oublié
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    console.log('Requête reçue pour forgot-password avec email:', email);
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'Aucun utilisateur trouvé avec cet e-mail.' });

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 heure d'expiration
    await user.save();
    console.log('Jeton généré et sauvegardé:', resetToken);

    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Réinitialisation de votre mot de passe CraftHub',
      text: `Vous avez demandé une réinitialisation de mot de passe. Cliquez sur ce lien pour créer un nouveau mot de passe : ${resetUrl}\n\nCe lien expire dans 1 heure.`,
    };

    console.log('Options d\'e-mail:', mailOptions);
    await transporter.sendMail(mailOptions);
    console.log('E-mail envoyé avec succès');
    res.json({ message: 'Un lien de réinitialisation a été envoyé à votre adresse e-mail.' });
  } catch (error) {
    console.error('Erreur détaillée:', error);
    res.status(500).json({ error: 'Erreur lors de l\'envoi du lien de réinitialisation.' });
  }
});

// Route pour réinitialiser le mot de passe
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ error: 'Nouveau mot de passe requis.' });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: 'Jeton invalide ou expiré.' });
    }

    user.password = newPassword; // bcrypt sera appliqué par le pré-enregistreur du modèle
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    const newToken = jwt.sign({ id: user._id, role: user.role, paymentStatus: user.paymentStatus }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: 'Mot de passe réinitialisé avec succès.', token: newToken });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la réinitialisation du mot de passe.' });
  }
});
module.exports = router;