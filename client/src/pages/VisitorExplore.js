import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getPublicProducts, getPublicWorkshops, getPublicProductImage, getPublicWorkshopImage } from '../services/api';

function VisitorExplore() {
  const [products, setProducts] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products');
  const [searchTerm, setSearchTerm] = useState('');
  const [priceFilter, setPriceFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [imageUrls, setImageUrls] = useState({});
  const [workshopImageUrls, setWorkshopImageUrls] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('login'); // 'login' or 'register'
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
    
    // Cleanup function to revoke object URLs
    return () => {
      Object.values(imageUrls).forEach(url => URL.revokeObjectURL(url));
      Object.values(workshopImageUrls).forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsResponse, workshopsResponse] = await Promise.all([
        getPublicProducts(),
        getPublicWorkshops()
      ]);
      
      setProducts(productsResponse.data || []);
      setWorkshops(workshopsResponse.data || []);
      
      // Load images for products
      const productImageUrls = {};
      for (const product of productsResponse.data || []) {
        if (product.images && product.images.length > 0) {
          try {
            const response = await getPublicProductImage(product._id, 0);
            productImageUrls[product._id] = URL.createObjectURL(response.data);
          } catch (err) {
            console.error('Failed to fetch image for product ID:', product._id, err);
          }
        }
      }
      setImageUrls(productImageUrls);
      
      // Load images for workshops
      const workshopImageUrls = {};
      for (const workshop of workshopsResponse.data || []) {
        if (workshop.images && workshop.images.length > 0) {
          try {
            const response = await getPublicWorkshopImage(workshop._id, 0);
            workshopImageUrls[workshop._id] = URL.createObjectURL(response.data);
          } catch (err) {
            console.error('Failed to fetch image for workshop ID:', workshop._id, err);
          }
        }
      }
      setWorkshopImageUrls(workshopImageUrls);
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    const matchesPrice = priceFilter === 'all' || 
      (priceFilter === '0-50' && product.price <= 50) ||
      (priceFilter === '50-100' && product.price > 50 && product.price <= 100) ||
      (priceFilter === '100+' && product.price > 100);
    
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const filteredWorkshops = workshops.filter(workshop => {
    const matchesSearch = workshop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workshop.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPrice = priceFilter === 'all' || 
      (priceFilter === '0-50' && workshop.price <= 50) ||
      (priceFilter === '50-100' && workshop.price > 50 && workshop.price <= 100) ||
      (priceFilter === '100+' && workshop.price > 100);
    
    return matchesSearch && matchesPrice;
  });

  const handleLoginPrompt = (itemType = 'cet élément') => {
    setModalType('login');
    setModalTitle('🔐 Connexion requise');
    setModalMessage(`Pour acheter ${itemType}, vous devez vous connecter à votre compte.`);
    setShowModal(true);
  };

  const handleRegisterPrompt = (itemType = 'cet élément') => {
    setModalType('register');
    setModalTitle('✨ Créer un compte');
    setModalMessage(`Pour acheter ${itemType}, créez votre compte gratuitement en quelques secondes.`);
    setShowModal(true);
  };

  const handleModalConfirm = () => {
    setShowModal(false);
    if (modalType === 'login') {
      navigate('/login');
    } else {
      navigate('/register');
    }
  };

  const handleModalCancel = () => {
    setShowModal(false);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#fafafa'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '40px',
          backgroundColor: '#fff',
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
          <p style={{ color: '#8a5a44', fontSize: '1.1em', fontWeight: '600' }}>
            Chargement des créations...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif',
      backgroundColor: '#fafafa',
      minHeight: '100vh',
      padding: '0',
      margin: '0'
    }}>
      {/* ===== Header ===== */}
      <header style={{
        background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
        color: '#fff',
        padding: '20px 0',
        position: 'sticky',
        top: '0',
        zIndex: '100',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Link to="/" style={{
              fontSize: '1.8em',
              fontWeight: '800',
              color: '#fff',
              textDecoration: 'none'
            }}>
              🎨 CraftHub
            </Link>
            <div style={{
              padding: '6px 12px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: '20px',
              fontSize: '0.9em',
              fontWeight: '600'
            }}>
              Mode Visiteur
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '15px' }}>
            <Link to="/login" style={{
              padding: '10px 20px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: '25px',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              border: '1px solid rgba(255,255,255,0.3)'
            }} onMouseOver={e => {
              e.target.style.backgroundColor = 'rgba(255,255,255,0.3)';
            }} onMouseOut={e => {
              e.target.style.backgroundColor = 'rgba(255,255,255,0.2)';
            }}>
              Se connecter
            </Link>
            <Link to="/register" style={{
              padding: '10px 20px',
              backgroundColor: '#fff',
              color: '#8a5a44',
              textDecoration: 'none',
              borderRadius: '25px',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }} onMouseOver={e => {
              e.target.style.backgroundColor = '#f8f9fa';
              e.target.style.transform = 'translateY(-2px)';
            }} onMouseOut={e => {
              e.target.style.backgroundColor = '#fff';
              e.target.style.transform = 'translateY(0)';
            }}>
              S'inscrire
            </Link>
          </div>
        </div>
      </header>

      {/* ===== Hero Section ===== */}
      <section style={{
        background: 'linear-gradient(135deg, #f8f1e9, #faf3e9)',
        padding: '60px 20px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: '800',
            color: '#2c3e50',
            marginBottom: '20px',
            letterSpacing: '-0.02em'
          }}>
            Découvrez nos créations
          </h1>
          <p style={{
            fontSize: '1.2em',
            color: '#5a6c7d',
            marginBottom: '30px',
            lineHeight: '1.6'
          }}>
            Explorez notre collection d'objets artisanaux et d'ateliers. 
            <br />
            <strong style={{ color: '#8a5a44' }}>Connectez-vous pour acheter ou réserver</strong>
          </p>
          
          <div style={{
            display: 'flex',
            gap: '20px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginTop: '30px'
          }}>
            <button onClick={() => handleLoginPrompt('nos créations')} style={{
              padding: '12px 24px',
              backgroundColor: '#8a5a44',
              color: '#fff',
              border: 'none',
              borderRadius: '25px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontSize: '1rem'
            }} onMouseOver={e => {
              e.target.style.backgroundColor = '#704838';
              e.target.style.transform = 'translateY(-2px)';
            }} onMouseOut={e => {
              e.target.style.backgroundColor = '#8a5a44';
              e.target.style.transform = 'translateY(0)';
            }}>
              🔐 Se connecter pour acheter
            </button>
            
            <button onClick={() => handleRegisterPrompt('nos créations')} style={{
              padding: '12px 24px',
              backgroundColor: 'rgba(138, 90, 68, 0.1)',
              color: '#8a5a44',
              border: '2px solid #8a5a44',
              borderRadius: '25px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontSize: '1rem'
            }} onMouseOver={e => {
              e.target.style.backgroundColor = 'rgba(138, 90, 68, 0.2)';
              e.target.style.transform = 'translateY(-2px)';
            }} onMouseOut={e => {
              e.target.style.backgroundColor = 'rgba(138, 90, 68, 0.1)';
              e.target.style.transform = 'translateY(0)';
            }}>
              ✨ Créer un compte
            </button>
          </div>
        </div>
      </section>

      {/* ===== Filters and Tabs ===== */}
      <section style={{
        backgroundColor: '#fff',
        padding: '30px 20px',
        borderBottom: '1px solid #e9ecef'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Tabs */}
          <div style={{
            display: 'flex',
            gap: '10px',
            marginBottom: '30px',
            justifyContent: 'center'
          }}>
            <button
              onClick={() => setActiveTab('products')}
              style={{
                padding: '12px 24px',
                backgroundColor: activeTab === 'products' ? '#8a5a44' : 'transparent',
                color: activeTab === 'products' ? '#fff' : '#8a5a44',
                border: '2px solid #8a5a44',
                borderRadius: '25px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              🛍️ Produits ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('workshops')}
              style={{
                padding: '12px 24px',
                backgroundColor: activeTab === 'workshops' ? '#8a5a44' : 'transparent',
                color: activeTab === 'workshops' ? '#fff' : '#8a5a44',
                border: '2px solid #8a5a44',
                borderRadius: '25px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              🎨 Ateliers ({workshops.length})
            </button>
          </div>

          {/* Search and Filters */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            alignItems: 'end'
          }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#2c3e50'
              }}>
                Rechercher
              </label>
              <input
                type="text"
                placeholder="Rechercher des créations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e9ecef',
                  borderRadius: '10px',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.3s ease'
                }}
                onFocus={e => e.target.style.borderColor = '#8a5a44'}
                onBlur={e => e.target.style.borderColor = '#e9ecef'}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#2c3e50'
              }}>
                Prix
              </label>
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e9ecef',
                  borderRadius: '10px',
                  fontSize: '1rem',
                  outline: 'none',
                  backgroundColor: '#fff',
                  cursor: 'pointer'
                }}
              >
                <option value="all">Tous les prix</option>
                <option value="0-50">0 - 50 €</option>
                <option value="50-100">50 - 100 €</option>
                <option value="100+">100+ €</option>
              </select>
            </div>

            {activeTab === 'products' && (
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#2c3e50'
                }}>
                  Catégorie
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e9ecef',
                    borderRadius: '10px',
                    fontSize: '1rem',
                    outline: 'none',
                    backgroundColor: '#fff',
                    cursor: 'pointer'
                  }}
                >
                  <option value="all">Toutes les catégories</option>
                  <option value="ceramique">Céramique</option>
                  <option value="textile">Textile</option>
                  <option value="bois">Bois</option>
                  <option value="metal">Métal</option>
                  <option value="verre">Verre</option>
                  <option value="cuir">Cuir</option>
                </select>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ===== Content ===== */}
      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 20px'
      }}>
        {activeTab === 'products' ? (
          <div>
            <h2 style={{
              fontSize: '1.8em',
              fontWeight: '700',
              color: '#2c3e50',
              marginBottom: '30px',
              textAlign: 'center'
            }}>
              Nos Produits Artisanaux
            </h2>
            
            {filteredProducts.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                backgroundColor: '#fff',
                borderRadius: '20px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🔍</div>
                <h3 style={{ color: '#8a5a44', marginBottom: '10px' }}>
                  Aucun produit trouvé
                </h3>
                <p style={{ color: '#5a6c7d' }}>
                  Essayez de modifier vos critères de recherche
                </p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '30px'
              }}>
                {filteredProducts.map(product => (
                  <div key={product._id} style={{
                    backgroundColor: '#fff',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease',
                    border: '1px solid #e9ecef'
                  }} onMouseOver={e => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
                  }} onMouseOut={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
                  }}>
                    <div style={{ position: 'relative' }}>
                      <img
                        src={imageUrls[product._id] || 'https://placehold.co/400x300'}
                        alt={product.name}
                        style={{
                          width: '100%',
                          height: '250px',
                          objectFit: 'cover'
                        }}
                        onError={(e) => {
                          e.target.src = 'https://placehold.co/400x300';
                        }}
                      />
                      <div style={{
                        position: 'absolute',
                        top: '15px',
                        right: '15px',
                        backgroundColor: 'rgba(138, 90, 68, 0.9)',
                        color: '#fff',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '0.9em',
                        fontWeight: '600'
                      }}>
                        {product.price} €
                      </div>
                    </div>
                    
                    <div style={{ padding: '20px' }}>
                      <h3 style={{
                        fontSize: '1.3em',
                        fontWeight: '700',
                        color: '#2c3e50',
                        marginBottom: '10px',
                        lineHeight: '1.3'
                      }}>
                        {product.name}
                      </h3>
                      
                      <p style={{
                        color: '#5a6c7d',
                        fontSize: '0.95em',
                        lineHeight: '1.5',
                        marginBottom: '15px',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {product.description}
                      </p>
                      
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '20px'
                      }}>
                        <span style={{
                          backgroundColor: 'rgba(138, 90, 68, 0.1)',
                          color: '#8a5a44',
                          padding: '4px 12px',
                          borderRadius: '15px',
                          fontSize: '0.9em',
                          fontWeight: '600'
                        }}>
                          {product.category}
                        </span>
                        <span style={{
                          color: '#5a6c7d',
                          fontSize: '0.9em'
                        }}>
                          Stock: {product.stock}
                        </span>
                      </div>
                      
                      <button
                        onClick={() => handleLoginPrompt(`"${product.name}"`)}
                        style={{
                          width: '100%',
                          padding: '12px',
                          backgroundColor: '#8a5a44',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '10px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          fontSize: '1rem'
                        }} onMouseOver={e => {
                          e.target.style.backgroundColor = '#704838';
                          e.target.style.transform = 'translateY(-2px)';
                        }} onMouseOut={e => {
                          e.target.style.backgroundColor = '#8a5a44';
                          e.target.style.transform = 'translateY(0)';
                        }}
                      >
                        🔐 Se connecter pour acheter
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <h2 style={{
              fontSize: '1.8em',
              fontWeight: '700',
              color: '#2c3e50',
              marginBottom: '30px',
              textAlign: 'center'
            }}>
              Nos Ateliers
            </h2>
            
            {filteredWorkshops.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                backgroundColor: '#fff',
                borderRadius: '20px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🔍</div>
                <h3 style={{ color: '#8a5a44', marginBottom: '10px' }}>
                  Aucun atelier trouvé
                </h3>
                <p style={{ color: '#5a6c7d' }}>
                  Essayez de modifier vos critères de recherche
                </p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                gap: '30px'
              }}>
                {filteredWorkshops.map(workshop => (
                  <div key={workshop._id} style={{
                    backgroundColor: '#fff',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease',
                    border: '1px solid #e9ecef'
                  }} onMouseOver={e => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
                  }} onMouseOut={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
                  }}>
                    <div style={{ position: 'relative' }}>
                      <img
                        src={workshopImageUrls[workshop._id] || 'https://placehold.co/400x250'}
                        alt={workshop.title}
                        style={{
                          width: '100%',
                          height: '200px',
                          objectFit: 'cover'
                        }}
                        onError={(e) => {
                          e.target.src = 'https://placehold.co/400x250';
                        }}
                      />
                      <div style={{
                        position: 'absolute',
                        top: '15px',
                        right: '15px',
                        backgroundColor: 'rgba(138, 90, 68, 0.9)',
                        color: '#fff',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '0.9em',
                        fontWeight: '600'
                      }}>
                        {workshop.price} €
                      </div>
                    </div>
                    
                    <div style={{ padding: '20px' }}>
                      <h3 style={{
                        fontSize: '1.3em',
                        fontWeight: '700',
                        color: '#2c3e50',
                        marginBottom: '10px',
                        lineHeight: '1.3'
                      }}>
                        {workshop.title}
                      </h3>
                      
                      <p style={{
                        color: '#5a6c7d',
                        fontSize: '0.95em',
                        lineHeight: '1.5',
                        marginBottom: '15px',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {workshop.description}
                      </p>
                      
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '20px',
                        flexWrap: 'wrap',
                        gap: '10px'
                      }}>
                        <span style={{
                          backgroundColor: 'rgba(138, 90, 68, 0.1)',
                          color: '#8a5a44',
                          padding: '4px 12px',
                          borderRadius: '15px',
                          fontSize: '0.9em',
                          fontWeight: '600'
                        }}>
                          📅 {new Date(workshop.date).toLocaleDateString('fr-FR')}
                        </span>
                        <span style={{
                          color: '#5a6c7d',
                          fontSize: '0.9em'
                        }}>
                          👥 {workshop.places} places
                        </span>
                      </div>
                      
                      <button
                        onClick={() => handleLoginPrompt(`l'atelier "${workshop.title}"`)}
                        style={{
                          width: '100%',
                          padding: '12px',
                          backgroundColor: '#8a5a44',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '10px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          fontSize: '1rem'
                        }} onMouseOver={e => {
                          e.target.style.backgroundColor = '#704838';
                          e.target.style.transform = 'translateY(-2px)';
                        }} onMouseOut={e => {
                          e.target.style.backgroundColor = '#8a5a44';
                          e.target.style.transform = 'translateY(0)';
                        }}
                      >
                        🔐 Se connecter pour réserver
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ===== Call to Action ===== */}
      <section style={{
        background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
        color: '#fff',
        padding: '60px 20px',
        textAlign: 'center',
        marginTop: '60px'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '2.5em',
            fontWeight: '800',
            marginBottom: '20px',
            letterSpacing: '-0.02em'
          }}>
            Prêt à commencer ?
          </h2>
          <p style={{
            fontSize: '1.2em',
            marginBottom: '30px',
            opacity: '0.9'
          }}>
            Créez votre compte gratuitement et accédez à toutes les fonctionnalités
          </p>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" style={{
              padding: '15px 30px',
              backgroundColor: '#fff',
              color: '#8a5a44',
              textDecoration: 'none',
              borderRadius: '30px',
              fontWeight: '700',
              transition: 'all 0.3s ease',
              fontSize: '1.1rem'
            }} onMouseOver={e => {
              e.target.style.backgroundColor = '#f8f9fa';
              e.target.style.transform = 'translateY(-3px)';
            }} onMouseOut={e => {
              e.target.style.backgroundColor = '#fff';
              e.target.style.transform = 'translateY(0)';
            }}>
              ✨ Créer un compte
            </Link>
            <Link to="/login" style={{
              padding: '15px 30px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: '30px',
              fontWeight: '700',
              transition: 'all 0.3s ease',
              fontSize: '1.1rem',
              border: '2px solid rgba(255,255,255,0.3)'
            }} onMouseOver={e => {
              e.target.style.backgroundColor = 'rgba(255,255,255,0.3)';
              e.target.style.transform = 'translateY(-3px)';
            }} onMouseOut={e => {
              e.target.style.backgroundColor = 'rgba(255,255,255,0.2)';
              e.target.style.transform = 'translateY(0)';
            }}>
              🔐 Se connecter
            </Link>
          </div>
        </div>
      </section>

      {/* ===== Modern Modal ===== */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(5px)',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '20px',
            padding: '40px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
            position: 'relative',
            animation: 'slideInUp 0.3s ease-out',
            border: '1px solid rgba(138, 90, 68, 0.1)'
          }}>
            {/* Close Button */}
            <button
              onClick={handleModalCancel}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#999',
                padding: '5px',
                borderRadius: '50%',
                width: '35px',
                height: '35px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={e => {
                e.target.style.backgroundColor = '#f5f5f5';
                e.target.style.color = '#666';
              }}
              onMouseOut={e => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = '#999';
              }}
            >
              ×
            </button>

            {/* Modal Content */}
            <div style={{ textAlign: 'center' }}>
              {/* Icon */}
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: modalType === 'login' 
                  ? 'linear-gradient(135deg, #8a5a44, #d4a373)'
                  : 'linear-gradient(135deg, #667eea, #764ba2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 25px',
                fontSize: '2.5rem',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)'
              }}>
                {modalType === 'login' ? '🔐' : '✨'}
              </div>

              {/* Title */}
              <h2 style={{
                fontSize: '1.8em',
                fontWeight: '800',
                color: '#2c3e50',
                marginBottom: '15px',
                letterSpacing: '-0.02em'
              }}>
                {modalTitle}
              </h2>

              {/* Message */}
              <p style={{
                fontSize: '1.1em',
                color: '#5a6c7d',
                lineHeight: '1.6',
                marginBottom: '35px',
                maxWidth: '400px',
                margin: '0 auto 35px'
              }}>
                {modalMessage}
              </p>

              {/* Benefits */}
              <div style={{
                backgroundColor: 'rgba(138, 90, 68, 0.05)',
                borderRadius: '15px',
                padding: '20px',
                marginBottom: '35px',
                border: '1px solid rgba(138, 90, 68, 0.1)'
              }}>
                <h3 style={{
                  fontSize: '1.1em',
                  fontWeight: '700',
                  color: '#8a5a44',
                  marginBottom: '15px'
                }}>
                  {modalType === 'login' ? 'Avantages de la connexion :' : 'Avantages de l\'inscription :'}
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '10px',
                  textAlign: 'left'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#8a5a44', fontSize: '1.2em' }}>🛍️</span>
                    <span style={{ fontSize: '0.95em', color: '#5a6c7d' }}>
                      {modalType === 'login' ? 'Acheter des produits' : 'Acheter des produits'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#8a5a44', fontSize: '1.2em' }}>🎨</span>
                    <span style={{ fontSize: '0.95em', color: '#5a6c7d' }}>
                      {modalType === 'login' ? 'Réserver des ateliers' : 'Réserver des ateliers'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#8a5a44', fontSize: '1.2em' }}>❤️</span>
                    <span style={{ fontSize: '0.95em', color: '#5a6c7d' }}>
                      {modalType === 'login' ? 'Gérer vos favoris' : 'Sauvegarder vos favoris'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#8a5a44', fontSize: '1.2em' }}>📱</span>
                    <span style={{ fontSize: '0.95em', color: '#5a6c7d' }}>
                      {modalType === 'login' ? 'Suivre vos commandes' : 'Suivre vos commandes'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                gap: '15px',
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={handleModalConfirm}
                  style={{
                    padding: '15px 30px',
                    backgroundColor: modalType === 'login' ? '#8a5a44' : '#667eea',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '25px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontSize: '1.1rem',
                    minWidth: '160px',
                    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)'
                  }}
                  onMouseOver={e => {
                    e.target.style.backgroundColor = modalType === 'login' ? '#704838' : '#5a6fd8';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 12px 25px rgba(0, 0, 0, 0.2)';
                  }}
                  onMouseOut={e => {
                    e.target.style.backgroundColor = modalType === 'login' ? '#8a5a44' : '#667eea';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.15)';
                  }}
                >
                  {modalType === 'login' ? '🔐 Se connecter' : '✨ Créer un compte'}
                </button>

                <button
                  onClick={handleModalCancel}
                  style={{
                    padding: '15px 30px',
                    backgroundColor: 'transparent',
                    color: '#5a6c7d',
                    border: '2px solid #e9ecef',
                    borderRadius: '25px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontSize: '1.1rem',
                    minWidth: '160px'
                  }}
                  onMouseOver={e => {
                    e.target.style.backgroundColor = '#f8f9fa';
                    e.target.style.borderColor = '#8a5a44';
                    e.target.style.color = '#8a5a44';
                  }}
                  onMouseOut={e => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.borderColor = '#e9ecef';
                    e.target.style.color = '#5a6c7d';
                  }}
                >
                  Annuler
                </button>
              </div>

              {/* Alternative Action */}
              <div style={{
                marginTop: '25px',
                padding: '15px',
                backgroundColor: 'rgba(102, 126, 234, 0.05)',
                borderRadius: '10px',
                border: '1px solid rgba(102, 126, 234, 0.1)'
              }}>
                <p style={{
                  fontSize: '0.95em',
                  color: '#5a6c7d',
                  margin: '0 0 10px 0'
                }}>
                  {modalType === 'login' ? 'Pas encore de compte ?' : 'Déjà un compte ?'}
                </p>
                <button
                  onClick={() => {
                    setModalType(modalType === 'login' ? 'register' : 'login');
                    setModalTitle(modalType === 'login' ? '✨ Créer un compte' : '🔐 Connexion requise');
                    setModalMessage(modalType === 'login' 
                      ? `Pour acheter ${modalMessage.split(' ').slice(2).join(' ')}, créez votre compte gratuitement en quelques secondes.`
                      : `Pour acheter ${modalMessage.split(' ').slice(2).join(' ')}, vous devez vous connecter à votre compte.`
                    );
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#667eea',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    fontSize: '0.95em',
                    fontWeight: '600',
                    transition: 'color 0.3s ease'
                  }}
                  onMouseOver={e => e.target.style.color = '#5a6fd8'}
                  onMouseOut={e => e.target.style.color = '#667eea'}
                >
                  {modalType === 'login' ? 'Créer un compte' : 'Se connecter'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== CSS Animations ===== */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}

export default VisitorExplore;
