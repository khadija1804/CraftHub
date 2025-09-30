const mongoose = require('mongoose');
const Profile = require('../models/Profile');
const User = require('../models/user');
require('dotenv').config();

async function updateProfiles() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crafthub', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Trouver tous les profils sans email
    const profilesWithoutEmail = await Profile.find({ 
      $or: [
        { email: { $exists: false } },
        { email: '' },
        { email: null }
      ]
    });

    console.log(`Found ${profilesWithoutEmail.length} profiles without email`);

    for (const profile of profilesWithoutEmail) {
      try {
        // Récupérer l'utilisateur correspondant
        const user = await User.findById(profile.userId);
        if (user && user.email) {
          // Mettre à jour le profil avec l'email de l'utilisateur
          profile.email = user.email;
          await profile.save();
          console.log(`Updated profile for user ${user.email}`);
        } else {
          console.log(`No user found for profile ${profile._id}`);
        }
      } catch (error) {
        console.error(`Error updating profile ${profile._id}:`, error.message);
      }
    }

    console.log('✅ Profile update completed');

  } catch (error) {
    console.error('❌ Error updating profiles:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Exécuter le script
if (require.main === module) {
  updateProfiles();
}

module.exports = updateProfiles;
