import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPublicProducts, getPublicWorkshops, getPublicProductImage, getPublicWorkshopImage, getProfileById } from '../services/api';
import { isWorkshopExpired, getWorkshopStatus, formatWorkshopDate } from '../utils/workshopUtils';

function ClientArtisanProfile() {
  const [artisan, setArtisan] = useState(null);
  const [products, setProducts] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const [imageUrls, setImageUrls] = useState({});
  const [workshopImageUrls, setWorkshopImageUrls] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('products');
  const { artisanId } = useParams();

  // Helper function to convert Buffer to Uint8Array
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

  // Create profile image URL from Buffer data
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
    return null;
  };

  useEffect(() => {
    const fetchArtisanData = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch artisan profile
        const artisanResponse = await getProfileById(artisanId);
        setArtisan(artisanResponse.data);

        // Fetch artisan's products and workshops
        const [productsResponse, workshopsResponse] = await Promise.all([
          getPublicProducts(),
          getPublicWorkshops()
        ]);

        // Filter products and workshops by this artisan
        const artisanProducts = (productsResponse.data || []).filter(p => p.artisanId?._id === artisanId);
        const artisanWorkshops = (workshopsResponse.data || []).filter(w => w.artisanId?._id === artisanId);

        setProducts(artisanProducts);
        setWorkshops(artisanWorkshops);

        // Load product images
        const productImageUrls = {};
        for (const product of artisanProducts) {
          if (product.images && product.images.length > 0) {
            try {
              const response = await getPublicProductImage(product._id, 0);
              productImageUrls[product._id] = URL.createObjectURL(response.data);
            } catch (err) {
              console.error('Failed to fetch image for product ID:', product._id, err);
            }
          }
        }
        setImageUrls(productImageUrls);

        // Load workshop images
        const workshopImageUrls = {};
        for (const workshop of artisanWorkshops) {
          if (workshop.images && workshop.images.length > 0) {
            try {
              const response = await getPublicWorkshopImage(workshop._id, 0);
              workshopImageUrls[workshop._id] = URL.createObjectURL(response.data);
            } catch (err) {
              console.error('Failed to fetch image for workshop ID:', workshop._id, err);
            }
          }
        }
        setWorkshopImageUrls(workshopImageUrls);

      } catch (err) {
        console.error('Error fetching artisan data:', err);
        setError('Erreur lors du chargement du profil de l\'artisan');
      } finally {
        setLoading(false);
      }
    };

    if (artisanId) {
      fetchArtisanData();
    }

    // Cleanup function to revoke object URLs
    return () => {
      Object.values(imageUrls).forEach(url => URL.revokeObjectURL(url));
      Object.values(workshopImageUrls).forEach(url => URL.revokeObjectURL(url));
    };
  }, [artisanId]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#faf9f7'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          backgroundColor: '#fff',
          borderRadius: '20px',
          boxShadow: '0 8px 25px rgba(0,0,0,0.05)',
          border: '1px solid rgba(138, 90, 68, 0.1)'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 25px',
            fontSize: '1.5em',
            animation: 'pulse 2s infinite'
          }}>
            ⚡
          </div>
          <h3 style={{
            fontSize: '1.4em',
            fontWeight: '700',
            color: '#2c3e50',
            margin: '0 0 10px 0'
          }}>
            Chargement du profil...
          </h3>
          <p style={{
            fontSize: '1.1em',
            color: '#5a6c7d',
            margin: 0
          }}>
            Récupération des informations de l'artisan
          </p>
        </div>
      </div>
    );
  }

  if (error || !artisan) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#faf9f7'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          backgroundColor: '#fff',
          borderRadius: '20px',
          boxShadow: '0 8px 25px rgba(0,0,0,0.05)',
          border: '1px solid rgba(220, 53, 69, 0.2)',
          maxWidth: '500px'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            background: 'linear-gradient(135deg, #dc3545, #ff6b7a)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 25px',
            fontSize: '1.5em'
          }}>
            ⚠️
          </div>
          <h3 style={{
            fontSize: '1.4em',
            fontWeight: '700',
            color: '#dc3545',
            margin: '0 0 10px 0'
          }}>
            Erreur
          </h3>
          <p style={{
            fontSize: '1.1em',
            color: '#5a6c7d',
            margin: '0 0 25px 0'
          }}>
            {error || 'Artisan non trouvé'}
          </p>
          <Link to="/client-home" style={{
            padding: '12px 24px',
            backgroundColor: '#8a5a44',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '25px',
            fontWeight: '600',
            transition: 'all 0.3s ease',
            fontSize: '1rem'
          }} onMouseOver={e => {
            e.target.style.backgroundColor = '#704838';
            e.target.style.transform = 'translateY(-2px)';
          }} onMouseOut={e => {
            e.target.style.backgroundColor = '#8a5a44';
            e.target.style.transform = 'translateY(0)';
          }}>
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif',
      backgroundColor: '#faf9f7',
      color: '#2c3e50',
      margin: 0,
      padding: 0,
      minHeight: '100vh'
    }}>
      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
        color: '#fff',
        padding: '40px 20px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative elements */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '150px',
          height: '150px',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '50%',
          filter: 'blur(20px)'
        }}></div>
        
        <div style={{
          position: 'absolute',
          bottom: '-30px',
          left: '-30px',
          width: '100px',
          height: '100px',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '50%',
          filter: 'blur(15px)'
        }}></div>

        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          gap: '30px',
          position: 'relative',
          zIndex: 2
        }}>
          {/* Back button */}
          <Link to="/client-home" style={{
            padding: '12px 20px',
            backgroundColor: 'rgba(255,255,255,0.15)',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '25px',
            fontWeight: '600',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }} onMouseOver={e => {
            e.target.style.backgroundColor = 'rgba(255,255,255,0.25)';
            e.target.style.transform = 'translateY(-2px)';
          }} onMouseOut={e => {
            e.target.style.backgroundColor = 'rgba(255,255,255,0.15)';
            e.target.style.transform = 'translateY(0)';
          }}>
            ← Retour
          </Link>

          {/* Profile Image */}
          <div style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '4px solid rgba(255,255,255,0.3)',
            boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
            flexShrink: 0
          }}>
            {getProfileImageUrl() ? (
              <img
                src={getProfileImageUrl()}
                alt={`${artisan.prenom} ${artisan.nom}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <div style={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, #d4a373, #8a5a44)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5em',
                color: '#fff'
              }}>
                👨‍🎨
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div style={{ flex: 1 }}>
            <h1 style={{
              fontSize: '2.5em',
              fontWeight: '800',
              margin: '0 0 10px 0',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              letterSpacing: '-0.02em'
            }}>
              {artisan.prenom} {artisan.nom}
            </h1>
            <p style={{
              fontSize: '1.2em',
              margin: '0 0 15px 0',
              opacity: 0.9,
              fontWeight: '500'
            }}>
              Artisan passionné
            </p>
            <div style={{
              display: 'flex',
              gap: '30px',
              flexWrap: 'wrap',
              marginTop: '20px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.8em', fontWeight: '700', marginBottom: '5px' }}>
                  {products.length}
                </div>
                <div style={{ fontSize: '0.9em', opacity: 0.8 }}>Produits</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.8em', fontWeight: '700', marginBottom: '5px' }}>
                  {workshops.length}
                </div>
                <div style={{ fontSize: '0.9em', opacity: 0.8 }}>Ateliers</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.8em', fontWeight: '700', marginBottom: '5px' }}>
                  ⭐ 4.8
                </div>
                <div style={{ fontSize: '0.9em', opacity: 0.8 }}>Note</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 20px'
      }}>
        {/* Bio and History Section */}
        <section style={{
          backgroundColor: '#fff',
          borderRadius: '25px',
          padding: '40px',
          marginBottom: '40px',
          boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
          border: '1px solid rgba(138, 90, 68, 0.1)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative elements */}
          <div style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '150px',
            height: '150px',
            background: 'linear-gradient(135deg, #d4a373, #8a5a44)',
            borderRadius: '50%',
            opacity: 0.03,
            filter: 'blur(30px)'
          }}></div>
          
          <div style={{
            position: 'absolute',
            bottom: '-30px',
            left: '-30px',
            width: '100px',
            height: '100px',
            background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
            borderRadius: '50%',
            opacity: 0.04,
            filter: 'blur(20px)'
          }}></div>

          <div style={{ position: 'relative', zIndex: 2 }}>
            {/* Section Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              marginBottom: '30px'
            }}>
              <div style={{
                width: '50px',
                height: '50px',
                background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
                borderRadius: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5em',
                boxShadow: '0 8px 20px rgba(138, 90, 68, 0.3)'
              }}>
                📖
              </div>
              <div>
                <h2 style={{
                  fontSize: '1.8em',
                  fontWeight: '700',
                  color: '#2c3e50',
                  margin: '0 0 5px 0',
                  letterSpacing: '-0.01em'
                }}>
                  L'histoire de {artisan.prenom}
                </h2>
                <p style={{
                  fontSize: '1em',
                  color: '#8a5a44',
                  margin: 0,
                  fontWeight: '500'
                }}>
                  Découvrez le parcours et la passion de cet artisan
                </p>
              </div>
            </div>

            {/* Bio Section */}
            <div style={{
              backgroundColor: 'rgba(138, 90, 68, 0.05)',
              borderRadius: '20px',
              padding: '30px',
              marginBottom: '30px',
              border: '1px solid rgba(138, 90, 68, 0.1)'
            }}>
              <h3 style={{
                fontSize: '1.3em',
                fontWeight: '600',
                color: '#2c3e50',
                margin: '0 0 15px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span style={{ color: '#8a5a44' }}>👨‍🎨</span>
                Biographie
              </h3>
              <p style={{
                color: '#5a6c7d',
                lineHeight: '1.7',
                fontSize: '1.1em',
                margin: '0 0 20px 0'
              }}>
                {artisan.bio || `Passionné d'artisanat depuis son plus jeune âge, ${artisan.prenom} ${artisan.nom} a développé son savoir-faire au fil des années. Sa créativité et son attention aux détails se reflètent dans chacune de ses créations uniques.`}
              </p>
              
              {/* Specialties */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '10px',
                marginTop: '20px'
              }}>
                <span style={{
                  backgroundColor: 'rgba(138, 90, 68, 0.1)',
                  color: '#8a5a44',
                  padding: '6px 12px',
                  borderRadius: '15px',
                  fontSize: '0.9em',
                  fontWeight: '500'
                }}>
                  ✨ Créations uniques
                </span>
                <span style={{
                  backgroundColor: 'rgba(138, 90, 68, 0.1)',
                  color: '#8a5a44',
                  padding: '6px 12px',
                  borderRadius: '15px',
                  fontSize: '0.9em',
                  fontWeight: '500'
                }}>
                  🎨 Techniques traditionnelles
                </span>
                <span style={{
                  backgroundColor: 'rgba(138, 90, 68, 0.1)',
                  color: '#8a5a44',
                  padding: '6px 12px',
                  borderRadius: '15px',
                  fontSize: '0.9em',
                  fontWeight: '500'
                }}>
                  🌱 Matériaux durables
                </span>
              </div>
            </div>

            {/* History Timeline */}
            <div style={{
              backgroundColor: 'rgba(138, 90, 68, 0.05)',
              borderRadius: '20px',
              padding: '30px',
              border: '1px solid rgba(138, 90, 68, 0.1)'
            }}>
              <h3 style={{
                fontSize: '1.3em',
                fontWeight: '600',
                color: '#2c3e50',
                margin: '0 0 25px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span style={{ color: '#8a5a44' }}>⏰</span>
                Historique de {artisan.prenom}
              </h3>
              
              {/* Timeline */}
              <div style={{ position: 'relative' }}>
                {/* Timeline line */}
                <div style={{
                  position: 'absolute',
                  left: '20px',
                  top: '0',
                  bottom: '0',
                  width: '2px',
                  background: 'linear-gradient(180deg, #8a5a44, #d4a373)',
                  borderRadius: '2px'
                }}></div>

                {/* Timeline items from historique field */}
                {artisan.historique && artisan.historique.length > 0 ? (
                  artisan.historique.map((item, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '20px',
                      marginBottom: '30px',
                      position: 'relative'
                    }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2em',
                        color: '#fff',
                        boxShadow: '0 4px 15px rgba(138, 90, 68, 0.3)',
                        flexShrink: 0,
                        zIndex: 2
                      }}>
                        {index === 0 ? '🎓' : index === 1 ? '🏆' : '🌟'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{
                          fontSize: '1.1em',
                          fontWeight: '600',
                          color: '#2c3e50',
                          margin: '0 0 8px 0'
                        }}>
                          {item.event}
                        </h4>
                        <span style={{
                          color: '#8a5a44',
                          fontSize: '0.9em',
                          fontWeight: '500'
                        }}>
                          {new Date(item.date).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    padding: '20px',
                    backgroundColor: 'rgba(138, 90, 68, 0.05)',
                    borderRadius: '15px',
                    border: '1px solid rgba(138, 90, 68, 0.1)'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2em',
                      color: '#fff',
                      boxShadow: '0 4px 15px rgba(138, 90, 68, 0.3)',
                      flexShrink: 0
                    }}>
                      📝
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{
                        fontSize: '1.1em',
                        fontWeight: '600',
                        color: '#2c3e50',
                        margin: '0 0 8px 0'
                      }}>
                        Aucun historique disponible
                      </h4>
                      <p style={{
                        color: '#5a6c7d',
                        fontSize: '1em',
                        lineHeight: '1.6',
                        margin: 0
                      }}>
                        {artisan.prenom} n'a pas encore partagé son historique professionnel.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Contact */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: '30px'
            }}>
              <div style={{
                backgroundColor: 'rgba(138, 90, 68, 0.05)',
                borderRadius: '15px',
                padding: '20px',
                textAlign: 'center',
                border: '1px solid rgba(138, 90, 68, 0.1)',
                maxWidth: '300px',
                width: '100%'
              }}>
                <div style={{
                  fontSize: '2em',
                  marginBottom: '10px'
                }}>
                  📧
                </div>
                <h4 style={{
                  fontSize: '1em',
                  fontWeight: '600',
                  color: '#2c3e50',
                  margin: '0 0 8px 0'
                }}>
                  Contact
                </h4>
                <p style={{
                  color: '#5a6c7d',
                  fontSize: '0.9em',
                  margin: 0
                }}>
                  {artisan.email || 'contact@artisan.com'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '40px',
          backgroundColor: '#fff',
          borderRadius: '15px',
          padding: '8px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
          border: '1px solid rgba(138, 90, 68, 0.1)'
        }}>
          <button
            onClick={() => setActiveTab('products')}
            style={{
              flex: 1,
              padding: '15px 25px',
              backgroundColor: activeTab === 'products' ? '#8a5a44' : 'transparent',
              color: activeTab === 'products' ? '#fff' : '#8a5a44',
              border: 'none',
              borderRadius: '10px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontSize: '1rem'
            }} onMouseOver={e => {
              if (activeTab !== 'products') {
                e.target.style.backgroundColor = 'rgba(138, 90, 68, 0.1)';
              }
            }} onMouseOut={e => {
              if (activeTab !== 'products') {
                e.target.style.backgroundColor = 'transparent';
              }
            }}
          >
            🛍️ Produits ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('workshops')}
            style={{
              flex: 1,
              padding: '15px 25px',
              backgroundColor: activeTab === 'workshops' ? '#8a5a44' : 'transparent',
              color: activeTab === 'workshops' ? '#fff' : '#8a5a44',
              border: 'none',
              borderRadius: '10px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontSize: '1rem'
            }} onMouseOver={e => {
              if (activeTab !== 'workshops') {
                e.target.style.backgroundColor = 'rgba(138, 90, 68, 0.1)';
              }
            }} onMouseOut={e => {
              if (activeTab !== 'workshops') {
                e.target.style.backgroundColor = 'transparent';
              }
            }}
          >
            🎨 Ateliers ({workshops.length})
          </button>
        </div>

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div>
            {products.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '25px'
              }}>
                {products.map((product) => (
                  <div key={product._id} style={{
                    backgroundColor: '#fff',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
                    transition: 'all 0.3s ease',
                    border: '1px solid rgba(138, 90, 68, 0.1)',
                    position: 'relative'
                  }} onMouseOver={e => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.12)';
                  }} onMouseOut={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.08)';
                  }}>
                    {/* Product Image */}
                    <div style={{
                      height: '200px',
                      background: imageUrls[product._id] 
                        ? `url(${imageUrls[product._id]}) center/cover` 
                        : 'linear-gradient(135deg, #d4a373, #8a5a44)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      {!imageUrls[product._id] && (
                        <div style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          fontSize: '3em',
                          color: '#fff',
                          opacity: 0.7
                        }}>
                          🛍️
                        </div>
                      )}
                      {/* Price Badge */}
                      <div style={{
                        position: 'absolute',
                        top: '15px',
                        right: '15px',
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        color: '#8a5a44',
                        padding: '8px 15px',
                        borderRadius: '20px',
                        fontWeight: '600',
                        fontSize: '1.1em',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                      }}>
                        {product.price} €
                      </div>
                    </div>
                    
                    {/* Product Info */}
                    <div style={{ padding: '25px' }}>
                      <h3 style={{
                        fontSize: '1.3em',
                        margin: '0 0 10px',
                        color: '#2c3e50',
                        fontWeight: '600',
                        lineHeight: '1.3'
                      }}>
                        {product.name}
                      </h3>
                      <p style={{
                        color: '#8a5a44',
                        fontSize: '0.9em',
                        fontWeight: '500',
                        margin: '0 0 15px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {product.category}
                      </p>
                      <p style={{
                        color: '#5a6c7d',
                        fontSize: '0.9em',
                        lineHeight: '1.4',
                        margin: '0 0 20px'
                      }}>
                        {product.description?.substring(0, 100)}...
                      </p>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span style={{
                          backgroundColor: product.stock > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(220, 53, 69, 0.1)',
                          color: product.stock > 0 ? '#10b981' : '#dc3545',
                          padding: '6px 12px',
                          borderRadius: '15px',
                          fontSize: '0.85em',
                          fontWeight: '600'
                        }}>
                          {product.stock > 0 ? `Stock: ${product.stock}` : 'Rupture de stock'}
                        </span>
                        <Link to={`/product-detail/${product._id}`} style={{
                          padding: '10px 20px',
                          backgroundColor: '#8a5a44',
                          color: '#fff',
                          textDecoration: 'none',
                          borderRadius: '20px',
                          fontWeight: '600',
                          fontSize: '0.9em',
                          transition: 'all 0.3s ease'
                        }} onMouseOver={e => {
                          e.target.style.backgroundColor = '#704838';
                          e.target.style.transform = 'translateY(-2px)';
                        }} onMouseOut={e => {
                          e.target.style.backgroundColor = '#8a5a44';
                          e.target.style.transform = 'translateY(0)';
                        }}>
                          Voir détails
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '80px 20px',
                backgroundColor: '#fff',
                borderRadius: '20px',
                boxShadow: '0 8px 25px rgba(0,0,0,0.05)',
                border: '1px solid rgba(138, 90, 68, 0.1)'
              }}>
                <div style={{ fontSize: '4em', marginBottom: '20px' }}>🛍️</div>
                <h3 style={{
                  fontSize: '1.5em',
                  fontWeight: '600',
                  color: '#2c3e50',
                  margin: '0 0 10px 0'
                }}>
                  Aucun produit disponible
                </h3>
                <p style={{
                  color: '#5a6c7d',
                  fontSize: '1.1em',
                  margin: 0
                }}>
                  Cet artisan n'a pas encore publié de produits
                </p>
              </div>
            )}
          </div>
        )}

        {/* Workshops Tab */}
        {activeTab === 'workshops' && (
          <div>
            {workshops.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                gap: '25px'
              }}>
                {workshops.map((workshop) => {
                  const isExpired = isWorkshopExpired(workshop.date);
                  const workshopStatus = getWorkshopStatus(workshop.date);
                  
                  return (
                    <div key={workshop._id} style={{
                      backgroundColor: '#fff',
                      borderRadius: '20px',
                      overflow: 'hidden',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
                      transition: 'all 0.3s ease',
                      border: '1px solid rgba(138, 90, 68, 0.1)',
                      position: 'relative',
                      opacity: isExpired ? 0.7 : 1
                    }} onMouseOver={e => {
                      if (!isExpired) {
                        e.currentTarget.style.transform = 'translateY(-8px)';
                        e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.12)';
                      }
                    }} onMouseOut={e => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.08)';
                    }}>
                      {/* Workshop Image */}
                      <div style={{
                        height: '180px',
                        background: workshopImageUrls[workshop._id] 
                          ? `url(${workshopImageUrls[workshop._id]}) center/cover` 
                          : 'linear-gradient(135deg, #d4a373, #8a5a44)',
                        position: 'relative',
                        overflow: 'hidden',
                        filter: isExpired ? 'grayscale(0.3) brightness(0.7)' : 'none'
                      }}>
                        {!workshopImageUrls[workshop._id] && (
                          <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            fontSize: '3em',
                            color: '#fff',
                            opacity: 0.7
                          }}>
                            🎨
                          </div>
                        )}
                        
                        {/* Price Badge */}
                        <div style={{
                          position: 'absolute',
                          top: '15px',
                          right: '15px',
                          backgroundColor: 'rgba(255,255,255,0.9)',
                          color: '#8a5a44',
                          padding: '8px 15px',
                          borderRadius: '20px',
                          fontWeight: '600',
                          fontSize: '1.1em',
                          boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                        }}>
                          {workshop.price} €
                        </div>

                        {/* Expired Overlay */}
                        {isExpired && (
                          <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            backgroundColor: 'rgba(220, 38, 38, 0.9)',
                            color: '#fff',
                            padding: '8px 16px',
                            borderRadius: '20px',
                            fontSize: '14px',
                            fontWeight: '700',
                            textAlign: 'center',
                            boxShadow: '0 4px 12px rgba(220, 38, 38, 0.4)',
                            backdropFilter: 'blur(10px)',
                            zIndex: 2
                          }}>
                            ⚠️ ATELIER EXPIRÉ
                          </div>
                        )}
                      </div>
                      
                      {/* Workshop Info */}
                      <div style={{ padding: '25px' }}>
                        <h3 style={{
                          fontSize: '1.3em',
                          margin: '0 0 10px',
                          color: '#2c3e50',
                          fontWeight: '600',
                          lineHeight: '1.3',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          {workshop.title}
                          {isExpired && (
                            <span style={{
                              backgroundColor: 'rgba(220, 38, 38, 0.1)',
                              color: '#dc3545',
                              padding: '2px 6px',
                              borderRadius: '10px',
                              fontSize: '0.7em',
                              fontWeight: '700'
                            }}>
                              EXPIRÉ
                            </span>
                          )}
                        </h3>
                        <p style={{
                          color: '#8a5a44',
                          fontSize: '0.9em',
                          fontWeight: '500',
                          margin: '0 0 15px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          {workshop.category}
                        </p>
                        <p style={{
                          color: '#5a6c7d',
                          fontSize: '0.9em',
                          lineHeight: '1.4',
                          margin: '0 0 20px'
                        }}>
                          {workshop.description?.substring(0, 100)}...
                        </p>
                        
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '20px'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            color: isExpired ? '#dc3545' : '#8a5a44',
                            fontSize: '0.9em',
                            fontWeight: '500'
                          }}>
                            📅 {formatWorkshopDate(workshop.date)}
                          </div>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            color: '#8a5a44',
                            fontSize: '0.9em',
                            fontWeight: '500'
                          }}>
                            👥 {workshop.places} places
                          </div>
                        </div>

                        <Link 
                          to={`/workshop-detail/${workshop._id}`} 
                          style={{
                            width: '100%',
                            padding: '12px 20px',
                            backgroundColor: isExpired ? '#6c757d' : '#8a5a44',
                            color: '#fff',
                            textDecoration: 'none',
                            borderRadius: '20px',
                            fontWeight: '600',
                            fontSize: '0.9em',
                            transition: 'all 0.3s ease',
                            textAlign: 'center',
                            display: 'block',
                            cursor: isExpired ? 'not-allowed' : 'pointer'
                          }} 
                          onMouseOver={e => {
                            if (!isExpired) {
                              e.target.style.backgroundColor = '#704838';
                              e.target.style.transform = 'translateY(-2px)';
                            }
                          }} 
                          onMouseOut={e => {
                            e.target.style.backgroundColor = isExpired ? '#6c757d' : '#8a5a44';
                            e.target.style.transform = 'translateY(0)';
                          }}
                        >
                          {isExpired ? 'Atelier expiré' : 'Voir détails'}
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '80px 20px',
                backgroundColor: '#fff',
                borderRadius: '20px',
                boxShadow: '0 8px 25px rgba(0,0,0,0.05)',
                border: '1px solid rgba(138, 90, 68, 0.1)'
              }}>
                <div style={{ fontSize: '4em', marginBottom: '20px' }}>🎨</div>
                <h3 style={{
                  fontSize: '1.5em',
                  fontWeight: '600',
                  color: '#2c3e50',
                  margin: '0 0 10px 0'
                }}>
                  Aucun atelier disponible
                </h3>
                <p style={{
                  color: '#5a6c7d',
                  fontSize: '1.1em',
                  margin: 0
                }}>
                  Cet artisan n'a pas encore organisé d'ateliers
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* CSS Animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
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
        
        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }
        
        /* Custom scrollbar */
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
        
        /* Selection styling */
        ::selection {
          background: rgba(138, 90, 68, 0.2);
          color: #2c3e50;
        }
        
        /* Focus styles for accessibility */
        a:focus, button:focus {
          outline: 2px solid #8a5a44;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}

export default ClientArtisanProfile;
