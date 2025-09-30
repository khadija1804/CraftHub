import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile } from '../services/api';
import ArtisanHeader from '../components/ArtisanHeader';
import ArtisanFooter from '../components/ArtisanFooter';

function Settings() {
  const [user, setUser] = useState({ email: '', password: '', newPassword: '' });
  const [profile, setProfile] = useState({ nom: '', prenom: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getProfile();
        console.log('Profile data:', res.data); // Debug pour voir les données
        setProfile({
          nom: res.data.nom || '',
          prenom: res.data.prenom || '',
          email: res.data.email || ''
        });
        setUser((prevUser) => ({ ...prevUser, email: res.data.email || '' })); // Mettre à jour uniquement email, garder les autres champs
      } catch (err) {
        setError('Erreur lors du chargement du profil.');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user.email || !user.password || !user.newPassword) {
      setError('Tous les champs sont requis.');
      return;
    }

    const formData = new FormData();
    formData.append('email', user.email.trim());
    formData.append('password', user.password.trim()); // Vérification du mot de passe actuel
    formData.append('newPassword', user.newPassword.trim());

    try {
      await updateProfile(formData);
      setSuccess('Profil mis à jour avec succès !');
      setError('');
      setTimeout(() => navigate('/artisan-home'), 2000); // Redirige après 2 secondes
    } catch (err) {
      setError('Erreur lors de la mise à jour: ' + (err.response?.data?.message || err.message));
      setSuccess('');
      console.error('Error:', err);
    }
  };

  // Afficher un message de chargement
  if (loading) {
    return (
      <div style={{ fontFamily: '"Georgia", serif', color: '#3a2f1a', minHeight: '100vh', backgroundColor: '#f8f1e9', margin: 0, padding: 0 }}>
        <ArtisanHeader />
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
          fontSize: '1.2em',
          color: '#8a5a44'
        }}>
          Chargement de vos paramètres...
        </div>
        <ArtisanFooter />
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
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            background: 'rgba(138, 90, 68, 0.1)',
            padding: '12px 24px',
            borderRadius: '50px',
            marginBottom: '30px',
            border: '1px solid rgba(138, 90, 68, 0.2)'
          }}>
            <span style={{ fontSize: '1.5em' }}>⚙️</span>
            <span style={{
              color: '#8a5a44',
              fontWeight: 600,
              fontSize: '1.1em'
            }}>Gestion des Paramètres</span>
          </div>

          <h1 style={{
            fontSize: '3.5em',
            fontWeight: 800,
            color: '#3a2f1a',
            marginBottom: '20px',
            textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
            lineHeight: '1.2'
          }}>
            Mes
            <span style={{
              background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}> Paramètres</span>
          </h1>

          <p style={{
            fontSize: '1.3em',
            color: '#6b5b47',
            maxWidth: '600px',
            margin: '0 auto 50px',
            lineHeight: '1.6'
          }}>
            Personnalisez votre compte, gérez vos informations et configurez vos préférences de sécurité.
          </p>

          {/* Profile Info Card */}
          <div style={{
            background: 'rgba(255,255,255,0.8)',
            padding: '30px',
            borderRadius: '20px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            border: '1px solid rgba(212, 163, 115, 0.2)',
            maxWidth: '500px',
            margin: '0 auto'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              marginBottom: '20px'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.8em',
                color: '#fff'
              }}>
                👤
              </div>
              <div>
                <h3 style={{
                  fontSize: '1.3em',
                  fontWeight: 700,
                  color: '#3a2f1a',
                  marginBottom: '5px'
                }}>
                  {loading ? 'Chargement...' : 
                   profile.nom && profile.prenom ? `${profile.prenom} ${profile.nom}` : 
                   profile.email || 'Utilisateur'}
                </h3>
                <p style={{
                  color: '#6b5b47',
                  fontSize: '1em',
                  margin: 0
                }}>
                  Membre depuis 2025
                </p>
              </div>
            </div>
            <div style={{
              display: 'flex',
              gap: '20px',
              justifyContent: 'center'
            }}>
              <div style={{
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '1.5em',
                  fontWeight: 700,
                  color: '#8a5a44'
                }}>🔒</div>
                <div style={{
                  fontSize: '0.9em',
                  color: '#6b5b47',
                  fontWeight: 600
                }}>Sécurisé</div>
              </div>
              <div style={{
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '1.5em',
                  fontWeight: 700,
                  color: '#8a5a44'
                }}>✅</div>
                <div style={{
                  fontSize: '0.9em',
                  color: '#6b5b47',
                  fontWeight: 600
                }}>Actif</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Main Content ===== */}
      <main style={{
        flex: 1,
        padding: '60px 0',
        background: '#f8f1e9',
        position: 'relative'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 30px'
        }}>
          {/* Error and Success Messages */}
          {error && (
            <div style={{
              background: 'linear-gradient(135deg, #ff6b6b, #ff8e8e)',
              color: '#fff',
              padding: '20px 30px',
              borderRadius: '15px',
              marginBottom: '30px',
              textAlign: 'center',
              fontWeight: 600,
              boxShadow: '0 8px 25px rgba(255, 107, 107, 0.3)',
              fontSize: '1.1em'
            }}>
              ⚠️ {error}
            </div>
          )}

          {success && (
            <div style={{
              background: 'linear-gradient(135deg, #4ecdc4, #44a08d)',
              color: '#fff',
              padding: '20px 30px',
              borderRadius: '15px',
              marginBottom: '30px',
              textAlign: 'center',
              fontWeight: 600,
              boxShadow: '0 8px 25px rgba(78, 205, 196, 0.3)',
              fontSize: '1.1em'
            }}>
              ✅ {success}
            </div>
          )}

          {/* Settings Sections */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '40px'
          }}>
            {/* Account Settings */}
            <div style={{
              background: '#fff',
              padding: '40px',
              borderRadius: '20px',
              boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
              border: '1px solid rgba(212, 163, 115, 0.2)',
              maxWidth: '500px',
              width: '100%'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '30px'
              }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5em',
                  color: '#fff'
                }}>
                  👤
                </div>
                <div>
                  <h3 style={{
                    fontSize: '1.5em',
                    fontWeight: 700,
                    color: '#3a2f1a',
                    marginBottom: '5px'
                  }}>
                    Informations du Compte
                  </h3>
                  <p style={{
                    color: '#6b5b47',
                    fontSize: '1em',
                    margin: 0
                  }}>
                    Gérez vos informations de connexion
                  </p>
                </div>
        </div>

              <form onSubmit={handleSubmit} style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '25px'
              }}>
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
                    📧 Adresse Email
                  </label>
            <input
              type="email"
              value={user.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
                    placeholder="Votre adresse email"
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
              required
            />
          </div>

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
                    🔒 Mot de passe actuel
                  </label>
            <input
              type="password"
              value={user.password}
              onChange={(e) => setUser({ ...user, password: e.target.value })}
                    placeholder="Votre mot de passe actuel"
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
              required
            />
          </div>

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
                    🔑 Nouveau mot de passe
                  </label>
            <input
              type="password"
              value={user.newPassword}
              onChange={(e) => setUser({ ...user, newPassword: e.target.value })}
                    placeholder="Votre nouveau mot de passe"
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
              required
            />
          </div>

          <button
            type="submit"
                  style={{
                    background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
                    color: '#fff',
                    border: 'none',
                    padding: '18px 30px',
                    borderRadius: '15px',
                    fontSize: '1.2em',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 8px 25px rgba(138, 90, 68, 0.3)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 12px 35px rgba(138, 90, 68, 0.4)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 8px 25px rgba(138, 90, 68, 0.3)';
                  }}
                >
                  <span>💾</span>
            Mettre à jour le profil
          </button>
        </form>
      </div>

          </div>
        </div>
      </main>

      <ArtisanFooter />
    </div>
  );
}

export default Settings;