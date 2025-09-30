import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPublicProducts, getPublicWorkshops, getPublicProductImage, getPublicWorkshopImage, getProfileById } from '../services/api';

function AdminArtisanProfile() {
  const [artisan, setArtisan] = useState(null);
  const [products, setProducts] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const [imageUrls, setImageUrls] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('products');
  const { artisanId } = useParams();

  // Helper function to convert Buffer to Uint8Array (from ArtisanProfile.js)
  const bufferToUint8Array = (buffer) => {
    try {
      if (Buffer.isBuffer(buffer)) {
        return new Uint8Array(buffer);
      } else if (buffer && typeof buffer === 'object' && buffer.data) {
        return new Uint8Array(buffer.data);
      }
      return null;
    } catch (err) {
      console.error('Failed to convert Buffer to Uint8Array:', err);
      return null;
    }
  };

  // Create profile image URL from Buffer data (from ArtisanProfile.js)
  const getProfileImageUrl = () => {
    if (artisan && artisan.photo && artisan.photo.data && artisan.photo.contentType) {
      try {
        const uint8Array = bufferToUint8Array(artisan.photo.data);
        if (uint8Array) {
          const blob = new Blob([uint8Array], { type: artisan.photo.contentType });
          return URL.createObjectURL(blob);
        }
      } catch (err) {
        console.error('Failed to create profile image Blob:', err);
      }
    }
    return null; // No fallback, will show default icon
  };

  useEffect(() => {
    const fetchArtisanData = async () => {
      try {
        setLoading(true);
        setError('');
        
        console.log('Fetching artisan data for ID:', artisanId);
        
        // Récupérer le profil de l'artisan (comme dans ArtisanProfile.js)
        try {
          const profileRes = await getProfileById(artisanId);
          console.log('Profile data received:', profileRes.data);
          setArtisan(profileRes.data || {});
        } catch (profileError) {
          console.warn('Could not fetch profile data:', profileError);
          // Utiliser des données de test pour le debug
          const testArtisanData = {
            nom: 'Artisan',
            prenom: 'Test',
            email: 'test@artisan.com',
            bio: 'Artisan passionné par la création artisanale',
            photo: null, // Pas d'image pour le test
            specialite: 'Céramique',
            experience: '5 ans',
            presentation: 'Je suis un artisan passionné par la céramique',
            parcours: 'Formation en école d\'art, puis 5 ans d\'expérience'
          };
          console.log('Using test data:', testArtisanData);
          setArtisan(testArtisanData);
        }
        
        // Récupérer tous les produits et ateliers
        const [prodRes, workRes] = await Promise.all([getPublicProducts(), getPublicWorkshops()]);
        
        // Filtrer les produits et ateliers de cet artisan
        const artisanProducts = (prodRes.data || []).filter(p => p.artisanId && p.artisanId._id === artisanId);
        const artisanWorkshops = (workRes.data || []).filter(w => w.artisanId && w.artisanId._id === artisanId);
        
        console.log('Artisan products:', artisanProducts.length);
        console.log('Artisan workshops:', artisanWorkshops.length);
        
        setProducts(artisanProducts);
        setWorkshops(artisanWorkshops);

        // Récupérer les images
        const urls = {};
        
        // Images des produits
        for (const product of artisanProducts) {
          if (product.images && product.images.length > 0) {
            try {
              const response = await getPublicProductImage(product._id, 0);
              urls[product._id] = URL.createObjectURL(response.data);
            } catch (err) {
              console.error('Failed to fetch image for product ID:', product._id, err);
            }
          }
        }
        
        // Images des ateliers
        for (const workshop of artisanWorkshops) {
          if (workshop.images && workshop.images.length > 0) {
            try {
              const response = await getPublicWorkshopImage(workshop._id, 0);
              urls[workshop._id] = URL.createObjectURL(response.data);
            } catch (err) {
              console.error('Failed to fetch image for workshop ID:', workshop._id, err);
            }
          }
        }
        
        setImageUrls(urls);
        setError('');
      } catch (err) {
        console.error('API Error:', err);
        console.error('Error response:', err.response?.data);
        console.error('Error status:', err.response?.status);
        
        let errorMessage = 'Erreur lors du chargement des données de l\'artisan.';
        
        if (err.response?.status === 404) {
          errorMessage = 'Artisan non trouvé.';
        } else if (err.response?.status === 403) {
          errorMessage = 'Accès interdit. Vous devez être administrateur.';
        } else if (err.response?.status === 400) {
          errorMessage = 'ID d\'artisan invalide.';
        } else if (err.code === 'NETWORK_ERROR' || !err.response) {
          errorMessage = 'Erreur de connexion. Vérifiez que le serveur est démarré.';
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (artisanId) {
      fetchArtisanData();
    }
  }, [artisanId]);

  useEffect(() => {
    return () => {
      Object.values(imageUrls).forEach(url => URL.revokeObjectURL(url));
    };
  }, [imageUrls]);

  if (loading) {
    return (
      <div style={{
        fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8f1e9, #e8dcc0)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '40px',
          background: 'rgba(255,255,255,0.9)',
          borderRadius: '20px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #8a5a44',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ fontSize: '1.2em', color: '#8a5a44', fontWeight: '600' }}>Chargement du profil de l'artisan...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8f1e9, #e8dcc0)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '40px',
          background: 'rgba(255,255,255,0.9)',
          borderRadius: '20px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          maxWidth: '500px'
        }}>
          <div style={{ fontSize: '4em', marginBottom: '20px' }}>❌</div>
          <h2 style={{ color: '#e74c3c', marginBottom: '15px' }}>Erreur de chargement</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>{error}</p>
          <Link to="/admin-home" style={{
            display: 'inline-block',
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '25px',
            fontWeight: '600',
            transition: 'all 0.3s ease'
          }}>
            Retour à l'accueil admin
          </Link>
        </div>
      </div>
    );
  }

  if (!artisan) {
    return (
      <div style={{
        fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8f1e9, #e8dcc0)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '40px',
          background: 'rgba(255,255,255,0.9)',
          borderRadius: '20px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          maxWidth: '500px'
        }}>
          <div style={{ fontSize: '4em', marginBottom: '20px' }}>👤</div>
          <h2 style={{ color: '#8a5a44', marginBottom: '15px' }}>Artisan non trouvé</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>L'artisan que vous recherchez n'existe pas ou n'a pas de contenu.</p>
          <Link to="/admin-home" style={{
            display: 'inline-block',
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '25px',
            fontWeight: '600',
            transition: 'all 0.3s ease'
          }}>
            Retour à l'accueil admin
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif', 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f8f1e9, #e8dcc0)',
      margin: 0, 
      padding: 0 
    }}>
      {/* ===== Header Admin ===== */}
      <header style={{
        background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
        color: '#fff',
        padding: '20px 0',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Link to="/admin-home" style={{
            fontSize: '2.2em',
            margin: '0',
            fontWeight: '700',
            background: 'linear-gradient(45deg, #fff, #f0f0f0)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            textDecoration: 'none'
          }}>
            🎨 CraftHub Admin
          </Link>
          <nav style={{ display: 'flex', gap: '25px', alignItems: 'center' }}>
            <Link to="/admin-home" style={{
              color: 'rgba(255,255,255,0.9)',
              textDecoration: 'none',
              fontWeight: '600',
              padding: '8px 16px',
              borderRadius: '20px',
              transition: 'all 0.3s ease',
              background: 'rgba(255,255,255,0.1)'
            }}>
              🏠 Supervision
            </Link>
            <Link to="/admin/subscriptions" style={{
              color: 'rgba(255,255,255,0.9)',
              textDecoration: 'none',
              fontWeight: '600',
              padding: '8px 16px',
              borderRadius: '20px',
              transition: 'all 0.3s ease',
              background: 'rgba(255,255,255,0.1)'
            }}>
              💳 Abonnements
            </Link>
            <Link to="/admin-statistics" style={{
              color: 'rgba(255,255,255,0.9)',
              textDecoration: 'none',
              fontWeight: '600',
              padding: '8px 16px',
              borderRadius: '20px',
              transition: 'all 0.3s ease',
              background: 'rgba(255,255,255,0.1)'
            }}>
              📊 Statistiques
            </Link>
            <a href="/login" style={{
              color: 'rgba(255,255,255,0.9)',
              textDecoration: 'none',
              fontWeight: '600',
              padding: '8px 16px',
              borderRadius: '20px',
              transition: 'all 0.3s ease',
              background: 'rgba(255,255,255,0.1)'
            }}>
              🚪 Déconnexion
            </a>
          </nav>
        </div>
      </header>

      {/* ===== Hero Section ===== */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(138, 90, 68, 0.1), rgba(212, 163, 115, 0.1))',
        padding: '60px 0',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          width: '100px',
          height: '100px',
          background: 'linear-gradient(45deg, rgba(138, 90, 68, 0.1), rgba(212, 163, 115, 0.1))',
          borderRadius: '50%',
          animation: 'float 6s ease-in-out infinite'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '30px',
          left: '30px',
          width: '60px',
          height: '60px',
          background: 'linear-gradient(45deg, rgba(212, 163, 115, 0.1), rgba(138, 90, 68, 0.1))',
          borderRadius: '50%',
          animation: 'float 4s ease-in-out infinite reverse'
        }}></div>
        
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: '3.5em',
            color: '#8a5a44',
            marginBottom: '20px',
            fontWeight: '800',
            textShadow: '0 4px 8px rgba(0,0,0,0.1)',
            background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            👤 Profil de l'Artisan
          </h1>
          <p style={{
            fontSize: '1.3em',
            color: '#666',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Détails et créations de {artisan.prenom} {artisan.nom}
          </p>
        </div>
      </div>

      {/* ===== Main Content ===== */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 20px'
      }}>
        {/* ===== Artisan Profile Card ===== */}
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '25px',
          padding: '40px',
          boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
          border: '1px solid rgba(138, 90, 68, 0.1)',
          marginBottom: '40px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Élément décoratif en haut à droite */}
          <div style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '200px',
            height: '200px',
            background: 'linear-gradient(45deg, rgba(138, 90, 68, 0.05), rgba(212, 163, 115, 0.05))',
            borderRadius: '50%',
            zIndex: 0
          }}></div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '300px 1fr',
            gap: '40px',
            alignItems: 'flex-start',
            position: 'relative',
            zIndex: 1
          }}>
            {/* Section Photo et Nom */}
            <div style={{
              textAlign: 'center'
            }}>
              <div style={{
                width: '200px',
                height: '200px',
                borderRadius: '50%',
                margin: '0 auto 20px',
                overflow: 'hidden',
                border: '4px solid #8a5a44',
                boxShadow: '0 10px 30px rgba(138, 90, 68, 0.3)',
                position: 'relative'
              }}>
                {getProfileImageUrl() ? (
                  <img 
                    src={getProfileImageUrl()} 
                    alt={`${artisan.prenom || ''} ${artisan.nom || ''}`.trim() || 'Artisan'}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '50%'
                    }}
                    onError={(e) => {
                      console.log('Image failed to load, showing default icon');
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div style={{
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
                  display: getProfileImageUrl() ? 'none' : 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '4em',
                  color: '#fff',
                  borderRadius: '50%'
                }}>
                  👤
                </div>
              </div>
              
              <h2 style={{
                fontSize: '2.2em',
                color: '#8a5a44',
                marginBottom: '15px',
                fontWeight: '700',
                lineHeight: '1.2'
              }}>
                {`${artisan.prenom || ''} ${artisan.nom || ''}`.trim() || 'Inconnu Artisan'}
              </h2>
              
              {/* Badges de statistiques */}
              <div style={{
                display: 'flex',
                gap: '15px',
                justifyContent: 'center',
                marginBottom: '20px',
                flexWrap: 'wrap'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  background: 'linear-gradient(135deg, #e8f5e8, #c8e6c9)',
                  borderRadius: '20px',
                  color: '#2e7d32',
                  fontWeight: '600',
                  fontSize: '0.9em'
                }}>
                  <span>📦</span>
                  <span>{artisan.productsCount || products.length} produits</span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  background: 'linear-gradient(135deg, #fff3e0, #ffe0b2)',
                  borderRadius: '20px',
                  color: '#f57c00',
                  fontWeight: '600',
                  fontSize: '0.9em'
                }}>
                  <span>🎨</span>
                  <span>{artisan.workshopsCount || workshops.length} ateliers</span>
                </div>
              </div>
            </div>
            
            {/* Section Informations détaillées */}
            <div>
              <h3 style={{
                fontSize: '1.8em',
                color: '#8a5a44',
                marginBottom: '25px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span>📋</span>
                <span>Informations de l'Artisan</span>
              </h3>
              
              {/* Informations personnelles */}
              <div style={{
                background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
                padding: '24px',
                borderRadius: '16px',
                marginBottom: '20px',
                border: '1px solid #dee2e6'
              }}>
                <h3 style={{ 
                  color: '#8a5a44', 
                  marginBottom: '16px', 
                  fontSize: '1.3em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <span>👤</span>
                  <span>Informations personnelles</span>
                </h3>
                
                <div style={{ marginBottom: '12px' }}>
                  <strong style={{ color: '#8a5a44' }}>Nom :</strong> 
                  <span style={{ color: '#666', marginLeft: '8px' }}>
                    {artisan.nom || 'Non renseigné'}
                  </span>
                </div>
                
                <div style={{ marginBottom: '12px' }}>
                  <strong style={{ color: '#8a5a44' }}>Prénom :</strong> 
                  <span style={{ color: '#666', marginLeft: '8px' }}>
                    {artisan.prenom || 'Non renseigné'}
                  </span>
                </div>
                
                <div style={{ marginBottom: '12px' }}>
                  <strong style={{ color: '#8a5a44' }}>Email :</strong> 
                  <span style={{ color: '#666', marginLeft: '8px', wordBreak: 'break-all' }}>
                    {artisan.email || 'Non renseigné'}
                  </span>
                </div>
                
                {artisan.bio && (
                  <div style={{ 
                    marginTop: '16px', 
                    paddingTop: '16px', 
                    borderTop: '1px solid #dee2e6' 
                  }}>
                    <strong style={{ color: '#8a5a44' }}>Bio :</strong>
                    <p style={{ 
                      marginTop: '8px', 
                      color: '#6c757d', 
                      fontStyle: 'italic',
                      lineHeight: '1.5'
                    }}>
                      {artisan.bio}
                    </p>
                  </div>
                )}
              </div>
              
              {/* Statut et sécurité */}
              <div style={{
                background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
                padding: '24px',
                borderRadius: '16px',
                marginBottom: '20px',
                border: '1px solid #dee2e6'
              }}>
                <h3 style={{ 
                  color: '#8a5a44', 
                  marginBottom: '16px', 
                  fontSize: '1.3em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <span>🔐</span>
                  <span>Statut et sécurité</span>
                </h3>
                
                <div style={{ marginBottom: '12px' }}>
                  <strong style={{ color: '#8a5a44' }}>Statut :</strong> 
                  <span style={{ color: '#28a745', marginLeft: '8px' }}>Compte actif</span>
                </div>
                
                <div style={{ marginBottom: '12px' }}>
                  <strong style={{ color: '#8a5a44' }}>Rôle :</strong> 
                  <span style={{ 
                    color: '#8a5a44', 
                    marginLeft: '8px',
                    padding: '4px 12px',
                    background: 'rgba(138, 90, 68, 0.1)',
                    borderRadius: '12px',
                    fontSize: '0.9em',
                    fontWeight: '600'
                  }}>
                    Artisan
                  </span>
                </div>
                
                <div style={{ marginBottom: '12px' }}>
                  <strong style={{ color: '#8a5a44' }}>Membre depuis :</strong> 
                  <span style={{ color: '#666', marginLeft: '8px' }}>
                    {artisan.createdAt ? new Date(artisan.createdAt).toLocaleDateString('fr-FR') : 'Non disponible'}
                  </span>
                </div>
                
                <div>
                  <strong style={{ color: '#8a5a44' }}>Dernière activité :</strong> 
                  <span style={{ color: '#666', marginLeft: '8px' }}>Aujourd'hui</span>
                </div>
              </div>
              
              {/* Spécialité et Expérience */}
              {((artisan.specialite && artisan.specialite.trim()) || (artisan.experience && artisan.experience.trim())) && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '15px',
                  marginBottom: '20px'
                }}>
                  {artisan.specialite && artisan.specialite.trim() && (
                    <div style={{
                      background: 'linear-gradient(135deg, #f3e5f5, #e1bee7)',
                      padding: '15px',
                      borderRadius: '15px',
                      border: '2px solid #9c27b0'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}>
                        <div style={{ fontSize: '1.2em' }}>🎯</div>
                        <div>
                          <p style={{
                            fontSize: '0.9em',
                            color: '#7b1fa2',
                            margin: '0 0 3px 0',
                            fontWeight: '600'
                          }}>
                            Spécialité
                          </p>
                          <p style={{
                            fontSize: '0.9em',
                            color: '#666',
                            margin: '0'
                          }}>
                            {artisan.specialite}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {artisan.experience && artisan.experience.trim() && (
                    <div style={{
                      background: 'linear-gradient(135deg, #e8f5e8, #c8e6c9)',
                      padding: '15px',
                      borderRadius: '15px',
                      border: '2px solid #4caf50'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}>
                        <div style={{ fontSize: '1.2em' }}>⭐</div>
                        <div>
                          <p style={{
                            fontSize: '0.9em',
                            color: '#2e7d32',
                            margin: '0 0 3px 0',
                            fontWeight: '600'
                          }}>
                            Expérience
                          </p>
                          <p style={{
                            fontSize: '0.9em',
                            color: '#666',
                            margin: '0'
                          }}>
                            {artisan.experience}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Sections Présentation et Parcours */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '15px'
              }}>
                {/* Je me présente */}
                <div style={{
                  background: 'linear-gradient(135deg, #fff3e0, #ffe0b2)',
                  padding: '20px',
                  borderRadius: '15px',
                  border: '2px solid #ff9800',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                className="card-hover">
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '10px'
                  }}>
                    <h4 style={{
                      fontSize: '1.1em',
                      color: '#f57c00',
                      margin: '0',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span>👋</span>
                      <span>Je me présente</span>
                    </h4>
                    <span style={{
                      fontSize: '1.2em',
                      color: '#f57c00',
                      transition: 'transform 0.3s ease'
                    }}>+</span>
                  </div>
                  <div style={{
                    fontSize: '0.95em',
                    color: '#666',
                    margin: '0',
                    lineHeight: '1.5'
                  }}>
                    {artisan.bio ? (
                      <p style={{ margin: '0' }}>{artisan.bio}</p>
                    ) : artisan.presentation ? (
                      <p style={{ margin: '0' }}>{artisan.presentation}</p>
                    ) : (
                      <p style={{ margin: '0', fontStyle: 'italic' }}>
                        Aucune présentation disponible pour le moment.
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Mon parcours */}
                <div style={{
                  background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
                  padding: '20px',
                  borderRadius: '15px',
                  border: '2px solid #2196f3',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                className="card-hover">
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '10px'
                  }}>
                    <h4 style={{
                      fontSize: '1.1em',
                      color: '#1976d2',
                      margin: '0',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span>🚀</span>
                      <span>Mon parcours</span>
                    </h4>
                    <span style={{
                      fontSize: '1.2em',
                      color: '#1976d2',
                      transition: 'transform 0.3s ease'
                    }}>+</span>
                  </div>
                  <div style={{
                    fontSize: '0.95em',
                    color: '#666',
                    margin: '0',
                    lineHeight: '1.5'
                  }}>
                    {artisan.historique && artisan.historique.length > 0 ? (
                      <div style={{ marginTop: '5px' }}>
                        {artisan.historique.map((event, index) => (
                          <div key={index} style={{
                            backgroundColor: 'rgba(33, 150, 243, 0.1)',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            marginBottom: '8px',
                            border: '1px solid rgba(33, 150, 243, 0.2)',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(33, 150, 243, 0.15)';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(33, 150, 243, 0.1)';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}>
                            <p style={{ 
                              margin: '0 0 4px 0', 
                              color: '#1976d2', 
                              fontWeight: '500',
                              fontSize: '0.9em',
                              lineHeight: '1.3'
                            }}>
                              {event.event}
                            </p>
                            <small style={{ 
                              color: '#666', 
                              opacity: 0.8,
                              fontSize: '0.8em'
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
                    ) : artisan.parcours ? (
                      <p style={{ margin: '0' }}>{artisan.parcours}</p>
                    ) : (
                      <p style={{ margin: '0', fontStyle: 'italic' }}>
                        Aucun parcours disponible pour le moment.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== Tabs Navigation ===== */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '30px',
          justifyContent: 'center'
        }}>
          <button
            onClick={() => setActiveTab('products')}
            style={{
              padding: '15px 30px',
              background: activeTab === 'products' 
                ? 'linear-gradient(135deg, #8a5a44, #d4a373)' 
                : 'rgba(255,255,255,0.8)',
              color: activeTab === 'products' ? '#fff' : '#8a5a44',
              border: 'none',
              borderRadius: '25px',
              fontSize: '1.1em',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: activeTab === 'products' 
                ? '0 8px 25px rgba(138, 90, 68, 0.3)' 
                : '0 4px 15px rgba(0,0,0,0.1)'
            }}
          >
            📦 Produits ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('workshops')}
            style={{
              padding: '15px 30px',
              background: activeTab === 'workshops' 
                ? 'linear-gradient(135deg, #8a5a44, #d4a373)' 
                : 'rgba(255,255,255,0.8)',
              color: activeTab === 'workshops' ? '#fff' : '#8a5a44',
              border: 'none',
              borderRadius: '25px',
              fontSize: '1.1em',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: activeTab === 'workshops' 
                ? '0 8px 25px rgba(138, 90, 68, 0.3)' 
                : '0 4px 15px rgba(0,0,0,0.1)'
            }}
          >
            🛠️ Ateliers ({workshops.length})
          </button>
        </div>

        {/* ===== Products Tab ===== */}
        {activeTab === 'products' && (
          <div>
            <h2 style={{
              fontSize: '2.2em',
              color: '#8a5a44',
              textAlign: 'center',
              marginBottom: '30px',
              fontWeight: '700'
            }}>
              📦 Produits de {artisan.prenom} {artisan.nom}
            </h2>
            
            {products.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '30px'
              }}>
                {products.map((product) => (
                  <div key={product._id} style={{
                    background: 'rgba(255,255,255,0.95)',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                    border: '1px solid rgba(138, 90, 68, 0.1)',
                    transition: 'all 0.3s ease'
                  }}
                  className="card-hover">
                    {imageUrls[product._id] && (
                      <div style={{
                        height: '200px',
                        backgroundImage: `url(${imageUrls[product._id]})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        position: 'relative'
                      }}>
                        <div style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          background: 'rgba(0,0,0,0.7)',
                          color: '#fff',
                          padding: '5px 10px',
                          borderRadius: '15px',
                          fontSize: '0.9em',
                          fontWeight: '600'
                        }}>
                          {product.price} €
                        </div>
                      </div>
                    )}
                    
                    <div style={{ padding: '25px' }}>
                      <h3 style={{
                        fontSize: '1.3em',
                        color: '#8a5a44',
                        marginBottom: '10px',
                        fontWeight: '700',
                        lineHeight: '1.3'
                      }}>
                        {product.title}
                      </h3>
                      
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginBottom: '15px'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '5px 10px',
                          background: 'linear-gradient(135deg, #e8f5e8, #c8e6c9)',
                          borderRadius: '15px',
                          fontSize: '0.9em',
                          color: '#2e7d32',
                          fontWeight: '600'
                        }}>
                          🏷️ {product.category}
                        </div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '5px 10px',
                          background: 'linear-gradient(135deg, #fff3e0, #ffe0b2)',
                          borderRadius: '15px',
                          fontSize: '0.9em',
                          color: '#f57c00',
                          fontWeight: '600'
                        }}>
                          📦 Stock: {product.stock || 'N/A'}
                        </div>
                      </div>
                      
                      <p style={{
                        color: '#666',
                        fontSize: '0.95em',
                        lineHeight: '1.5',
                        marginBottom: '20px',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {product.description || 'Aucune description disponible.'}
                      </p>
                      
                      <Link 
                        to={`/admin-product-details/${product._id}`}
                        style={{
                          display: 'block',
                          width: '100%',
                          padding: '12px 20px',
                          background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
                          color: '#fff',
                          textDecoration: 'none',
                          borderRadius: '25px',
                          textAlign: 'center',
                          fontWeight: '600',
                          fontSize: '1em',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 4px 15px rgba(138, 90, 68, 0.3)'
                        }}
                        onMouseOver={(e) => {
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 6px 20px rgba(138, 90, 68, 0.4)';
                        }}
                        onMouseOut={(e) => {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = '0 4px 15px rgba(138, 90, 68, 0.3)';
                        }}
                      >
                        👁️ Voir les détails
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                background: 'rgba(255,255,255,0.8)',
                borderRadius: '20px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
              }}>
                <div style={{ fontSize: '4em', marginBottom: '20px' }}>📦</div>
                <h3 style={{ color: '#8a5a44', marginBottom: '10px' }}>Aucun produit</h3>
                <p style={{ color: '#666' }}>Cet artisan n'a pas encore publié de produits.</p>
              </div>
            )}
          </div>
        )}

        {/* ===== Workshops Tab ===== */}
        {activeTab === 'workshops' && (
          <div>
            <h2 style={{
              fontSize: '2.2em',
              color: '#8a5a44',
              textAlign: 'center',
              marginBottom: '30px',
              fontWeight: '700'
            }}>
              🛠️ Ateliers de {artisan.prenom} {artisan.nom}
            </h2>
            
            {workshops.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '30px'
              }}>
                {workshops.map((workshop) => (
                  <div key={workshop._id} style={{
                    background: 'rgba(255,255,255,0.95)',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                    border: '1px solid rgba(138, 90, 68, 0.1)',
                    transition: 'all 0.3s ease'
                  }}
                  className="card-hover">
                    {imageUrls[workshop._id] && (
                      <div style={{
                        height: '200px',
                        backgroundImage: `url(${imageUrls[workshop._id]})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        position: 'relative'
                      }}>
                        <div style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          background: 'rgba(0,0,0,0.7)',
                          color: '#fff',
                          padding: '5px 10px',
                          borderRadius: '15px',
                          fontSize: '0.9em',
                          fontWeight: '600'
                        }}>
                          {workshop.price} €
                        </div>
                        <div style={{
                          position: 'absolute',
                          bottom: '10px',
                          left: '10px',
                          background: workshop.places > 0 ? 'rgba(76, 175, 80, 0.9)' : 'rgba(244, 67, 54, 0.9)',
                          color: '#fff',
                          padding: '5px 10px',
                          borderRadius: '15px',
                          fontSize: '0.9em',
                          fontWeight: '600'
                        }}>
                          {workshop.places > 0 ? `${workshop.places} places` : 'Complet'}
                        </div>
                      </div>
                    )}
                    
                    <div style={{ padding: '25px' }}>
                      <h3 style={{
                        fontSize: '1.3em',
                        color: '#8a5a44',
                        marginBottom: '10px',
                        fontWeight: '700',
                        lineHeight: '1.3'
                      }}>
                        {workshop.title}
                      </h3>
                      
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginBottom: '15px',
                        flexWrap: 'wrap'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '5px 10px',
                          background: 'linear-gradient(135deg, #e8f5e8, #c8e6c9)',
                          borderRadius: '15px',
                          fontSize: '0.9em',
                          color: '#2e7d32',
                          fontWeight: '600'
                        }}>
                          🏷️ {workshop.category}
                        </div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '5px 10px',
                          background: 'linear-gradient(135deg, #f3e5f5, #e1bee7)',
                          borderRadius: '15px',
                          fontSize: '0.9em',
                          color: '#7b1fa2',
                          fontWeight: '600'
                        }}>
                          📅 {new Date(workshop.date).toLocaleDateString()}
                        </div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '5px 10px',
                          background: 'linear-gradient(135deg, #fff3e0, #ffe0b2)',
                          borderRadius: '15px',
                          fontSize: '0.9em',
                          color: '#f57c00',
                          fontWeight: '600'
                        }}>
                          ⏱️ {workshop.duration}h
                        </div>
                      </div>
                      
                      <p style={{
                        color: '#666',
                        fontSize: '0.95em',
                        lineHeight: '1.5',
                        marginBottom: '20px',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {workshop.description || 'Aucune description disponible.'}
                      </p>
                      
                      <Link 
                        to={`/admin-workshop-details/${workshop._id}`}
                        style={{
                          display: 'block',
                          width: '100%',
                          padding: '12px 20px',
                          background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
                          color: '#fff',
                          textDecoration: 'none',
                          borderRadius: '25px',
                          textAlign: 'center',
                          fontWeight: '600',
                          fontSize: '1em',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 4px 15px rgba(138, 90, 68, 0.3)'
                        }}
                        onMouseOver={(e) => {
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 6px 20px rgba(138, 90, 68, 0.4)';
                        }}
                        onMouseOut={(e) => {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = '0 4px 15px rgba(138, 90, 68, 0.3)';
                        }}
                      >
                        👁️ Voir les détails
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                background: 'rgba(255,255,255,0.8)',
                borderRadius: '20px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
              }}>
                <div style={{ fontSize: '4em', marginBottom: '20px' }}>🛠️</div>
                <h3 style={{ color: '#8a5a44', marginBottom: '10px' }}>Aucun atelier</h3>
                <p style={{ color: '#666' }}>Cet artisan n'a pas encore publié d'ateliers.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===== Footer Admin ===== */}
      <footer style={{
        background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
        color: '#fff',
        padding: '50px 0 30px',
        marginTop: '60px'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '40px',
            marginBottom: '30px'
          }}>
            <div>
              <h3 style={{
                fontSize: '1.5em',
                marginBottom: '20px',
                fontWeight: '700'
              }}>
                🎨 CraftHub Admin
              </h3>
              <p style={{
                lineHeight: '1.6',
                opacity: '0.9'
              }}>
                Plateforme de gestion complète pour les artisans et leurs créations.
              </p>
            </div>
            
            <div>
              <h4 style={{
                fontSize: '1.2em',
                marginBottom: '15px',
                fontWeight: '600'
              }}>
                🔗 Liens Rapides
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Link to="/admin-home" style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none' }}>🏠 Supervision</Link>
                <Link to="/admin/subscriptions" style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none' }}>💳 Abonnements</Link>
                <Link to="/admin-statistics" style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none' }}>📊 Statistiques</Link>
              </div>
            </div>
            
            <div>
              <h4 style={{
                fontSize: '1.2em',
                marginBottom: '15px',
                fontWeight: '600'
              }}>
                📞 Contact
              </h4>
              <p style={{ margin: '0 0 8px 0', opacity: '0.9' }}>
                📧 contact@crafthub.com
              </p>
              <p style={{ margin: '0 0 8px 0', opacity: '0.9' }}>
                📱 +1 (555) 123-4567
              </p>
            </div>
            
            <div>
              <h4 style={{
                fontSize: '1.2em',
                marginBottom: '15px',
                fontWeight: '600'
              }}>
                🌐 Suivez-nous
              </h4>
              <div style={{ display: 'flex', gap: '15px' }}>
                <a href="https://facebook.com/crafthub" style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none' }}>📘 Facebook</a>
                <a href="https://instagram.com/crafthub" style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none' }}>📷 Instagram</a>
              </div>
            </div>
          </div>
          
          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.2)',
            paddingTop: '20px',
            textAlign: 'center',
            opacity: '0.8'
          }}>
            <p style={{ margin: '0 0 10px 0' }}>
              © 2025 CraftHub. Tous droits réservés.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '0.9em' }}>
              <a href="/privacy" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>Confidentialité</a>
              <a href="/terms" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>Conditions</a>
              <a href="/cookies" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>Cookies</a>
            </div>
          </div>
        </div>
      </footer>

      {/* ===== CSS Animations ===== */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .card-hover {
          transition: all 0.3s ease;
        }
        
        .card-hover:hover {
          transform: translateY(-5px);
        }
        
        /* Scrollbar personnalisée */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #8a5a44, #d4a373);
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #704838, #c19a6b);
        }
      `}</style>
    </div>
  );
}

export default AdminArtisanProfile;
