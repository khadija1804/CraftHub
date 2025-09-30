import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { isWorkshopExpired, getWorkshopStatus, formatWorkshopDate } from "../utils/workshopUtils";
import { getProfile } from "../services/api";

function ClientProfile() {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("userProfile");
    return storedUser ? JSON.parse(storedUser) : { nom: "", prenom: "", email: "" };
  });
  const [profile, setProfile] = useState({ nom: "", prenom: "", email: "", bio: "", historique: [] });
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");


  // Récupérer les données du profil depuis la base de données
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await getProfile();
        console.log('Profile data from API:', response.data);
        
        const profileData = response.data || {};
        setProfile({
          nom: profileData.nom || '',
          prenom: profileData.prenom || '',
          email: profileData.email || '',
          bio: profileData.bio || '',
          historique: profileData.historique || []
        });

        // Mettre à jour aussi l'état user pour la compatibilité
        setUser({
          nom: profileData.nom || '',
          prenom: profileData.prenom || '',
          email: profileData.email || ''
        });

        // Mettre à jour le localStorage
        localStorage.setItem("userProfile", JSON.stringify({
          nom: profileData.nom || '',
          prenom: profileData.prenom || '',
          email: profileData.email || ''
        }));

      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Erreur lors du chargement du profil. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [token]);


  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      setError("Vous devez être connecté pour mettre à jour votre profil.");
      return;
    }

    try {
      const response = await axios.put(
        "/profile",
        { 
          nom: profile.nom,
          prenom: profile.prenom,
          email: profile.email,
          password: currentPassword, 
          newPassword 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedProfile = response.data;
      
      // Mettre à jour l'état local
      setProfile(prevProfile => ({
        ...prevProfile,
        nom: updatedProfile.nom || prevProfile.nom,
        prenom: updatedProfile.prenom || prevProfile.prenom,
        email: updatedProfile.email || prevProfile.email
      }));

      // Mettre à jour aussi l'état user pour la compatibilité
      setUser({
        nom: updatedProfile.nom || profile.nom,
        prenom: updatedProfile.prenom || profile.prenom,
        email: updatedProfile.email || profile.email
      });

      // Mettre à jour le localStorage
      localStorage.setItem("userProfile", JSON.stringify({
        nom: updatedProfile.nom || profile.nom,
        prenom: updatedProfile.prenom || profile.prenom,
        email: updatedProfile.email || profile.email
      }));

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }

      setCurrentPassword("");
      setNewPassword("");
      setSuccess("Profil mis à jour avec succès !");
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de la mise à jour du profil");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userProfile");
    navigate("/login");
  };

  return (
    <div
      style={{
        fontFamily: '"Georgia", serif',
        color: "#3a2f1a",
        minHeight: "100vh",
        backgroundColor: "#f8f1e9",
        margin: 0,
        padding: 0,
      }}
    >
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      {/* ===== Modern Header ===== */}
      <header style={{
        background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
        color: '#fff',
        padding: '20px 0',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 30px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          {/* Logo */}
          <Link to="/" style={{
            fontSize: '2.2em',
            fontWeight: 700,
            color: '#fff',
            textDecoration: 'none',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            transition: 'transform 0.3s ease'
          }} onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'} onMouseOut={(e) => e.target.style.transform = 'scale(1)'}>
            CraftHub
          </Link>

          {/* Navigation */}
          <nav style={{
            display: 'flex',
            gap: '30px',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <Link to="/client-home" style={{
              color: '#fff',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '1.1em',
              padding: '10px 20px',
              borderRadius: '25px',
              transition: 'all 0.3s ease',
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)'
            }} onMouseOver={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.2)';
              e.target.style.transform = 'translateY(-2px)';
            }} onMouseOut={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.1)';
              e.target.style.transform = 'translateY(0)';
            }}>
            Explorer
          </Link>
            <Link to="/workshop-booking" style={{
              color: '#fff',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '1.1em',
              padding: '10px 20px',
              borderRadius: '25px',
              transition: 'all 0.3s ease',
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)'
            }} onMouseOver={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.2)';
              e.target.style.transform = 'translateY(-2px)';
            }} onMouseOut={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.1)';
              e.target.style.transform = 'translateY(0)';
            }}>
            Réservations
          </Link>
            <Link to="/client-profile" style={{
              color: '#fff',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '1.1em',
              padding: '10px 20px',
              borderRadius: '25px',
              transition: 'all 0.3s ease',
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.3)'
            }} onMouseOver={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.3)';
              e.target.style.transform = 'translateY(-2px)';
            }} onMouseOut={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.2)';
              e.target.style.transform = 'translateY(0)';
            }}>
            Profil
          </Link>
            <Link to="/login" onClick={handleLogout} style={{
              color: '#8a5a44',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '1.1em',
              padding: '12px 24px',
              borderRadius: '25px',
              transition: 'all 0.3s ease',
              background: '#fff',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
            }} onMouseOver={(e) => {
              e.target.style.background = '#f8f1e9';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
            }} onMouseOut={(e) => {
              e.target.style.background = '#fff';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
            }}>
            Déconnexion
          </Link>
        </nav>
        </div>
      </header>

      {/* Main Content Container */}
      <div style={{
        maxWidth: "1400px",
        margin: "40px auto",
        padding: "0 20px"
      }}>
        {/* Welcome Section */}
        <div style={{
          background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
          borderRadius: '24px',
          padding: '40px',
          marginBottom: '40px',
          color: '#fff',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(138, 90, 68, 0.3)'
        }}>
          {/* Decorative Elements */}
          <div style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '200px',
            height: '200px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '50%',
            opacity: 0.3
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: '-30px',
            left: '-30px',
            width: '150px',
            height: '150px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '50%',
            opacity: 0.2
          }}></div>
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h1 style={{
              fontSize: '3.5em',
              fontWeight: '700',
              marginBottom: '10px',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}>
              Bienvenue, {profile.prenom || profile.nom || user.prenom || user.nom || 'Utilisateur'} !
            </h1>
            <p style={{
              fontSize: '1.3em',
              opacity: 0.9,
              marginBottom: '30px'
            }}>
              Gérez votre profil et découvrez vos activités sur CraftHub
            </p>
            
            {/* Quick Stats */}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '40px',
          background: '#fff',
          borderRadius: '16px',
          padding: '8px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          border: '1px solid rgba(138, 90, 68, 0.1)'
        }}>
          {[
            { id: 'profile', label: 'Mon Profil', icon: '👤' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '16px 32px',
                border: 'none',
                background: activeTab === tab.id ? 'linear-gradient(135deg, #8a5a44, #d4a373)' : 'transparent',
                color: activeTab === tab.id ? '#fff' : '#8a5a44',
                borderRadius: '12px',
                fontSize: '1.1em',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                minWidth: '180px',
                justifyContent: 'center'
              }}
              onMouseOver={(e) => {
                if (activeTab !== tab.id) {
                  e.target.style.background = 'rgba(138, 90, 68, 0.1)';
                }
              }}
              onMouseOut={(e) => {
                if (activeTab !== tab.id) {
                  e.target.style.background = 'transparent';
                }
              }}
            >
              <span style={{ fontSize: '1.2em' }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{
          background: '#fff',
          borderRadius: '24px',
          padding: '40px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          border: '1px solid rgba(138, 90, 68, 0.1)',
          minHeight: '500px'
        }}>
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '30px'
              }}>
                <h2 style={{
                  fontSize: '2.5em',
                  color: '#8a5a44',
                  margin: 0,
                  fontWeight: '700'
                }}>
                  Informations du Profil
                </h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  style={{
                    padding: '12px 24px',
                    background: isEditing ? '#dc3545' : 'linear-gradient(135deg, #8a5a44, #d4a373)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '1em',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  {isEditing ? '❌ Annuler' : '✏️ Modifier'}
                </button>
              </div>

              {/* Success/Error Messages */}
              {success && (
                <div style={{
                  background: 'linear-gradient(135deg, #d4edda, #c3e6cb)',
                  color: '#155724',
                  padding: '16px 24px',
                  borderRadius: '12px',
                  marginBottom: '30px',
                  border: '1px solid #c3e6cb',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <span style={{ fontSize: '1.2em' }}>✅</span>
                  {success}
                </div>
              )}

              {error && (
                <div style={{
                  background: 'linear-gradient(135deg, #f8d7da, #f5c6cb)',
                  color: '#721c24',
                  padding: '16px 24px',
                  borderRadius: '12px',
                  marginBottom: '30px',
                  border: '1px solid #f5c6cb',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <span style={{ fontSize: '1.2em' }}>⚠️</span>
                  {error}
                </div>
              )}

              {isEditing ? (
                <form onSubmit={handleUpdate} style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '24px'
                }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontWeight: '600',
                      color: '#8a5a44',
                      fontSize: '1.1em'
                    }}>
                      Nom complet
                    </label>
                    <input
                      type="text"
                      name="nom"
                      value={profile.nom}
                      onChange={(e) => setProfile({...profile, nom: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '16px 20px',
                        borderRadius: '12px',
                        border: '2px solid #e9ecef',
                        fontSize: '1em',
                        transition: 'all 0.3s ease',
                        background: '#f8f9fa'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#8a5a44';
                        e.target.style.background = '#fff';
                        e.target.style.boxShadow = '0 0 0 3px rgba(138, 90, 68, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e9ecef';
                        e.target.style.background = '#f8f9fa';
                        e.target.style.boxShadow = 'none';
                      }}
                      required
                    />
                  </div>
                  
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontWeight: '600',
                      color: '#8a5a44',
                      fontSize: '1.1em'
                    }}>
                      Prénom
                    </label>
                    <input
                      type="text"
                      name="prenom"
                      value={profile.prenom}
                      onChange={(e) => setProfile({...profile, prenom: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '16px 20px',
                        borderRadius: '12px',
                        border: '2px solid #e9ecef',
                        fontSize: '1em',
                        transition: 'all 0.3s ease',
                        background: '#f8f9fa'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#8a5a44';
                        e.target.style.background = '#fff';
                        e.target.style.boxShadow = '0 0 0 3px rgba(138, 90, 68, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e9ecef';
                        e.target.style.background = '#f8f9fa';
                        e.target.style.boxShadow = 'none';
                      }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontWeight: '600',
                      color: '#8a5a44',
                      fontSize: '1.1em'
                    }}>
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={profile.email}
                      onChange={(e) => setProfile({...profile, email: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '16px 20px',
                        borderRadius: '12px',
                        border: '2px solid #e9ecef',
                        fontSize: '1em',
                        transition: 'all 0.3s ease',
                        background: '#f8f9fa'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#8a5a44';
                        e.target.style.background = '#fff';
                        e.target.style.boxShadow = '0 0 0 3px rgba(138, 90, 68, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e9ecef';
                        e.target.style.background = '#f8f9fa';
                        e.target.style.boxShadow = 'none';
                      }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontWeight: '600',
                      color: '#8a5a44',
                      fontSize: '1.1em'
                    }}>
                      Mot de passe actuel
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '16px 20px',
                        borderRadius: '12px',
                        border: '2px solid #e9ecef',
                        fontSize: '1em',
                        transition: 'all 0.3s ease',
                        background: '#f8f9fa'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#8a5a44';
                        e.target.style.background = '#fff';
                        e.target.style.boxShadow = '0 0 0 3px rgba(138, 90, 68, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e9ecef';
                        e.target.style.background = '#f8f9fa';
                        e.target.style.boxShadow = 'none';
                      }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontWeight: '600',
                      color: '#8a5a44',
                      fontSize: '1.1em'
                    }}>
                      Nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '16px 20px',
                        borderRadius: '12px',
                        border: '2px solid #e9ecef',
                        fontSize: '1em',
                        transition: 'all 0.3s ease',
                        background: '#f8f9fa'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#8a5a44';
                        e.target.style.background = '#fff';
                        e.target.style.boxShadow = '0 0 0 3px rgba(138, 90, 68, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e9ecef';
                        e.target.style.background = '#f8f9fa';
                        e.target.style.boxShadow = 'none';
                      }}
                      required
                    />
                  </div>

                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', marginTop: '20px' }}>
                    <button
                      type="submit"
                      style={{
                        padding: '18px 48px',
                        background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '16px',
                        fontSize: '1.2em',
                        fontWeight: '700',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 8px 24px rgba(138, 90, 68, 0.3)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}
                      onMouseOver={(e) => {
                        e.target.style.transform = 'translateY(-3px)';
                        e.target.style.boxShadow = '0 12px 32px rgba(138, 90, 68, 0.4)';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 8px 24px rgba(138, 90, 68, 0.3)';
                      }}
                    >
                      <span>💾</span>
                      Sauvegarder les modifications
                    </button>
                  </div>
                </form>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '24px'
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
                    padding: '24px',
                    borderRadius: '16px',
                    border: '1px solid #dee2e6'
                  }}>
                    <h3 style={{ color: '#8a5a44', marginBottom: '16px', fontSize: '1.3em' }}>👤 Informations personnelles</h3>
                    {loading ? (
                      <div style={{ textAlign: 'center', padding: '20px' }}>
                        <div style={{ 
                          display: 'inline-block',
                          width: '20px',
                          height: '20px',
                          border: '3px solid #f3f3f3',
                          borderTop: '3px solid #8a5a44',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite'
                        }}></div>
                        <p style={{ marginTop: '10px', color: '#6c757d' }}>Chargement des données...</p>
                      </div>
                    ) : (
                      <>
                        <div style={{ marginBottom: '12px' }}>
                          <strong>Nom :</strong> {profile.nom || 'Non renseigné'}
                        </div>
                        <div style={{ marginBottom: '12px' }}>
                          <strong>Prénom :</strong> {profile.prenom || 'Non renseigné'}
                        </div>
                        <div style={{ marginBottom: '12px' }}>
                          <strong>Email :</strong> {profile.email || 'Non renseigné'}
                        </div>
                        {profile.bio && (
                          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #dee2e6' }}>
                            <strong>Bio :</strong>
                            <p style={{ marginTop: '8px', color: '#6c757d', fontStyle: 'italic' }}>
                              {profile.bio}
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  
                  <div style={{
                    background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
                    padding: '24px',
                    borderRadius: '16px',
                    border: '1px solid #dee2e6'
                  }}>
                    <h3 style={{ color: '#8a5a44', marginBottom: '16px', fontSize: '1.3em' }}>🔐 Sécurité</h3>
                    <div style={{ marginBottom: '12px' }}>
                      <strong>Statut :</strong> <span style={{ color: '#28a745' }}>Compte actif</span>
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <strong>Dernière connexion :</strong> Aujourd'hui
                    </div>
                    <div>
                      <strong>Mot de passe :</strong> <span style={{ color: '#6c757d' }}>••••••••</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}


        </div>
      </div>

      {/* ===== Modern Footer ===== */}
      <footer style={{
        background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
        color: '#fff',
        padding: '60px 0 40px',
        marginTop: '80px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative Elements */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100px',
          height: '100px',
          background: 'linear-gradient(45deg, #d4a373, #8a5a44)',
          borderRadius: '50%',
          opacity: 0.1
        }}></div>
        
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '10%',
          width: '60px',
          height: '60px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '50%',
          opacity: 0.3
        }}></div>
        
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '15%',
          width: '40px',
          height: '40px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '50%',
          opacity: 0.2
        }}></div>

        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 30px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '40px',
          alignItems: 'start'
        }}>
          {/* Company Info */}
          <div style={{ textAlign: 'left' }}>
            <h3 style={{
              fontSize: '1.8em',
              fontWeight: 700,
              marginBottom: '20px',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}>
              CraftHub
            </h3>
            <p style={{
              fontSize: '1.1em',
              lineHeight: '1.6',
              marginBottom: '20px',
              opacity: 0.9
            }}>
              Votre plateforme de confiance pour découvrir et acheter des produits artisanaux authentiques. 
              Connectons les artisans talentueux avec des clients passionnés.
            </p>
            <div style={{
              display: 'flex',
              gap: '15px',
              marginTop: '20px'
            }}>
              <a href="https://facebook.com/crafthub" style={{
                color: '#fff',
                fontSize: '1.5em',
                transition: 'transform 0.3s ease',
                textDecoration: 'none'
              }} onMouseOver={(e) => e.target.style.transform = 'scale(1.2)'} onMouseOut={(e) => e.target.style.transform = 'scale(1)'}>
                📘
              </a>
              <a href="https://instagram.com/crafthub" style={{
                color: '#fff',
                fontSize: '1.5em',
                transition: 'transform 0.3s ease',
                textDecoration: 'none'
              }} onMouseOver={(e) => e.target.style.transform = 'scale(1.2)'} onMouseOut={(e) => e.target.style.transform = 'scale(1)'}>
                📷
              </a>
              <a href="https://twitter.com/crafthub" style={{
                color: '#fff',
                fontSize: '1.5em',
                transition: 'transform 0.3s ease',
                textDecoration: 'none'
              }} onMouseOver={(e) => e.target.style.transform = 'scale(1.2)'} onMouseOut={(e) => e.target.style.transform = 'scale(1)'}>
                🐦
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{
              fontSize: '1.3em',
              fontWeight: 600,
              marginBottom: '20px',
              textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
            }}>
              Liens Rapides
            </h4>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <Link to="/client-home" style={{
                color: '#fff',
                textDecoration: 'none',
                fontSize: '1em',
                transition: 'all 0.3s ease',
                padding: '8px 0',
                borderBottom: '1px solid transparent'
              }} onMouseOver={(e) => {
                e.target.style.paddingLeft = '10px';
                e.target.style.borderBottomColor = 'rgba(255,255,255,0.3)';
              }} onMouseOut={(e) => {
                e.target.style.paddingLeft = '0';
                e.target.style.borderBottomColor = 'transparent';
              }}>
                Explorer
              </Link>
              <Link to="/workshop-booking" style={{
                color: '#fff',
                textDecoration: 'none',
                fontSize: '1em',
                transition: 'all 0.3s ease',
                padding: '8px 0',
                borderBottom: '1px solid transparent'
              }} onMouseOver={(e) => {
                e.target.style.paddingLeft = '10px';
                e.target.style.borderBottomColor = 'rgba(255,255,255,0.3)';
              }} onMouseOut={(e) => {
                e.target.style.paddingLeft = '0';
                e.target.style.borderBottomColor = 'transparent';
              }}>
                Réservations
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 style={{
              fontSize: '1.3em',
              fontWeight: 600,
              marginBottom: '20px',
              textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
            }}>
              Contact
            </h4>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '15px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '1em'
              }}>
                <span style={{ fontSize: '1.2em' }}>📧</span>
                <a href="mailto:contact@crafthub.com" style={{
                  color: '#fff',
                  textDecoration: 'none',
                  transition: 'opacity 0.3s ease'
                }} onMouseOver={(e) => e.target.style.opacity = '0.8'} onMouseOut={(e) => e.target.style.opacity = '1'}>
                  contact@crafthub.com
                </a>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '1em'
              }}>
                <span style={{ fontSize: '1.2em' }}>📞</span>
                <span>+33 1 23 45 67 89</span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '1em'
              }}>
                <span style={{ fontSize: '1.2em' }}>📍</span>
                <span>123 Rue de l'Artisanat<br />75001 Paris, France</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.2)',
          marginTop: '40px',
          paddingTop: '20px',
          textAlign: 'center'
        }}>
          <p style={{
            fontSize: '0.9em',
            opacity: 0.8,
            margin: 0
          }}>
            © 2025 CraftHub. Tous droits réservés. | 
            <a href="/privacy" style={{ color: '#fff', textDecoration: 'none', marginLeft: '10px' }}>Confidentialité</a> | 
            <a href="/terms" style={{ color: '#fff', textDecoration: 'none', marginLeft: '10px' }}>Conditions</a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default ClientProfile;