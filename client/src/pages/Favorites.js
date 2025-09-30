import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getFavorites,
  removeFavorite,
  getPublicProductImage,
  getPublicWorkshopImage,
} from "../services/api";

function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [error, setError] = useState("");
  const [imageUrls, setImageUrls] = useState({});
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }
        const response = await getFavorites();
        const favs = response.data || [];
        console.log("Fetched favorites data:", favs); // Log pour débogage
        setFavorites(favs);

        // Charger les images
        const urls = {};
        for (const fav of favs) {
          try {
            if (fav.itemType === "product" && fav.images && fav.images.length > 0) {
              const response = await getPublicProductImage(fav.itemId, 0);
              urls[fav._id] = URL.createObjectURL(response.data);
            } else if (fav.itemType === "workshop" && fav.images && fav.images.length > 0) {
              const response = await getPublicWorkshopImage(fav.itemId, 0);
              urls[fav._id] = URL.createObjectURL(response.data);
            } else {
              console.log("No valid images for item ID:", fav._id);
              urls[fav._id] = "/placeholder-image.jpg";
            }
          } catch (err) {
            console.error("Failed to fetch image for item ID:", fav._id, err);
            urls[fav._id] = "/placeholder-image.jpg";
          }
        }
        setImageUrls(urls);
      } catch (err) {
        setError("Erreur lors du chargement des favoris: " + err.message);
        console.error("Fetch favorites error:", err);
      }
    };
    fetchFavorites();

    return () => {
      Object.values(imageUrls).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [navigate]);

  const removeFromFavorites = async (itemId, itemType) => {
    try {
      await removeFavorite({ itemId, itemType });
      setFavorites(favorites.filter((item) => item._id !== itemId));
      setNotification({
        show: true,
        message: 'Article retiré des favoris !',
        type: 'success'
      });
      // Auto-hide notification after 3 seconds
      setTimeout(() => {
        setNotification({ show: false, message: '', type: 'success' });
      }, 3000);
    } catch (err) {
      setError("Erreur lors de la suppression des favoris: " + err.message);
      setNotification({
        show: true,
        message: 'Erreur lors de la suppression des favoris',
        type: 'error'
      });
      // Auto-hide notification after 4 seconds
      setTimeout(() => {
        setNotification({ show: false, message: '', type: 'error' });
      }, 4000);
      console.error("Remove favorite error:", err);
    }
  };

  return (
    <div
      style={{
        fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif',
        color: "#3a2f1a",
        minHeight: "100vh",
        backgroundColor: "#f8f1e9",
        margin: 0,
        padding: 0,
      }}
    >
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
            <Link to="/favorites-cart" style={{
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
              Favoris
            </Link>
            <Link to="/panier" style={{
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
              Panier
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

      {/* ===== Hero Section ===== */}
      <section style={{
        background: 'linear-gradient(135deg, #8a5a44 0%, #d4a373 50%, #f8f1e9 100%)',
        padding: '80px 0',
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
          padding: '0 30px',
          textAlign: 'center',
          position: 'relative',
          zIndex: 2
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            padding: '50px 40px',
            borderRadius: '25px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            border: '1px solid rgba(255,255,255,0.3)'
          }}>
            <div style={{ fontSize: '4em', marginBottom: '20px' }}>❤️</div>
            <h1 style={{
              fontSize: '3.2em',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '20px',
              textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
            }}>
          Mes Favoris
            </h1>
            <p style={{
              fontSize: '1.3em',
              color: '#6b5b47',
              marginBottom: '30px',
              lineHeight: '1.6',
              maxWidth: '600px',
              margin: '0 auto 30px'
            }}>
              Découvrez vos produits et ateliers préférés sauvegardés
            </p>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '20px',
              flexWrap: 'wrap'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #d4a373, #c78c5d)',
                color: '#fff',
                padding: '15px 30px',
                borderRadius: '25px',
                fontSize: '1.2em',
                fontWeight: 700,
                boxShadow: '0 8px 25px rgba(212, 163, 115, 0.3)',
                textShadow: '1px 1px 2px rgba(0,0,0,0.2)'
              }}>
                {favorites.length} {favorites.length === 1 ? 'article' : 'articles'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Main Content ===== */}
      <section style={{
        maxWidth: '1200px',
        margin: '40px auto',
        padding: '0 30px'
      }}>
        <div style={{
          background: '#fff',
          borderRadius: '25px',
          boxShadow: '0 15px 40px rgba(0,0,0,0.1)',
          padding: '50px',
          border: '1px solid rgba(138, 90, 68, 0.1)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative corner */}
          <div style={{
            position: 'absolute',
            top: '0',
            right: '0',
            width: '100px',
            height: '100px',
            background: 'linear-gradient(135deg, #d4a373, #8a5a44)',
            borderRadius: '0 25px 0 100px',
            opacity: 0.05
          }}></div>

          {/* Error Message */}
        {error && (
            <div style={{
              background: 'linear-gradient(135deg, #f8d7da, #f5c6cb)',
              color: '#721c24',
              padding: '20px',
              borderRadius: '15px',
              marginBottom: '30px',
              border: '1px solid #f5c6cb',
              display: 'flex',
              alignItems: 'center',
              gap: '15px'
            }}>
              <div style={{ fontSize: '1.5em' }}>⚠️</div>
              <div>
                <h4 style={{ margin: '0 0 5px 0', fontSize: '1.1em', fontWeight: 600 }}>
                  Erreur de chargement
                </h4>
                <p style={{ margin: 0, fontSize: '1em' }}>{error}</p>
              </div>
            </div>
          )}

          {/* Empty State */}
        {favorites.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '80px 20px',
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              borderRadius: '20px',
              border: '2px dashed rgba(138, 90, 68, 0.3)'
            }}>
              <div style={{ fontSize: '6em', marginBottom: '30px' }}>💔</div>
              <h3 style={{
                fontSize: '2em',
                color: '#8a5a44',
                marginBottom: '20px',
                fontWeight: 700
              }}>
                Aucun favori pour le moment
              </h3>
              <p style={{
                color: '#6b5b47',
                fontSize: '1.2em',
                marginBottom: '30px',
                lineHeight: '1.6'
              }}>
                Commencez à explorer nos produits et ateliers pour ajouter vos favoris !
              </p>
              <Link
                to="/client-home"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '18px 40px',
                  background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
                  color: '#fff',
                  textDecoration: 'none',
                  borderRadius: '25px',
                  fontSize: '1.2em',
                  fontWeight: 700,
                  transition: 'all 0.3s ease',
                  boxShadow: '0 6px 20px rgba(138, 90, 68, 0.3)'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-3px)';
                  e.target.style.boxShadow = '0 10px 30px rgba(138, 90, 68, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 6px 20px rgba(138, 90, 68, 0.3)';
                }}
              >
                🚀 Découvrir nos produits
              </Link>
            </div>
          ) : (
            /* Favorites Grid */
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}>
              {favorites.map((item, index) => (
                <div
                  key={item._id}
                  style={{
                    background: '#fff',
                    borderRadius: '20px',
                    padding: '0',
                    border: '1px solid rgba(138, 90, 68, 0.1)',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                    display: 'flex',
                    height: '200px'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = 'translateY(-5px)';
                    e.target.style.boxShadow = '0 15px 40px rgba(0,0,0,0.15)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
                  }}
                >
                  {/* Item Type Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '15px',
                    left: '15px',
                    background: item.itemType === 'workshop' 
                      ? 'linear-gradient(135deg, #17a2b8, #138496)' 
                      : 'linear-gradient(135deg, #28a745, #20c997)',
                    color: '#fff',
                    padding: '8px 15px',
                    borderRadius: '20px',
                    fontSize: '0.9em',
                    fontWeight: 600,
                    zIndex: 2,
                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    {item.itemType === 'workshop' ? '🛠️' : '📦'} {item.itemType === 'workshop' ? 'Atelier' : 'Produit'}
                  </div>

                  {/* Image Section */}
                  {imageUrls[item._id] && (
                    <div style={{
                      width: '250px',
                      height: '100%',
                      overflow: 'hidden',
                      borderRadius: '20px 0 0 20px',
                      position: 'relative',
                      flexShrink: 0
                    }}>
                      <img
                        src={imageUrls[item._id]}
                        alt={item.name || item.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.3s ease'
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          console.log("Image load failed for item ID:", item._id);
                        }}
                      />
                    </div>
                  )}

                  {/* Content Section */}
                  <div style={{ 
                    flex: 1, 
                    padding: '25px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}>
                    {/* Top Section - Title and Price */}
                    <div>
                      <h3 style={{
                        margin: '0 0 15px 0',
                        fontSize: '1.4em',
                        color: '#8a5a44',
                        fontWeight: 700,
                        lineHeight: '1.3'
                      }}>
                        {item.name || item.title || "Article inconnu"}
                      </h3>

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px',
                        marginBottom: '20px'
                      }}>
                        <div style={{
                          background: 'linear-gradient(135deg, #d4a373, #c78c5d)',
                          color: '#fff',
                          padding: '10px 20px',
                          borderRadius: '15px',
                          fontSize: '1.2em',
                          fontWeight: 700,
                          boxShadow: '0 4px 15px rgba(212, 163, 115, 0.3)'
                        }}>
                          {item.price || "N/A"} €
                        </div>
                        <div style={{
                          color: '#6b5b47',
                          fontSize: '1em',
                          fontWeight: 600
                        }}>
                          Quantité: {item.quantity || 1}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Section - Action Buttons */}
                    <div style={{
                      display: 'flex',
                      gap: '15px',
                      alignItems: 'center'
                    }}>
                      <Link
                        to={`/${item.itemType === "workshop" ? "workshop" : "product"}/${item._id}`}
                        style={{
                          flex: 1,
                          padding: '15px 25px',
                          background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
                          color: '#fff',
                          textDecoration: 'none',
                          borderRadius: '15px',
                          fontSize: '1.1em',
                          fontWeight: 600,
                          textAlign: 'center',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 4px 15px rgba(138, 90, 68, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px'
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
                        👁️ Voir détails
                      </Link>
                      <button
                        onClick={() => removeFromFavorites(item._id, item.itemType)}
                        style={{
                          padding: '15px 20px',
                          background: 'linear-gradient(135deg, #dc3545, #c82333)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '15px',
                          fontSize: '1.1em',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 4px 15px rgba(220, 53, 69, 0.3)',
                          minWidth: '120px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                        onMouseOver={(e) => {
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 6px 20px rgba(220, 53, 69, 0.4)';
                        }}
                        onMouseOut={(e) => {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = '0 4px 15px rgba(220, 53, 69, 0.3)';
                        }}
                      >
                        ❌ Retirer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
        )}
      </div>
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
              <Link to="/favorites-cart" style={{
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
                Favoris
              </Link>
              <Link to="/panier" style={{
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
                Panier
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

      {/* ===== Modern Notification ===== */}
      {notification.show && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 10000,
          animation: 'slideIn 0.5s ease-out'
        }}>
          <div style={{
            background: notification.type === 'success' 
              ? 'linear-gradient(135deg, #28a745, #20c997)' 
              : 'linear-gradient(135deg, #dc3545, #fd7e14)',
            color: '#fff',
            padding: '20px 30px',
            borderRadius: '15px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)',
            minWidth: '300px',
            maxWidth: '400px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Decorative elements */}
            <div style={{
              position: 'absolute',
              top: '-10px',
              right: '-10px',
              width: '30px',
              height: '30px',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '50%',
              opacity: 0.5
            }}></div>
            <div style={{
              position: 'absolute',
              bottom: '-15px',
              left: '-15px',
              width: '40px',
              height: '40px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '50%',
              opacity: 0.3
            }}></div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              position: 'relative',
              zIndex: 2
            }}>
              <div style={{
                fontSize: '2em',
                filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))'
              }}>
                {notification.type === 'success' ? '✅' : '⚠️'}
              </div>
              <div>
                <h4 style={{
                  margin: '0 0 5px 0',
                  fontSize: '1.1em',
                  fontWeight: 700,
                  textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
                }}>
                  {notification.type === 'success' ? 'Succès !' : 'Attention !'}
                </h4>
                <p style={{
                  margin: 0,
                  fontSize: '1em',
                  opacity: 0.95,
                  lineHeight: '1.4'
                }}>
                  {notification.message}
                </p>
              </div>
              <button
                onClick={() => setNotification({ show: false, message: '', type: 'success' })}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  color: '#fff',
                  fontSize: '1.2em',
                  cursor: 'pointer',
                  padding: '5px 10px',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  marginLeft: 'auto'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.3)';
                  e.target.style.transform = 'scale(1.1)';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.2)';
                  e.target.style.transform = 'scale(1)';
                }}
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

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
              transform: translateX(100px);
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
        `}
      </style>
    </div>
  );
}

export default Favorites;