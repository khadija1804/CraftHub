const mongoose = require('mongoose');
const Subscription = require('../models/Subscription');
require('dotenv').config();

async function markExpiredSubscriptions() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crafthub', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

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

    console.log(`✅ Marked ${result.modifiedCount} subscriptions as expired`);
    
    // Afficher les abonnements expirés
    if (result.modifiedCount > 0) {
      const expiredSubscriptions = await Subscription.find({ 
        status: 'expired',
        updatedAt: { $gte: new Date(now.getTime() - 60000) } // Mis à jour dans la dernière minute
      }).populate('artisanId', 'nom prenom email');

      console.log('📋 Expired subscriptions:');
      expiredSubscriptions.forEach(sub => {
        console.log(`- ${sub.artisanId.nom} ${sub.artisanId.prenom} (${sub.artisanId.email}): ${sub.plan} - Expired on ${sub.expiryDate.toLocaleDateString()}`);
      });
    }

  } catch (error) {
    console.error('❌ Error marking expired subscriptions:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Exécuter le script
if (require.main === module) {
  markExpiredSubscriptions();
}

module.exports = markExpiredSubscriptions;
