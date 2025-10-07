import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getArtisansStatistics } from '../services/api';
// Auto-enregistrement de tous les éléments/échelles/types
import 'chart.js/auto';
import { Chart } from 'react-chartjs-2'; // 👈 générique, permet les datasets mixtes


function AdminStatistics() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filteredStats, setFilteredStats] = useState(null);

  // Helper: convertir en nombre sûr
  const n = (v) => Number.isFinite(Number(v)) ? Number(v) : 0;
  const formatDateFR = (v) => {
    const d = new Date(v);
    return isNaN(d) ? String(v) : d.toLocaleDateString('fr-FR');
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await getArtisansStatistics();
        setStats(response.data);
        setFilteredStats(response.data); // Initialement, pas de filtre
        setError('');
      } catch (err) {
        setError('Erreur lors du chargement des statistiques: ' + (err.response ? err.response.data.error : err.message));
        console.error('Fetch Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleFilter = () => {
    if (!stats) return;
    const filtered = {
      ...stats,
      paymentsByDay: (stats.paymentsByDay || []).filter(item => {
        const d = new Date(item._id);
        return (!startDate || d >= new Date(startDate)) && (!endDate || d <= new Date(endDate));
      })
    };
    setFilteredStats(filtered);
  };

  const exportToCSV = () => {
    if (!filteredStats) return;
    const SEP = ';';
    const BOM = '\uFEFF';
    const esc = (v) => {
      if (v === null || v === undefined) return '';
      const s = String(v);
      return (s.includes('"') || s.includes('\n') || s.includes(SEP))
        ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const formatDate = (v) => {
      const d = new Date(v);
      return isNaN(d) ? String(v) : d.toLocaleDateString('fr-FR');
    };

    const byDayHeader = ['Date', 'Payment Count', 'Total Amount (€)'];
    const byDayRows = (filteredStats.paymentsByDay || []).map(item => ([
      formatDate(item._id),
      n(item.paymentCount),
      n(item.totalAmount).toFixed(2), // si cents: (n(item.totalAmount)/100).toFixed(2)
    ]));

    const byArtisanHeader = ['Artisan Name', 'Payment Count', 'Total Amount (€)'];
    const byArtisanRows = (filteredStats.paymentsByArtisan || []).map(item => ([
      item.artisanName || '—',
      n(item.paymentCount),
      n(item.totalAmount).toFixed(2), // si cents: (n(item.totalAmount)/100).toFixed(2)
    ]));

    const lines = [];
    lines.push(esc('Paiements par jour'));
    lines.push(byDayHeader.map(esc).join(SEP));
    byDayRows.forEach(r => lines.push(r.map(esc).join(SEP)));
    lines.push('');
    lines.push(esc('Paiements par artisan'));
    lines.push(byArtisanHeader.map(esc).join(SEP));
    byArtisanRows.forEach(r => lines.push(r.map(esc).join(SEP)));

    const csv = BOM + lines.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'craft_hub_statistics.csv';
    a.click();
    window.URL.revokeObjectURL(url);
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
          <p style={{ fontSize: '1.2em', color: '#8a5a44', fontWeight: '600' }}>Chargement des statistiques...</p>
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

  // Données pour le graphique combiné (bar + line)
  const labels = (filteredStats?.paymentsByDay || []).map(item => formatDateFR(item._id));
  const chartData = {
    labels,
    datasets: [
      {
        type: 'bar',
        label: 'Montant Total (€)',
        data: (filteredStats?.paymentsByDay || []).map(item => n(item.totalAmount)), // si cents: n(item.totalAmount)/100
        backgroundColor: 'rgba(138, 90, 68, 0.6)',
        borderColor: 'rgba(138, 90, 68, 1)',
        borderWidth: 1,
      },
      {
        type: 'line',
        label: 'Nombre de Paiements',
        data: (filteredStats?.paymentsByDay || []).map(item => n(item.paymentCount)),
        borderWidth: 2,
        tension: 0.3,
        fill: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Valeur (€ / Nombre)' },
      },
      x: { title: { display: true, text: 'Date' } },
    },
    plugins: {
      legend: { position: 'top' },
      tooltip: { mode: 'index', intersect: false },
    },
  };

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
            <Link to="/admin/subscriptions" style={{
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
            📊 Statistiques de la Plateforme
          </h1>
          <p style={{
            fontSize: '1.3em',
            color: '#fff',
            marginBottom: '30px',
            opacity: 0.9,
            maxWidth: '600px',
            margin: '0 auto 30px'
          }}>
            Analysez les performances et les tendances de votre plateforme CraftHub
          </p>
        </div>
      </div>

      {/* ===== Main Content ===== */}
      <div style={{
        maxWidth: '1200px',
        margin: '40px auto',
        padding: '0 20px'
      }}>
        {/* ===== Filters Section ===== */}
        <div style={{
          background: 'linear-gradient(135deg, #fff, #f8f9fa)',
          borderRadius: '25px',
          padding: '30px',
          marginBottom: '30px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          border: '1px solid rgba(138, 90, 68, 0.1)'
        }}>
          <h2 style={{
            fontSize: '1.8em',
            color: '#8a5a44',
            textAlign: 'center',
            marginBottom: '25px',
            fontWeight: '700'
          }}>
            🔍 Filtres et Actions
          </h2>
          
          <div style={{
            display: 'flex',
            gap: '20px',
            justifyContent: 'center',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px'
            }}>
              <label style={{
                fontSize: '1em',
                color: '#8a5a44',
                fontWeight: '600'
              }}>
                📅 Date de début
              </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
                style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '2px solid #e0e0e0',
                  fontSize: '1em',
                  background: '#fff',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#8a5a44';
                  e.target.style.boxShadow = '0 4px 15px rgba(138, 90, 68, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e0e0e0';
                  e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                }}
              />
            </div>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px'
            }}>
              <label style={{
                fontSize: '1em',
                color: '#8a5a44',
                fontWeight: '600'
              }}>
                📅 Date de fin
              </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
                style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '2px solid #e0e0e0',
                  fontSize: '1em',
                  background: '#fff',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#8a5a44';
                  e.target.style.boxShadow = '0 4px 15px rgba(138, 90, 68, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e0e0e0';
                  e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                }}
              />
            </div>
            
            <div style={{
              display: 'flex',
              gap: '15px',
              alignItems: 'flex-end'
            }}>
          <button
            onClick={handleFilter}
                style={{
                  background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
                  color: '#fff',
                  padding: '12px 24px',
                  borderRadius: '25px',
                  border: 'none',
                  cursor: 'pointer',
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
                🔍 Filtrer
          </button>
              
          <button
            onClick={exportToCSV}
                style={{
                  background: 'linear-gradient(135deg, #4caf50, #66bb6a)',
                  color: '#fff',
                  padding: '12px 24px',
                  borderRadius: '25px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '1em',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(76, 175, 80, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(76, 175, 80, 0.3)';
                }}
              >
                📊 Exporter CSV
          </button>
            </div>
          </div>
        </div>

        {/* ===== Statistics Content ===== */}
        {filteredStats && (
          <>
            {/* ===== Summary Cards ===== */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '25px',
              marginBottom: '40px'
            }}>
              <div className="card-hover" style={{
                background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
                borderRadius: '20px',
                padding: '30px',
                textAlign: 'center',
                boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                border: '1px solid #e9ecef',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ fontSize: '3em', marginBottom: '15px' }}>👥</div>
                <h3 style={{
                  fontSize: '1.5em',
                  color: '#1976d2',
                  marginBottom: '10px',
                  fontWeight: '700'
                }}>
                  {n(filteredStats.totalArtisans)}
                </h3>
                <p style={{
                  fontSize: '1.1em',
                  color: '#666',
                  margin: '0'
                }}>
                  Total Artisans
                </p>
            </div>

              <div className="card-hover" style={{
                background: 'linear-gradient(135deg, #e8f5e8, #c8e6c9)',
                borderRadius: '20px',
                padding: '30px',
                textAlign: 'center',
                boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                border: '1px solid #e9ecef',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ fontSize: '3em', marginBottom: '15px' }}>💳</div>
                <h3 style={{
                  fontSize: '1.5em',
                  color: '#2e7d32',
                  marginBottom: '10px',
                  fontWeight: '700'
                }}>
                  {n(filteredStats.totalPayments)}
                </h3>
                <p style={{
                  fontSize: '1.1em',
                  color: '#666',
                  margin: '0'
                }}>
                  Total Abonnements
                </p>
              </div>
              
              <div className="card-hover" style={{
                background: 'linear-gradient(135deg, #fff3e0, #ffe0b2)',
                borderRadius: '20px',
                padding: '30px',
                textAlign: 'center',
                boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                border: '1px solid #e9ecef',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ fontSize: '3em', marginBottom: '15px' }}>💰</div>
                <h3 style={{
                  fontSize: '1.5em',
                  color: '#ef6c00',
                  marginBottom: '10px',
                  fontWeight: '700'
                }}>
                  €{n(filteredStats.totalRevenue).toFixed(2)}
                </h3>
                <p style={{
                  fontSize: '1.1em',
                  color: '#666',
                  margin: '0'
                }}>
                  Chiffre d'Affaires
                </p>
              </div>
              
              <div className="card-hover" style={{
                background: 'linear-gradient(135deg, #f3e5f5, #e1bee7)',
                borderRadius: '20px',
                padding: '30px',
                textAlign: 'center',
                boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                border: '1px solid #e9ecef',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ fontSize: '3em', marginBottom: '15px' }}>📈</div>
                <h3 style={{
                  fontSize: '1.5em',
                  color: '#7b1fa2',
                  marginBottom: '10px',
                  fontWeight: '700'
                }}>
                  €{n(filteredStats.averagePayment).toFixed(2)}
                </h3>
                <p style={{
                  fontSize: '1.1em',
                  color: '#666',
                  margin: '0'
                }}>
                  Montant Moyen par Abonnement
                </p>
              </div>
            </div>

            {/* ===== Advanced Analytics Section ===== */}
            <div style={{
              background: 'linear-gradient(135deg, #fff, #f8f9fa)',
              borderRadius: '25px',
              padding: '40px',
              marginBottom: '40px',
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
                📈 Analyses Avancées
              </h2>
              
            {/* ===== Performance Metrics Grid ===== */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '25px',
              marginBottom: '40px'
            }}>
              {/* Artisans avec Paiements */}
              <div className="card-hover" style={{
                background: 'linear-gradient(135deg, #e8f5e8, #c8e6c9)',
                borderRadius: '20px',
                padding: '30px',
                textAlign: 'center',
                boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                border: '1px solid #e9ecef',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ fontSize: '3em', marginBottom: '15px' }}>👨‍🎨</div>
                  <h3 style={{
                    fontSize: '1.8em',
                    color: '#2e7d32',
                    marginBottom: '10px',
                    fontWeight: '700'
                  }}>
                    {n(filteredStats.paymentsByArtisan?.length)}
                  </h3>
                <p style={{
                  fontSize: '1.1em',
                  color: '#666',
                  margin: '0 0 10px 0'
                }}>
                  Artisans avec Abonnements
                </p>
                  <p style={{
                    fontSize: '0.9em',
                    color: '#888',
                    margin: '0'
                  }}>
                    {n(filteredStats.totalArtisans) > 0
                      ? Math.round((n(filteredStats.paymentsByArtisan?.length) / n(filteredStats.totalArtisans)) * 100)
                      : 0}% du total
                  </p>
              </div>

              {/* Paiements Réussis */}
              <div className="card-hover" style={{
                background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
                borderRadius: '20px',
                padding: '30px',
                textAlign: 'center',
                boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                border: '1px solid #e9ecef',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ fontSize: '3em', marginBottom: '15px' }}>✅</div>
                  <h3 style={{
                    fontSize: '1.8em',
                    color: '#1976d2',
                    marginBottom: '10px',
                    fontWeight: '700'
                  }}>
                    {n(filteredStats.paymentStatus?.find(p => p._id === 'paid')?.count)}
                  </h3>
                <p style={{
                  fontSize: '1.1em',
                  color: '#666',
                  margin: '0 0 10px 0'
                }}>
                  Abonnements Réussis
                </p>
                  <p style={{
                    fontSize: '0.9em',
                    color: '#888',
                    margin: '0'
                  }}>
                    {n(filteredStats.totalPayments) > 0
                      ? Math.round((n(filteredStats.paymentStatus?.find(p => p._id === 'paid')?.count) / n(filteredStats.totalPayments)) * 100)
                      : 0}% du total
                  </p>
              </div>

              {/* Paiements Échoués */}
              <div className="card-hover" style={{
                background: 'linear-gradient(135deg, #ffebee, #ffcdd2)',
                borderRadius: '20px',
                padding: '30px',
                textAlign: 'center',
                boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                border: '1px solid #e9ecef',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ fontSize: '3em', marginBottom: '15px' }}>❌</div>
                  <h3 style={{
                    fontSize: '1.8em',
                    color: '#d32f2f',
                    marginBottom: '10px',
                    fontWeight: '700'
                  }}>
                    {n(filteredStats.paymentStatus?.find(p => p._id === 'pending')?.count)
                      + n(filteredStats.paymentStatus?.find(p => p._id === 'expired')?.count)}
                  </h3>
                <p style={{
                  fontSize: '1.1em',
                  color: '#666',
                  margin: '0 0 10px 0'
                }}>
                  Abonnements Échoués
                </p>
                  <p style={{
                    fontSize: '0.9em',
                    color: '#888',
                    margin: '0'
                  }}>
                    {n(filteredStats.totalPayments) > 0
                      ? Math.round(((n(filteredStats.paymentStatus?.find(p => p._id === 'pending')?.count)
                        + n(filteredStats.paymentStatus?.find(p => p._id === 'expired')?.count)) / n(filteredStats.totalPayments)) * 100)
                      : 0}% du total
                  </p>
              </div>

              {/* Revenus par Artisan Moyen */}
              <div className="card-hover" style={{
                background: 'linear-gradient(135deg, #f3e5f5, #e1bee7)',
                borderRadius: '20px',
                padding: '30px',
                textAlign: 'center',
                boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                border: '1px solid #e9ecef',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ fontSize: '3em', marginBottom: '15px' }}>💰</div>
                  <h3 style={{
                    fontSize: '1.8em',
                    color: '#7b1fa2',
                    marginBottom: '10px',
                    fontWeight: '700'
                  }}>
                    €{(n(filteredStats.paymentsByArtisan?.length) > 0
                      ? (n(filteredStats.totalRevenue) / n(filteredStats.paymentsByArtisan?.length))
                      : 0).toFixed(2)}
                  </h3>
                <p style={{
                  fontSize: '1.1em',
                  color: '#666',
                  margin: '0 0 10px 0'
                }}>
                  Revenus Moyens par Artisan
                </p>
                <p style={{
                  fontSize: '0.9em',
                  color: '#888',
                  margin: '0'
                }}>
                  parmi ceux avec abonnements
                </p>
              </div>
            </div>

              {/* ===== Top Performers Section ===== */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                gap: '30px'
              }}>
                {/* Top Revenue Artisans */}
                <div style={{
                  background: 'linear-gradient(135deg, #fff, #f8f9fa)',
                  borderRadius: '20px',
                  padding: '25px',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                  border: '1px solid #e9ecef'
                }}>
                  <h3 style={{
                    fontSize: '1.5em',
                    color: '#8a5a44',
                    marginBottom: '20px',
                    fontWeight: '700',
                    textAlign: 'center'
                  }}>
                    🏆 Top Artisans par Abonnements
                  </h3>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '15px'
                  }}>
                    {filteredStats.paymentsByArtisan.slice(0, 5).map((item, index) => (
                      <div key={index} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '15px',
                        background: index < 3 ? 
                          (index === 0 ? 'linear-gradient(135deg, #ffd700, #ffed4e)' :
                           index === 1 ? 'linear-gradient(135deg, #c0c0c0, #e5e5e5)' :
                           'linear-gradient(135deg, #cd7f32, #daa520)') :
                          'linear-gradient(135deg, #f8f9fa, #e9ecef)',
                        borderRadius: '12px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        transition: 'all 0.3s ease'
                      }} onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.15)';
                      }} onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px'
                        }}>
                          <div style={{
                            fontSize: '1.2em',
                            fontWeight: '700',
                            color: index < 3 ? '#fff' : '#8a5a44',
                            minWidth: '20px'
                          }}>
                            #{index + 1}
                          </div>
                          <span style={{
                            fontSize: '1em',
                            fontWeight: '600',
                            color: index < 3 ? '#fff' : '#2c3e50'
                          }}>
                            {item.artisanName}
                          </span>
                        </div>
                        <div style={{
                          fontSize: '1.1em',
                          fontWeight: '700',
                          color: index < 3 ? '#fff' : '#2e7d32'
                        }}>
                          €{n(item.totalAmount).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Trends */}
                <div style={{
                  background: 'linear-gradient(135deg, #fff, #f8f9fa)',
                  borderRadius: '20px',
                  padding: '25px',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                  border: '1px solid #e9ecef'
                }}>
                  <h3 style={{
                    fontSize: '1.5em',
                    color: '#8a5a44',
                    marginBottom: '20px',
                    fontWeight: '700',
                    textAlign: 'center'
                  }}>
                    📊 Tendances des Abonnements
                  </h3>
                  
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px'
                  }}>
                    {/* Paiements par Jour (7 derniers jours) */}
                    <div style={{
                      background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
                      padding: '20px',
                      borderRadius: '15px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '2em', marginBottom: '10px' }}>📅</div>
                      <h4 style={{
                        fontSize: '1.2em',
                        color: '#1976d2',
                        marginBottom: '5px',
                        fontWeight: '600'
                      }}>
                        Abonnements Récents
                      </h4>
                      <p style={{
                        fontSize: '1.5em',
                        color: '#1976d2',
                        fontWeight: '700',
                        margin: '0'
                      }}>
                        {(filteredStats.paymentsByDay || []).slice(-7).reduce((sum, d) => sum + n(d.paymentCount), 0)} abonnements
                      </p>
                      <p style={{
                        fontSize: '0.9em',
                        color: '#666',
                        margin: '5px 0 0 0'
                      }}>
                        (7 derniers jours)
                      </p>
                    </div>

                    {/* Jour avec le plus de paiements */}
                    <div style={{
                      background: 'linear-gradient(135deg, #e8f5e8, #c8e6c9)',
                      padding: '20px',
                      borderRadius: '15px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '2em', marginBottom: '10px' }}>⚡</div>
                      <h4 style={{
                        fontSize: '1.2em',
                        color: '#2e7d32',
                        marginBottom: '5px',
                        fontWeight: '600'
                      }}>
                        Meilleur Jour
                      </h4>
                      <p style={{
                        fontSize: '1.5em',
                        color: '#2e7d32',
                        fontWeight: '700',
                        margin: '0'
                      }}>
                        {(filteredStats.paymentsByDay || []).length > 0
                          ? Math.max(...(filteredStats.paymentsByDay || []).map(d => n(d.paymentCount)))
                          : 0} abonnements
                      </p>
                      <p style={{
                        fontSize: '0.9em',
                        color: '#666',
                        margin: '5px 0 0 0'
                      }}>
                        {filteredStats.paymentsByDay?.length > 0 ? 
                          (filteredStats.paymentsByDay.find(day => day.paymentCount === Math.max(...filteredStats.paymentsByDay.map(d => d.paymentCount)))?.id || 'N/A') : 
                          'Aucune donnée'}
                      </p>
                    </div>

                    {/* Revenus par Jour Moyen */}
                    <div style={{
                      background: 'linear-gradient(135deg, #fff3e0, #ffe0b2)',
                      padding: '20px',
                      borderRadius: '15px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '2em', marginBottom: '10px' }}>💰</div>
                      <h4 style={{
                        fontSize: '1.2em',
                        color: '#ef6c00',
                        marginBottom: '5px',
                        fontWeight: '600'
                      }}>
                        Revenus Moyens/Jour
                      </h4>
                      <p style={{
                        fontSize: '1.5em',
                        color: '#ef6c00',
                        fontWeight: '700',
                        margin: '0'
                      }}>
                        €{(filteredStats.paymentsByDay?.length
                            ? (filteredStats.paymentsByDay.reduce((sum, d) => sum + n(d.totalAmount), 0) / filteredStats.paymentsByDay.length)
                            : 0).toFixed(2)}
                      </p>
                      <p style={{
                        fontSize: '0.9em',
                        color: '#666',
                        margin: '5px 0 0 0'
                      }}>
                        sur {n(filteredStats.paymentsByDay?.length)} jours
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ===== Real Data Chart Section ===== */}
            <div style={{
              background: 'linear-gradient(135deg, #fff, #f8f9fa)',
              borderRadius: '25px',
              padding: '40px',
              marginBottom: '40px',
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
                📊 Évolution des Abonnements (Données Réelles)
              </h2>
              <div style={{
                width: '100%',
                height: '500px',
                position: 'relative',
                background: '#fff',
                borderRadius: '15px',
                padding: '20px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
              }}>
                {/* 👇 Chart combiné (bar + line) */}
                <Chart type="bar" data={chartData} options={chartOptions} />
              </div>
            </div>

            {/* ===== Artisans Table ===== */}
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
                👨‍🎨 Abonnements par Artisan
              </h2>
              
              <div style={{
                overflowX: 'auto',
                borderRadius: '15px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
              }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  background: '#fff'
                }}>
                <thead>
                    <tr style={{
                      background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
                      color: '#fff'
                    }}>
                      <th style={{
                        padding: '20px',
                        textAlign: 'left',
                        fontWeight: '600',
                        fontSize: '1.1em',
                        borderBottom: '2px solid rgba(255,255,255,0.2)'
                      }}>
                        👤 Nom de l'Artisan
                      </th>
                      <th style={{
                        padding: '20px',
                        textAlign: 'center',
                        fontWeight: '600',
                        fontSize: '1.1em',
                        borderBottom: '2px solid rgba(255,255,255,0.2)'
                      }}>
                        💳 Nombre d'Abonnements
                      </th>
                      <th style={{
                        padding: '20px',
                        textAlign: 'center',
                        fontWeight: '600',
                        fontSize: '1.1em',
                        borderBottom: '2px solid rgba(255,255,255,0.2)'
                      }}>
                        💰 Montant Total
                      </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStats.paymentsByArtisan.map((item, index) => (
                      <tr key={index} style={{
                        background: index % 2 === 0 ? '#fff' : '#f8f9fa',
                        transition: 'all 0.3s ease'
                      }} onMouseOver={(e) => {
                        e.currentTarget.style.background = '#e3f2fd';
                        e.currentTarget.style.transform = 'scale(1.01)';
                      }} onMouseOut={(e) => {
                        e.currentTarget.style.background = index % 2 === 0 ? '#fff' : '#f8f9fa';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}>
                        <td style={{
                          padding: '20px',
                          color: '#2c3e50',
                          fontWeight: '600',
                          fontSize: '1.1em',
                          borderBottom: '1px solid #e9ecef'
                        }}>
                          {item.artisanName}
                        </td>
                        <td style={{
                          padding: '20px',
                          textAlign: 'center',
                          color: '#1976d2',
                          fontWeight: '600',
                          fontSize: '1.1em',
                          borderBottom: '1px solid #e9ecef'
                        }}>
                          {n(item.paymentCount)}
                        </td>
                        <td style={{
                          padding: '20px',
                          textAlign: 'center',
                          color: '#2e7d32',
                          fontWeight: '700',
                          fontSize: '1.2em',
                          borderBottom: '1px solid #e9ecef'
                        }}>
                          €{n(item.totalAmount).toFixed(2)}
                        </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          </>
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
              <Link to="/admin/subscriptions" style={{
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
          boxShadow: 0 20px 40px rgba(0,0,0,0.15);
        }
        table tr {
          transition: all 0.3s ease;
        }
        table tr:hover {
          transform: scale(1.01);
        }
      `}</style>
    </div>
  );
}

export default AdminStatistics;