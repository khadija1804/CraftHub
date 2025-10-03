import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { addWorkshop, checkSubscriptionStatus } from '../services/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ArtisanHeader from '../components/ArtisanHeader';
import ArtisanFooter from '../components/ArtisanFooter';

function AddWorkshop() {
  const [workshop, setWorkshop] = useState({
    title: '',
    description: '',
    price: 0,
    category: '',
    date: '',
    booking_time: '',
    duration: '',
    location: '',
    places: 0,
    images: [null, null, null],
  });
  const [error, setError] = useState('');
  const [imageUrls, setImageUrls] = useState([null, null, null]);
  const [saving, setSaving] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(true);
  const navigate = useNavigate();

  // Vérifier le statut d'abonnement au chargement
  useEffect(() => {
    const checkSubscription = async () => {
      try {
        setIsCheckingSubscription(true);
        const response = await checkSubscriptionStatus();
        setSubscriptionStatus(response.data);
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'abonnement:', error);
        setError('Erreur lors de la vérification de votre abonnement');
      } finally {
        setIsCheckingSubscription(false);
      }
    };

    checkSubscription();
  }, []);

  // Gestion de la soumission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    // Vérifier l'abonnement avant de permettre l'ajout
    if (!subscriptionStatus?.hasActiveSubscription) {
      toast.error('Vous devez avoir un abonnement actif pour ajouter des ateliers !');
      setSaving(false);
      return;
    }

    const formData = new FormData();
    formData.append('title', workshop.title);
    formData.append('description', workshop.description);
    formData.append('price', workshop.price);
    formData.append('category', workshop.category);
    formData.append('date', workshop.date);
    formData.append('booking_time', workshop.booking_time);
    formData.append('duration', workshop.duration);
    formData.append('location', workshop.location);
    formData.append('places', workshop.places);
    
    // Ajouter seulement les images non-null
    workshop.images.forEach((image) => {
      if (image) {
        formData.append('images', image);
      }
    });

    try {
      await addWorkshop(formData);
      toast.success('Atelier ajouté avec succès !');
      navigate('/Profile');
    } catch (err) {
      setError('Erreur lors de l\'ajout de l\'atelier. Vérifiez vos informations.');
      console.error('Error:', err);
      toast.error('Erreur lors de l\'ajout de l\'atelier. Vérifiez vos informations.');
    } finally {
      setSaving(false);
    }
  };

  const handleImageChange = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const newImages = [...workshop.images];
      newImages[index] = file;
      setWorkshop({ ...workshop, images: newImages });

      // Créer l'URL pour l'aperçu
      const newImageUrls = [...imageUrls];
      newImageUrls[index] = URL.createObjectURL(file);
      setImageUrls(newImageUrls);
    }
  };

  // Nettoyage des URLs d'images
  useEffect(() => {
    return () => {
      imageUrls.forEach(url => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [imageUrls]);

  const categories = [
    { value: 'woodworking', label: '🪵 Menuiserie' },
    { value: 'pottery', label: '🏺 Poterie' },
    { value: 'jewelry', label: '💎 Bijouterie' },
    { value: 'painting', label: '🎨 Peinture' },
    { value: 'sculpture', label: '🗿 Sculpture' },
    { value: 'textiles', label: '🧵 Textiles' },
    { value: 'leatherwork', label: '👜 Maroquinerie' },
    { value: 'metalwork', label: '⚒️ Métallurgie' },
    { value: 'glasswork', label: '🪟 Verrerie' },
    { value: 'ceramics', label: '🍶 Céramique' },
    { value: 'basketry', label: '🧺 Vannerie' },
    { value: 'candlemaking', label: '🕯️ Bougies' },
    { value: 'soapmaking', label: '🧼 Savonnerie' },
    { value: 'cooking', label: '👨‍🍳 Cuisine' },
    { value: 'gardening', label: '🌱 Jardinage' }
  ];

  // Écran de chargement pendant la vérification de l'abonnement
  if (isCheckingSubscription) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f1eb 0%, #e8ddd4 100%)',
        fontFamily: '"Inter", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
      }}>
        <ArtisanHeader />
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
          flexDirection: 'column'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #8a5a44',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ marginTop: '20px', fontSize: '1.1em', color: '#8a5a44' }}>
            Vérification de votre abonnement...
          </p>
        </div>
        <ArtisanFooter />
      </div>
    );
  }

  // Écran d'erreur si pas d'abonnement actif
  if (subscriptionStatus && !subscriptionStatus.hasActiveSubscription) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f1eb 0%, #e8ddd4 100%)',
        fontFamily: '"Inter", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
      }}>
        <ArtisanHeader />
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
          flexDirection: 'column',
          padding: '40px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
            color: '#fff',
            padding: '40px',
            borderRadius: '20px',
            textAlign: 'center',
            maxWidth: '600px',
            boxShadow: '0 10px 30px rgba(220, 38, 38, 0.3)'
          }}>
            <div style={{ fontSize: '4em', marginBottom: '20px' }}>🔒</div>
            <h2 style={{ fontSize: '2em', marginBottom: '20px', fontWeight: '700' }}>
              Abonnement Requis
            </h2>
            <p style={{ fontSize: '1.2em', marginBottom: '30px', lineHeight: '1.6' }}>
              {subscriptionStatus.message || 'Vous devez avoir un abonnement actif pour ajouter des ateliers à votre boutique.'}
            </p>
            <div style={{ marginBottom: '30px' }}>
              <Link 
                to="/subscription" 
                style={{
                  background: 'linear-gradient(45deg, #8a5a44, #704838)',
                  color: '#fff',
                  padding: '15px 30px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  fontSize: '1.1em',
                  fontWeight: '600',
                  display: 'inline-block',
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
                💳 S'abonner maintenant
              </Link>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <Link 
                to="/artisan-profile" 
                style={{
                  color: '#fff',
                  textDecoration: 'none',
                  fontSize: '1em',
                  opacity: 0.8
                }}
              >
                ← Retour au profil
              </Link>
            </div>
          </div>
        </div>
        <ArtisanFooter />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f1eb 0%, #e8ddd4 100%)',
      fontFamily: '"Inter", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
    }}>
      <ArtisanHeader />
      
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #8a5a44 0%, #d4a373 100%)',
        padding: '60px 0',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          animation: 'float 6s ease-in-out infinite'
        }}></div>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '0 30px',
          position: 'relative',
          zIndex: 2
        }}>
          <h1 style={{
            fontSize: '3.5em',
            fontWeight: '800',
            color: '#fff',
            margin: '0 0 20px 0',
            textShadow: '0 4px 20px rgba(0,0,0,0.3)',
            letterSpacing: '-0.02em'
          }}>
            🎨 Créer un Atelier
          </h1>
          <p style={{
            fontSize: '1.3em',
            color: 'rgba(255,255,255,0.9)',
            margin: '0 0 30px 0',
            fontWeight: '400',
            lineHeight: '1.6'
          }}>
            Partagez votre passion et créez des expériences uniques pour vos participants
          </p>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 24px',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '50px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.3)',
            color: '#fff',
            fontSize: '1em',
            fontWeight: '600'
          }}>
            ✨ Créez des souvenirs inoubliables
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main style={{
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '60px 30px',
        position: 'relative'
      }}>
        <div style={{
          background: '#fff',
          borderRadius: '24px',
          padding: '50px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
          border: '1px solid rgba(212, 163, 115, 0.2)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Error Display */}
          {error && (
            <div style={{
              background: 'linear-gradient(135deg, #fee, #fdd)',
              border: '1px solid #f5c6cb',
              borderRadius: '12px',
              padding: '16px 20px',
              marginBottom: '30px',
              color: '#721c24',
              fontSize: '1em',
              fontWeight: '600',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(220, 53, 69, 0.15)'
            }}>
              ❌ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} encType="multipart/form-data">
            {/* Informations de Base */}
            <div style={{ marginBottom: '40px' }}>
              <h2 style={{
                fontSize: '1.8em',
                fontWeight: '700',
                color: '#8a5a44',
                margin: '0 0 25px 0',
                paddingBottom: '15px',
                borderBottom: '3px solid #d4a373',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                📝 Informations de Base
              </h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginBottom: '25px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '1.1em',
                    fontWeight: '600',
                    color: '#5a4a3a',
                    marginBottom: '10px'
                  }}>
                    Titre de l'atelier *
                  </label>
                  <input
                    type="text"
                    value={workshop.title}
                    onChange={(e) => setWorkshop({ ...workshop, title: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '15px 20px',
                      border: '2px solid #e9ecef',
                      borderRadius: '12px',
                      fontSize: '1em',
                      transition: 'all 0.3s ease',
                      backgroundColor: '#fff',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#d4a373';
                      e.target.style.boxShadow = '0 0 0 3px rgba(212, 163, 115, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e9ecef';
                      e.target.style.boxShadow = 'none';
                    }}
                    placeholder="Ex: Atelier de poterie pour débutants"
                    required
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '1.1em',
                    fontWeight: '600',
                    color: '#5a4a3a',
                    marginBottom: '10px'
                  }}>
                    Catégorie *
                  </label>
                  <select
                    value={workshop.category}
                    onChange={(e) => setWorkshop({ ...workshop, category: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '15px 20px',
                      border: '2px solid #e9ecef',
                      borderRadius: '12px',
                      fontSize: '1em',
                      backgroundColor: '#fff',
                      color: '#5a4a3a',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#d4a373';
                      e.target.style.boxShadow = '0 0 0 3px rgba(212, 163, 115, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e9ecef';
                      e.target.style.boxShadow = 'none';
                    }}
                    required
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '1.1em',
                  fontWeight: '600',
                  color: '#5a4a3a',
                  marginBottom: '10px'
                }}>
                  Description détaillée *
                </label>
                <textarea
                  value={workshop.description}
                  onChange={(e) => setWorkshop({ ...workshop, description: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '15px 20px',
                    border: '2px solid #e9ecef',
                    borderRadius: '12px',
                    fontSize: '1em',
                    minHeight: '120px',
                    resize: 'vertical',
                    transition: 'all 0.3s ease',
                    backgroundColor: '#fff',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#d4a373';
                    e.target.style.boxShadow = '0 0 0 3px rgba(212, 163, 115, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e9ecef';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="Décrivez votre atelier, les techniques enseignées, le niveau requis..."
                  required
                />
              </div>
            </div>

            {/* Détails de l'Atelier */}
            <div style={{ marginBottom: '40px' }}>
              <h2 style={{
                fontSize: '1.8em',
                fontWeight: '700',
                color: '#8a5a44',
                margin: '0 0 25px 0',
                paddingBottom: '15px',
                borderBottom: '3px solid #d4a373',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                ⏰ Détails de l'Atelier
              </h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '25px', marginBottom: '25px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '1.1em',
                    fontWeight: '600',
                    color: '#5a4a3a',
                    marginBottom: '10px'
                  }}>
                    Prix (€) *
                  </label>
                  <input
                    type="number"
                    value={workshop.price}
                    onChange={(e) => setWorkshop({ ...workshop, price: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '15px 20px',
                      border: '2px solid #e9ecef',
                      borderRadius: '12px',
                      fontSize: '1em',
                      transition: 'all 0.3s ease',
                      backgroundColor: '#fff',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#d4a373';
                      e.target.style.boxShadow = '0 0 0 3px rgba(212, 163, 115, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e9ecef';
                      e.target.style.boxShadow = 'none';
                    }}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '1.1em',
                    fontWeight: '600',
                    color: '#5a4a3a',
                    marginBottom: '10px'
                  }}>
                    Places disponibles *
                  </label>
                  <input
                    type="number"
                    value={workshop.places}
                    onChange={(e) => setWorkshop({ ...workshop, places: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '15px 20px',
                      border: '2px solid #e9ecef',
                      borderRadius: '12px',
                      fontSize: '1em',
                      transition: 'all 0.3s ease',
                      backgroundColor: '#fff',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#d4a373';
                      e.target.style.boxShadow = '0 0 0 3px rgba(212, 163, 115, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e9ecef';
                      e.target.style.boxShadow = 'none';
                    }}
                    placeholder="0"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '1.1em',
                    fontWeight: '600',
                    color: '#5a4a3a',
                    marginBottom: '10px'
                  }}>
                    Durée (heures) *
                  </label>
                  <input
                    type="number"
                    value={workshop.duration}
                    onChange={(e) => setWorkshop({ ...workshop, duration: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '15px 20px',
                      border: '2px solid #e9ecef',
                      borderRadius: '12px',
                      fontSize: '1em',
                      transition: 'all 0.3s ease',
                      backgroundColor: '#fff',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#d4a373';
                      e.target.style.boxShadow = '0 0 0 3px rgba(212, 163, 115, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e9ecef';
                      e.target.style.boxShadow = 'none';
                    }}
                    placeholder="0"
                    min="0.5"
                    step="0.5"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '25px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '1.1em',
                    fontWeight: '600',
                    color: '#5a4a3a',
                    marginBottom: '10px'
                  }}>
                    Date *
                  </label>
                  <input
                    type="date"
                    value={workshop.date}
                    onChange={(e) => setWorkshop({ ...workshop, date: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '15px 20px',
                      border: '2px solid #e9ecef',
                      borderRadius: '12px',
                      fontSize: '1em',
                      transition: 'all 0.3s ease',
                      backgroundColor: '#fff',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#d4a373';
                      e.target.style.boxShadow = '0 0 0 3px rgba(212, 163, 115, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e9ecef';
                      e.target.style.boxShadow = 'none';
                    }}
                    required
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '1.1em',
                    fontWeight: '600',
                    color: '#5a4a3a',
                    marginBottom: '10px'
                  }}>
                    Heure *
                  </label>
                  <input
                    type="time"
                    value={workshop.booking_time}
                    onChange={(e) => setWorkshop({ ...workshop, booking_time: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '15px 20px',
                      border: '2px solid #e9ecef',
                      borderRadius: '12px',
                      fontSize: '1em',
                      transition: 'all 0.3s ease',
                      backgroundColor: '#fff',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#d4a373';
                      e.target.style.boxShadow = '0 0 0 3px rgba(212, 163, 115, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e9ecef';
                      e.target.style.boxShadow = 'none';
                    }}
                    required
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '1.1em',
                    fontWeight: '600',
                    color: '#5a4a3a',
                    marginBottom: '10px'
                  }}>
                    Lieu *
                  </label>
                  <input
                    type="text"
                    value={workshop.location}
                    onChange={(e) => setWorkshop({ ...workshop, location: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '15px 20px',
                      border: '2px solid #e9ecef',
                      borderRadius: '12px',
                      fontSize: '1em',
                      transition: 'all 0.3s ease',
                      backgroundColor: '#fff',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#d4a373';
                      e.target.style.boxShadow = '0 0 0 3px rgba(212, 163, 115, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e9ecef';
                      e.target.style.boxShadow = 'none';
                    }}
                    placeholder="Ex: Atelier Artisan, Tunis"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Images de l'Atelier */}
            <div style={{ marginBottom: '40px' }}>
              <h2 style={{
                fontSize: '1.8em',
                fontWeight: '700',
                color: '#8a5a44',
                margin: '0 0 25px 0',
                paddingBottom: '15px',
                borderBottom: '3px solid #d4a373',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                📸 Images de l'Atelier
              </h2>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '20px'
              }}>
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} style={{
                    border: '2px dashed #d4a373',
                    borderRadius: '16px',
                    padding: '20px',
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    backgroundColor: '#faf9f7'
                  }}>
                    <div style={{
                      fontSize: '2em',
                      marginBottom: '15px',
                      color: '#d4a373'
                    }}>
                      {workshop.images[index] ? '✅' : '📷'}
                    </div>
                    
                    <div style={{
                      marginBottom: '15px',
                      fontSize: '1em',
                      fontWeight: '600',
                      color: '#5a4a3a'
                    }}>
                      {workshop.images[index] ? 'Image sélectionnée' : `Image ${index + 1}`}
                    </div>
                    
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, index)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #d4a373',
                        borderRadius: '8px',
                        fontSize: '0.9em',
                        cursor: 'pointer',
                        backgroundColor: '#fff'
                      }}
                    />

                    {/* Aperçu de l'image */}
                    {imageUrls[index] && (
                      <div style={{
                        marginTop: '15px',
                        padding: '10px',
                        background: '#f8f9fa',
                        borderRadius: '8px',
                        border: '1px solid #e9ecef'
                      }}>
                        <div style={{
                          fontSize: '0.9em',
                          color: '#6c757d',
                          marginBottom: '8px',
                          fontWeight: '600'
                        }}>
                          Aperçu :
                        </div>
                        <img
                          src={imageUrls[index]}
                          alt={`Aperçu ${index + 1}`}
                          style={{
                            width: '100%',
                            maxWidth: '200px',
                            height: '150px',
                            objectFit: 'cover',
                            borderRadius: '6px',
                            border: '1px solid #dee2e6',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}
                        />
                        <div style={{
                          marginTop: '8px',
                          fontSize: '0.8em',
                          color: '#6c757d',
                          wordBreak: 'break-all'
                        }}>
                          {workshop.images[index]?.name}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Boutons d'Action */}
            <div style={{
              display: 'flex',
              gap: '20px',
              justifyContent: 'center',
              marginTop: '40px',
              paddingTop: '30px',
              borderTop: '2px solid #f0f0f0'
            }}>
              <Link
                to="/artisan-profile"
                style={{
                  padding: '15px 30px',
                  background: 'linear-gradient(135deg, #6c757d, #5a6268)',
                  color: '#fff',
                  textDecoration: 'none',
                  borderRadius: '12px',
                  fontSize: '1.1em',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(108, 117, 125, 0.3)',
                  border: 'none',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 25px rgba(108, 117, 125, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(108, 117, 125, 0.3)';
                }}
              >
                Annuler
              </Link>

              <button
                type="submit"
                disabled={saving}
                style={{
                  padding: '15px 40px',
                  background: saving 
                    ? 'linear-gradient(135deg, #adb5bd, #6c757d)' 
                    : 'linear-gradient(135deg, #8a5a44, #d4a373)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1.1em',
                  fontWeight: '600',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: saving 
                    ? '0 4px 15px rgba(173, 181, 189, 0.3)' 
                    : '0 4px 15px rgba(138, 90, 68, 0.3)',
                  opacity: saving ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
                onMouseOver={(e) => {
                  if (!saving) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 25px rgba(138, 90, 68, 0.4)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!saving) {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 15px rgba(138, 90, 68, 0.3)';
                  }
                }}
              >
                {saving ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid #fff',
                      borderTop: '2px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    Création...
                  </>
                ) : (
                  '✨ Créer l\'atelier'
                )}
              </button>
            </div>
          </form>
        </div>
      </main>

      <ArtisanFooter />
      
      {/* Toast Notifications */}
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{
          fontSize: '14px'
        }}
      />

      {/* CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default AddWorkshop;