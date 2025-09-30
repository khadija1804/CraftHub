import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCategoryStatistics } from '../services/api';

const AdminCategoryStatistics = () => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await getCategoryStatistics();
      setStatistics(response.data);
    } catch (err) {
      setError('Erreur lors du chargement des statistiques');
      console.error('Error fetching statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif', 
        color: '#3a2f1a', 
        minHeight: '100vh', 
        backgroundColor: '#f8f1e9', 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3em', marginBottom: '20px' }}>📊</div>
          <h2 style={{ color: '#8a5a44' }}>Chargement des statistiques...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif', 
        color: '#3a2f1a', 
        minHeight: '100vh', 
        backgroundColor: '#f8f1e9', 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3em', marginBottom: '20px' }}>❌</div>
          <h2 style={{ color: '#dc3545' }}>{error}</h2>
          <button 
            onClick={fetchStatistics}
            style={{
              padding: '10px 20px',
              backgroundColor: '#8a5a44',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginTop: '20px'
            }}
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif', 
      color: '#3a2f1a', 
      minHeight: '100vh', 
      backgroundColor: '#f8f1e9', 
      margin: 0, 
      padding: 0,
      position: 'relative'
    }}>
      <style>
        {`
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
        `}
      </style>

      {/* ===== Admin Header ===== */}
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
          <Link to="/admin-home" style={{
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
              padding: '12px 24px',
              borderRadius: '25px',
              transition: 'all 0.3s ease',
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)'
            }} onMouseOver={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.2)';
              e.target.style.transform = 'translateY(-2px)';
            }} onMouseOut={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.1)';
              e.target.style.transform = 'translateY(0)';
            }}>
              🏠 Accueil Admin
            </Link>
            <Link to="/admin-categories-info" style={{
              color: '#fff',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '1.1em',
              padding: '12px 24px',
              borderRadius: '25px',
              transition: 'all 0.3s ease',
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)'
            }} onMouseOver={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.2)';
              e.target.style.transform = 'translateY(-2px)';
            }} onMouseOut={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.1)';
              e.target.style.transform = 'translateY(0)';
            }}>
              📚 Catégories
            </Link>
            <Link to="/" style={{
              color: '#fff',
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
            fontWeight: 700,
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            animation: 'fadeInUp 1s ease-out'
          }}>
            📊 Statistiques des Catégories
          </h1>
          <p style={{
            fontSize: '1.4em',
            color: 'rgba(255,255,255,0.9)',
            marginBottom: '40px',
            maxWidth: '600px',
            margin: '0 auto 40px',
            lineHeight: '1.6',
            animation: 'fadeInUp 1s ease-out 0.2s both'
          }}>
            Analyse détaillée de l'utilisation des catégories par les artisans
          </p>
          <div style={{
            display: 'flex',
            gap: '20px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            animation: 'fadeInUp 1s ease-out 0.4s both'
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
              padding: '15px 30px',
              borderRadius: '30px',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#fff',
              fontSize: '1.1em',
              fontWeight: 600
            }}>
              📦 {statistics?.summary?.totalProducts || 0} Produits
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
              padding: '15px 30px',
              borderRadius: '30px',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#fff',
              fontSize: '1.1em',
              fontWeight: 600
            }}>
              🛠️ {statistics?.summary?.totalWorkshops || 0} Ateliers
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
              padding: '15px 30px',
              borderRadius: '30px',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#fff',
              fontSize: '1.1em',
              fontWeight: 600
            }}>
              👥 {statistics?.summary?.totalArtisans || 0} Artisans
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          padding: "60px 40px",
          maxWidth: "1400px",
          margin: "-30px auto 0",
          backgroundColor: "#fff",
          borderRadius: "30px 30px 0 0",
          boxShadow: "0 -10px 30px rgba(0,0,0,0.1)",
          position: 'relative',
          zIndex: 3
        }}
      >
        {/* ===== Top 5 Categories Products Section ===== */}
        <div style={{
          background: 'linear-gradient(135deg, #f8f1e9, #fff)',
          padding: '40px',
          borderRadius: '25px',
          marginBottom: '50px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          border: '1px solid rgba(138, 90, 68, 0.1)'
        }}>
          <h2 style={{
            fontSize: '2.2em',
            color: '#8a5a44',
            textAlign: 'center',
            marginBottom: '40px',
            fontWeight: 700
          }}>
            📦 Top 5 des Catégories de Produits
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '25px'
          }}>
            {statistics?.productStats?.slice(0, 5).map((category, index) => (
              <div key={index} className="card-hover" style={{
                background: 'linear-gradient(135deg, #fff, #f8f9fa)',
                borderRadius: '20px',
                padding: '30px',
                boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                border: '1px solid #e9ecef',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Rank Badge */}
                <div style={{
                  position: 'absolute',
                  top: '15px',
                  right: '15px',
                  background: index === 0 ? 'linear-gradient(135deg, #ffd700, #ffed4e)' : 
                             index === 1 ? 'linear-gradient(135deg, #c0c0c0, #e5e5e5)' :
                             index === 2 ? 'linear-gradient(135deg, #cd7f32, #daa520)' :
                             'linear-gradient(135deg, #8a5a44, #d4a373)',
                  color: '#fff',
                  padding: '8px 12px',
                  borderRadius: '20px',
                  fontSize: '1.2em',
                  fontWeight: '700',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                }}>
                  #{index + 1}
                </div>

                <h3 style={{
                  fontSize: '1.4em',
                  fontWeight: '700',
                  color: '#2c3e50',
                  marginBottom: '20px',
                  lineHeight: '1.3',
                  paddingRight: '60px'
                }}>
                  {category.category}
                </h3>

                <div style={{
                  background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
                  padding: '20px',
                  borderRadius: '12px',
                  textAlign: 'center',
                  marginBottom: '20px'
                }}>
                  <div style={{ fontSize: '2em', marginBottom: '10px' }}>📦</div>
                  <div style={{ fontSize: '1.5em', fontWeight: '700', color: '#1976d2' }}>
                    {category.productCount || 0}
                  </div>
                  <div style={{ fontSize: '1em', color: '#666' }}>Produits</div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '15px',
                  marginBottom: '15px'
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #fff3e0, #ffe0b2)',
                    padding: '12px',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '1.1em', fontWeight: '700', color: '#ef6c00' }}>
                      {category.averagePrice} €
                    </div>
                    <div style={{ fontSize: '0.8em', color: '#666' }}>Prix moyen</div>
                  </div>
                  
                  <div style={{
                    background: 'linear-gradient(135deg, #f3e5f5, #e1bee7)',
                    padding: '12px',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '1.1em', fontWeight: '700', color: '#7b1fa2' }}>
                      {category.uniqueArtisans}
                    </div>
                    <div style={{ fontSize: '0.8em', color: '#666' }}>Artisans</div>
                  </div>
                </div>

                <div style={{
                  background: 'linear-gradient(135deg, #e8f5e8, #c8e6c9)',
                  padding: '12px',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '1.1em', fontWeight: '700', color: '#2e7d32' }}>
                    {category.totalRevenue} €
                  </div>
                  <div style={{ fontSize: '0.8em', color: '#666' }}>Revenus totaux</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ===== Top 5 Categories Workshops Section ===== */}
        <div style={{
          background: 'linear-gradient(135deg, #f8f1e9, #fff)',
          padding: '40px',
          borderRadius: '25px',
          marginBottom: '50px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          border: '1px solid rgba(138, 90, 68, 0.1)'
        }}>
          <h2 style={{
            fontSize: '2.2em',
            color: '#8a5a44',
            textAlign: 'center',
            marginBottom: '40px',
            fontWeight: 700
          }}>
            🛠️ Top 5 des Catégories d'Ateliers
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '25px'
          }}>
            {statistics?.workshopStats?.slice(0, 5).map((category, index) => (
              <div key={index} className="card-hover" style={{
                background: 'linear-gradient(135deg, #fff, #f8f9fa)',
                borderRadius: '20px',
                padding: '30px',
                boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                border: '1px solid #e9ecef',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Rank Badge */}
                <div style={{
                  position: 'absolute',
                  top: '15px',
                  right: '15px',
                  background: index === 0 ? 'linear-gradient(135deg, #ffd700, #ffed4e)' : 
                             index === 1 ? 'linear-gradient(135deg, #c0c0c0, #e5e5e5)' :
                             index === 2 ? 'linear-gradient(135deg, #cd7f32, #daa520)' :
                             'linear-gradient(135deg, #8a5a44, #d4a373)',
                  color: '#fff',
                  padding: '8px 12px',
                  borderRadius: '20px',
                  fontSize: '1.2em',
                  fontWeight: '700',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                }}>
                  #{index + 1}
                </div>

                <h3 style={{
                  fontSize: '1.4em',
                  fontWeight: '700',
                  color: '#2c3e50',
                  marginBottom: '20px',
                  lineHeight: '1.3',
                  paddingRight: '60px'
                }}>
                  {category.category}
                </h3>

                <div style={{
                  background: 'linear-gradient(135deg, #e8f5e8, #c8e6c9)',
                  padding: '20px',
                  borderRadius: '12px',
                  textAlign: 'center',
                  marginBottom: '20px'
                }}>
                  <div style={{ fontSize: '2em', marginBottom: '10px' }}>🛠️</div>
                  <div style={{ fontSize: '1.5em', fontWeight: '700', color: '#2e7d32' }}>
                    {category.workshopCount || 0}
                  </div>
                  <div style={{ fontSize: '1em', color: '#666' }}>Ateliers</div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '15px',
                  marginBottom: '15px'
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #fff3e0, #ffe0b2)',
                    padding: '12px',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '1.1em', fontWeight: '700', color: '#ef6c00' }}>
                      {category.averagePrice} €
                    </div>
                    <div style={{ fontSize: '0.8em', color: '#666' }}>Prix moyen</div>
                  </div>
                  
                  <div style={{
                    background: 'linear-gradient(135deg, #f3e5f5, #e1bee7)',
                    padding: '12px',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '1.1em', fontWeight: '700', color: '#7b1fa2' }}>
                      {category.uniqueArtisans}
                    </div>
                    <div style={{ fontSize: '0.8em', color: '#666' }}>Artisans</div>
                  </div>
                </div>

                <div style={{
                  background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
                  padding: '12px',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '1.1em', fontWeight: '700', color: '#1976d2' }}>
                    {category.totalRevenue} €
                  </div>
                  <div style={{ fontSize: '0.8em', color: '#666' }}>Revenus totaux</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ===== Detailed Statistics Section ===== */}
        <div style={{
          background: 'linear-gradient(135deg, #f8f1e9, #fff)',
          padding: '40px',
          borderRadius: '25px',
          marginBottom: '50px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          border: '1px solid rgba(138, 90, 68, 0.1)'
        }}>
          <h2 style={{
            fontSize: '2.2em',
            color: '#8a5a44',
            textAlign: 'center',
            marginBottom: '40px',
            fontWeight: 700
          }}>
            📈 Statistiques Détaillées par Catégorie
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '25px'
          }}>
            {/* Products Statistics */}
            <div style={{
              background: '#fff',
              padding: '30px',
              borderRadius: '20px',
              boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
              border: '1px solid #e9ecef'
            }}>
              <h3 style={{
                fontSize: '1.6em',
                color: '#8a5a44',
                marginBottom: '25px',
                textAlign: 'center',
                fontWeight: 700
              }}>
                📦 Produits par Catégorie
              </h3>
              
              {statistics?.productStats?.map((stat, index) => (
                <div key={index} style={{
                  padding: '15px',
                  marginBottom: '10px',
                  background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
                  borderRadius: '12px',
                  border: '1px solid #dee2e6'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px'
                  }}>
                    <span style={{ fontWeight: '600', color: '#2c3e50' }}>
                      {stat.category}
                    </span>
                    <span style={{
                      background: '#8a5a44',
                      color: '#fff',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '0.9em',
                      fontWeight: '600'
                    }}>
                      {stat.productCount}
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.9em',
                    color: '#666'
                  }}>
                    <span>Artisans: {stat.uniqueArtisans}</span>
                    <span>Prix moyen: {stat.averagePrice} €</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Workshops Statistics */}
            <div style={{
              background: '#fff',
              padding: '30px',
              borderRadius: '20px',
              boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
              border: '1px solid #e9ecef'
            }}>
              <h3 style={{
                fontSize: '1.6em',
                color: '#8a5a44',
                marginBottom: '25px',
                textAlign: 'center',
                fontWeight: 700
              }}>
                🛠️ Ateliers par Catégorie
              </h3>
              
              {statistics?.workshopStats?.map((stat, index) => (
                <div key={index} style={{
                  padding: '15px',
                  marginBottom: '10px',
                  background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
                  borderRadius: '12px',
                  border: '1px solid #dee2e6'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px'
                  }}>
                    <span style={{ fontWeight: '600', color: '#2c3e50' }}>
                      {stat.category}
                    </span>
                    <span style={{
                      background: '#8a5a44',
                      color: '#fff',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '0.9em',
                      fontWeight: '600'
                    }}>
                      {stat.workshopCount}
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.9em',
                    color: '#666'
                  }}>
                    <span>Artisans: {stat.uniqueArtisans}</span>
                    <span>Prix moyen: {stat.averagePrice} €</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ===== Top Artisans Section ===== */}
        <div style={{
          background: 'linear-gradient(135deg, #f8f1e9, #fff)',
          padding: '40px',
          borderRadius: '25px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          border: '1px solid rgba(138, 90, 68, 0.1)'
        }}>
          <h2 style={{
            fontSize: '2.2em',
            color: '#8a5a44',
            textAlign: 'center',
            marginBottom: '40px',
            fontWeight: 700
          }}>
            👑 Top 10 des Artisans les Plus Actifs
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            {statistics?.topArtisans?.map((artisan, index) => (
              <div key={index} className="card-hover" style={{
                background: 'linear-gradient(135deg, #fff, #f8f9fa)',
                borderRadius: '20px',
                padding: '25px',
                boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                border: '1px solid #e9ecef',
                position: 'relative'
              }}>
                {/* Rank Badge */}
                <div style={{
                  position: 'absolute',
                  top: '15px',
                  right: '15px',
                  background: index < 3 ? 'linear-gradient(135deg, #ffd700, #ffed4e)' : 
                             'linear-gradient(135deg, #8a5a44, #d4a373)',
                  color: '#fff',
                  padding: '6px 10px',
                  borderRadius: '15px',
                  fontSize: '1em',
                  fontWeight: '700',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                }}>
                  #{index + 1}
                </div>

                <h3 style={{
                  fontSize: '1.3em',
                  fontWeight: '700',
                  color: '#2c3e50',
                  marginBottom: '15px',
                  paddingRight: '50px'
                }}>
                  {artisan.artisanName}
                </h3>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '10px',
                  marginBottom: '15px'
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
                    padding: '10px',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '1.2em', fontWeight: '700', color: '#1976d2' }}>
                      {artisan.productCount}
                    </div>
                    <div style={{ fontSize: '0.8em', color: '#666' }}>Produits</div>
                  </div>
                  
                  <div style={{
                    background: 'linear-gradient(135deg, #e8f5e8, #c8e6c9)',
                    padding: '10px',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '1.2em', fontWeight: '700', color: '#2e7d32' }}>
                      {artisan.workshopCount}
                    </div>
                    <div style={{ fontSize: '0.8em', color: '#666' }}>Ateliers</div>
                  </div>
                </div>

                <div style={{
                  background: 'linear-gradient(135deg, #fff3e0, #ffe0b2)',
                  padding: '10px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  marginBottom: '10px'
                }}>
                  <div style={{ fontSize: '1.1em', fontWeight: '700', color: '#ef6c00' }}>
                    {artisan.totalItems} Total
                  </div>
                  <div style={{ fontSize: '0.8em', color: '#666' }}>Éléments créés</div>
                </div>

                <div style={{
                  background: 'linear-gradient(135deg, #f3e5f5, #e1bee7)',
                  padding: '10px',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '1em', fontWeight: '700', color: '#7b1fa2' }}>
                    {artisan.categories?.length || 0}
                  </div>
                  <div style={{ fontSize: '0.8em', color: '#666' }}>Catégories utilisées</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== Admin Footer ===== */}
      <footer style={{
        background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
        color: '#fff',
        padding: '40px 0',
        textAlign: 'center',
        marginTop: '50px'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 30px'
        }}>
          <h3 style={{
            fontSize: '1.8em',
            marginBottom: '20px',
            fontWeight: 700
          }}>
            CraftHub Admin Panel
          </h3>
          <p style={{
            fontSize: '1.1em',
            marginBottom: '20px',
            opacity: 0.9
          }}>
            Statistiques avancées des catégories et de l'activité des artisans
          </p>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '30px',
            flexWrap: 'wrap'
          }}>
            <Link to="/admin-home" style={{
              color: '#fff',
              textDecoration: 'none',
              fontSize: '1em',
              fontWeight: 600,
              padding: '10px 20px',
              borderRadius: '20px',
              background: 'rgba(255,255,255,0.1)',
              transition: 'all 0.3s ease'
            }} onMouseOver={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.2)';
              e.target.style.transform = 'translateY(-2px)';
            }} onMouseOut={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.1)';
              e.target.style.transform = 'translateY(0)';
            }}>
              Retour à l'accueil admin
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AdminCategoryStatistics;
