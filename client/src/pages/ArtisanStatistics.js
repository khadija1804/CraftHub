import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getArtisanStatistics, getWorkshopStatistics, getProducts } from '../services/api';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function ArtisanStatistics() {
  const [stats, setStats] = useState(null);
  const [workshopStats, setWorkshopStats] = useState(null);
  const [artisanProducts, setArtisanProducts] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const artisanId = localStorage.getItem('userId'); // Assure-toi que l'ID est stocké
        if (!artisanId) throw new Error('Utilisateur non identifié');

        const [artisanResponse, workshopResponse, productsResponse] = await Promise.all([
          getArtisanStatistics(),
          getWorkshopStatistics(artisanId),
          getProducts(), // Récupérer tous les produits de l'artisan
        ]);
        setStats(artisanResponse.data);
        setWorkshopStats(workshopResponse.data);
        setArtisanProducts(productsResponse.data || []);
        setError('');
      } catch (err) {
        setError('Erreur lors du chargement des statistiques: ' + (err.response ? err.response.data.error : err.message));
        console.error('Fetch Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div style={{ textAlign: 'center', color: '#5c4b38' }}>Chargement...</div>;
  if (error) return <div style={{ color: '#a94442', textAlign: 'center' }}>{error}</div>;

  // Graphique pour les produits
  const productChartData = {
    labels: stats?.topProducts.map(item => item.name) || [],
    datasets: [
      {
        label: 'Quantité Vendue',
        data: stats?.topProducts.map(item => item.quantity) || [],
        backgroundColor: 'rgba(138, 90, 68, 0.6)',
        borderColor: 'rgba(138, 90, 68, 1)',
        borderWidth: 1,
      },
    ],
  };

  const productChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { y: { beginAtZero: true, title: { display: true, text: 'Quantité' } }, x: { title: { display: true, text: 'Produits' } } },
    plugins: { legend: { position: 'top' }, tooltip: { mode: 'index', intersect: false } },
  };

  // Graphique pour les ateliers (places restantes par atelier)
  const workshopChartData = {
    labels: workshopStats?.workshops?.map(workshop => workshop.title) || [],
    datasets: [
      {
        label: 'Places Restantes',
        data: workshopStats?.workshops?.map(workshop => workshop.places || 0) || [],
        backgroundColor: 'rgba(212, 163, 115, 0.6)',
        borderColor: 'rgba(212, 163, 115, 1)',
        borderWidth: 1,
      },
    ],
  };

  const workshopChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { 
      y: { 
        beginAtZero: true, 
        title: { display: true, text: 'Places Restantes' } 
      }, 
      x: { 
        title: { display: true, text: 'Ateliers' },
        ticks: {
          maxRotation: 45,
          minRotation: 45
        }
      } 
    },
    plugins: { 
      legend: { position: 'top' }, 
      tooltip: { 
        mode: 'index', 
        intersect: false,
        callbacks: {
          title: function(context) {
            return context[0].label;
          },
          label: function(context) {
            return `Places restantes: ${context.parsed.y}`;
          }
        }
      } 
    },
  };

  return (
    <div style={{ fontFamily: '"Georgia", serif', color: '#3a2f1a', minHeight: '100vh', backgroundColor: '#f8f1e9', margin: 0, padding: 0 }}>
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
            <Link to="/artisan-home" style={{
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
              Accueil
            </Link>
            <Link to="/settings" style={{
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
              Paramètres
            </Link>
            <Link to="/artisan-orders" style={{
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
              Commandes
            </Link>
            <Link to="/subscription-payment" style={{
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
              Paiement
            </Link>
            <Link to="/artisan-statistics" style={{
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
              Statistiques
            </Link>
            <Link to="/profile" style={{
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
              Profil
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

      {/* ===== Modern Statistics Content ===== */}
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
              📊 Mes Statistiques
            </h1>
            <p style={{
              fontSize: '1.3em',
              color: '#8a5a44',
              margin: '0',
              opacity: 0.8,
              fontWeight: 500
            }}>
              Analysez vos performances et suivez l'évolution de votre activité artisanale
            </p>
          </div>
        </div>

        {stats && workshopStats && artisanProducts && (
          <>
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ color: '#8a5a44', fontSize: '1.5em' }}>Résumé</h3>
              {/* Modern Cards Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '25px'
              }}>
                {/* Revenue Card */}
                <div style={{
                  backgroundColor: '#fff',
                  borderRadius: '20px',
                  padding: '30px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                  border: '1px solid rgba(212, 163, 115, 0.2)',
                  textAlign: 'center',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.12)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.08)';
                }}>
                  <div style={{ fontSize: '3em', marginBottom: '15px' }}>💰</div>
                  <h4 style={{ color: '#8a5a44', margin: '0 0 10px 0', fontSize: '1.2em' }}>Chiffre d'Affaires</h4>
                  <p style={{ fontSize: '2.5em', color: '#8a5a44', margin: '0', fontWeight: 700 }}>${stats.totalRevenue}</p>
            </div>

                {/* Payments Card */}
                <div style={{
                  backgroundColor: '#fff',
                  borderRadius: '20px',
                  padding: '30px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                  border: '1px solid rgba(212, 163, 115, 0.2)',
                  textAlign: 'center',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.12)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.08)';
                }}>
                  <div style={{ fontSize: '3em', marginBottom: '15px' }}>✅</div>
                  <h4 style={{ color: '#8a5a44', margin: '0 0 10px 0', fontSize: '1.2em' }}>Commandes Traitées</h4>
                  <p style={{ fontSize: '2.5em', color: '#8a5a44', margin: '0', fontWeight: 700 }}>{stats.paymentCount}</p>
                </div>

                {/* Workshops Card */}
                <div style={{
                  backgroundColor: '#fff',
                  borderRadius: '20px',
                  padding: '30px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                  border: '1px solid rgba(212, 163, 115, 0.2)',
                  textAlign: 'center',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.12)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.08)';
                }}>
                  <div style={{ fontSize: '3em', marginBottom: '15px' }}>🎨</div>
                  <h4 style={{ color: '#8a5a44', margin: '0 0 10px 0', fontSize: '1.2em' }}>Ateliers</h4>
                  <p style={{ fontSize: '2.5em', color: '#8a5a44', margin: '0', fontWeight: 700 }}>{workshopStats.totalWorkshops}</p>
            </div>


              </div>
            </div>

            {/* ===== Charts Section ===== */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
              gap: '40px',
              marginBottom: '50px'
            }}>
              {/* Products Chart */}
              <div style={{
                backgroundColor: '#fff',
                borderRadius: '20px',
                padding: '30px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                border: '1px solid rgba(212, 163, 115, 0.2)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-20px',
                  right: '-20px',
                  width: '100px',
                  height: '100px',
                  background: 'linear-gradient(135deg, rgba(138, 90, 68, 0.1) 0%, rgba(212, 163, 115, 0.05) 100%)',
                  borderRadius: '50%',
                  zIndex: 0
                }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <h3 style={{
                    fontSize: '1.6em',
                    color: '#8a5a44',
                    margin: '0 0 25px 0',
                    fontWeight: 700,
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px'
                  }}>
                    📦 Produits les Plus Vendus
                  </h3>
                  <div style={{ width: '100%', height: '350px', position: 'relative' }}>
                <Bar data={productChartData} options={productChartOptions} />
                  </div>
              </div>
            </div>

              {/* Workshops Chart */}
              <div style={{
                backgroundColor: '#fff',
                borderRadius: '20px',
                padding: '30px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                border: '1px solid rgba(212, 163, 115, 0.2)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-20px',
                  right: '-20px',
                  width: '100px',
                  height: '100px',
                  background: 'linear-gradient(135deg, rgba(212, 163, 115, 0.1) 0%, rgba(138, 90, 68, 0.05) 100%)',
                  borderRadius: '50%',
                  zIndex: 0
                }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <h3 style={{
                    fontSize: '1.6em',
                    color: '#8a5a44',
                    margin: '0 0 25px 0',
                    fontWeight: 700,
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px'
                  }}>
                    🎨 Places Restantes par Atelier
                  </h3>
                  <div style={{ width: '100%', height: '350px', position: 'relative' }}>
                <Bar data={workshopChartData} options={workshopChartOptions} />
              </div>
            </div>
              </div>
            </div>

            {/* ===== Out of Stock Products Section ===== */}
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '20px',
              padding: '30px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
              border: '1px solid rgba(212, 163, 115, 0.2)',
              marginBottom: '50px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                width: '100px',
                height: '100px',
                background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(255, 152, 0, 0.05) 100%)',
                borderRadius: '50%',
                zIndex: 0
              }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <h3 style={{
                  fontSize: '1.6em',
                  color: '#8a5a44',
                  margin: '0 0 25px 0',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  ⚠️ Produits en Rupture de Stock
                </h3>
                
                
                
                {artisanProducts?.filter(product => 
                  product.stock === 0 || 
                  product.stock === "0"
                ).length > 0 ? (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '20px'
                  }}>
                    {artisanProducts
                      .filter(product => 
                        product.stock === 0 || 
                        product.stock === "0"
                      )
                      .map((product, index) => (
                        <div key={index} style={{
                          backgroundColor: 'rgba(244, 67, 54, 0.05)',
                          border: '1px solid rgba(244, 67, 54, 0.2)',
                          borderRadius: '15px',
                          padding: '20px',
                          transition: 'all 0.3s ease',
                          position: 'relative'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(244, 67, 54, 0.1)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 8px 24px rgba(244, 67, 54, 0.15)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(244, 67, 54, 0.05)';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}>
                          {/* Product Header */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '15px'
                          }}>
                            <div style={{
                              width: '50px',
                              height: '50px',
                              backgroundColor: 'rgba(244, 67, 54, 0.1)',
                              borderRadius: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '1.5em'
                            }}>
                              📦
                            </div>
                            <div style={{ flex: 1 }}>
                              <h4 style={{
                                fontSize: '1.2em',
                                color: '#8a5a44',
                                margin: '0 0 5px 0',
                                fontWeight: 600
                              }}>
                                {product.name}
                              </h4>
                              <p style={{
                                fontSize: '1em',
                                color: '#5c4b38',
                                margin: '0',
                                opacity: 0.8
                              }}>
                                Prix: {product.price} €
                              </p>
                            </div>
                          </div>
                          
                          {/* Stock Status */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px 16px',
                            backgroundColor: 'rgba(244, 67, 54, 0.1)',
                            borderRadius: '10px',
                            border: '1px solid rgba(244, 67, 54, 0.3)'
                          }}>
                            <span style={{
                              color: '#F44336',
                              fontWeight: 600,
                              fontSize: '1em'
                            }}>
                              Stock: {product.stock}
                            </span>
                            <span style={{
                              color: '#F44336',
                              fontWeight: 700,
                              fontSize: '0.9em',
                              padding: '4px 8px',
                              backgroundColor: 'rgba(244, 67, 54, 0.2)',
                              borderRadius: '6px'
                            }}>
                              RUPTURE
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div style={{
                    textAlign: 'center',
                    padding: '60px 20px',
                    backgroundColor: 'rgba(76, 175, 80, 0.05)',
                    borderRadius: '16px',
                    border: '2px dashed rgba(76, 175, 80, 0.3)'
                  }}>
                    <div style={{ fontSize: '4em', marginBottom: '20px' }}>✅</div>
                    <h4 style={{
                      color: '#4CAF50',
                      fontSize: '1.3em',
                      margin: '0 0 10px 0',
                      fontWeight: 600
                    }}>
                      Aucun produit en rupture de stock
                    </h4>
                    <p style={{
                      color: '#4CAF50',
                      fontSize: '1em',
                      margin: 0,
                      opacity: 0.7
                    }}>
                      Tous vos produits ont du stock disponible !
                    </p>
                  </div>
                )}
              </div>
      </div>

            {/* ===== Additional Info Section ===== */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '25px',
              marginBottom: '50px'
            }}>
              {/* Artisan Info Card */}
              <div style={{
                backgroundColor: '#fff',
                borderRadius: '20px',
                padding: '30px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                border: '1px solid rgba(212, 163, 115, 0.2)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-20px',
                  right: '-20px',
                  width: '100px',
                  height: '100px',
                  background: 'linear-gradient(135deg, rgba(212, 163, 115, 0.1) 0%, rgba(138, 90, 68, 0.05) 100%)',
                  borderRadius: '50%',
                  zIndex: 0
                }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <h3 style={{
                    fontSize: '1.4em',
                    color: '#8a5a44',
                    margin: '0 0 20px 0',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    👨‍🎨 Informations Artisan
                  </h3>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '15px'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 0',
                      borderBottom: '1px solid rgba(212, 163, 115, 0.1)'
                    }}>
                      <span style={{ color: '#8a5a44', fontWeight: 600 }}>Nom</span>
                      <span style={{ color: '#5c4b38', fontWeight: 500 }}>{stats.artisanName}</span>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 0'
                    }}>
                      <span style={{ color: '#8a5a44', fontWeight: 600 }}>Dernière Activité</span>
                      <span style={{ color: '#5c4b38', fontWeight: 500 }}>
                        {stats.lastActivity ? new Date(stats.lastActivity).toLocaleDateString('fr-FR') : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Card */}
              <div style={{
                backgroundColor: '#fff',
                borderRadius: '20px',
                padding: '30px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                border: '1px solid rgba(212, 163, 115, 0.2)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-20px',
                  right: '-20px',
                  width: '100px',
                  height: '100px',
                  background: 'linear-gradient(135deg, rgba(138, 90, 68, 0.1) 0%, rgba(212, 163, 115, 0.05) 100%)',
                  borderRadius: '50%',
                  zIndex: 0
                }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <h3 style={{
                    fontSize: '1.4em',
                    color: '#8a5a44',
                    margin: '0 0 20px 0',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    📈 Performance
                  </h3>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '15px'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 0',
                      borderBottom: '1px solid rgba(212, 163, 115, 0.1)'
                    }}>
                      <span style={{ color: '#8a5a44', fontWeight: 600 }}>Taux de Remplissage des ateliers </span>
                      <span style={{ 
                        color: workshopStats.averageFillRate > 70 ? '#4CAF50' : workshopStats.averageFillRate > 40 ? '#FF9800' : '#F44336',
                        fontWeight: 700,
                        fontSize: '1.1em'
                      }}>
                        {workshopStats.averageFillRate || 0}%
                      </span>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 0'
                    }}>
                      <span style={{ color: '#8a5a44', fontWeight: 600 }}>Statut</span>
                      <span style={{ 
                        color: workshopStats.averageFillRate > 70 ? '#4CAF50' : workshopStats.averageFillRate > 40 ? '#FF9800' : '#F44336',
                        fontWeight: 600,
                        padding: '4px 12px',
                        borderRadius: '20px',
                        backgroundColor: workshopStats.averageFillRate > 70 ? 'rgba(76, 175, 80, 0.1)' : workshopStats.averageFillRate > 40 ? 'rgba(255, 152, 0, 0.1)' : 'rgba(244, 67, 54, 0.1)'
                      }}>
                        {workshopStats.averageFillRate > 70 ? 'Excellent' : workshopStats.averageFillRate > 40 ? 'Bon' : 'À améliorer'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </section>

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
              <Link to="/artisan-home" style={{
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
                Accueil
              </Link>
              <Link to="/settings" style={{
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
                Paramètres
              </Link>
              <Link to="/artisan-orders" style={{
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
                Commandes
              </Link>
              <Link to="/artisan-statistics" style={{
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
                Statistiques
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

export default ArtisanStatistics;