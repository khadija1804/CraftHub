import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPublicProducts, getPublicWorkshops, getPublicProductImage, getPublicWorkshopImage } from '../services/api';

function AdminHome() {
  const [products, setProducts] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const [imageUrls, setImageUrls] = useState({});
  const [filters, setFilters] = useState({ 
    productCategory: 'all', 
    workshopCategory: 'all', 
    region: 'all', 
    priceRange: 'all' 
  });
  const [activeTab, setActiveTab] = useState('products');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  
  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [prodRes, workRes] = await Promise.all([getPublicProducts(), getPublicWorkshops()]);
        setProducts(prodRes.data || []);
        setWorkshops(workRes.data || []);

        const urls = {};
        for (const p of prodRes.data || []) {
          if (p.images && p.images.length > 0) {
            try {
              const response = await getPublicProductImage(p._id, 0);
              urls[p._id] = URL.createObjectURL(response.data);
            } catch (err) {
              console.error('Failed to fetch image for product ID:', p._id, err);
            }
          }
        }
        for (const w of workRes.data || []) {
          if (w.images && w.images.length > 0) {
            try {
              const response = await getPublicWorkshopImage(w._id, 0);
              urls[w._id] = URL.createObjectURL(response.data);
            } catch (err) {
              console.error('Failed to fetch image for workshop ID:', w._id, err);
            }
          }
        }
        setImageUrls(urls);
        setError('');
      } catch (err) {
        setError('Erreur lors du chargement des données. Vérifiez la console.');
        console.error('API Error:', err.response ? err.response.data : err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    return () => {
      Object.values(imageUrls).forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  const filteredProducts = products.filter(p => 
    (filters.productCategory === 'all' || p.category === filters.productCategory) &&
    (filters.priceRange === 'all' || 
     (filters.priceRange === '0-50' && p.price >= 0 && p.price <= 50) ||
     (filters.priceRange === '50-100' && p.price > 50 && p.price <= 100) ||
     (filters.priceRange === '100+' && p.price > 100))
  );

  const filteredWorkshops = workshops.filter(w => 
    (filters.workshopCategory === 'all' || w.category === filters.workshopCategory) &&
    (filters.region === 'all' || w.location.toLowerCase() === filters.region.toLowerCase()) &&
    (filters.priceRange === 'all' || 
     (filters.priceRange === '0-50' && w.price >= 0 && w.price <= 50) ||
     (filters.priceRange === '50-100' && w.price > 50 && w.price <= 100) ||
     (filters.priceRange === '100+' && w.price > 100))
  );

  // Logique de pagination
  const totalProducts = filteredProducts.length;
  const totalWorkshops = filteredWorkshops.length;
  const totalPages = Math.ceil((activeTab === 'products' ? totalProducts : totalWorkshops) / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const currentWorkshops = filteredWorkshops.slice(indexOfFirstItem, indexOfLastItem);

  // Réinitialiser la page courante quand on change d'onglet ou de filtres
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, filters]);

  // Réinitialiser la page courante si elle dépasse le nombre total de pages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  const isGoogleMapsLink = (text) => {
    return text && (text.startsWith('https://goo.gl') || text.startsWith('https://google.com/maps'));
  };

  return (
    <div
      style={{
        fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif',
        color: "#3a2f1a",
        minHeight: "100vh",
        backgroundColor: "#f8f1e9",
        margin: 0,
        padding: 0
      }}
    >
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
            fontWeight: 700,
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            animation: 'fadeInUp 1s ease-out'
          }}>
            Supervision Admin CraftHub
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
            Gérez et supervisez tous les produits et ateliers de la plateforme
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
              🎨 {products.length} Produits
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
              🛠️ {workshops.length} Ateliers
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
        {error && (
          <p
            style={{
              color: "#a94442",
              backgroundColor: "#f2dede",
              padding: "10px",
              borderRadius: "5px",
              textAlign: "center"
            }}
          >
            {error}
          </p>
        )}
        {loading && <p style={{ textAlign: "center" }}>Chargement...</p>}

        {/* ===== Dynamic Filters Section ===== */}
        <div style={{
          background: 'linear-gradient(135deg, #f8f1e9, #fff)',
          padding: '40px',
          borderRadius: '25px',
          marginBottom: '50px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          border: '1px solid rgba(138, 90, 68, 0.1)'
        }}>
          <h3 style={{
            fontSize: '1.8em',
            color: '#8a5a44',
            textAlign: 'center',
            marginBottom: '30px',
            fontWeight: 600
          }}>
            🔍 Filtres de Recherche - {activeTab === 'products' ? 'Produits' : 'Ateliers'}
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: activeTab === 'products' 
              ? 'repeat(auto-fit, minmax(250px, 1fr))' 
              : 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '25px',
            alignItems: 'end'
          }}>
            {/* Category Filter - Dynamic based on active tab */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '1.1em',
                fontWeight: 600,
                color: '#5c4b38',
                marginBottom: '10px'
              }}>
                📂 Catégorie {activeTab === 'products' ? 'Produits' : 'Ateliers'}
              </label>
          <select
                value={activeTab === 'products' ? filters.productCategory : filters.workshopCategory}
                onChange={(e) => setFilters({ 
                  ...filters, 
                  [activeTab === 'products' ? 'productCategory' : 'workshopCategory']: e.target.value 
                })}
                style={{
                  width: '100%',
                  padding: '15px 20px',
                  borderRadius: '15px',
                  border: '2px solid #d4a373',
                  backgroundColor: '#fff',
                  fontSize: '1em',
                  color: '#5c4b38',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
                }}
                onMouseOver={(e) => {
                  e.target.style.borderColor = '#8a5a44';
                  e.target.style.boxShadow = '0 6px 20px rgba(138, 90, 68, 0.15)';
                }}
                onMouseOut={(e) => {
                  e.target.style.borderColor = '#d4a373';
                  e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.05)';
                }}
          >
             <option value="all">Toutes catégories</option>
            <option value="Produits naturels, biologiques & bien-être">Produits naturels, biologiques & bien-être</option>
            <option value="Maison, décoration & art de vivre">Maison, décoration & art de vivre</option>
            <option value="Mode, accessoires & bijoux">Mode, accessoires & bijoux</option>
            <option value="Produits alimentaires artisanaux">Produits alimentaires artisanaux</option>
            <option value="Jouets & loisirs créatifs">Jouets & loisirs créatifs</option>
            <option value="Mobilier & artisanat utilitaire">Mobilier & artisanat utilitaire</option>
            <option value="Arts visuels & artisanat artistique">Arts visuels & artisanat artistique</option>
            <option value="Artisanat culturel & traditionnel">Artisanat culturel & traditionnel</option>
          </select>
            </div>

            {/* Price Range Filter */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '1.1em',
                fontWeight: 600,
                color: '#5c4b38',
                marginBottom: '10px'
              }}>
                💰 Fourchette de prix
              </label>
              <select
                value={filters.priceRange}
                onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}
                style={{
                  width: '100%',
                  padding: '15px 20px',
                  borderRadius: '15px',
                  border: '2px solid #d4a373',
                  backgroundColor: '#fff',
                  fontSize: '1em',
                  color: '#5c4b38',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
                }}
                onMouseOver={(e) => {
                  e.target.style.borderColor = '#8a5a44';
                  e.target.style.boxShadow = '0 6px 20px rgba(138, 90, 68, 0.15)';
                }}
                onMouseOut={(e) => {
                  e.target.style.borderColor = '#d4a373';
                  e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.05)';
                }}
              >
                <option value="all">Tous prix</option>
                <option value="0-50">0 € - 50 €</option>
                <option value="50-100">50 € - 100 €</option>
                <option value="100+">100 €+</option>
              </select>
            </div>

            {/* Region Filter - Only for Workshops */}
            {activeTab === 'workshops' && (
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '1.1em',
                  fontWeight: 600,
                  color: '#5c4b38',
                  marginBottom: '10px'
                }}>
                  🌍 Région
                </label>
                <select
                  value={filters.region}
                  onChange={(e) => setFilters({ ...filters, region: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '15px 20px',
                    borderRadius: '15px',
                    border: '2px solid #d4a373',
                    backgroundColor: '#fff',
                    fontSize: '1em',
                    color: '#5c4b38',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.borderColor = '#8a5a44';
                    e.target.style.boxShadow = '0 6px 20px rgba(138, 90, 68, 0.15)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.borderColor = '#d4a373';
                    e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.05)';
                  }}
                >
                  <option value="all">🌍 Toutes régions</option>
                  <option value="tunis">🏛️ Tunis</option>
                  <option value="sfax">🏭 Sfax</option>
                  <option value="sousse">🏖️ Sousse</option>
                  <option value="nabeul">🌺 Nabeul</option>
                  <option value="bizerte">⚓ Bizerte</option>
                  <option value="gabès">🏜️ Gabès</option>
                  <option value="monastir">🕌 Monastir</option>
                  <option value="kairouan">🕌 Kairouan</option>
                  <option value="gafsa">⛰️ Gafsa</option>
                  <option value="tozeur">🌴 Tozeur</option>
                  <option value="medenine">🏺 Medenine</option>
                  <option value="tataouine">🏜️ Tataouine</option>
                  <option value="kebili">🌵 Kebili</option>
                  <option value="kasserine">🏔️ Kasserine</option>
                  <option value="sidi bouzid">🌾 Sidi Bouzid</option>
                  <option value="mahdia">🏖️ Mahdia</option>
                  <option value="jendouba">🌲 Jendouba</option>
                  <option value="kef">🏔️ Kef</option>
                  <option value="siliana">🌿 Siliana</option>
                  <option value="manouba">🏘️ Manouba</option>
                  <option value="ben arous">🏢 Ben Arous</option>
                  <option value="ariana">🌹 Ariana</option>
                  <option value="zaghouan">🌿 Zaghouan</option>
                  <option value="béja">🌾 Béja</option>
                </select>
              </div>
            )}

            {/* Info Button */}
            <div style={{ display: 'flex', alignItems: 'end' }}>
                      <Link
                to="/admin-categories-info"
                        style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '15px 25px',
                          backgroundColor: '#8a5a44',
                          color: '#fff',
                  borderRadius: '15px',
                          fontWeight: '600',
                          textDecoration: 'none',
                  fontSize: '1em',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(138, 90, 68, 0.3)',
                  width: '100%',
                  justifyContent: 'center'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#a66c55';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(138, 90, 68, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = '#8a5a44';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(138, 90, 68, 0.3)';
                }}
              >
                ℹ️ En savoir plus
                      </Link>
            </div>
          </div>
                    </div>
          
        {/* ===== Tab Navigation ===== */}
        <div style={{
          background: '#fff',
          padding: '0',
          borderRadius: '20px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          marginBottom: '40px',
          border: '1px solid rgba(138, 90, 68, 0.1)',
          overflow: 'hidden'
        }}>
          <div style={{
            display: 'flex',
            background: 'linear-gradient(135deg, #f8f1e9, #fff)',
            borderBottom: '1px solid rgba(138, 90, 68, 0.1)'
          }}>
            <button
              onClick={() => setActiveTab('products')}
              style={{
                background: activeTab === 'products' ? 'linear-gradient(45deg, #d4a373, #c78c5d)' : 'transparent',
                border: 'none',
                fontSize: '1.1em',
                fontWeight: activeTab === 'products' ? 700 : 600,
                color: activeTab === 'products' ? '#fff' : '#8a5a44',
                padding: '20px 40px',
                cursor: 'pointer',
                borderRadius: '0',
                transition: 'all 0.3s ease',
                flex: 1,
                position: 'relative',
                textShadow: activeTab === 'products' ? '1px 1px 2px rgba(0,0,0,0.2)' : 'none'
              }}
              onMouseOver={(e) => {
                if (activeTab !== 'products') {
                  e.currentTarget.style.backgroundColor = 'rgba(212, 163, 115, 0.1)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseOut={(e) => {
                if (activeTab !== 'products') {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              🛍️ Produits ({totalProducts})
            </button>

            <button
              onClick={() => setActiveTab('workshops')}
              style={{
                background: activeTab === 'workshops' ? 'linear-gradient(45deg, #d4a373, #c78c5d)' : 'transparent',
                border: 'none',
                fontSize: '1.1em',
                fontWeight: activeTab === 'workshops' ? 700 : 600,
                color: activeTab === 'workshops' ? '#fff' : '#8a5a44',
                padding: '20px 40px',
                cursor: 'pointer',
                borderRadius: '0',
                transition: 'all 0.3s ease',
                flex: 1,
                position: 'relative',
                textShadow: activeTab === 'workshops' ? '1px 1px 2px rgba(0,0,0,0.2)' : 'none'
              }}
              onMouseOver={(e) => {
                if (activeTab !== 'workshops') {
                  e.currentTarget.style.backgroundColor = 'rgba(212, 163, 115, 0.1)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseOut={(e) => {
                if (activeTab !== 'workshops') {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              🛠️ Ateliers ({totalWorkshops})
            </button>
          </div>
        </div>

        {/* ===== Products Section ===== */}
        {activeTab === 'products' && (
          <div style={{
            background: '#fff',
            borderRadius: '20px',
            padding: '40px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            border: '1px solid rgba(138, 90, 68, 0.1)'
          }}>
            <h3 style={{
              fontSize: '2.2em',
              color: '#8a5a44',
              textAlign: 'center',
              marginBottom: '40px',
              fontWeight: 700,
              textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
            }}>
              🛍️ Produits ({totalProducts})
            </h3>
            
          {currentProducts.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                gap: '35px'
              }}>
                {currentProducts.map((p) => (
                  <div key={p._id} className="card-hover" style={{
                    background: 'linear-gradient(135deg, #fff, #f8f9fa)',
                    borderRadius: '20px',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                    overflow: 'hidden',
                    border: '1px solid #e9ecef',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%'
                  }}>
                    {/* Product Image */}
                    <div style={{ position: 'relative', height: '250px', overflow: 'hidden' }}>
                      {imageUrls[p._id] ? (
                  <img
                    src={imageUrls[p._id]}
                    alt={p.name}
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover',
                            transition: 'transform 0.3s ease'
                          }}
                          onError={(e) => { 
                            e.target.style.display = 'none'; 
                            console.log('Image load failed for product ID:', p._id); 
                          }}
                        />
                      ) : (
                        <div style={{
                          width: '100%',
                          height: '100%',
                          background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '3em',
                          color: '#fff'
                        }}>
                          🛍️
                        </div>
                      )}
                      {/* Price Badge */}
                      <div style={{
                        position: 'absolute',
                        top: '15px',
                        right: '15px',
                        background: 'linear-gradient(135deg, #28a745, #20c997)',
                        color: '#fff',
                        padding: '8px 12px',
                        borderRadius: '20px',
                        fontSize: '1em',
                        fontWeight: '700',
                        boxShadow: '0 4px 15px rgba(40, 167, 69, 0.3)'
                      }}>
                        {p.price} €
                      </div>
                    </div>
                    
                    {/* Product Info */}
                    <div style={{ 
                      padding: '25px', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      flex: 1,
                      justifyContent: 'space-between'
                    }}>
                      <div>
                        <h4 style={{
                          fontSize: '1.4em',
                          fontWeight: '700',
                          color: '#2c3e50',
                          margin: '0 0 15px 0',
                          lineHeight: '1.3',
                          minHeight: '2.6em',
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                          {p.name}
                        </h4>
                        
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '15px',
                          padding: '10px',
                          background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
                          borderRadius: '10px'
                        }}>
                          <span style={{ fontSize: '1.2em' }}>👤</span>
                          <span style={{ fontSize: '0.9em', color: '#6c757d', fontWeight: '500' }}>
                  Par{' '}
                  {p.artisanId && p.artisanId._id ? (
                              <Link to={`/admin-artisan-profile/${p.artisanId._id}`} style={{ 
                                color: '#8a5a44', 
                                textDecoration: 'none', 
                                fontWeight: '600',
                                transition: 'color 0.3s ease'
                              }} onMouseOver={(e) => e.target.style.color = '#d4a373'} onMouseOut={(e) => e.target.style.color = '#8a5a44'}>
                      {p.artisanId.prenom} {p.artisanId.nom}
                    </Link>
                  ) : (
                              <span style={{ color: '#dc3545', fontStyle: 'italic' }}>Artisan inconnu</span>
                            )}
                          </span>
                        </div>
                        
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '20px',
                          padding: '10px',
                          background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
                          borderRadius: '10px'
                        }}>
                          <span style={{ fontSize: '1.2em' }}>📂</span>
                          <span style={{ fontSize: '0.9em', color: '#1976d2', fontWeight: '500' }}>
                            {p.category}
                          </span>
                        </div>
                      </div>
                      
                      {/* Button positioned at bottom */}
                      <div style={{ marginTop: 'auto' }}>
                        <Link 
                          to={`/admin-product-details/${p._id}`} 
                          style={{ 
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '12px 20px',
                            background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
                            color: '#fff',
                            textDecoration: 'none',
                            borderRadius: '12px',
                            fontWeight: '600',
                            fontSize: '1em',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 15px rgba(138, 90, 68, 0.3)',
                            width: '100%',
                            justifyContent: 'center'
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
                          <span>👁️</span>
                          Voir les détails
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
                borderRadius: '20px',
                border: '2px dashed #dee2e6'
              }}>
                <div style={{ fontSize: '4em', marginBottom: '20px' }}>🛍️</div>
                <h4 style={{ 
                  color: '#6c757d', 
                  fontSize: '1.5em',
                  margin: '0 0 10px 0',
                  fontWeight: '600'
                }}>
                  Aucun produit trouvé
                </h4>
                <p style={{ 
                  color: '#6c757d', 
                  fontSize: '1.1em',
                  margin: 0
                }}>
                  Aucun produit ne correspond aux filtres sélectionnés.
                </p>
              </div>
            )}
            
            {/* Contrôles de pagination pour les produits */}
            {activeTab === 'products' && totalPages > 1 && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '10px',
                marginTop: '40px',
                marginBottom: '20px'
              }}>
                {/* Bouton Précédent */}
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '25px',
                    border: 'none',
                    background: currentPage === 1 ? '#e0e0e0' : 'linear-gradient(45deg, #8a5a44, #a67c5a)',
                    color: currentPage === 1 ? '#999' : '#fff',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    fontSize: '1em',
                    fontWeight: 600,
                    boxShadow: currentPage === 1 ? 'none' : '0 4px 15px rgba(138, 90, 68, 0.3)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  ← Précédent
                </button>

                {/* Numéros de pages */}
                <div style={{ display: 'flex', gap: '5px' }}>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => (
                    <button
                      key={pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
                      style={{
                        width: '45px',
                        height: '45px',
                        borderRadius: '50%',
                        border: 'none',
                        background: currentPage === pageNumber 
                          ? 'linear-gradient(45deg, #8a5a44, #a67c5a)' 
                          : '#fff',
                        color: currentPage === pageNumber ? '#fff' : '#8a5a44',
                        cursor: 'pointer',
                        fontSize: '1em',
                        fontWeight: 600,
                        boxShadow: currentPage === pageNumber 
                          ? '0 4px 15px rgba(138, 90, 68, 0.3)' 
                          : '0 2px 8px rgba(0,0,0,0.1)',
                        transition: 'all 0.3s ease',
                        border: currentPage === pageNumber ? 'none' : '2px solid #8a5a44'
                      }}
                      onMouseEnter={(e) => {
                        if (currentPage !== pageNumber) {
                          e.target.style.background = 'linear-gradient(45deg, #8a5a44, #a67c5a)';
                          e.target.style.color = '#fff';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (currentPage !== pageNumber) {
                          e.target.style.background = '#fff';
                          e.target.style.color = '#8a5a44';
                        }
                      }}
                    >
                      {pageNumber}
                    </button>
                  ))}
                </div>

                {/* Bouton Suivant */}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '25px',
                    border: 'none',
                    background: currentPage === totalPages ? '#e0e0e0' : 'linear-gradient(45deg, #8a5a44, #a67c5a)',
                    color: currentPage === totalPages ? '#999' : '#fff',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    fontSize: '1em',
                    fontWeight: 600,
                    boxShadow: currentPage === totalPages ? 'none' : '0 4px 15px rgba(138, 90, 68, 0.3)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Suivant →
                </button>
              </div>
            )}

            {/* Informations de pagination pour les produits */}
            {activeTab === 'products' && totalProducts > 0 && (
              <div style={{
                textAlign: 'center',
                color: '#8a5a44',
                fontSize: '0.9em',
                marginBottom: '20px'
              }}>
                Affichage de {indexOfFirstItem + 1} à {Math.min(indexOfLastItem, totalProducts)} sur {totalProducts} produits
              </div>
            )}
          </div>
        )}

        {/* ===== Workshops Section ===== */}
        {activeTab === 'workshops' && (
          <div style={{
            background: '#fff',
            borderRadius: '20px',
            padding: '40px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            border: '1px solid rgba(138, 90, 68, 0.1)'
          }}>
            <h3 style={{
              fontSize: '2.2em',
              color: '#8a5a44',
              textAlign: 'center',
              marginBottom: '40px',
              fontWeight: 700,
              textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
            }}>
              🛠️ Ateliers ({totalWorkshops})
            </h3>
            
          {currentWorkshops.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                gap: '35px'
              }}>
                {currentWorkshops.map((w) => (
                  <div key={w._id} className="card-hover" style={{
                    background: 'linear-gradient(135deg, #fff, #f8f9fa)',
                    borderRadius: '20px',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                    overflow: 'hidden',
                    border: '1px solid #e9ecef',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%'
                  }}>
                    {/* Workshop Image */}
                    <div style={{ position: 'relative', height: '250px', overflow: 'hidden' }}>
                      {imageUrls[w._id] ? (
                  <img
                    src={imageUrls[w._id]}
                    alt={w.title}
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover',
                            transition: 'transform 0.3s ease'
                          }}
                          onError={(e) => { 
                            e.target.style.display = 'none'; 
                            console.log('Image load failed for workshop ID:', w._id); 
                          }}
                        />
                      ) : (
                        <div style={{
                          width: '100%',
                          height: '100%',
                          background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '3em',
                          color: '#fff'
                        }}>
                          🛠️
                        </div>
                      )}
                      {/* Price Badge */}
                      <div style={{
                        position: 'absolute',
                        top: '15px',
                        right: '15px',
                        background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
                        color: '#fff',
                        padding: '8px 12px',
                        borderRadius: '20px',
                        fontSize: '1em',
                        fontWeight: '700',
                        boxShadow: '0 4px 15px rgba(255, 107, 107, 0.3)'
                      }}>
                        {w.price || 'N/A'} €
                      </div>
                      {/* Date Badge */}
                      <div style={{
                        position: 'absolute',
                        top: '15px',
                        left: '15px',
                        background: 'rgba(0,0,0,0.7)',
                        color: '#fff',
                        padding: '6px 10px',
                        borderRadius: '15px',
                        fontSize: '0.8em',
                        fontWeight: '600',
                        backdropFilter: 'blur(10px)'
                      }}>
                        📅 {new Date(w.date).toLocaleDateString()}
                      </div>
                    </div>
                    
                    {/* Workshop Info */}
                    <div style={{ 
                      padding: '25px', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      flex: 1,
                      justifyContent: 'space-between'
                    }}>
                      <div>
                        <h4 style={{
                          fontSize: '1.4em',
                          fontWeight: '700',
                          color: '#2c3e50',
                          margin: '0 0 15px 0',
                          lineHeight: '1.3',
                          minHeight: '2.6em',
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                          {w.title}
                        </h4>
                        
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '15px',
                          padding: '10px',
                          background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
                          borderRadius: '10px'
                        }}>
                          <span style={{ fontSize: '1.2em' }}>👤</span>
                          <span style={{ fontSize: '0.9em', color: '#6c757d', fontWeight: '500' }}>
                  Par{' '}
                  {w.artisanId && w.artisanId._id ? (
                              <Link to={`/admin-artisan-profile/${w.artisanId._id}`} style={{ 
                                color: '#8a5a44', 
                                textDecoration: 'none', 
                                fontWeight: '600',
                                transition: 'color 0.3s ease'
                              }} onMouseOver={(e) => e.target.style.color = '#d4a373'} onMouseOut={(e) => e.target.style.color = '#8a5a44'}>
                      {w.artisanId.prenom} {w.artisanId.nom}
                    </Link>
                  ) : (
                              <span style={{ color: '#dc3545', fontStyle: 'italic' }}>Artisan inconnu</span>
                            )}
                          </span>
                        </div>
                        
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '15px',
                          padding: '10px',
                          background: 'linear-gradient(135deg, #e8f5e8, #c8e6c9)',
                          borderRadius: '10px'
                        }}>
                          <span style={{ fontSize: '1.2em' }}>📍</span>
                          <span style={{ fontSize: '0.9em', color: '#2e7d32', fontWeight: '500' }}>
                  {isGoogleMapsLink(w.location) ? (
                              <a href={w.location} target="_blank" rel="noopener noreferrer" style={{ 
                                color: '#2e7d32', 
                                textDecoration: 'none',
                                transition: 'color 0.3s ease'
                              }} onMouseOver={(e) => e.target.style.color = '#1b5e20'} onMouseOut={(e) => e.target.style.color = '#2e7d32'}>
                                📍 Voir sur la carte
                    </a>
                  ) : (
                    w.location
                  )}
                          </span>
                        </div>
                        
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '20px',
                          padding: '10px',
                          background: 'linear-gradient(135deg, #fff3e0, #ffe0b2)',
                          borderRadius: '10px'
                        }}>
                          <span style={{ fontSize: '1.2em' }}>📂</span>
                          <span style={{ fontSize: '0.9em', color: '#ef6c00', fontWeight: '500' }}>
                            {w.category}
                          </span>
                        </div>
                      </div>
                      
                      {/* Button positioned at bottom */}
                      <div style={{ marginTop: 'auto' }}>
                        <Link 
                          to={`/admin-workshop-details/${w._id}`} 
                          style={{ 
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '12px 20px',
                            background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
                            color: '#fff',
                            textDecoration: 'none',
                            borderRadius: '12px',
                            fontWeight: '600',
                            fontSize: '1em',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 15px rgba(138, 90, 68, 0.3)',
                            width: '100%',
                            justifyContent: 'center'
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
                          <span>👁️</span>
                          Voir les détails
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
                borderRadius: '20px',
                border: '2px dashed #dee2e6'
              }}>
                <div style={{ fontSize: '4em', marginBottom: '20px' }}>🛠️</div>
                <h4 style={{ 
                  color: '#6c757d', 
                  fontSize: '1.5em',
                  margin: '0 0 10px 0',
                  fontWeight: '600'
                }}>
                  Aucun atelier trouvé
                </h4>
                <p style={{ 
                  color: '#6c757d', 
                  fontSize: '1.1em',
                  margin: 0
                }}>
                  Aucun atelier ne correspond aux filtres sélectionnés.
                </p>
              </div>
            )}
            
            {/* Contrôles de pagination pour les ateliers */}
            {activeTab === 'workshops' && totalPages > 1 && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '10px',
                marginTop: '40px',
                marginBottom: '20px'
              }}>
                {/* Bouton Précédent */}
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '25px',
                    border: 'none',
                    background: currentPage === 1 ? '#e0e0e0' : 'linear-gradient(45deg, #8a5a44, #a67c5a)',
                    color: currentPage === 1 ? '#999' : '#fff',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    fontSize: '1em',
                    fontWeight: 600,
                    boxShadow: currentPage === 1 ? 'none' : '0 4px 15px rgba(138, 90, 68, 0.3)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  ← Précédent
                </button>

                {/* Numéros de pages */}
                <div style={{ display: 'flex', gap: '5px' }}>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => (
                    <button
                      key={pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
                      style={{
                        width: '45px',
                        height: '45px',
                        borderRadius: '50%',
                        border: 'none',
                        background: currentPage === pageNumber 
                          ? 'linear-gradient(45deg, #8a5a44, #a67c5a)' 
                          : '#fff',
                        color: currentPage === pageNumber ? '#fff' : '#8a5a44',
                        cursor: 'pointer',
                        fontSize: '1em',
                        fontWeight: 600,
                        boxShadow: currentPage === pageNumber 
                          ? '0 4px 15px rgba(138, 90, 68, 0.3)' 
                          : '0 2px 8px rgba(0,0,0,0.1)',
                        transition: 'all 0.3s ease',
                        border: currentPage === pageNumber ? 'none' : '2px solid #8a5a44'
                      }}
                      onMouseEnter={(e) => {
                        if (currentPage !== pageNumber) {
                          e.target.style.background = 'linear-gradient(45deg, #8a5a44, #a67c5a)';
                          e.target.style.color = '#fff';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (currentPage !== pageNumber) {
                          e.target.style.background = '#fff';
                          e.target.style.color = '#8a5a44';
                        }
                      }}
                    >
                      {pageNumber}
                    </button>
                  ))}
                </div>

                {/* Bouton Suivant */}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '25px',
                    border: 'none',
                    background: currentPage === totalPages ? '#e0e0e0' : 'linear-gradient(45deg, #8a5a44, #a67c5a)',
                    color: currentPage === totalPages ? '#999' : '#fff',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    fontSize: '1em',
                    fontWeight: 600,
                    boxShadow: currentPage === totalPages ? 'none' : '0 4px 15px rgba(138, 90, 68, 0.3)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Suivant →
                </button>
              </div>
            )}

            {/* Informations de pagination pour les ateliers */}
            {activeTab === 'workshops' && totalWorkshops > 0 && (
              <div style={{
                textAlign: 'center',
                color: '#8a5a44',
                fontSize: '0.9em',
                marginBottom: '20px'
              }}>
                Affichage de {indexOfFirstItem + 1} à {Math.min(indexOfLastItem, totalWorkshops)} sur {totalWorkshops} ateliers
              </div>
            )}
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
    </div>
  );
}

export default AdminHome;