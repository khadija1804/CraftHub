import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getArtisansSubscriptions, deleteArtisan } from '../services/api';

function AdminSubscriptionTracking() {
  const [artisans, setArtisans] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtisans = async () => {
      try {
        setLoading(true);
        const response = await getArtisansSubscriptions();
        setArtisans(response.data);
        setError('');
      } catch (err) {
        setError('Erreur lors du chargement des données: ' + (err.response ? err.response.data.error : err.message));
        console.error('Fetch Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchArtisans();
  }, []);

  const handleDeleteArtisan = async (artisanId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet artisan ?')) {
      try {
        await deleteArtisan(artisanId);
        setArtisans(artisans.filter(artisan => artisan.artisanId !== artisanId));
        setError('');
      } catch (err) {
        setError('Erreur lors de la suppression: ' + (err.response ? err.response.data.error : err.message));
        console.error('Delete Error:', err);
      }
    }
  };

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
          <p style={{ fontSize: '1.2em', color: '#8a5a44', fontWeight: '600' }}>Chargement des abonnements...</p>
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

  return (
    <div style={{
      fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif',
      color: '#3a2f1a',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8f1e9, #e8dcc0)',
      margin: 0,
      padding: 0
    }}>
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
            CraftHub Admin
          </Link>

          {/* Navigation */}
          <nav style={{
            display: 'flex',
            gap: '30px',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <Link to="/admin-home" style={{
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
              Supervision
            </Link>
            <Link to="/admin-subscriptions" style={{
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
              Paiements
            </Link>
            <Link to="/admin-statistics" style={{
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
              Statistique
            </Link>
            <Link to="/login" style={{
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

      {/* ===== Hero Section ===== */}
      <div style={{
        background: 'linear-gradient(135deg, #8a5a44 0%, #d4a373 50%, #f8f1e9 100%)',
        padding: '80px 40px',
        margin: '0',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative Elements */}
        <div style={{
          position: 'absolute',
          top: '-100px',
          right: '-100px',
          width: '200px',
          height: '200px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '50%',
          animation: 'float 6s ease-in-out infinite'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '-50px',
          left: '-50px',
          width: '150px',
          height: '150px',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '50%',
          animation: 'float 8s ease-in-out infinite reverse'
        }}></div>
        
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center',
          position: 'relative',
          zIndex: 2
        }}>
          <h1 style={{
            fontSize: '3.5em',
            color: '#fff',
            marginBottom: '20px',
            fontWeight: '700',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}>
            💳 Gestion des Abonnements
          </h1>
          <p style={{
            fontSize: '1.3em',
            color: '#fff',
            marginBottom: '30px',
            opacity: 0.9,
            maxWidth: '600px',
            margin: '0 auto 30px'
          }}>
            Supervisez et gérez les abonnements et paiements de tous les artisans de la plateforme
          </p>
        </div>
      </div>

      {/* ===== Main Content ===== */}
      <div style={{
        maxWidth: '1200px',
        margin: '40px auto',
        padding: '0 20px'
      }}>
        {/* ===== Error Message ===== */}
        {error && (
          <div style={{
            background: 'linear-gradient(135deg, #ffebee, #ffcdd2)',
            border: '1px solid #e57373',
            borderRadius: '15px',
            padding: '20px',
            marginBottom: '30px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2em', marginBottom: '10px' }}>⚠️</div>
            <h3 style={{ color: '#d32f2f', marginBottom: '10px', fontSize: '1.3em' }}>Erreur de chargement</h3>
            <p style={{ color: '#c62828', margin: '0' }}>{error}</p>
          </div>
        )}

        {/* ===== Empty State ===== */}
        {artisans.length === 0 && !error && (
          <div style={{
            background: 'linear-gradient(135deg, #fff, #f8f9fa)',
            borderRadius: '25px',
            padding: '60px 40px',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
            border: '1px solid rgba(138, 90, 68, 0.1)'
          }}>
            <div style={{ fontSize: '5em', marginBottom: '20px' }}>👥</div>
            <h2 style={{
              fontSize: '2em',
              color: '#8a5a44',
              marginBottom: '15px',
              fontWeight: '700'
            }}>
              Aucun artisan inscrit
            </h2>
            <p style={{
              fontSize: '1.1em',
              color: '#666',
              margin: '0'
            }}>
              Aucun artisan n'est actuellement inscrit sur la plateforme.
            </p>
          </div>
        )}

        {/* ===== Artisans Grid ===== */}
        {artisans.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '30px',
            marginBottom: '50px'
          }}>
            {artisans.map((artisan) => {
              const totalPaid = artisan.payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || (artisan.subscription?.amount || 0);
              const isActive = artisan.subscription?.status === 'paid';
              const planType = artisan.subscription?.plan ? (artisan.subscription.plan === 'annual' ? 'Annuel' : 'Mensuel') : 'Aucun';
              
              return (
                <div key={artisan.artisanId} className="card-hover" style={{
                  background: 'linear-gradient(135deg, #fff, #f8f9fa)',
                  borderRadius: '20px',
                  padding: '30px',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                  border: '1px solid #e9ecef',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease'
                }}>
                  {/* Status Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    background: isActive ? 
                      'linear-gradient(135deg, #4caf50, #66bb6a)' : 
                      'linear-gradient(135deg, #f44336, #ef5350)',
                    color: '#fff',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '0.9em',
                    fontWeight: '600',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                  }}>
                    {isActive ? '✅ Actif' : '❌ Inactif'}
                  </div>

                  {/* Artisan Info */}
                  <div style={{ marginBottom: '25px' }}>
                    <h3 style={{
                      fontSize: '1.5em',
                      color: '#2c3e50',
                      marginBottom: '10px',
                      fontWeight: '700',
                      paddingRight: '100px'
                    }}>
                      👤 {artisan.prenom} {artisan.nom}
                    </h3>
                    <p style={{
                      color: '#666',
                      fontSize: '1em',
                      margin: '0 0 15px 0',
                      wordBreak: 'break-word'
                    }}>
                      📧 {artisan.email}
                    </p>
                  </div>

                  {/* Subscription Details */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '15px',
                    marginBottom: '25px'
                  }}>
                    <div style={{
                      background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
                      padding: '15px',
                      borderRadius: '12px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '1.2em', marginBottom: '5px' }}>📋</div>
                      <div style={{ fontSize: '0.9em', color: '#666', marginBottom: '5px' }}>Plan</div>
                      <div style={{ fontSize: '1.1em', fontWeight: '600', color: '#1976d2' }}>
                        {planType}
                      </div>
                    </div>
                    
                    <div style={{
                      background: 'linear-gradient(135deg, #e8f5e8, #c8e6c9)',
                      padding: '15px',
                      borderRadius: '12px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '1.2em', marginBottom: '5px' }}>💰</div>
                      <div style={{ fontSize: '0.9em', color: '#666', marginBottom: '5px' }}>Montant</div>
                      <div style={{ fontSize: '1.1em', fontWeight: '600', color: '#2e7d32' }}>
                        {totalPaid > 0 ? `${totalPaid} €` : 'Aucun'}
                      </div>
                    </div>
                  </div>

                  {/* Next Payment */}
                  {artisan.subscription?.nextPaymentDate && (
                    <div style={{
                      background: 'linear-gradient(135deg, #fff3e0, #ffe0b2)',
                      padding: '15px',
                      borderRadius: '12px',
                      textAlign: 'center',
                      marginBottom: '25px'
                    }}>
                      <div style={{ fontSize: '1.2em', marginBottom: '5px' }}>📅</div>
                      <div style={{ fontSize: '0.9em', color: '#666', marginBottom: '5px' }}>Prochain paiement</div>
                      <div style={{ fontSize: '1.1em', fontWeight: '600', color: '#ef6c00' }}>
                        {new Date(artisan.subscription.nextPaymentDate).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{
                    display: 'flex',
                    gap: '10px',
                    justifyContent: 'flex-end'
                  }}>
                    <button
                      onClick={() => handleDeleteArtisan(artisan.artisanId)}
                      style={{
                        background: 'linear-gradient(135deg, #f44336, #ef5350)',
                        color: '#fff',
                        padding: '12px 20px',
                        borderRadius: '25px',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '0.9em',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 15px rgba(244, 67, 54, 0.3)'
                      }}
                      onMouseOver={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 6px 20px rgba(244, 67, 54, 0.4)';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 15px rgba(244, 67, 54, 0.3)';
                      }}
                    >
                      🗑️ Supprimer
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ===== Statistics Summary ===== */}
        {artisans.length > 0 && (
          <div style={{
            background: 'linear-gradient(135deg, #fff, #f8f9fa)',
            borderRadius: '25px',
            padding: '40px',
            marginBottom: '30px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
            border: '1px solid rgba(138, 90, 68, 0.1)'
          }}>
            <h2 style={{
              fontSize: '2em',
              color: '#8a5a44',
              textAlign: 'center',
              marginBottom: '30px',
              fontWeight: '700'
            }}>
              📊 Résumé des Abonnements
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '25px'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
                padding: '25px',
                borderRadius: '15px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2.5em', marginBottom: '10px' }}>👥</div>
                <div style={{ fontSize: '2em', fontWeight: '700', color: '#1976d2', marginBottom: '5px' }}>
                  {artisans.length}
                </div>
                <div style={{ fontSize: '1em', color: '#666' }}>Total Artisans</div>
              </div>
              
              <div style={{
                background: 'linear-gradient(135deg, #e8f5e8, #c8e6c9)',
                padding: '25px',
                borderRadius: '15px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2.5em', marginBottom: '10px' }}>✅</div>
                <div style={{ fontSize: '2em', fontWeight: '700', color: '#2e7d32', marginBottom: '5px' }}>
                  {artisans.filter(a => a.subscription?.status === 'paid').length}
                </div>
                <div style={{ fontSize: '1em', color: '#666' }}>Abonnements Actifs</div>
              </div>
              
              <div style={{
                background: 'linear-gradient(135deg, #fff3e0, #ffe0b2)',
                padding: '25px',
                borderRadius: '15px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2.5em', marginBottom: '10px' }}>💰</div>
                <div style={{ fontSize: '2em', fontWeight: '700', color: '#ef6c00', marginBottom: '5px' }}>
                  {artisans.reduce((sum, a) => {
                    const totalPaid = a.payments?.reduce((s, p) => s + (p.amount || 0), 0) || (a.subscription?.amount || 0);
                    return sum + totalPaid;
                  }, 0)} €
                </div>
                <div style={{ fontSize: '1em', color: '#666' }}>Revenus Totaux</div>
              </div>
              
              <div style={{
                background: 'linear-gradient(135deg, #f3e5f5, #e1bee7)',
                padding: '25px',
                borderRadius: '15px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2.5em', marginBottom: '10px' }}>📈</div>
                <div style={{ fontSize: '2em', fontWeight: '700', color: '#7b1fa2', marginBottom: '5px' }}>
                  {artisans.length > 0 ? Math.round((artisans.filter(a => a.subscription?.status === 'paid').length / artisans.length) * 100) : 0}%
                </div>
                <div style={{ fontSize: '1em', color: '#666' }}>Taux d'Activation</div>
              </div>
            </div>
          </div>
        )}
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
              CraftHub Admin
            </h3>
            <p style={{
              fontSize: '1.1em',
              lineHeight: '1.6',
              marginBottom: '20px',
              opacity: 0.9
            }}>
              Interface d'administration pour superviser et gérer la plateforme CraftHub. 
              Contrôlez les produits, ateliers, paiements et statistiques en temps réel.
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
              Administration
            </h4>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <Link to="/admin-home" style={{
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
                Supervision
              </Link>
              <Link to="/admin-subscriptions" style={{
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
                Paiements
              </Link>
              <Link to="/admin-statistics" style={{
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
                Statistique
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

      {/* ===== CSS Animations ===== */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
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
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .card-hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .card-hover:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }
      `}</style>
    </div>
  );
}

export default AdminSubscriptionTracking;