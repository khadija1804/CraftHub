import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getProfile, updateProfile } from '../services/api';
import ArtisanHeader from '../components/ArtisanHeader';
import ArtisanFooter from '../components/ArtisanFooter';

function EditProfile() {
  const [profile, setProfile] = useState({ nom: '', prenom: '', bio: '', photo: null, historique: [] });
  const [newBio, setNewBio] = useState('');
  const [newHistorique, setNewHistorique] = useState('');
  const [photo, setPhoto] = useState(null);
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getProfile();
        console.log('Profile data received:', response.data);
        setProfile(response.data || { nom: '', prenom: '', bio: '', photo: null, historique: [] });
        setNewBio(response.data?.bio || '');
      } catch (err) {
        setError('Erreur lors du chargement du profil.');
        console.error('Fetch Profile Error:', err);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('bio', newBio);
    if (newHistorique) {
      formData.append('historique', JSON.stringify({ event: newHistorique, date: new Date() }));
    }
    if (photo) {
      formData.append('photo', photo);
    }

    try {
      await updateProfile(formData);
      navigate('/profile');
    } catch (err) {
      setError('Erreur lors de la mise à jour du profil.');
      console.error('Update Profile Error:', err);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      // Créer une URL de prévisualisation
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewPhoto(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      backgroundColor: '#f8f1e9',
      minHeight: '100vh',
      margin: 0,
      display: 'flex',
      flexDirection: 'column'
    }}>
      <ArtisanHeader />

      {/* ===== Modern Content Section ===== */}
      <section style={{
        maxWidth: '1200px',
        margin: '40px auto',
        padding: '0 30px'
      }}>
        {/* Hero Section */}
        <div style={{
          textAlign: 'center',
          marginBottom: '60px',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            top: '-20px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, rgba(138, 90, 68, 0.1) 0%, rgba(212, 163, 115, 0.05) 100%)',
            borderRadius: '50%',
            zIndex: 0
          }} />
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h1 style={{
              fontSize: '3.2em',
              color: '#8a5a44',
              margin: '0 0 20px 0',
              fontWeight: 700,
              letterSpacing: '-0.5px',
              textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '15px'
            }}>
              ✏️ Modifier le Profil
            </h1>
            <p style={{
              fontSize: '1.3em',
              color: '#8a5a44',
              margin: '0',
              opacity: 0.8,
              fontWeight: 500
            }}>
              Personnalisez votre profil et partagez votre histoire avec la communauté
            </p>
          </div>
        </div>

        {/* Main Content Card */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '20px',
          padding: '40px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          border: '1px solid rgba(212, 163, 115, 0.2)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative background pattern */}
          <div style={{
            position: 'absolute',
            top: '-30px',
            right: '-30px',
            width: '150px',
            height: '150px',
            background: 'linear-gradient(135deg, rgba(138, 90, 68, 0.1) 0%, rgba(212, 163, 115, 0.05) 100%)',
            borderRadius: '50%',
            zIndex: 0
          }} />
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* Error Message */}
            {error && (
              <div style={{
                backgroundColor: 'rgba(244, 67, 54, 0.1)',
                border: '1px solid rgba(244, 67, 54, 0.3)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '30px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <span style={{ fontSize: '1.5em' }}>⚠️</span>
                <p style={{ color: '#F44336', margin: 0, fontWeight: 600 }}>{error}</p>
              </div>
            )}

              {/* Photo Section */}
              <div style={{
                textAlign: 'center',
                marginBottom: '40px',
                padding: '30px',
                backgroundColor: 'rgba(212, 163, 115, 0.05)',
                borderRadius: '20px',
                border: '2px dashed rgba(212, 163, 115, 0.3)'
              }}>
              {/* Current/Preview Photo */}
              <div style={{
                position: 'relative',
                display: 'inline-block',
                marginBottom: '20px'
              }}>
                <img
                  src={previewPhoto || 'https://via.placeholder.com/150'}
                  alt="Profile"
            style={{
                    width: '150px',
                    height: '150px',
                    borderRadius: '50%',
                    border: '4px solid #d4a373',
                    boxShadow: '0 8px 24px rgba(212, 163, 115, 0.3)',
                    objectFit: 'cover',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = 'scale(1.05)';
                    e.target.style.boxShadow = '0 12px 32px rgba(212, 163, 115, 0.4)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.boxShadow = '0 8px 24px rgba(212, 163, 115, 0.3)';
                  }}
                />
                
                {/* Photo Status Badge */}
                <div style={{
                  position: 'absolute',
                  bottom: '10px',
                  right: '10px',
                  width: '40px',
                  height: '40px',
                  backgroundColor: previewPhoto ? '#4CAF50' : '#8a5a44',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2em',
                  color: '#fff',
                  boxShadow: '0 4px 12px rgba(138, 90, 68, 0.3)'
                }}>
                  {previewPhoto ? '✨' : '📷'}
                </div>
                
                {/* Preview Indicator */}
                {previewPhoto && (
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    backgroundColor: '#4CAF50',
                    color: '#fff',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '0.8em',
                    fontWeight: 600,
                    boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)'
                  }}>
                    Nouvelle
                  </div>
                )}
              </div>
              
              {/* Photo Actions */}
              <div style={{
                display: 'flex',
                gap: '15px',
                justifyContent: 'center',
                flexWrap: 'wrap',
                alignItems: 'center'
              }}>
                <label style={{
                  display: 'inline-block',
                  padding: '12px 24px',
              backgroundColor: '#d4a373',
              color: '#fff',
                  borderRadius: '25px',
                  cursor: 'pointer',
              fontWeight: 600,
                  fontSize: '1em',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 16px rgba(212, 163, 115, 0.3)'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#b88d5a';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(212, 163, 115, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = '#d4a373';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 16px rgba(212, 163, 115, 0.3)';
                }}>
                  {previewPhoto ? 'Changer l\'image' : 'Changer la photo'}
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
                    style={{ display: 'none' }}
                  />
                </label>
                
                {previewPhoto && (
                  <button
                    type="button"
                    onClick={() => {
                      setPhoto(null);
                      setPreviewPhoto(null);
                    }}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: 'transparent',
                      color: '#8a5a44',
                      border: '2px solid #8a5a44',
                      borderRadius: '25px',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '1em',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.backgroundColor = '#8a5a44';
                      e.target.style.color = '#fff';
                      e.target.style.transform = 'translateY(-2px)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.color = '#8a5a44';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    Annuler
                  </button>
                )}
              </div>
              
              {/* Photo Info */}
              {previewPhoto && (
                <div style={{
                  marginTop: '15px',
                  padding: '10px 20px',
                  backgroundColor: 'rgba(76, 175, 80, 0.1)',
                  borderRadius: '15px',
                  border: '1px solid rgba(76, 175, 80, 0.3)'
                }}>
                  <p style={{
                    color: '#4CAF50',
                    margin: 0,
                    fontSize: '0.9em',
                    fontWeight: 600
                  }}>
                    ✨ Nouvelle image sélectionnée - Cliquez sur "Enregistrer" pour confirmer
                  </p>
                </div>
              )}
          </div>

            {/* Current Profile Info */}
            <div style={{
              backgroundColor: 'rgba(138, 90, 68, 0.05)',
              borderRadius: '15px',
              padding: '20px',
              marginBottom: '30px',
              border: '1px solid rgba(138, 90, 68, 0.2)'
            }}>
              <h3 style={{
                color: '#8a5a44',
                margin: '0 0 15px 0',
                fontSize: '1.3em',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                📋 Informations actuelles
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '15px'
              }}>
                <div>
                  <strong style={{ color: '#8a5a44' }}>Nom :</strong>
                  <p style={{ margin: '5px 0 0 0', color: '#5c4b38' }}>
                    {profile.nom || 'Non renseigné'}
                  </p>
                </div>
                <div>
                  <strong style={{ color: '#8a5a44' }}>Prénom :</strong>
                  <p style={{ margin: '5px 0 0 0', color: '#5c4b38' }}>
                    {profile.prenom || 'Non renseigné'}
                  </p>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <strong style={{ color: '#8a5a44' }}>Biographie :</strong>
                  <p style={{ margin: '5px 0 0 0', color: '#5c4b38', lineHeight: '1.5' }}>
                    {profile.bio || 'Aucune biographie renseignée'}
                  </p>
                </div>
                {/* Section Mon parcours */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <h3 style={{ 
                    color: '#8a5a44', 
                    marginBottom: '16px', 
                    fontSize: '1.3em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <span>🚀</span>
                    <span>Mon parcours</span>
                  </h3>
                  
                  {profile.historique && profile.historique.length > 0 ? (
                    <div style={{ marginTop: '5px' }}>
                      {profile.historique.map((event, index) => (
                        <div key={index} style={{
                          backgroundColor: 'rgba(212, 163, 115, 0.1)',
                          padding: '12px 16px',
                          borderRadius: '12px',
                          marginBottom: '12px',
                          border: '1px solid rgba(212, 163, 115, 0.3)',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(212, 163, 115, 0.15)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(212, 163, 115, 0.1)';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}>
                          <p style={{ 
                            margin: '0 0 8px 0', 
                            color: '#5c4b38', 
                            fontWeight: '500',
                            fontSize: '1em',
                            lineHeight: '1.4'
                          }}>
                            {event.event}
                          </p>
                          <small style={{ 
                            color: '#8a5a44', 
                            opacity: 0.8,
                            fontSize: '0.9em'
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
                      padding: '20px',
                      borderRadius: '12px',
                      border: '2px dashed rgba(212, 163, 115, 0.3)',
                      textAlign: 'center',
                      color: '#8a5a44',
                      fontStyle: 'italic'
                    }}>
                      Aucun événement dans votre parcours pour le moment.
                    </div>
                  )}
                  
                  {/* Champ de saisie pour ajouter un nouvel événement */}
                  <div style={{ marginTop: '20px' }}>
                    <label style={{
                      color: '#8a5a44',
                      fontWeight: 600,
                      fontSize: '1em',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '10px'
                    }}>
                      <span>➕</span>
                      <span>Ajouter un événement</span>
                    </label>
                    <input
                      type="text"
                      value={newHistorique}
                      onChange={(e) => setNewHistorique(e.target.value)}
                      placeholder="Décrivez un événement de votre parcours..."
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid rgba(212, 163, 115, 0.3)',
                        borderRadius: '12px',
                        fontSize: '1em',
                        backgroundColor: '#fff',
                        color: '#3a2f1a',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                        outline: 'none'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#d4a373';
                        e.target.style.boxShadow = '0 4px 12px rgba(212, 163, 115, 0.2)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(212, 163, 115, 0.3)';
                        e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Form Section */}
            <form onSubmit={handleSubmit} style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '35px',
              marginBottom: '40px',
              padding: '0 20px',
              maxWidth: '800px',
              margin: '0 auto 40px auto'
            }}>
              {/* Nom et Prénom - Côte à côte */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '25px'
              }}>
                {/* Nom Field */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <label style={{
                    color: '#8a5a44',
                    fontWeight: 600,
                    fontSize: '1.1em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    👤 Nom
                  </label>
                  <input
                    type="text"
                    value={profile.nom || ''}
                    onChange={(e) => setProfile({ ...profile, nom: e.target.value })}
                    placeholder="Votre nom de famille"
                    style={{
                      width: '100%',
                      padding: '18px 24px',
                      border: '2px solid rgba(212, 163, 115, 0.3)',
                      borderRadius: '16px',
                      fontSize: '1.1em',
                      backgroundColor: '#fff',
                      color: '#3a2f1a',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#d4a373';
                      e.target.style.boxShadow = '0 6px 20px rgba(212, 163, 115, 0.25)';
                      e.target.style.transform = 'translateY(-2px)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(212, 163, 115, 0.3)';
                      e.target.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  />
                </div>

                {/* Prénom Field */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <label style={{
                    color: '#8a5a44',
                    fontWeight: 600,
                    fontSize: '1.1em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    👤 Prénom
                  </label>
                  <input
                    type="text"
                    value={profile.prenom || ''}
                    onChange={(e) => setProfile({ ...profile, prenom: e.target.value })}
                    placeholder="Votre prénom"
                    style={{
                      width: '100%',
                      padding: '18px 24px',
                      border: '2px solid rgba(212, 163, 115, 0.3)',
                      borderRadius: '16px',
                      fontSize: '1.1em',
                      backgroundColor: '#fff',
                      color: '#3a2f1a',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#d4a373';
                      e.target.style.boxShadow = '0 6px 20px rgba(212, 163, 115, 0.25)';
                      e.target.style.transform = 'translateY(-2px)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(212, 163, 115, 0.3)';
                      e.target.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  />
                </div>
              </div>

              {/* Bio Field */}
              <div style={{ 
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <label style={{
                  color: '#8a5a44',
                  fontWeight: 600,
                  fontSize: '1.1em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  📝 Biographie
                </label>
            <textarea
              value={newBio}
              onChange={(e) => setNewBio(e.target.value)}
                  placeholder="Parlez-nous de vous, de votre passion pour l'artisanat..."
                  style={{
                    width: '100%',
                    padding: '18px 24px',
                    border: '2px solid rgba(212, 163, 115, 0.3)',
                    borderRadius: '16px',
                    fontSize: '1.1em',
                    backgroundColor: '#fff',
                    color: '#3a2f1a',
                    minHeight: '140px',
                    resize: 'vertical',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                    fontFamily: 'inherit',
                    outline: 'none',
                    lineHeight: '1.6'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#d4a373';
                    e.target.style.boxShadow = '0 6px 20px rgba(212, 163, 115, 0.25)';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(212, 163, 115, 0.3)';
                    e.target.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)';
                    e.target.style.transform = 'translateY(0)';
                  }}
                />
              </div>

            </form>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '20px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button
                type="button"
                onClick={() => navigate('/profile')}
                style={{
                  padding: '16px 32px',
                  backgroundColor: 'transparent',
                  color: '#8a5a44',
                  border: '2px solid #8a5a44',
                  borderRadius: '25px',
                  fontWeight: 600,
                  fontSize: '1.1em',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#8a5a44';
                  e.target.style.color = '#fff';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(138, 90, 68, 0.3)';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#8a5a44';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                ← Annuler
              </button>
              
            <button
              type="submit"
                onClick={handleSubmit}
              style={{
                  padding: '16px 32px',
                backgroundColor: '#d4a373',
                color: '#fff',
                border: 'none',
                  borderRadius: '25px',
                fontWeight: 600,
                  fontSize: '1.1em',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 16px rgba(212, 163, 115, 0.3)'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#b88d5a';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(212, 163, 115, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = '#d4a373';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 16px rgba(212, 163, 115, 0.3)';
                }}
              >
                💾 Enregistrer les modifications
            </button>
            </div>
          </div>
        </div>
        </section>

      <ArtisanFooter />
    </div>
  );
}

export default EditProfile;