const express = require('express');
const router = express.Router();
const Subscription = require('../models/Subscription');
const auth = require('../middleware/auth');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/user');
const nodemailer = require('nodemailer');

// Validate Stripe secret key
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('Error: STRIPE_SECRET_KEY is not defined in .env');
  process.exit(1);
}

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false, // Use TLS for port 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  logger: true,
  debug: true,
});

// Verify Nodemailer configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Nodemailer configuration error:', error.message);
  } else {
    console.log('Nodemailer configuration verified successfully');
  }
});

// Vérifier l'état de l'abonnement de l'artisan
router.get('/status', auth, async (req, res) => {
  try {
    const artisanId = req.user.id;
    const subscription = await Subscription.findOne({ 
      artisanId, 
      status: { $in: ['paid', 'pending'] } 
    }).sort({ createdAt: -1 });

    if (!subscription) {
      return res.json({ 
        hasActiveSubscription: false, 
        subscription: null,
        message: 'Aucun abonnement trouvé'
      });
    }

    const isActive = subscription.isActive();
    const daysUntilExpiry = Math.ceil((subscription.expiryDate - new Date()) / (1000 * 60 * 60 * 24));

    res.json({
      hasActiveSubscription: isActive,
      subscription: {
        id: subscription._id,
        plan: subscription.plan,
        amount: subscription.amount,
        status: subscription.status,
        expiryDate: subscription.expiryDate,
        createdAt: subscription.createdAt,
        daysUntilExpiry: daysUntilExpiry
      },
      message: isActive ? 
        `Abonnement actif jusqu'au ${subscription.expiryDate.toLocaleDateString('fr-FR')}` :
        'Abonnement expiré'
    });
  } catch (error) {
    console.error('Subscription Status Error:', error.message);
    res.status(500).json({ error: 'Failed to check subscription status' });
  }
});

router.post('/subscribe', auth, async (req, res) => {
  const { plan, amount } = req.body;
  const artisanId = req.user.id;

  console.log('Subscribe request:', { plan, amount, artisanId });

  if (!plan || !amount) {
    return res.status(400).json({ error: 'Plan and amount are required' });
  }

  try {
    // Vérifier si l'artisan a déjà un abonnement actif
    const existingSubscription = await Subscription.findOne({ 
      artisanId, 
      status: 'paid' 
    });

    if (existingSubscription && existingSubscription.isActive()) {
      const daysUntilExpiry = Math.ceil((existingSubscription.expiryDate - new Date()) / (1000 * 60 * 60 * 24));
      return res.status(400).json({ 
        error: 'Vous avez déjà un abonnement actif',
        subscription: {
          plan: existingSubscription.plan,
          expiryDate: existingSubscription.expiryDate,
          daysUntilExpiry: daysUntilExpiry
        },
        message: `Votre abonnement ${existingSubscription.plan === 'annual' ? 'annuel' : 'mensuel'} est actif jusqu'au ${existingSubscription.expiryDate.toLocaleDateString('fr-FR')}`
      });
    }

    const expiryDate = plan === 'annual' ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      metadata: { artisanId, plan, expiryDate: expiryDate.toISOString() },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Subscribe Error:', error.message, error.code, error.type);
    res.status(500).json({ error: `Failed to create payment intent: ${error.message}` });
  }
});

