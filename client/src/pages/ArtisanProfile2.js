import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { getProfileById, getProductsByArtisan, getWorkshopsByArtisan, getPublicProductImage, getPublicWorkshopImage } from '../services/api';

function ArtisanProfile2() {
  const [products, setProducts] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const [imageUrls, setImageUrls] = useState({});
  const [profile, setProfile] = useState({ nom: '', prenom: '', bio: '', history: [], photo: null }); // Initialiser history comme tableau
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('products');
  const navigate = useNavigate();
  const { artisanId } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      if (!artisanId) {
        setError('Aucun artisan spécifié.');
        return;
      }
      try {
        console.log('Fetching data for artisanId:', artisanId);
        const response = await getProfileById(artisanId);
        console.log('Full response:', response);
        const profileData = response.data || {};
        console.log('Profile data received:', profileData);
        setProfile({
          nom: profileData.nom || '',
          prenom: profileData.prenom || '',
          bio: profileData.bio || '',
          history: Array.isArray(profileData.history) ? profileData.history : Array.isArray(profileData.historique) ? profileData.historique : [], // Gérer les deux cas
          photo: profileData.photo || null,
        });

        const prodResponse = await getProductsByArtisan(artisanId);
        const prodData = Array.isArray(prodResponse.data) ? prodResponse.data : prodResponse.data || [];
        console.log('Products data:', prodData);
        setProducts(prodData);

        const workResponse = await getWorkshopsByArtisan(artisanId);
        const workData = Array.isArray(workResponse.data) ? workResponse.data : workResponse.data || [];
        console.log('Workshops data:', workData);
        setWorkshops(workData);

        const urls = {};
        for (const p of prodData) {
          if (p._id && p.images && p.images.length > 0) {
            p.images.forEach((img, index) => console.log(`Product image ${index}:`, img));
            try {
              const response = await getPublicProductImage(p._id, 0);
              urls[p._id] = URL.createObjectURL(response.data);
            } catch (err) {
              console.error('Failed to fetch image for product ID:', p._id, err);
              urls[p._id] = 'https://placehold.co/293x293';
            }
          } else {
            urls[p._id] = 'https://placehold.co/293x293';
          }
        }
        for (const w of workData) {
          if (w._id && w.images && w.images.length > 0) {
            w.images.forEach((img, index) => console.log(`Workshop image ${index}:`, img));
            try {
              const response = await getPublicWorkshopImage(w._id, 0);
              urls[w._id] = URL.createObjectURL(response.data);
            } catch (err) {
              console.error('Failed to fetch image for workshop ID:', w._id, err);
              urls[w._id] = 'https://placehold.co/293x293';
            }
          } else {
            urls[w._id] = 'https://placehold.co/293x293';
          }
        }
        setImageUrls(urls);
      } catch (err) {
        setError('Erreur lors du chargement des données. Veuillez réessayer.');
        console.error('Fetch Error:', err.response ? err.response.data : err.message);
      }
    };
    fetchData();
  }, [artisanId]);

  useEffect(() => {
    return () => {
      Object.values(imageUrls).forEach(url => URL.revokeObjectURL(url));
    };
  }, [imageUrls]);

  const bufferToUint8Array = (bufferData) => {
    try {
      if (bufferData && Array.isArray(bufferData.data)) {
        return new Uint8Array(bufferData.data);
      }
      return null;
    } catch (err) {
      console.error('Failed to convert Buffer to Uint8Array:', err);
      return null;
    }
  };

  const getProfileImageUrl = () => {
    if (profile.photo && profile.photo.data && profile.photo.contentType) {
      try {
        // Si c'est déjà une string base64 (nouveau format)
        if (typeof profile.photo.data === 'string') {
          return `data:${profile.photo.contentType};base64,${profile.photo.data}`;
        }
        // Si c'est un Buffer (ancien format)
        const uint8Array = bufferToUint8Array(profile.photo.data);
        if (uint8Array) {
          const blob = new Blob([uint8Array], { type: profile.photo.contentType });
          return URL.createObjectURL(blob);
        }
      } catch (err) {
        console.error('Failed to create profile image:', err);
      }
    }
    // Vérifier aussi si photoUrl existe (nouveau format du backend)
    if (profile.photoUrl) {
      return profile.photoUrl;
    }
    return 'https://placehold.co/150x150';
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div style={{ fontFamily: '"Georgia", serif', color: '#3a2f1a', minHeight: '100vh', backgroundColor: '#f8f1e9', margin: 0, padding: 0 }}>
      <header style={{ backgroundColor: '#8a5a44', color: '#fff', padding: '20px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h1 style={{ fontSize: '2em', margin: '0', fontWeight: 700 }}>
          <Link to="/client-home" style={{ color: '#fff', textDecoration: 'none' }}>CraftHub Tunisie</Link>
        </h1>
        <nav style={{ marginTop: '10px' }}>
          <Link to="/client-home" style={{ color: '#d4a373', margin: '0 15px', textDecoration: 'none', fontWeight: 500 }}>Explorer</Link>
          <Link to="/favorites-cart" style={{ color: '#d4a373', margin: '0 15px', textDecoration: 'none', fontWeight: 500 }}>Favoris</Link>
          <Link to="/panier" style={{ color: '#d4a373', margin: '0 15px', textDecoration: 'none', fontWeight: 500 }}>Panier</Link>
          <Link to="/workshop-booking" style={{ color: '#d4a373', margin: '0 15px', textDecoration: 'none', fontWeight: 500 }}>Réservations</Link>
          <Link to="/client-profile" style={{ color: '#d4a373', margin: '0 15px', textDecoration: 'none', fontWeight: 500 }}>Profil</Link>
          <Link to="/login" style={{ color: '#d4a373', margin: '0 15px', textDecoration: 'none', fontWeight: 500 }}>Déconnexion</Link>
        </nav>
      </header>

      <section style={{ maxWidth: '935px', margin: '30px auto', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {error && (
          <p style={{ color: '#8a5a44', backgroundColor: '#f8f1e9', padding: '10px', borderRadius: '5px', textAlign: 'center', marginBottom: '20px' }}>{error}</p>
        )}
        {profile.nom === '' && profile.prenom === '' && (
          <p style={{ color: '#8a5a44', textAlign: 'center', marginBottom: '20px' }}>
            Aucun profil trouvé.
          </p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '30px', flexWrap: 'wrap' }}>
          <img
            src={getProfileImageUrl()}
            alt={`${profile.prenom} ${profile.nom}'s profile`}
            style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #d4a373' }}
            onError={(e) => { console.log('Profile image load failed'); e.target.src = 'https://placehold.co/150x150'; e.target.onerror = null; }}
          />
          <div style={{ flex: 1, minWidth: '200px' }}>
            <h2 style={{ fontSize: '1.8em', margin: 0, color: '#8a5a44' }}>
              {`${profile.prenom} ${profile.nom}` || 'Inconnu Artisan'}
            </h2>
            <div style={{ display: 'flex', gap: '40px', margin: '10px 0', fontSize: '1em', color: '#8a5a44' }}>
              <span><strong>{products.length}</strong> produits</span>
              <span><strong>{workshops.length}</strong> ateliers</span>
            </div>
            <p style={{ margin: '10px 0', fontSize: '1em', color: '#8a5a44' }}>
              {profile.bio || 'Artisan passionné | Créations uniques et ateliers créatifs'}
            </p>
            <div style={{ margin: '10px 0', fontSize: '1em', color: '#8a5a44' }}>
              <h4 style={{ 
                color: '#8a5a44', 
                marginBottom: '12px', 
                fontSize: '1.1em',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>🚀</span>
                <span>Mon parcours</span>
              </h4>
              
              {profile.historique && profile.historique.length > 0 ? (
                <div style={{ marginTop: '10px' }}>
                  {profile.historique.map((event, index) => (
                    <div key={index} style={{
                      backgroundColor: 'rgba(212, 163, 115, 0.1)',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      marginBottom: '8px',
                      border: '1px solid rgba(212, 163, 115, 0.3)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(212, 163, 115, 0.15)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(212, 163, 115, 0.1)';
                    }}>
                      <p style={{ 
                        margin: '0 0 6px 0', 
                        color: '#5c4b38', 
                        fontWeight: '500',
                        fontSize: '0.95em',
                        lineHeight: '1.3'
                      }}>
                        {event.event}
                      </p>
                      <small style={{ 
                        color: '#8a5a44', 
                        opacity: 0.8,
                        fontSize: '0.85em'
                      }}>
                        {new Date(event.date).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </small>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  backgroundColor: 'rgba(212, 163, 115, 0.05)',
                  padding: '15px',
                  borderRadius: '8px',
                  border: '2px dashed rgba(212, 163, 115, 0.3)',
                  textAlign: 'center',
                  color: '#8a5a44',
                  fontStyle: 'italic',
                  fontSize: '0.9em'
                }}>
                  Aucun événement dans votre parcours pour le moment.
                </div>
              )}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '60px', borderTop: '1px solid #d4a373', paddingTop: '10px' }}>
          <button
            onClick={() => setActiveTab('products')}
            style={{ background: 'none', border: 'none', fontSize: '0.9em', fontWeight: activeTab === 'products' ? 600 : 400, color: activeTab === 'products' ? '#8a5a44' : '#8e8e8e', borderBottom: activeTab === 'products' ? '2px solid #8a5a44' : 'none', padding: '10px 0', cursor: 'pointer' }}
            aria-label="Afficher les produits"
          >
            Produits
          </button>
          <button
            onClick={() => setActiveTab('workshops')}
            style={{ background: 'none', border: 'none', fontSize: '0.9em', fontWeight: activeTab === 'workshops' ? 600 : 400, color: activeTab === 'workshops' ? '#8a5a44' : '#8e8e8e', borderBottom: activeTab === 'workshops' ? '2px solid #8a5a44' : 'none', padding: '10px 0', cursor: 'pointer' }}
            aria-label="Afficher les ateliers"
          >
            Ateliers
          </button>
        </div>
      </section>

      <section style={{ maxWidth: '935px', margin: '0 auto', padding: '0 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(293px, 1fr))', gap: '20px' }}>
          {activeTab === 'products' && products.length > 0 ? (
            products.map((p) => (
              <div key={p._id} style={{ position: 'relative', aspectRatio: '1/1', backgroundColor: '#fff', border: '1px solid #d4a373', borderRadius: '3px', overflow: 'hidden', transition: 'transform 0.2s' }}
                onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.02)')}
                onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')}>
                {imageUrls[p._id] ? (
                  <img
                    src={imageUrls[p._id]}
                    alt={p.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { console.log('Image load failed for product ID:', p._id); e.target.src = 'https://placehold.co/293x293'; e.target.onerror = null; }}
                  />
                ) : (
                  <img
                    src="https://placehold.co/293x293"
                    alt="Product placeholder"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { console.log('Placeholder image load failed for product ID:', p._id); e.target.style.display = 'none'; e.target.onerror = null; }}
                  />
                )}
                <div style={{ position: 'absolute', bottom: '10px', left: '10px', color: '#fff', backgroundColor: 'rgba(138, 90, 68, 0.5)', padding: '5px 10px', borderRadius: '3px', fontSize: '0.9em' }}>
                  {p.name} - {p.price} €
                </div>
                <Link
                  to={`/product/${p._id}`}
                  style={{ position: 'absolute', bottom: '10px', right: '10px', backgroundColor: 'rgba(212, 163, 115, 0.5)', color: '#fff', padding: '5px 10px', borderRadius: '3px', textDecoration: 'none', fontSize: '0.9em' }}
                  aria-label={`Voir plus pour ${p.name}`}
                >
                  Voir plus
                </Link>
              </div>
            ))
          ) : activeTab === 'products' && (
            <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#8e8e8e' }}>
              Aucun produit ajouté.
            </p>
          )}
          {activeTab === 'workshops' && workshops.length > 0 ? (
            workshops.map((w) => (
              <div key={w._id} style={{ position: 'relative', aspectRatio: '1/1', backgroundColor: '#fff', border: '1px solid #d4a373', borderRadius: '3px', overflow: 'hidden', transition: 'transform 0.2s' }}
                onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.02)')}
                onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')}>
                {imageUrls[w._id] ? (
                  <img
                    src={imageUrls[w._id]}
                    alt={w.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { console.log('Image load failed for workshop ID:', w._id); e.target.src = 'https://placehold.co/293x293'; e.target.onerror = null; }}
                  />
                ) : (
                  <img
                    src="https://placehold.co/293x293"
                    alt="Workshop placeholder"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { console.log('Placeholder image load failed for workshop ID:', w._id); e.target.style.display = 'none'; e.target.onerror = null; }}
                  />
                )}
                <div style={{ position: 'absolute', bottom: '10px', left: '10px', color: '#fff', backgroundColor: 'rgba(138, 90, 68, 0.5)', padding: '5px 10px', borderRadius: '3px', fontSize: '0.9em' }}>
                  {w.title} - {new Date(w.date).toLocaleDateString()}
                </div>
                <Link
                  to={`/workshop/${w._id}`}
                  style={{ position: 'absolute', bottom: '10px', right: '10px', backgroundColor: 'rgba(212, 163, 115, 0.5)', color: '#fff', padding: '5px 10px', borderRadius: '3px', textDecoration: 'none', fontSize: '0.9em' }}
                  aria-label={`Voir plus pour ${w.title}`}
                >
                  Voir plus
                </Link>
              </div>
            ))
          ) : activeTab === 'workshops' && (
            <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#8e8e8e' }}>
              Aucun atelier créé.
            </p>
          )}
        </div>
      </section>

      <footer style={{ backgroundColor: '#8a5a44', color: '#fff', textAlign: 'center', padding: '30px', marginTop: '50px' }}>
        <p style={{ margin: '0 0 10px', fontSize: '1em' }}>© 2025 CraftHub Tunisie. Tous droits réservés.</p>
        <p style={{ fontSize: '1em' }}>Contact : <a href="mailto:contact@crafthub.tn" style={{ color: '#d4a373', textDecoration: 'underline' }}>contact@crafthub.tn</a></p>
        <p style={{ fontSize: '1em' }}>Suivez-nous : <a href="https://facebook.com/crafthubtn" style={{ color: '#d4a373', textDecoration: 'underline', marginRight: '15px' }}>Facebook</a> | <a href="https://instagram.com/crafthubtn" style={{ color: '#d4a373', textDecoration: 'underline' }}>Instagram</a></p>
      </footer>
    </div>
  );
}

export default ArtisanProfile2;