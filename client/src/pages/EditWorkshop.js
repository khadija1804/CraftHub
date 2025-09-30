import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getWorkshop, updateWorkshop } from '../services/api';
import ArtisanHeader from '../components/ArtisanHeader';
import ArtisanFooter from '../components/ArtisanFooter';

function EditWorkshop() {
  const { id } = useParams();
  const [workshop, setWorkshop] = useState({ title: '', price: 0, category: '', images: [null, null, null], date: '', duration: 0, location: '', description: '' });
  const [error, setError] = useState('');
  const [imageUrls, setImageUrls] = useState([null, null, null]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  // Fonction pour formater la date pour l'input datetime-local
  const formatDateForInput = (dateString) => {
    if (!dateString) {
      console.log('Aucune date fournie');
      return '';
    }
    
    console.log('Date reçue de l\'API:', dateString);
    
    try {
      const date = new Date(dateString);
      console.log('Date parsée:', date);
      
      if (isNaN(date.getTime())) {
        console.log('Date invalide');
        return '';
      }
      
      // Formater en YYYY-MM-DDTHH:MM pour datetime-local
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}`;
      console.log('Date formatée pour input:', formattedDate);
      
      return formattedDate;
    } catch (error) {
      console.error('Erreur lors du formatage de la date:', error);
      return '';
    }
  };

  useEffect(() => {
    const fetchWorkshop = async () => {
      try {
        setLoading(true);
        const res = await getWorkshop(id);
        const data = res.data || { title: '', price: 0, category: '', images: [], date: '', duration: 0, location: '', description: '' };
        
        // S'assurer que les images ont 3 éléments
        const images = [...(data.images || [])];
        while (images.length < 3) {
          images.push(null);
        }
        
        // Formater la date pour l'input datetime-local
        const formattedDate = formatDateForInput(data.date);
        
        console.log('Données complètes de l\'atelier:', data);
        console.log('Date formatée finale:', formattedDate);
        
        setWorkshop({ 
          ...data, 
          images,
          date: formattedDate
        });
        setLoading(false);
      } catch (err) {
        setError('Erreur lors du chargement de l\'atelier.');
        console.error('Error:', err);
        setLoading(false);
      }
    };
    fetchWorkshop();
  }, [id]);

  // Nettoyage des URLs d'objets
  useEffect(() => {
    return () => {
      imageUrls.forEach(url => {
        if (url) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [imageUrls]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    // Validation pour description
    if (!workshop.description || !workshop.description.trim()) {
      setError('La description est requise et ne peut pas être vide.');
      setSaving(false);
      return;
    }

    const formData = new FormData();
    formData.append('title', workshop.title);
    formData.append('price', workshop.price);
    formData.append('category', workshop.category);
    formData.append('date', workshop.date);
    formData.append('duration', workshop.duration);
    formData.append('location', workshop.location);
    formData.append('description', workshop.description.trim());
    
    // Ajouter seulement les images qui ne sont pas null
    workshop.images.forEach((image) => {
      if (image) {
        formData.append('images', image);
      }
    });

    try {
      await updateWorkshop(id, formData);
      navigate('/profile');
    } catch (err) {
      setError('Erreur lors de la mise à jour de l\'atelier.');
      console.error('Error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleImageChange = (e, index) => {
    const file = e.target.files[0];
    const newImages = [...workshop.images];
    newImages[index] = file;
    setWorkshop({ ...workshop, images: newImages });

    // Créer l'URL pour l'aperçu
    if (file) {
      const newImageUrls = [...imageUrls];
      newImageUrls[index] = URL.createObjectURL(file);
      setImageUrls(newImageUrls);
    } else {
      const newImageUrls = [...imageUrls];
      newImageUrls[index] = null;
      setImageUrls(newImageUrls);
    }
  };

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

  if (loading) {
    return (
      <div style={{ fontFamily: '"Georgia", serif', color: '#3a2f1a', minHeight: '100vh', backgroundColor: '#f8f1e9', margin: 0, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3em', marginBottom: '20px' }}>⏳</div>
          <h2 style={{ color: '#8a5a44', fontSize: '1.5em' }}>Chargement de l'atelier...</h2>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: '"Georgia", serif', color: '#3a2f1a', minHeight: '100vh', backgroundColor: '#f8f1e9', margin: 0, padding: 0 }}>
      <ArtisanHeader />
      
      {/* ===== Hero Section ===== */}
      <section style={{
        background: 'linear-gradient(135deg, #f8f1e9 0%, #e8d5c4 100%)',
        padding: '80px 0',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative Elements */}
        <div style={{
          position: 'absolute',
          top: '-100px',
          right: '-100px',
          width: '300px',
          height: '300px',
          background: 'linear-gradient(45deg, rgba(212, 163, 115, 0.1), rgba(138, 90, 68, 0.1))',
          borderRadius: '50%',
          opacity: 0.6
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '-150px',
          left: '-150px',
          width: '400px',
          height: '400px',
          background: 'linear-gradient(45deg, rgba(138, 90, 68, 0.05), rgba(212, 163, 115, 0.05))',
          borderRadius: '50%',
          opacity: 0.8
        }}></div>

        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 30px',
          textAlign: 'center',
          position: 'relative',
          zIndex: 2
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            padding: '40px',
            borderRadius: '20px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <div style={{ fontSize: '4em', marginBottom: '20px' }}>🎨</div>
            <h1 style={{
              fontSize: '3em',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '20px',
              textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
            }}>
              Modifier l'Atelier
        </h1>
            <p style={{
              fontSize: '1.3em',
              color: '#6b5b47',
              marginBottom: '30px',
              lineHeight: '1.6'
            }}>
              Mettez à jour les informations de votre atelier
            </p>
          </div>
        </div>
      </section>

      {/* ===== Main Content ===== */}
      <section style={{
        maxWidth: '1200px',
        margin: '40px auto',
        padding: '0 30px'
      }}>
        <div style={{
          background: '#fff',
          borderRadius: '20px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          padding: '50px',
          border: '1px solid #e8e8e8'
        }}>
          {/* Error Message */}
          {error && (
            <div style={{
              backgroundColor: '#f8d7da',
              color: '#721c24',
              padding: '15px 20px',
              borderRadius: '10px',
              marginBottom: '30px',
              border: '1px solid #f5c6cb',
              textAlign: 'center',
              fontSize: '1.1em',
              fontWeight: 600
            }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '30px' }} encType="multipart/form-data">
            
            {/* ===== Informations de Base ===== */}
            <div style={{
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              padding: '30px',
              borderRadius: '15px',
              border: '1px solid #dee2e6'
            }}>
              <h3 style={{
                fontSize: '1.5em',
                color: '#8a5a44',
                marginBottom: '25px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                📝 Informations de Base
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px' }}>
                {/* Titre de l'Atelier */}
          <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: 600,
                    color: '#3a2f1a',
                    fontSize: '1.1em'
                  }}>
                    Titre de l'Atelier *
                  </label>
            <input
              type="text"
              value={workshop.title}
              onChange={(e) => setWorkshop({ ...workshop, title: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '15px',
                      border: '2px solid #e9ecef',
                      borderRadius: '10px',
                      fontSize: '1em',
                      transition: 'all 0.3s ease',
                      backgroundColor: '#fff'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#8a5a44';
                      e.target.style.boxShadow = '0 0 0 3px rgba(138, 90, 68, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e9ecef';
                      e.target.style.boxShadow = 'none';
                    }}
                    placeholder="Entrez le titre de votre atelier"
              required
            />
          </div>

                {/* Prix */}
          <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: 600,
                    color: '#3a2f1a',
                    fontSize: '1.1em'
                  }}>
                    Prix (€) *
                  </label>
            <input
              type="number"
              value={workshop.price}
              onChange={(e) => setWorkshop({ ...workshop, price: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '15px',
                      border: '2px solid #e9ecef',
                      borderRadius: '10px',
                      fontSize: '1em',
                      transition: 'all 0.3s ease',
                      backgroundColor: '#fff'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#8a5a44';
                      e.target.style.boxShadow = '0 0 0 3px rgba(138, 90, 68, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e9ecef';
                      e.target.style.boxShadow = 'none';
                    }}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
              required
            />
          </div>

                {/* Catégorie */}
          <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: 600,
                    color: '#3a2f1a',
                    fontSize: '1.1em'
                  }}>
                    Catégorie *
                  </label>
            <select
              value={workshop.category}
              onChange={(e) => setWorkshop({ ...workshop, category: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '15px',
                      border: '2px solid #e9ecef',
                      borderRadius: '10px',
                      fontSize: '1em',
                      transition: 'all 0.3s ease',
                      backgroundColor: '#fff',
                      cursor: 'pointer'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#8a5a44';
                      e.target.style.boxShadow = '0 0 0 3px rgba(138, 90, 68, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e9ecef';
                      e.target.style.boxShadow = 'none';
                    }}
              required
            >
              <option value="">Sélectionner une catégorie</option>
              {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
              ))}
            </select>
          </div>
              </div>
            </div>

            {/* ===== Détails de l'Atelier ===== */}
            <div style={{
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              padding: '30px',
              borderRadius: '15px',
              border: '1px solid #dee2e6'
            }}>
              <h3 style={{
                fontSize: '1.5em',
                color: '#8a5a44',
                marginBottom: '25px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                📅 Détails de l'Atelier
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px' }}>
                {/* Date */}
          <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: 600,
                    color: '#3a2f1a',
                    fontSize: '1.1em'
                  }}>
                    Date et Heure *
                  </label>
            <input
              type="datetime-local"
              value={workshop.date}
              onChange={(e) => setWorkshop({ ...workshop, date: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '15px',
                      border: '2px solid #e9ecef',
                      borderRadius: '10px',
                      fontSize: '1em',
                      transition: 'all 0.3s ease',
                      backgroundColor: '#fff'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#8a5a44';
                      e.target.style.boxShadow = '0 0 0 3px rgba(138, 90, 68, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e9ecef';
                      e.target.style.boxShadow = 'none';
                    }}
              required
            />
          </div>

                {/* Durée */}
          <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: 600,
                    color: '#3a2f1a',
                    fontSize: '1.1em'
                  }}>
                    Durée (heures) *
                  </label>
            <input
              type="number"
              value={workshop.duration}
              onChange={(e) => setWorkshop({ ...workshop, duration: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '15px',
                      border: '2px solid #e9ecef',
                      borderRadius: '10px',
                      fontSize: '1em',
                      transition: 'all 0.3s ease',
                      backgroundColor: '#fff'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#8a5a44';
                      e.target.style.boxShadow = '0 0 0 3px rgba(138, 90, 68, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e9ecef';
                      e.target.style.boxShadow = 'none';
                    }}
                    min="0.5"
                    step="0.5"
                    placeholder="2.0"
              required
            />
          </div>

                {/* Lieu */}
          <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: 600,
                    color: '#3a2f1a',
                    fontSize: '1.1em'
                  }}>
                    Lieu *
                  </label>
            <input
              type="text"
              value={workshop.location}
              onChange={(e) => setWorkshop({ ...workshop, location: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '15px',
                      border: '2px solid #e9ecef',
                      borderRadius: '10px',
                      fontSize: '1em',
                      transition: 'all 0.3s ease',
                      backgroundColor: '#fff'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#8a5a44';
                      e.target.style.boxShadow = '0 0 0 3px rgba(138, 90, 68, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e9ecef';
                      e.target.style.boxShadow = 'none';
                    }}
                    placeholder="Adresse ou lieu de l'atelier"
              required
            />
          </div>
              </div>
            </div>

            {/* ===== Description ===== */}
            <div style={{
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              padding: '30px',
              borderRadius: '15px',
              border: '1px solid #dee2e6'
            }}>
              <h3 style={{
                fontSize: '1.5em',
                color: '#8a5a44',
                marginBottom: '25px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                📝 Description Détaillée
              </h3>
              
          <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: 600,
                  color: '#3a2f1a',
                  fontSize: '1.1em'
                }}>
                  Description de l'Atelier *
                </label>
            <textarea
              value={workshop.description}
              onChange={(e) => setWorkshop({ ...workshop, description: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '15px',
                    border: '2px solid #e9ecef',
                    borderRadius: '10px',
                    fontSize: '1em',
                    transition: 'all 0.3s ease',
                    backgroundColor: '#fff',
                    minHeight: '120px',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#8a5a44';
                    e.target.style.boxShadow = '0 0 0 3px rgba(138, 90, 68, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e9ecef';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="Décrivez votre atelier en détail : techniques enseignées, matériaux fournis, niveau requis, etc..."
              required
            />
          </div>
            </div>

            {/* ===== Images ===== */}
            <div style={{
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              padding: '30px',
              borderRadius: '15px',
              border: '1px solid #dee2e6'
            }}>
              <h3 style={{
                fontSize: '1.5em',
                color: '#8a5a44',
                marginBottom: '25px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                📸 Images de l'Atelier
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} style={{
                    background: '#fff',
                    padding: '20px',
                    borderRadius: '10px',
                    border: '2px dashed #dee2e6',
                    textAlign: 'center',
                    transition: 'all 0.3s ease'
                  }}>
                    <div style={{ fontSize: '2em', marginBottom: '10px' }}>📷</div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, index)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #dee2e6',
                        borderRadius: '8px',
                        fontSize: '0.9em',
                        cursor: 'pointer'
                      }}
                    />
                    {workshop.images[index] && (
                      <div style={{
                        marginTop: '10px',
                        padding: '8px',
                        background: 'linear-gradient(135deg, #d4edda, #c3e6cb)',
                        borderRadius: '8px',
                        color: '#155724',
                        fontSize: '0.9em',
                        fontWeight: 600
                      }}>
                        ✓ Image sélectionnée
                      </div>
                    )}
                    
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
                          fontWeight: 600
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

            {/* ===== Actions ===== */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '20px',
              marginTop: '30px'
            }}>
              <Link
                to="/profile"
                style={{
                  padding: '15px 30px',
                  background: 'linear-gradient(135deg, #6c757d, #5a6268)',
                  color: '#fff',
                  textDecoration: 'none',
                  borderRadius: '10px',
                  fontSize: '1.1em',
                  fontWeight: 600,
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 16px rgba(0,0,0,0.2)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                ← Annuler
              </Link>
              
          <button
            type="submit"
                disabled={saving}
                style={{
                  padding: '15px 40px',
                  background: saving ? 'linear-gradient(135deg, #6c757d, #5a6268)' : 'linear-gradient(135deg, #8a5a44, #d4a373)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '1.1em',
                  fontWeight: 600,
                  cursor: saving ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  opacity: saving ? 0.7 : 1
                }}
                onMouseOver={(e) => {
                  if (!saving) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 16px rgba(0,0,0,0.2)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!saving) {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              >
                {saving ? '⏳ Mise à jour...' : '✨ Mettre à jour l\'atelier'}
          </button>
            </div>
        </form>
        </div>
      </section>

      <ArtisanFooter />
    </div>
  );
}

export default EditWorkshop;