router.post('/confirm-subscription', auth, async (req, res) => {
  const { paymentIntentId, status } = req.body;
  const artisanId = req.user.id;

  console.log('Confirm subscription request:', { paymentIntentId, status, artisanId });

  if (status !== 'succeeded') {
    return res.status(400).json({ error: 'Payment not successful' });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    const { plan, expiryDate } = paymentIntent.metadata;
    const amount = paymentIntent.amount / 100; // Convert cents to dollars

    let subscription = await Subscription.findOne({ artisanId });
    if (subscription) {
      subscription.plan = plan;
      subscription.amount = amount;
      subscription.expiryDate = new Date(expiryDate);
      subscription.status = 'paid';
    } else {
      subscription = new Subscription({
        artisanId,
        plan,
        amount,
        expiryDate: new Date(expiryDate),
        status: 'paid',
      });
    }
    await subscription.save();

    const user = await User.findById(artisanId);
    if (!user || !user.email) {
      console.error('User email not found for artisanId:', artisanId);
      throw new Error('User email not found');
    }
    user.paymentStatus = 'paid';
    await user.save();

    // Calculate next payment date
    const nextPaymentDate = plan === 'annual'
      ? new Date(new Date(expiryDate).getTime() + 365 * 24 * 60 * 60 * 1000)
      : new Date(new Date(expiryDate).getTime() + 30 * 24 * 60 * 60 * 1000);

    // Send email notification
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Confirmation de votre abonnement CraftHub Artisan',
      html: `
        <h2>Confirmation de paiement</h2>
        <p>Cher(e) artisan(e),</p>
        <p>Votre paiement pour l'abonnement <strong>${plan === 'annual' ? 'Annuel' : 'Mensuel'}</strong> a été effectué avec succès.</p>
        <h3>Détails de l'abonnement :</h3>
        <ul>
          <li><strong>Plan :</strong> ${plan === 'annual' ? 'Annuel' : 'Mensuel'}</li>
          <li><strong>Montant :</strong> ${amount} €</li>
          <li><strong>Date d'activation :</strong> ${new Date().toLocaleDateString('fr-FR')}</li>
          <li><strong>Date d'expiration :</strong> ${new Date(expiryDate).toLocaleDateString('fr-FR')}</li>
          <li><strong>Prochain paiement :</strong> ${nextPaymentDate.toLocaleDateString('fr-FR')}</li>
        </ul>
        <p>Vous avez maintenant accès à toutes les fonctionnalités de CraftHub Artisan. Connectez-vous à votre tableau de bord pour commencer.</p>
        <p>Pour toute question, contactez-nous à support@crafthub.tn.</p>
        <p>Merci de votre confiance !</p>
        <p>L'équipe CraftHub</p>
      `,
    };

    console.log('Sending email to:', user.email);
    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${user.email}`);

    res.json({ message: 'Abonnement activé', subscription });
  } catch (error) {
    console.error('Confirm Subscription Error:', error.message, error.code, error.stack);
    if (error.code === 'ECONNREFUSED') {
      return res.status(500).json({ error: 'Failed to connect to email server', details: error.message });
    } else if (error.response && error.response.code === 'EAUTH') {
      return res.status(500).json({ error: 'Authentication failed with email server', details: error.message });
    }
    return res.status(500).json({ error: `Failed to confirm subscription: ${error.message}` });
  }
});

// Marquer les abonnements expirés (à appeler périodiquement)
router.post('/mark-expired', async (req, res) => {
  try {
    const now = new Date();
    const result = await Subscription.updateMany(
      { 
        status: 'paid', 
        expiryDate: { $lt: now } 
      },
      { 
        $set: { 
          status: 'expired',
          updatedAt: now
        } 
      }
    );

    console.log(`Marked ${result.modifiedCount} subscriptions as expired`);
    res.json({ 
      message: `Marked ${result.modifiedCount} subscriptions as expired`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Mark Expired Error:', error.message);
    res.status(500).json({ error: 'Failed to mark expired subscriptions' });
  }
});

// Vérifier le statut d'abonnement d'un artisan
router.get('/check-subscription-status', auth, async (req, res) => {
  try {
    const artisanId = req.user.id;
    
    // Vérifier que l'utilisateur est un artisan
    if (req.user.role !== 'artisan') {
      return res.status(403).json({ error: 'Accès interdit : Artisans uniquement' });
    }

    // Chercher l'abonnement le plus récent de l'artisan
    const subscription = await Subscription.findOne({ 
      artisanId: artisanId 
    }).sort({ createdAt: -1 });

    if (!subscription) {
      return res.json({
        hasActiveSubscription: false,
        subscription: null,
        message: 'Aucun abonnement trouvé'
      });
    }

    // Vérifier si l'abonnement est actif
    const now = new Date();
    const isActive = subscription.status === 'paid' && subscription.expiryDate > now;
    
    // Calculer les jours restants
    const daysUntilExpiry = isActive 
      ? Math.ceil((subscription.expiryDate - now) / (1000 * 60 * 60 * 24))
      : 0;

    return res.json({
      hasActiveSubscription: isActive,
      subscription: {
        plan: subscription.plan,
        amount: subscription.amount,
        status: subscription.status,
        expiryDate: subscription.expiryDate,
        daysUntilExpiry: daysUntilExpiry,
        createdAt: subscription.createdAt
      },
      message: isActive 
        ? `Abonnement ${subscription.plan === 'annual' ? 'annuel' : 'mensuel'} actif jusqu'au ${subscription.expiryDate.toLocaleDateString('fr-FR')}`
        : subscription.status === 'expired' 
          ? 'Votre abonnement a expiré'
          : 'Votre abonnement est en attente de paiement'
    });

  } catch (error) {
    console.error('Check Subscription Status Error:', error.message);
    res.status(500).json({ error: 'Erreur lors de la vérification du statut d\'abonnement' });
  }
});

// Test email endpoint
router.get('/test-email', async (req, res) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: 'test@example.com',
      subject: 'Test Email',
      text: 'This is a test email from CraftHub.',
    });
    console.log('Test Email Sent:', info);
    res.json({ message: 'Test email sent' });
  } catch (error) {
    console.error('Test Email Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;