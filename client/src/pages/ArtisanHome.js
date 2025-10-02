import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getPublicProducts, getPublicWorkshops, getPublicProductImage, getPublicWorkshopImage } from '../services/api';
import ArtisanHeader from '../components/ArtisanHeader';
import ArtisanFooter from '../components/ArtisanFooter';

function Home() {
  const [products, setProducts] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const [imageUrls, setImageUrls] = useState({});
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ category: '', minPrice: '', maxPrice: '', region: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [regions, setRegions] = useState([]);
  const [activeTab, setActiveTab] = useState('products');
  const navigate = useNavigate();
  
  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Fonction pour vérifier si un atelier est expiré
  const isWorkshopExpired = (workshopDate) => {
    if (!workshopDate) return false;
    
    try {
      const workshopDateTime = new Date(workshopDate);
      const now = new Date();
      
      // Comparer les dates (ignorer les secondes et millisecondes)
      workshopDateTime.setSeconds(0, 0);
      now.setSeconds(0, 0);
      
      return workshopDateTime < now;
    } catch (error) {
      console.error('Erreur lors de la vérification de la date:', error);
      return false;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, workRes] = await Promise.all([getPublicProducts(), getPublicWorkshops()]);
        const allProducts = prodRes.data || [];
        const allWorkshops = workRes.data || [];
        setProducts(allProducts);
        setWorkshops(allWorkshops);

        // Extraire les catégories uniques à partir de produits et ateliers
        const uniqueCategories = [...new Set([...allProducts.map(p => p.category), ...allWorkshops.map(w => w.category)])].filter(c => c);
        setCategories(['Économique', 'Bio', 'Woodworking', 'Pottery', 'Jewelry', 'Painting', 'Sculpture', ...uniqueCategories]);

        
     

        // Fetch image URLs for products and workshops
        const urls = {};
        for (const p of allProducts) {
          if (p.images && p.images.length > 0) {
            try {
              const response = await getPublicProductImage(p._id, 0);
              urls[p._id] = URL.createObjectURL(response.data);
            } catch (err) {
              console.error('Failed to fetch image for product ID:', p._id, err);
            }
          }
        }
        for (const w of allWorkshops) {
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
      } catch (err) {
        setError('Erreur lors du chargement des données.');
        console.error('Fetch Error:', err);
      }
    };
    fetchData();
  }, []);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      Object.values(imageUrls).forEach(url => URL.revokeObjectURL(url));
    };
  }, [imageUrls]);

  // Filtrer produits et ateliers selon les critères
  const filteredProducts = products.filter(p => {
    const matchesCategory = !filters.category || p.category === filters.category;
    const matchesMinPrice = !filters.minPrice || (p.price >= parseFloat(filters.minPrice));
    const matchesMaxPrice = !filters.maxPrice || (p.price <= parseFloat(filters.maxPrice));
    // Recherche par nom de produit
    const matchesSearch = !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase());
    // Le filtre par région ne s'applique pas aux produits
    return matchesCategory && matchesMinPrice && matchesMaxPrice && matchesSearch;
  });

  const filteredWorkshops = workshops.filter(w => {
    const matchesCategory = !filters.category || w.category === filters.category;
    const matchesMinPrice = !filters.minPrice || (w.price >= parseFloat(filters.minPrice));
    const matchesMaxPrice = !filters.maxPrice || (w.price <= parseFloat(filters.maxPrice));
    // Recherche par nom d'atelier
    const matchesSearch = !searchTerm || w.title.toLowerCase().includes(searchTerm.toLowerCase());
    // Le filtre par région s'applique seulement aux ateliers
    const matchesRegion = !filters.region || filters.region === '' || w.location.toLowerCase().includes(filters.region.toLowerCase());
    return matchesCategory && matchesMinPrice && matchesMaxPrice && matchesRegion && matchesSearch;
  });

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
  }, [activeTab, filters, searchTerm]);

  // Réinitialiser la page courante si elle dépasse le nombre total de pages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  return (
    <div style={{ fontFamily: '"Georgia", serif', color: '#3a2f1a', minHeight: '100vh', backgroundColor: '#f8f1e9', margin: 0, padding: 0 }}>
      <ArtisanHeader />

      {/* Main Content - Pinterest Style Gallery */}
      <div style={{ 
        padding: '40px 20px', 
        maxWidth: '1400px', 
        margin: '50px auto',
        fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif'
      }}>
        {/* Hero Section */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '60px',
          background: 'linear-gradient(135deg, #f8f1e9, #fff)',
          padding: '60px 40px',
          borderRadius: '30px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative elements */}
          <div style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '100px',
            height: '100px',
            background: 'linear-gradient(45deg, #d4a373, #8a5a44)',
            borderRadius: '50%',
            opacity: 0.1
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: '-30px',
            left: '-30px',
            width: '60px',
            height: '60px',
            background: 'linear-gradient(45deg, #8a5a44, #d4a373)',
            borderRadius: '50%',
            opacity: 0.1
          }}></div>
          
          <h1 style={{ 
            fontSize: '3.5em', 
            color: '#8a5a44', 
            marginBottom: '20px',
            fontWeight: 700,
            textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
          }}>
            Galerie Artisanale
          </h1>
          <p style={{ 
            fontSize: '1.3em', 
            color: '#5c4b38', 
            marginBottom: '40px',
            maxWidth: '600px',
            margin: '0 auto 40px',
            lineHeight: '1.6'
          }}>
            Découvrez une collection unique de créations artisanales et d'ateliers exceptionnels
          </p>
          
          {error && (
            <div style={{ 
              color: '#a94442', 
              backgroundColor: '#f8d7da', 
              border: '1px solid #f5c6cb',
              padding: '15px 20px', 
              borderRadius: '15px', 
              textAlign: 'center',
              marginBottom: '30px',
              fontSize: '1em',
              fontWeight: 500,
              boxShadow: '0 4px 15px rgba(169, 68, 66, 0.1)',
              maxWidth: '500px',
              margin: '0 auto 30px'
            }}>
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* Modern Filters */}
        <div style={{ 
          background: '#fff',
          padding: '30px',
          borderRadius: '20px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          marginBottom: '40px',
          border: '1px solid #e8d5c4'
        }}>
          <h3 style={{ 
            color: '#8a5a44', 
            fontSize: '1.5em', 
            marginBottom: '25px',
            fontWeight: 600
          }}>
            🔍 Filtres de recherche
          </h3>
          {/* Champ de recherche */}
          <div style={{
            marginBottom: '25px'
          }}>
            <label style={{ 
              display: 'block',
              marginBottom: '8px',
              color: '#8a5a44',
              fontWeight: 600,
              fontSize: '1em'
            }}>
              🔍 Recherche par nom
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Tapez le nom d'un produit ou d'un atelier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 50px 12px 16px',
                  border: '2px solid rgba(212, 163, 115, 0.3)',
                  borderRadius: '12px',
                  fontSize: '1em',
                  backgroundColor: '#fff',
                  color: '#3a2f1a',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#d4a373';
                  e.target.style.boxShadow = '0 4px 16px rgba(212, 163, 115, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(212, 163, 115, 0.3)';
                  e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                }}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    fontSize: '1.2em',
                    color: '#8a5a44',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '50%',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = 'rgba(138, 90, 68, 0.1)';
                    e.target.style.transform = 'translateY(-50%) scale(1.1)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.transform = 'translateY(-50%) scale(1)';
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '20px',
            alignItems: 'end'
          }}>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                color: '#8a5a44', 
                fontWeight: 600,
                fontSize: '0.9em'
              }}>
                Catégorie
              </label>
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              style={{
                  width: '100%',
                  padding: '12px 15px', 
                  borderRadius: '10px', 
                  border: '2px solid #e8d5c4', 
                  color: '#3a2f1a',
                  fontSize: '1em',
                  backgroundColor: '#faf9f7',
                  outline: 'none',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#8a5a44'}
                onBlur={(e) => e.target.style.borderColor = '#e8d5c4'}
              >
                <option value="">Toutes catégories</option>
                <option value="Produits naturels, biologiques & bien-être">🌿 Nature & Bien-être & Bio</option>
                <option value="Maison, décoration & art de vivre">🏠 Maison & Décoration & art de vivre</option>
                <option value="Mode, accessoires & bijoux">💎 Mode & Bijoux</option>
                <option value="Produits alimentaires artisanaux">🍯 Alimentaire Artisanal</option>
                <option value="Jouets & loisirs créatifs">🎨 Jouets & Créatif</option>
                <option value="Mobilier & artisanat utilitaire">🪑 Mobilier & Utilitaire</option>
                <option value="Arts visuels & artisanat artistique">🎭 Arts Visuels & artisanat artistique</option>
                <option value="Artisanat culturel & traditionnel">🏛️ Culturel & Traditionnel</option>
              </select>
          </div>
            
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                color: '#8a5a44', 
                fontWeight: 600,
                fontSize: '0.9em'
              }}>
                Prix minimum
              </label>
          <input
            type="number"
                placeholder="0"
            value={filters.minPrice}
            onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                style={{ 
                  width: '100%',
                  padding: '12px 15px', 
                  borderRadius: '10px', 
                  border: '2px solid #e8d5c4',
                  fontSize: '1em',
                  backgroundColor: '#faf9f7',
                  outline: 'none',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#8a5a44'}
                onBlur={(e) => e.target.style.borderColor = '#e8d5c4'}
              />
            </div>
            
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                color: '#8a5a44', 
                fontWeight: 600,
                fontSize: '0.9em'
              }}>
                Prix maximum
              </label>
          <input
            type="number"
                placeholder="1000"
            value={filters.maxPrice}
            onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                style={{ 
                  width: '100%',
                  padding: '12px 15px', 
                  borderRadius: '10px', 
                  border: '2px solid #e8d5c4',
                  fontSize: '1em',
                  backgroundColor: '#faf9f7',
                  outline: 'none',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#8a5a44'}
                onBlur={(e) => e.target.style.borderColor = '#e8d5c4'}
              />
            </div>
            
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                color: '#8a5a44', 
                fontWeight: 600,
                fontSize: '0.9em'
              }}>
                Région (Ateliers uniquement)
              </label>
              <select
                value={filters.region}
                onChange={(e) => setFilters({ ...filters, region: e.target.value })}
                style={{ 
                  width: '100%',
                  padding: '12px 15px', 
                  borderRadius: '10px', 
                  border: '2px solid #e8d5c4', 
                  color: '#3a2f1a',
                  fontSize: '1em',
                  backgroundColor: '#faf9f7',
                  outline: 'none',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#8a5a44'}
                onBlur={(e) => e.target.style.borderColor = '#e8d5c4'}
              >
                <option value="">Toutes régions</option>
                <option value="ariana">Ariana</option>
                <option value="béja">Béja</option>
                <option value="ben arous">Ben Arous</option>
                <option value="bizerte">Bizerte</option>
                <option value="gabès">Gabès</option>
                <option value="gafsa">Gafsa</option>
                <option value="jendouba">Jendouba</option>
                <option value="kairouan">Kairouan</option>
                <option value="kasserine">Kasserine</option>
                <option value="kebili">Kebili</option>
                <option value="kef">Kef</option>
                <option value="mahdia">Mahdia</option>
                <option value="manouba">Manouba</option>
                <option value="medenine">Medenine</option>
                <option value="monastir">Monastir</option>
                <option value="nabeul">Nabeul</option>
                <option value="sfax">Sfax</option>
                <option value="sidi bouzid">Sidi Bouzid</option>
                <option value="siliana">Siliana</option>
                <option value="sousse">Sousse</option>
                <option value="tataouine">Tataouine</option>
                <option value="tozeur">Tozeur</option>
                <option value="tunis">Tunis</option>
                <option value="zaghouan">Zaghouan</option>
              </select>
            </div>

            <div>
              <Link
                to="/categories-info"
      style={{
                  display: 'inline-block',
                  padding: '12px 20px',
                  background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
                  color: '#fff',
        borderRadius: '10px',
                  fontWeight: '600',
                  textDecoration: 'none',
                  fontSize: '1em',
                  transition: 'all 0.3s ease',
                  textAlign: 'center',
                  boxShadow: '0 4px 15px rgba(138, 90, 68, 0.3)'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #704838, #c68e5d)';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(138, 90, 68, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #8a5a44, #d4a373)';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(138, 90, 68, 0.3)';
                }}
              >
                📚 En savoir plus
              </Link>
            </div>
          </div>
        </div>

        {/* Compteurs comme dans le profil artisan */}
        <div style={{ 
          display: 'flex', 
          gap: '32px', 
          margin: '20px 0 40px', 
          fontSize: '1.1em', 
          color: '#8a5a44',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            backgroundColor: 'rgba(212, 163, 115, 0.1)',
            borderRadius: '20px',
            border: '1px solid rgba(212, 163, 115, 0.2)'
          }}>
            <span style={{ fontSize: '1.2em' }}>📦</span>
            <span><strong>{totalProducts}</strong> produits</span>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            backgroundColor: 'rgba(212, 163, 115, 0.1)',
            borderRadius: '20px',
            border: '1px solid rgba(212, 163, 115, 0.2)'
          }}>
            <span style={{ fontSize: '1.2em' }}>🎨</span>
            <span><strong>{totalWorkshops}</strong> ateliers</span>
          </div>
        </div>

        {/* Navigation par onglets comme dans le profil artisan */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '0',
            backgroundColor: '#fff',
            borderRadius: '16px',
            padding: '8px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            border: '1px solid rgba(212, 163, 115, 0.2)',
            maxWidth: '400px',
            margin: '0 auto 40px'
          }}
        >
          <button
            onClick={() => setActiveTab('products')}
            style={{
              background: activeTab === 'products' ? '#d4a373' : 'transparent',
              border: 'none',
              fontSize: '16px',
              fontWeight: activeTab === 'products' ? 600 : 500,
              color: activeTab === 'products' ? '#fff' : '#8a5a44',
              padding: '12px 32px',
              cursor: 'pointer',
              borderRadius: '12px',
              transition: 'all 0.3s ease',
              flex: 1
            }}
            onMouseOver={(e) => {
              if (activeTab !== 'products') {
                e.currentTarget.style.backgroundColor = 'rgba(212, 163, 115, 0.1)';
              }
            }}
            onMouseOut={(e) => {
              if (activeTab !== 'products') {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
            aria-label="Afficher les produits"
          >
            📦 Produits
          </button>

          <button
            onClick={() => setActiveTab('workshops')}
            style={{
              background: activeTab === 'workshops' ? '#d4a373' : 'transparent',
              border: 'none',
              fontSize: '16px',
              fontWeight: activeTab === 'workshops' ? 600 : 500,
              color: activeTab === 'workshops' ? '#fff' : '#8a5a44',
              padding: '12px 32px',
              cursor: 'pointer',
              borderRadius: '12px',
              transition: 'all 0.3s ease',
              flex: 1
            }}
            onMouseOver={(e) => {
              if (activeTab !== 'workshops') {
                e.currentTarget.style.backgroundColor = 'rgba(212, 163, 115, 0.1)';
              }
            }}
            onMouseOut={(e) => {
              if (activeTab !== 'workshops') {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
            aria-label="Afficher les ateliers"
          >
            🎨 Ateliers
          </button>
        </div>

        {/* Contenu des onglets */}
        <section style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 30px'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '24px',
            marginBottom: '40px'
          }}>
            {activeTab === 'products' && currentProducts.length > 0 ? (
              currentProducts.map((p) => {
                const outOfStock = Number(p.stock) <= 0;
                
                return (
                  <div key={p._id} style={{
                    position: 'relative',
                    aspectRatio: '1/1',
                    backgroundColor: '#fff',
                    border: '1px solid rgba(212, 163, 115, 0.2)',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                    cursor: 'pointer'
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
                  }}
                  onClick={() => navigate(`/artisan-product-details/${p._id}`)}
                  >
                    {imageUrls[p._id] ? (
        <img
          src={imageUrls[p._id]}
          alt={p.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
          onError={(e) => {
            e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(135deg, #d4a373, #8a5a44)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '3em',
                        color: '#fff',
                        opacity: 0.7
                      }}>
                        🛍️
                      </div>
                    )}
                    
                    {/* Price Badge */}
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      backgroundColor: 'rgba(255,255,255,0.95)',
                      color: '#8a5a44',
                      padding: '6px 12px',
                      borderRadius: '16px',
                      fontWeight: 700,
                      fontSize: '0.9em',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                      backdropFilter: 'blur(10px)'
                    }}>
                      {p.price} €
                    </div>
                    
                    {/* Stock Badge */}
        {outOfStock && (
                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
              backgroundColor: '#a94442',
              color: '#fff',
                        padding: '4px 10px',
              borderRadius: '12px',
                        fontWeight: 600,
                        fontSize: '0.8em',
                        boxShadow: '0 2px 8px rgba(169, 68, 66, 0.3)'
                      }}>
            Stock épuisé
                      </div>
                    )}
                    
                    {/* Nom du produit - Badge fixe */}
                    <div style={{
                      position: 'absolute',
                      bottom: '40px',
                      left: '12px',
                      backgroundColor: 'rgba(138, 90, 68, 0.9)',
                      color: '#fff',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontWeight: 600,
                      fontSize: '0.8em',
                      backdropFilter: 'blur(10px)',
                      maxWidth: 'calc(50% - 18px)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {p.name}
                    </div>

                    {/* Nom de l'artisan - Badge fixe */}
                    <div style={{
                      position: 'absolute',
                      bottom: '40px',
                      right: '12px',
                      backgroundColor: 'rgba(212, 163, 115, 0.95)',
                      color: '#fff',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontWeight: 600,
                      fontSize: '0.8em',
                      backdropFilter: 'blur(10px)',
                      maxWidth: 'calc(50% - 18px)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      Par {p.artisanId?.nom || 'Inconnu'} {p.artisanId?.prenom || ''}
                    </div>

                    {/* Stock badge - En bas */}
                    <div style={{
                      position: 'absolute',
                      bottom: '12px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      backgroundColor: 'rgba(0,0,0,0.7)',
                      color: '#fff',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontWeight: 600,
                      fontSize: '0.8em',
                      backdropFilter: 'blur(10px)',
                      whiteSpace: 'nowrap'
                    }}>
                      Stock: {p.stock}
                    </div>

                    {/* Overlay avec infos */}
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                      color: '#fff',
                      padding: '20px 16px 16px',
                      transform: 'translateY(100%)',
                      transition: 'transform 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(100%)';
                    }}
                    >
                      <h3 style={{
                        margin: '0 0 8px',
                        fontSize: '1.1em',
                        fontWeight: 600,
                        lineHeight: '1.2'
                      }}>
                        {p.name}
                      </h3>
                      <p style={{
                        margin: '0 0 4px',
                        fontSize: '0.9em',
                        opacity: 0.9
                      }}>
                        {p.category}
                      </p>
                      <p style={{
                        margin: '0 0 8px',
                        fontSize: '0.85em',
                        opacity: 0.8
                      }}>
                        Par {p.artisanId?.nom || 'Inconnu'} {p.artisanId?.prenom || ''}
                      </p>
                      <p style={{
                        margin: '0',
                        fontSize: '0.8em',
                        opacity: 0.7
                      }}>
                        Stock: {p.stock}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : activeTab === 'products' ? (
              <div style={{
                gridColumn: '1 / -1',
                textAlign: 'center',
                padding: '60px 20px',
                backgroundColor: '#faf9f7',
                borderRadius: '20px',
                border: '2px dashed #d4a373'
              }}>
                <div style={{ fontSize: '4em', marginBottom: '20px' }}>🔍</div>
                <h3 style={{ color: '#8a5a44', fontSize: '1.5em', marginBottom: '10px' }}>
                  Aucun produit trouvé
                </h3>
                <p style={{ color: '#5c4b38', fontSize: '1.1em' }}>
                  Essayez de modifier vos filtres de recherche
                </p>
              </div>
            ) : null}

            {activeTab === 'workshops' && currentWorkshops.length > 0 ? (
            currentWorkshops.map((w) => {
              const isExpired = isWorkshopExpired(w.date);
              
              return (
                <div key={w._id} style={{
                  position: 'relative',
                  aspectRatio: '1/1',
                  backgroundColor: '#fff',
                  border: isExpired ? '2px solid #dc3545' : '1px solid rgba(212, 163, 115, 0.2)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  boxShadow: isExpired ? '0 4px 16px rgba(220, 53, 69, 0.2)' : '0 4px 16px rgba(0,0,0,0.08)',
                  cursor: 'pointer',
                  opacity: isExpired ? 0.8 : 1
                }}
                onMouseOver={e => {
                  if (!isExpired) {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
                  }
                }}
                onMouseOut={e => {
                  if (!isExpired) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
                  }
                }}
                onClick={() => !isExpired && navigate(`/artisan-workshop-details/${w._id}`)}
                >
                  {imageUrls[w._id] ? (
                    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                      <img
                        src={imageUrls[w._id]}
                        alt={w.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          filter: isExpired ? 'grayscale(50%) brightness(0.7)' : 'none'
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      {isExpired && (
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'rgba(0, 0, 0, 0.4)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 5
                        }}>
                          <div style={{
                            backgroundColor: 'rgba(220, 53, 69, 0.9)',
                            color: '#fff',
                            padding: '8px 16px',
                            borderRadius: '20px',
                            fontWeight: '700',
                            fontSize: '0.9em',
                            textAlign: 'center',
                            boxShadow: '0 4px 12px rgba(220, 53, 69, 0.4)'
                          }}>
                            ⏰ ATELIER EXPIRÉ
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      background: isExpired 
                        ? 'linear-gradient(135deg, #6c757d, #495057)' 
                        : 'linear-gradient(135deg, #d4a373, #8a5a44)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '3em',
                      color: '#fff',
                      opacity: isExpired ? 0.6 : 0.7
                    }}>
                      {isExpired ? '⏰' : '🎨'}
                    </div>
                  )}
                  
                  {/* Price Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    color: '#8a5a44',
                    padding: '6px 12px',
                    borderRadius: '16px',
                    fontWeight: 700,
                    fontSize: '0.9em',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    backdropFilter: 'blur(10px)'
                  }}>
                    {w.price} €
                  </div>

                  {/* Badge Atelier Expiré */}
                  {isExpired && (
                    <div style={{
                      position: 'absolute',
                      top: '50px',
                      right: '12px',
                      backgroundColor: 'rgba(220, 53, 69, 0.95)',
                      color: '#fff',
                      padding: '6px 12px',
                      borderRadius: '16px',
                      fontWeight: 700,
                      fontSize: '0.8em',
                      boxShadow: '0 2px 8px rgba(220, 53, 69, 0.3)',
                      backdropFilter: 'blur(10px)',
                      zIndex: 10
                    }}>
                      ⏰ Atelier expiré
                    </div>
                  )}
                  
                  {/* Date Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    color: '#fff',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontWeight: 600,
                    fontSize: '0.8em',
                    backdropFilter: 'blur(10px)'
                  }}>
                    {new Date(w.date).toLocaleDateString()}
                  </div>

                  {/* Région Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'rgba(138, 90, 68, 0.9)',
                    color: '#fff',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontWeight: 600,
                    fontSize: '0.8em',
                    backdropFilter: 'blur(10px)',
                    whiteSpace: 'nowrap'
                  }}>
                    📍 {w.location || 'Non spécifiée'}
                  </div>

                  {/* Nom de l'atelier - Badge fixe */}
                  <div style={{
                    position: 'absolute',
                    bottom: '40px',
                    left: '12px',
                    backgroundColor: 'rgba(138, 90, 68, 0.9)',
                    color: '#fff',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontWeight: 600,
                    fontSize: '0.8em',
                    backdropFilter: 'blur(10px)',
                    maxWidth: 'calc(50% - 18px)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {w.title}
                  </div>

                  {/* Places disponibles badge */}
                  <div style={{
                    position: 'absolute',
                    bottom: '40px',
                    right: '12px',
                    backgroundColor: isExpired ? 'rgba(220, 53, 69, 0.95)' : 'rgba(212, 163, 115, 0.95)',
                    color: '#fff',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontWeight: 600,
                    fontSize: '0.8em',
                    boxShadow: isExpired ? '0 2px 8px rgba(220, 53, 69, 0.3)' : '0 2px 8px rgba(212, 163, 115, 0.3)',
                    backdropFilter: 'blur(10px)',
                    maxWidth: 'calc(50% - 18px)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {isExpired ? '⏰ Expiré' : `${w.places || 0} places disponibles`}
                  </div>

                  {/* Date badge - En bas */}
                  <div style={{
                    position: 'absolute',
                    bottom: '12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    color: '#fff',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontWeight: 600,
                    fontSize: '0.8em',
                    backdropFilter: 'blur(10px)',
                    whiteSpace: 'nowrap'
                  }}>
                    {new Date(w.date).toLocaleDateString()}
                  </div>
                  
                  
                  {/* Overlay avec infos */}
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                    color: '#fff',
                    padding: '20px 16px 16px',
                    transform: 'translateY(100%)',
                    transition: 'transform 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(100%)';
                  }}
                  >
                    <h3 style={{
                      margin: '0 0 8px',
                      fontSize: '1.1em',
                      fontWeight: 600,
                      lineHeight: '1.2'
                    }}>
                      {w.title}
                    </h3>
                    <p style={{
                      margin: '0 0 4px',
                      fontSize: '0.9em',
                      opacity: 0.9
                    }}>
                      {w.category}
                    </p>
                    <p style={{
                      margin: '8px 0 0',
                      fontSize: '0.85em',
                      opacity: 0.8
                    }}>
                      Par {w.artisanId?.nom || 'Inconnu'} {w.artisanId?.prenom || ''}
                    </p>
                  </div>
                </div>
              );
            })
            ) : activeTab === 'workshops' ? (
              <div style={{
                gridColumn: '1 / -1',
                textAlign: 'center',
                padding: '60px 20px',
                backgroundColor: '#faf9f7',
                borderRadius: '20px',
                border: '2px dashed #d4a373'
              }}>
                <div style={{ fontSize: '4em', marginBottom: '20px' }}>🔍</div>
                <h3 style={{ color: '#8a5a44', fontSize: '1.5em', marginBottom: '10px' }}>
                  Aucun atelier trouvé
                </h3>
                <p style={{ color: '#5c4b38', fontSize: '1.1em' }}>
                  Essayez de modifier vos filtres de recherche
                </p>
              </div>
            ) : null}
          </div>
          
          {/* Contrôles de pagination */}
          {totalPages > 1 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '10px',
              marginTop: '40px',
              marginBottom: '40px'
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

          {/* Informations de pagination */}
          {(activeTab === 'products' ? totalProducts : totalWorkshops) > 0 && (
            <div style={{
              textAlign: 'center',
              color: '#8a5a44',
              fontSize: '0.9em',
              marginBottom: '20px'
            }}>
              Affichage de {indexOfFirstItem + 1} à {Math.min(indexOfLastItem, activeTab === 'products' ? totalProducts : totalWorkshops)} sur {activeTab === 'products' ? totalProducts : totalWorkshops} {activeTab === 'products' ? 'produits' : 'ateliers'}
            </div>
          )}
        </section>
      </div>

      <ArtisanFooter />
    </div>
  );
}

export default Home;