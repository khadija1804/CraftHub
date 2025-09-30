const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Profile = require('../models/Profile');
const User = require('../models/user');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage });

/** Helper: transforme le doc en objet JSON prêt pour le front
 *  - Encode photo.data (Buffer) en base64
 *  - Ajoute photoUrl: data:<mime>;base64,<...>
 */
function serializeProfile(doc) {
  if (!doc) return null;
  const obj = typeof doc.toObject === 'function' ? doc.toObject() : doc;

  if (obj.photo && obj.photo.data) {
    const base64 =
      Buffer.isBuffer(obj.photo.data)
        ? obj.photo.data.toString('base64')
        : Buffer.from(obj.photo.data).toString('base64');

    obj.photo = {
      ...obj.photo,
      data: base64, // on garde la compatibilité: .data contient du base64
    };

    // pratique côté front: <img src={profile.photoUrl} />
    obj.photoUrl = `data:${obj.photo.contentType || 'image/jpeg'};base64,${base64}`;
  }
  return obj;
}

/** Créer un profil */
router.post('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const profile = new Profile({
      userId: req.user.id,
      nom: user.nom,
      prenom: user.prenom,
    });

    await profile.save();
    res.status(201).json(serializeProfile(profile));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/** Mettre à jour le profil (y compris la photo) */
router.put('/', auth, upload.single('photo'), async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    const { bio, historique } = req.body;
    if (bio) profile.bio = bio;
    if (historique) {
      try {
        profile.historique.push(JSON.parse(historique));
      } catch {
        // si ce n'est pas du JSON valide, on peut décider d'ignorer ou d'erreur
      }
    }
    if (req.file) {
      profile.photo = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      };
    }

    await profile.save();
    res.json(serializeProfile(profile));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/** ⚠️ Place /public avant /:id pour éviter les collisions */
router.get('/public', async (req, res) => {
  try {
    const profiles = await Profile.find()
      .select('-__v -photo.data') // on n'envoie pas le binaire ici
      .lean();
    res.json(profiles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/** Récupérer un profil par userId (avec photo en base64) */
router.get('/:id', async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.params.id });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    res.json(serializeProfile(profile));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/** Endpoint direct pour servir la photo binaire (Content-Type correct) */
router.get('/:id/photo', async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.params.id }).select('photo');
    if (!profile || !profile.photo || !profile.photo.data) {
      return res.status(404).send('No photo');
    }
    res.set('Content-Type', profile.photo.contentType || 'image/jpeg');
    res.send(profile.photo.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/** Récupérer le profil de l'utilisateur connecté */
router.get('/', auth, async (req, res) => {
  try {
    let profile = await Profile.findOne({ userId: req.user.id });
    
    if (!profile) {
      // Si le profil n'existe pas, le créer avec les données de l'utilisateur
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      
      profile = new Profile({
        userId: req.user.id,
        nom: user.nom || '',
        prenom: user.prenom || '',
        email: user.email || '',
        bio: '',
        historique: []
      });
      
      await profile.save();
    }
    
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
