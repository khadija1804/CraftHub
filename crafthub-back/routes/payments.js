const express = require('express');
const router = express.Router();
const Subscription = require('../models/Subscription');
const auth = require('../middleware/auth');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/user');
const nodemailer = require('nodemailer');
const Payment = require('../models/Payment');
const Product = require('../models/product'); // Ajoute cette ligne si elle n'est pas déjà présente
const Workshop = require('../models/workshop');
// Validate Stripe secret key
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('Error: STRIPE_SECRET_KEY is not defined in .env');
  process.exit(1);
}

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


router.post('/subscribe', auth, async (req, res) => {
  const { plan, amount } = req.body;
  const artisanId = req.user.id;

  if (!plan || !amount) {
    return res.status(400).json({ error: 'Plan and amount are required' });
  }

  try {
    const expiryDate = plan === 'annual' ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'EUR',
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

  if (status !== 'succeeded') {
    return res.status(400).json({ error: 'Payment not successful' });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    const { plan, expiryDate } = paymentIntent.metadata;
    const amount = paymentIntent.amount / 100;

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
      throw new Error('User email not found');
    }
    user.paymentStatus = 'paid';
    await user.save();

    const nextPaymentDate = plan === 'annual'
      ? new Date(new Date(expiryDate).getTime() + 365 * 24 * 60 * 60 * 1000)
      : new Date(new Date(expiryDate).getTime() + 30 * 24 * 60 * 60 * 1000);

    // Template HTML amélioré pour l'abonnement
    const generateSubscriptionEmailTemplate = (plan, amount, expiryDate, nextPaymentDate) => {
      const isAnnual = plan === 'annual';
      const planName = isAnnual ? 'Annuel' : 'Mensuel';
      const planIcon = isAnnual ? '📅' : '📆';
      
      return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmation d'abonnement CraftHub Artisan</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f8f9fa;
            line-height: 1.6;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 300;
        }
        .header .subtitle {
            margin: 10px 0 0 0;
            font-size: 16px;
            opacity: 0.9;
        }
        .content {
            padding: 30px 20px;
        }
        .success-badge {
            background-color: #28a745;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            display: inline-block;
            margin-bottom: 20px;
        }
        .subscription-details {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .subscription-details h3 {
            margin: 0 0 15px 0;
            color: #333;
            font-size: 18px;
        }
        .detail-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #e9ecef;
        }
        .detail-item:last-child {
            border-bottom: none;
        }
        .detail-label {
            font-weight: 600;
            color: #333;
        }
        .detail-value {
            color: #28a745;
            font-weight: 600;
        }
        .amount-section {
            background-color: #e3f2fd;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
        }
        .amount-value {
            font-size: 24px;
            font-weight: 700;
            color: #1976d2;
            margin: 0;
        }
        .status-section {
            text-align: center;
            margin: 30px 0;
        }
        .status-message {
            background-color: #d4edda;
            color: #155724;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #28a745;
        }
        .features-section {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .features-section h4 {
            margin: 0 0 15px 0;
            color: #856404;
        }
        .features-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        .features-list li {
            padding: 8px 0;
            color: #856404;
        }
        .features-list li:before {
            content: "✅ ";
            margin-right: 8px;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            border-top: 1px solid #e9ecef;
        }
        .footer p {
            margin: 5px 0;
            color: #666;
            font-size: 14px;
        }
        .contact-info {
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid #dee2e6;
        }
        .btn {
            display: inline-block;
            background-color: #007bff;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 10px 5px;
        }
        .btn:hover {
            background-color: #0056b3;
        }
        @media (max-width: 600px) {
            .email-container {
                margin: 0;
                box-shadow: none;
            }
            .header {
                padding: 20px 15px;
            }
            .header h1 {
                font-size: 24px;
            }
            .content {
                padding: 20px 15px;
            }
            .detail-item {
                flex-direction: column;
                align-items: flex-start;
            }
            .detail-value {
                margin-top: 8px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>🎉 Abonnement Activé !</h1>
            <p class="subtitle">Bienvenue dans la communauté CraftHub Artisan</p>
        </div>
        
        <div class="content">
            <div class="success-badge">✅ Paiement Réussi</div>
            
            <div class="subscription-details">
                <h3>${planIcon} Détails de votre abonnement</h3>
                <div class="detail-item">
                    <span class="detail-label">Plan d'abonnement</span>
                    <span class="detail-value">${planName}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Date d'activation</span>
                    <span class="detail-value">${new Date().toLocaleDateString('fr-FR')}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Date d'expiration</span>
                    <span class="detail-value">${new Date(expiryDate).toLocaleDateString('fr-FR')}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Prochain paiement</span>
                    <span class="detail-value">${nextPaymentDate.toLocaleDateString('fr-FR')}</span>
                </div>
            </div>
            
            <div class="amount-section">
                <p style="margin: 0 0 10px 0; color: #666;">Montant payé</p>
                <p class="amount-value">${amount} €</p>
            </div>
            
            <div class="features-section">
                <h4>🚀 Fonctionnalités incluses dans votre abonnement</h4>
                <ul class="features-list">
                    <li>Création illimitée de produits</li>
                    <li>Gestion complète de votre boutique</li>
                    <li>Statistiques détaillées de vente</li>
                    <li>Support client prioritaire</li>
                    <li>Outils de marketing avancés</li>
                    <li>Accès aux formations exclusives</li>
                </ul>
            </div>
            
            <div class="status-section">
                <div class="status-message">
                    <strong>Votre abonnement CraftHub Artisan est maintenant actif !</strong>
                    <br>
                    Connectez-vous à votre tableau de bord pour commencer à utiliser toutes les fonctionnalités disponibles.
                </div>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="#" class="btn">Accéder au tableau de bord</a>
                <a href="#" class="btn">Guide de démarrage</a>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>CraftHub - Votre plateforme d'artisanat de confiance</strong></p>
            <div class="contact-info">
                <p>📧 support@crafthub.tn</p>
                <p>🌐 www.crafthub.tn</p>
                <p>📱 Suivez-nous sur les réseaux sociaux</p>
            </div>
            <p style="font-size: 12px; color: #999; margin-top: 15px;">
                Merci de votre confiance ! L'équipe CraftHub
            </p>
        </div>
    </div>
</body>
</html>`;
    };

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Confirmation de votre abonnement CraftHub Artisan',
      html: generateSubscriptionEmailTemplate(plan, amount, expiryDate, nextPaymentDate),
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${user.email}`);

    res.json({ message: 'Abonnement activé', subscription });
  } catch (error) {
    console.error('Confirm Subscription Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      return res.status(500).json({ error: 'Failed to connect to email server', details: error.message });
    }
    return res.status(500).json({ error: 'Failed to confirm subscription', details: error.message });
  }
});
// Create Payment Intent
// Create Payment Intent
router.post('/create-payment-intent', auth, async (req, res) => {
  const { amount_cents, currency = 'usd', type, items, deliveryInfo } = req.body;

 const cents = parseInt(amount_cents, 10);
 if (!Number.isFinite(cents)) {
   return res.status(400).json({ error: 'amount_cents invalide' });
 }
  try {
    console.log('Items received:', JSON.stringify(items, null, 2));
    console.log('Delivery Info received:', JSON.stringify(deliveryInfo, null, 2)); // Log pour vérifier
    const paymentIntent = await stripe.paymentIntents.create({
    amount: cents,                                // ✅ plus de *100 ici
 currency: String(currency).toLowerCase(),
      metadata: { userId: req.user.id, type, items: JSON.stringify(items), deliveryInfo: JSON.stringify(deliveryInfo) },
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Erreur lors de la création du Payment Intent :', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Confirm Payment
router.post('/confirm-payment', auth, async (req, res) => {
  const { paymentIntentId, status, amount_cents, type, items, deliveryInfo } = req.body;
  try {
    if (status !== 'succeeded') {
      return res.status(400).json({ error: 'Statut invalide, seul "succeeded" est accepté' });
    }

    const updatedItems = await Promise.all(items.map(async (item) => {
      const itemId = typeof item._id === 'string' ? new mongoose.Types.ObjectId(item._id) : item._id;
      
      if (type === 'reservation') {
        // Pour les réservations d'ateliers, récupérer les données depuis la base
        const workshop = await Workshop.findById(item._id).select('title price artisanId');
        const artisan = workshop ? await User.findById(workshop.artisanId).select('prenom nom') : null;
        const artisanName = artisan ? `${artisan.prenom} ${artisan.nom}` : 'Artisan inconnu';
        
        return {
          _id: itemId,
          name: workshop ? workshop.title : 'Atelier inconnu',
          title: workshop ? workshop.title : 'Atelier inconnu',
          artisanName: artisanName,
          price: workshop ? workshop.price : item.price || 0,
          quantity: item.quantity || 1,
          artisanId: workshop ? workshop.artisanId : item.artisanId,
          status: 'pending'
        };
      } else {
        // Pour les produits, utiliser la logique existante
      if (!item.name) {
        throw new Error(`Le champ 'name' est requis pour l'item ${item._id}`);
      }
      const artisan = await User.findById(item.artisanId).select('prenom nom');
      const artisanName = artisan ? `${artisan.prenom} ${artisan.nom}` : 'Artisan inconnu';
        
      return {
        _id: itemId,
        name: item.name,
        artisanName: artisanName,
        price: item.price,
        quantity: item.quantity || 1,
        artisanId: item.artisanId,
        status: 'pending'
      };
      }
    }));

    let payment = await Payment.findOne({ paymentIntentId });
    if (payment) {
      payment.status = 'succeeded';
      payment.amount = amount_cents;
      payment.type = type;
      payment.items = updatedItems;
      payment.deliveryInfo = deliveryInfo;
      await payment.save();
    } else {
      payment = await Payment.create({
        userId: req.user.id,
        paymentIntentId,
        amount: amount_cents,
        currency: 'usd',
        type,
        items: updatedItems,
        status: 'succeeded',
        deliveryInfo,
      });
    }

    if (type === 'cart') {
      for (const item of items) {
        const product = await Product.findById(item._id);
        if (!product) {
          await Product.create({
            _id: typeof item._id === 'string' ? new mongoose.Types.ObjectId(item._id) : item._id,
            name: item.name,
            artisanId: item.artisanId,
            price: item.price,
            stock: 100
          });
          continue;
        }
        if (product.stock < (item.quantity || 1)) {
          throw new Error(`Stock insuffisant pour ${item.name}. Stock restant : ${product.stock}`);
        }
        product.stock -= item.quantity || 1;
        await product.save();
      }
    } else if (type === 'reservation') {
      for (const item of items) {
        const workshop = await Workshop.findById(item._id);
        if (workshop && workshop.places < (item.quantity || 1)) {
          throw new Error(`Places insuffisantes pour ${item.name}. Places restantes : ${workshop.places}`);
        }
      }
    }

    const user = await User.findById(req.user.id).select('email');
    if (!user || !user.email) {
      return res.status(500).json({ error: 'Email de l\'utilisateur non trouvé' });
    }

    // Template HTML amélioré pour Gmail
    const generateEmailTemplate = (type, items, updatedItems, amount_cents, deliveryInfo) => {
      const isReservation = type === 'reservation';
      const totalAmount = (amount_cents / 100).toFixed(2);
      
      return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmation de ${isReservation ? 'Réservation' : 'Achat'}</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f8f9fa;
            line-height: 1.6;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 300;
        }
        .header .subtitle {
            margin: 10px 0 0 0;
            font-size: 16px;
            opacity: 0.9;
        }
        .content {
            padding: 30px 20px;
        }
        .success-badge {
            background-color: #28a745;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            display: inline-block;
            margin-bottom: 20px;
        }
        .order-details {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .order-details h3 {
            margin: 0 0 15px 0;
            color: #333;
            font-size: 18px;
        }
        .item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #e9ecef;
        }
        .item:last-child {
            border-bottom: none;
        }
        .item-info {
            flex: 1;
        }
        .item-name {
            font-weight: 600;
            color: #333;
            margin-bottom: 4px;
        }
        .item-artisan {
            font-size: 14px;
            color: #666;
        }
        .item-price {
            font-weight: 600;
            color: #28a745;
            font-size: 16px;
        }
        .total-section {
            background-color: #e3f2fd;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
        }
        .total-amount {
            font-size: 24px;
            font-weight: 700;
            color: #1976d2;
            margin: 0;
        }
        .status-section {
            text-align: center;
            margin: 30px 0;
        }
        .status-message {
            background-color: #d4edda;
            color: #155724;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #28a745;
        }
        .delivery-info {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
        }
        .delivery-info h4 {
            margin: 0 0 10px 0;
            color: #856404;
        }
        .delivery-info p {
            margin: 5px 0;
            color: #856404;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            border-top: 1px solid #e9ecef;
        }
        .footer p {
            margin: 5px 0;
            color: #666;
            font-size: 14px;
        }
        .contact-info {
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid #dee2e6;
        }
        .btn {
            display: inline-block;
            background-color: #007bff;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 10px 5px;
        }
        .btn:hover {
            background-color: #0056b3;
        }
        @media (max-width: 600px) {
            .email-container {
                margin: 0;
                box-shadow: none;
            }
            .header {
                padding: 20px 15px;
            }
            .header h1 {
                font-size: 24px;
            }
            .content {
                padding: 20px 15px;
            }
            .item {
                flex-direction: column;
                align-items: flex-start;
            }
            .item-price {
                margin-top: 8px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>🎉 ${isReservation ? 'Réservation Confirmée !' : 'Achat Confirmé !'}</h1>
            <p class="subtitle">Merci de votre confiance en CraftHub</p>
        </div>
        
        <div class="content">
            <div class="success-badge">✅ Paiement Réussi</div>
            
            <div class="order-details">
                <h3>📋 Détails de votre ${isReservation ? 'réservation' : 'commande'}</h3>
                ${isReservation ? 
                  items.map(item => `
                    <div class="item">
                        <div class="item-info">
                            <div class="item-name">${item.name}</div>
                            <div class="item-artisan">${item.quantity || 1} place(s) réservée(s)</div>
                        </div>
                        <div class="item-price">${item.price} €</div>
                    </div>
                  `).join('') :
                  items.map(item => {
                    const updatedItem = updatedItems.find(i => i._id.equals(typeof item._id === 'string' ? new mongoose.Types.ObjectId(item._id) : item._id));
                    return `
                      <div class="item">
                          <div class="item-info">
                              <div class="item-name">${updatedItem.name}</div>
                              <div class="item-artisan">par ${updatedItem.artisanName}</div>
                          </div>
                          <div class="item-price">${item.price} € × ${item.quantity || 1}</div>
                      </div>
                    `;
                  }).join('')
                }
            </div>
            
            <div class="total-section">
                <p style="margin: 0 0 10px 0; color: #666;">Total à payer</p>
                <p class="total-amount">${totalAmount} €</p>
            </div>
            
            <div class="status-section">
                <div class="status-message">
                    <strong>${isReservation ? 'Votre réservation d\'atelier est confirmée !' : 'Votre commande est en cours de traitement'}</strong>
                    <br>
                    ${isReservation ? 
                      'Vous recevrez un email de confirmation de l\'artisan avec tous les détails pratiques.' : 
                      'L\'artisan va préparer votre commande et vous contactera pour l\'envoi.'
                    }
                </div>
            </div>
            
            ${deliveryInfo ? `
            <div class="delivery-info">
                <h4>📦 Informations de livraison</h4>
                <p><strong>Téléphone :</strong> ${deliveryInfo.phone}</p>
                <p><strong>Adresse :</strong> ${deliveryInfo.address}</p>
            </div>
            ` : ''}
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="#" class="btn">Voir mes commandes</a>
                <a href="#" class="btn">Contacter le support</a>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>CraftHub - Votre plateforme d'artisanat de confiance</strong></p>
            <div class="contact-info">
                <p>📧 support@crafthub.tn</p>
                <p>🌐 www.crafthub.tn</p>
                <p>📱 Suivez-nous sur les réseaux sociaux</p>
            </div>
            <p style="font-size: 12px; color: #999; margin-top: 15px;">
                Cet email a été envoyé automatiquement, merci de ne pas y répondre.
            </p>
        </div>
    </div>
</body>
</html>`;
    };

    const emailHtml = generateEmailTemplate(type, items, updatedItems, amount_cents, deliveryInfo);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `Confirmation de ${type === 'cart' ? 'Achat' : 'Réservation'}`,
      html: emailHtml,
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'Paiement confirmé, stock mis à jour et email envoyé', payment });
  } catch (error) {
    console.error('Erreur lors de la confirmation du paiement :', error.message, error.stack);
    res.status(500).json({ error: error.message });
  }
});
// Confirm Payment
/*router.post('/confirm-payment', auth, async (req, res) => {
  const { paymentIntentId, status, amount, type, items } = req.body;
  try {
    if (status !== 'succeeded') {
      return res.status(400).json({ error: 'Statut invalide, seul "succeeded" est accepté' });
    }

    const updatedItems = items.map(item => ({
      ...item,
      artisanId: item.artisanId || req.user.id,
      status: 'pending',
    }));

    const payment = await Payment.create({
      userId: req.user.id,
      paymentIntentId,
      amount: amount * 100,
      currency: 'usd',
      type,
      items: updatedItems,
      status: 'succeeded',
    });

    console.log('Paiement enregistré :', payment);

    const user = await User.findById(req.user.id).select('email');
    if (!user || !user.email) {
      return res.status(500).json({ error: 'Email de l\'utilisateur non trouvé' });
    }

    let emailHtml = `
      <h1>Merci pour votre ${type === 'cart' ? 'Achat' : 'Réservation'} !</h1>
      <p>Détails :</p>
      <ul>
    `;
    if (type === 'reservation') {
      items.forEach(item => {
        emailHtml += `<li>${item.title} - ${item.places} place(s) - ${item.duration / 60} heure(s) - ${item.price} €</li>`;
      });
    } else {
      items.forEach(item => {
        emailHtml += `<li>${item.name} - ${item.price} € x ${item.quantity || 1}</li>`;
      });
    }
    emailHtml += `
      </ul>
      <p>Total : ${amount} €</p>
      <p>Statut : Réussi</p>
      <p>Votre commande est en attente d'envoi par l'artisan.</p>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `Confirmation de ${type === 'cart' ? 'Achat' : 'Réservation'}`,
      html: emailHtml,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${user.email}`);

    res.json({ message: 'Paiement confirmé et email envoyé' });
  } catch (error) {
    console.error('Erreur lors de la confirmation du paiement :', error.message, error.stack);
    if (error.code === 'ECONNREFUSED') {
      return res.status(500).json({ error: 'Failed to connect to email server', details: error.message });
    } else if (error.response && error.response.code === 'EAUTH') {
      return res.status(500).json({ error: 'Authentication failed with email server', details: error.message });
    }
    return res.status(500).json({ error: `Failed to confirm payment: ${error.message}` });
  }
});*/


/*router.post('/confirm-payment', auth, async (req, res) => {
  const { paymentIntentId, status, amount, type, items } = req.body;
  try {
    if (status !== 'succeeded') {
      return res.status(400).json({ error: 'Statut invalide, seul "succeeded" est accepté' });
    }

    const updatedItems = items.map(item => ({
      ...item,
      artisanId: item.artisanId || req.user.id,
      status: 'pending',
    }));

    const payment = await Payment.create({
      userId: req.user.id,
      paymentIntentId,
      amount: amount * 100,
      currency: 'usd',
      type,
      items: updatedItems,
      status: 'succeeded',
    });

    console.log('Paiement enregistré :', payment);

    // Gérer le stock pour les achats (type: 'cart')
    if (type === 'cart') {
      for (const item of items) {
        const product = await Product.findById(item._id);
        if (!product) {
          throw new Error(`Produit ${item._id} non trouvé`);
        }
        if (product.stock < (item.quantity || 1)) {
          throw new Error(`Stock insuffisant pour ${item.name}. Stock restant : ${product.stock}`);
        }
        product.stock -= item.quantity || 1;
        await product.save();
        console.log(`Stock mis à jour pour ${item.name}: ${product.stock} restant(s)`);
      }
    }

    const user = await User.findById(req.user.id).select('email');
    if (!user || !user.email) {
      return res.status(500).json({ error: 'Email de l\'utilisateur non trouvé' });
    }

    let emailHtml = `
      <h1>Merci pour votre ${type === 'cart' ? 'Achat' : 'Réservation'} !</h1>
      <p>Détails :</p>
      <ul>
    `;
    if (type === 'reservation') {
      items.forEach(item => {
        emailHtml += `<li>${item.title} - ${item.places} place(s) - ${item.duration / 60} heure(s) - ${item.price} €</li>`;
      });
    } else {
      items.forEach(item => {
        emailHtml += `<li>${item.name} - ${item.price} € x ${item.quantity || 1}</li>`;
      });
    }
    emailHtml += `
      </ul>
      <p>Total : ${amount} €</p>
      <p>Statut : Réussi</p>
      <p>Votre commande est en attente d'envoi par l'artisan.</p>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `Confirmation de ${type === 'cart' ? 'Achat' : 'Réservation'}`,
      html: emailHtml,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${user.email}`);

    res.json({ message: 'Paiement confirmé, stock mis à jour et email envoyé' });
  } catch (error) {
    console.error('Erreur lors de la confirmation du paiement :', error.message, error.stack);
    if (error.code === 'ECONNREFUSED') {
      return res.status(500).json({ error: 'Failed to connect to email server', details: error.message });
    } else if (error.response && error.response.code === 'EAUTH') {
      return res.status(500).json({ error: 'Authentication failed with email server', details: error.message });
    }
    return res.status(500).json({ error: `Failed to confirm payment: ${error.message}` });
  }
});*/


const mongoose = require('mongoose');

router.get('/pending-orders', auth, async (req, res) => {
  try {
    console.log('Requête reçue pour /pending-orders avec userId:', req.user.id);
    if (!req.user.id) {
      return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }

    // Convertir req.user.id en ObjectId
    const userId = new mongoose.Types.ObjectId(req.user.id);
    console.log('UserId converti en ObjectId:', userId);

    const payments = await Payment.find({
      'items': {
        $elemMatch: {
          status: 'pending',
          artisanId: userId // Utiliser l'ObjectId converti
        }
      }
    })
      .populate('userId', 'email')
      .populate('items._id', 'name price')
      .lean();

    console.log('Résultat de la requête:', payments);
    if (!payments.length) {
      console.log('Aucune commande en attente trouvée pour cet artisan avec artisanId:', userId);
    } else {
      console.log('Items correspondants:', payments.flatMap(p => p.items.filter(i => i.artisanId.equals(userId) && i.status === 'pending')));
    }
    res.json(payments);
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes :', error.message);
    res.status(500).json({ error: error.message });
  }
});


// Confirmer l'envoi par l'artisan
router.post('/confirm-shipment', auth, async (req, res) => {
  const { paymentId, itemId } = req.body;
  try {
    const payment = await Payment.findById(paymentId);
    if (!payment || !payment.items.some(item => item._id.toString() === itemId && item.artisanId.toString() === req.user.id.toString())) {
      return res.status(403).json({ error: 'Accès non autorisé ou commande introuvable' });
    }

    payment.items = payment.items.map(item => 
      item._id.toString() === itemId ? { ...item, status: 'completed' } : item
    );
    await payment.save();

    const user = await User.findById(payment.userId).select('email');
    if (!user || !user.email) {
      return res.status(500).json({ error: 'Email du client non trouvé' });
    }

    const item = payment.items.find(i => i._id.toString() === itemId);

    // Template HTML amélioré pour l'envoi
    const generateShippingEmailTemplate = (item) => {
      return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Votre commande est en route</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f8f9fa;
            line-height: 1.6;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 300;
        }
        .header .subtitle {
            margin: 10px 0 0 0;
            font-size: 16px;
            opacity: 0.9;
        }
        .content {
            padding: 30px 20px;
        }
        .shipping-badge {
            background-color: #17a2b8;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            display: inline-block;
            margin-bottom: 20px;
        }
        .order-details {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .order-details h3 {
            margin: 0 0 15px 0;
            color: #333;
            font-size: 18px;
        }
        .item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #e9ecef;
        }
        .item:last-child {
            border-bottom: none;
        }
        .item-info {
            flex: 1;
        }
        .item-name {
            font-weight: 600;
            color: #333;
            margin-bottom: 4px;
        }
        .item-quantity {
            font-size: 14px;
            color: #666;
        }
        .status-section {
            text-align: center;
            margin: 30px 0;
        }
        .status-message {
            background-color: #d1ecf1;
            color: #0c5460;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #17a2b8;
        }
        .tracking-info {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
        }
        .tracking-info h4 {
            margin: 0 0 10px 0;
            color: #856404;
        }
        .tracking-info p {
            margin: 5px 0;
            color: #856404;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            border-top: 1px solid #e9ecef;
        }
        .footer p {
            margin: 5px 0;
            color: #666;
            font-size: 14px;
        }
        .contact-info {
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid #dee2e6;
        }
        .btn {
            display: inline-block;
            background-color: #007bff;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 10px 5px;
        }
        .btn:hover {
            background-color: #0056b3;
        }
        @media (max-width: 600px) {
            .email-container {
                margin: 0;
                box-shadow: none;
            }
            .header {
                padding: 20px 15px;
            }
            .header h1 {
                font-size: 24px;
            }
            .content {
                padding: 20px 15px;
            }
            .item {
                flex-direction: column;
                align-items: flex-start;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>🚚 Votre commande est en route !</h1>
            <p class="subtitle">Expédition confirmée par l'artisan</p>
        </div>
        
        <div class="content">
            <div class="shipping-badge">📦 Expédié</div>
            
            <div class="order-details">
                <h3>📋 Détails de l'expédition</h3>
                <div class="item">
                    <div class="item-info">
                        <div class="item-name">${item.name || item.title}</div>
                        <div class="item-quantity">Quantité : ${item.quantity || 1}</div>
                    </div>
                </div>
            </div>
            
            <div class="status-section">
                <div class="status-message">
                    <strong>Votre commande a été expédiée par l'artisan !</strong>
                    <br>
                    Elle sera bientôt chez vous. Merci de votre achat et de votre patience.
                </div>
            </div>
            
            <div class="tracking-info">
                <h4>📞 Besoin d'aide ?</h4>
                <p>Si vous avez des questions concernant votre commande, n'hésitez pas à contacter l'artisan directement ou notre service client.</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="#" class="btn">Suivre ma commande</a>
                <a href="#" class="btn">Contacter l'artisan</a>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>CraftHub - Votre plateforme d'artisanat de confiance</strong></p>
            <div class="contact-info">
                <p>📧 support@crafthub.tn</p>
                <p>🌐 www.crafthub.tn</p>
                <p>📱 Suivez-nous sur les réseaux sociaux</p>
            </div>
            <p style="font-size: 12px; color: #999; margin-top: 15px;">
                Merci de votre confiance ! L'équipe CraftHub
            </p>
        </div>
    </div>
</body>
</html>`;
    };

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Votre commande est en route',
      html: generateShippingEmailTemplate(item),
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'Envoi confirmé et email envoyé au client' });
  } catch (error) {
    console.error('Erreur lors de la confirmation d\'envoi :', error.message);
    res.status(500).json({ error: error.message });
  }
});


router.post('/confirm-payment-res', auth, async (req, res) => {
  const { paymentIntentId, status, amount_cents, type, items } = req.body;
  try {
    console.log('=== CONFIRM PAYMENT RES DEBUG ===');
    console.log('Type:', type);
    console.log('Items reçus:', JSON.stringify(items, null, 2));
    
    if (status !== 'succeeded') {
      return res.status(400).json({ error: 'Statut invalide, seul "succeeded" est accepté' });
    }

    // Récupérer les informations complètes des ateliers pour les réservations
    let updatedItems;
    if (type === 'reservation') {
      updatedItems = await Promise.all(items.map(async (item) => {
        console.log(`Récupération de l'atelier avec ID: ${item._id}`);
        const workshop = await Workshop.findById(item._id).select('title price artisanId');
        console.log('Atelier trouvé:', workshop);
        
        const result = {
          ...item,
          title: workshop ? workshop.title : 'Atelier inconnu',
          price: workshop ? workshop.price : item.price || 0,
          artisanId: workshop ? workshop.artisanId : item.artisanId || req.user.id,
          status: 'pending',
        };
        console.log('Item mis à jour:', result);
        return result;
      }));
    } else {
      updatedItems = items.map(item => ({
      ...item,
      artisanId: item.artisanId || req.user.id,
      status: 'pending',
    }));
    }
    
    console.log('Items finaux pour l\'email:', JSON.stringify(updatedItems, null, 2));

    const payment = await Payment.create({
      userId: req.user.id,
      paymentIntentId,
      amount: amount_cents, 
      currency: 'usd',
      type,
      items: updatedItems,
      status: 'succeeded',
    });

    console.log('Paiement enregistré :', payment);

    // Gérer le stock pour les achats (type: 'cart')
    if (type === 'cart') {
      for (const item of items) {
        const product = await Product.findById(item._id);
        if (!product) {
          throw new Error(`Produit ${item._id} non trouvé`);
        }
        if (product.stock < (item.quantity || 1)) {
          throw new Error(`Stock insuffisant pour ${item.name}. Stock restant : ${product.stock}`);
        }
        product.stock -= item.quantity || 1;
        await product.save();
        console.log(`Stock mis à jour pour ${item.name}: ${product.stock} restant(s)`);
      }
    }

    const user = await User.findById(req.user.id).select('email');
    if (!user || !user.email) {
      return res.status(500).json({ error: 'Email de l\'utilisateur non trouvé' });
    }

    // Utiliser le même template amélioré que la fonction principale
    const generateEmailTemplate = (type, items, updatedItems, amount_cents, deliveryInfo) => {
      const isReservation = type === 'reservation';
      const totalAmount = (amount_cents / 100).toFixed(2);
      
      return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmation de ${isReservation ? 'Réservation' : 'Achat'}</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f8f9fa;
            line-height: 1.6;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 300;
        }
        .header .subtitle {
            margin: 10px 0 0 0;
            font-size: 16px;
            opacity: 0.9;
        }
        .content {
            padding: 30px 20px;
        }
        .success-badge {
            background-color: #28a745;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            display: inline-block;
            margin-bottom: 20px;
        }
        .order-details {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .order-details h3 {
            margin: 0 0 15px 0;
            color: #333;
            font-size: 18px;
        }
        .item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #e9ecef;
        }
        .item:last-child {
            border-bottom: none;
        }
        .item-info {
            flex: 1;
        }
        .item-name {
            font-weight: 600;
            color: #333;
            margin-bottom: 4px;
        }
        .item-artisan {
            font-size: 14px;
            color: #666;
        }
        .item-price {
            font-weight: 600;
            color: #28a745;
            font-size: 16px;
        }
        .total-section {
            background-color: #e3f2fd;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
        }
        .total-amount {
            font-size: 24px;
            font-weight: 700;
            color: #1976d2;
            margin: 0;
        }
        .status-section {
            text-align: center;
            margin: 30px 0;
        }
        .status-message {
            background-color: #d4edda;
            color: #155724;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #28a745;
        }
        .delivery-info {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
        }
        .delivery-info h4 {
            margin: 0 0 10px 0;
            color: #856404;
        }
        .delivery-info p {
            margin: 5px 0;
            color: #856404;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            border-top: 1px solid #e9ecef;
        }
        .footer p {
            margin: 5px 0;
            color: #666;
            font-size: 14px;
        }
        .contact-info {
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid #dee2e6;
        }
        .btn {
            display: inline-block;
            background-color: #007bff;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 10px 5px;
        }
        .btn:hover {
            background-color: #0056b3;
        }
        @media (max-width: 600px) {
            .email-container {
                margin: 0;
                box-shadow: none;
            }
            .header {
                padding: 20px 15px;
            }
            .header h1 {
                font-size: 24px;
            }
            .content {
                padding: 20px 15px;
            }
            .item {
                flex-direction: column;
                align-items: flex-start;
            }
            .item-price {
                margin-top: 8px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>🎉 ${isReservation ? 'Réservation Confirmée !' : 'Achat Confirmé !'}</h1>
            <p class="subtitle">Merci de votre confiance en CraftHub</p>
        </div>
        
        <div class="content">
            <div class="success-badge">✅ Paiement Réussi</div>
            
            <div class="order-details">
                <h3>📋 Détails de votre ${isReservation ? 'réservation' : 'commande'}</h3>
                ${isReservation ? 
                  updatedItems.map(item => `
                    <div class="item">
                        <div class="item-info">
                            <div class="item-name">${item.title || 'Atelier inconnu'}</div>
                            <div class="item-artisan">${item.quantity || 1} place(s) réservée(s)</div>
                        </div>
                        <div class="item-price">${item.price || 0} €</div>
                    </div>
                  `).join('') :
                  updatedItems.map(item => `
                    <div class="item">
                        <div class="item-info">
                            <div class="item-name">${item.name || 'Produit inconnu'}</div>
                            <div class="item-artisan">par l'artisan</div>
                        </div>
                        <div class="item-price">${item.price || 0} € × ${item.quantity || 1}</div>
                    </div>
                  `).join('')
                }
            </div>
            
            <div class="total-section">
                <p style="margin: 0 0 10px 0; color: #666;">Total à payer</p>
                <p class="total-amount">${totalAmount} €</p>
            </div>
            
            <div class="status-section">
                <div class="status-message">
                    <strong>${isReservation ? 'Votre réservation d\'atelier est confirmée !' : 'Votre commande est en cours de traitement'}</strong>
                    <br>
                    ${isReservation ? 
                      'Vous recevrez un email de confirmation de l\'artisan avec tous les détails pratiques.' : 
                      'L\'artisan va préparer votre commande et vous contactera pour l\'envoi.'
                    }
                </div>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="#" class="btn">Voir mes commandes</a>
                <a href="#" class="btn">Contacter le support</a>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>CraftHub - Votre plateforme d'artisanat de confiance</strong></p>
            <div class="contact-info">
                <p>📧 support@crafthub.tn</p>
                <p>🌐 www.crafthub.tn</p>
                <p>📱 Suivez-nous sur les réseaux sociaux</p>
            </div>
            <p style="font-size: 12px; color: #999; margin-top: 15px;">
                Cet email a été envoyé automatiquement, merci de ne pas y répondre.
            </p>
        </div>
    </div>
</body>
</html>`;
    };

    const emailHtml = generateEmailTemplate(type, updatedItems, updatedItems, amount_cents, null);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `Confirmation de ${type === 'cart' ? 'Achat' : 'Réservation'}`,
      html: emailHtml,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${user.email}`);

    res.json({ message: 'Paiement confirmé et email envoyé' });
  } catch (error) {
    console.error('Erreur lors de la confirmation du paiement :', error.message, error.stack);
    if (error.code === 'ECONNREFUSED') {
      return res.status(500).json({ error: 'Failed to connect to email server', details: error.message });
    } else if (error.response && error.response.code === 'EAUTH') {
      return res.status(500).json({ error: 'Authentication failed with email server', details: error.message });
    }
    return res.status(500).json({ error: `Failed to confirm payment: ${error.message}` });
  }
});
module.exports = router;