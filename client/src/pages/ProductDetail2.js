import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPublicProduct, getPublicProductImage, addComment, getComments } from '../services/api';

function ProductDetail2() {
  const [product, setProduct] = useState(null);
  const [imageUrls, setImageUrls] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const { id } = useParams();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const prodRes = await getPublicProduct(id);
        setProduct(prodRes.data);

        const urls = [];
        for (let index = 0; index < prodRes.data.images.length; index++) {
          try {
            const response = await getPublicProductImage(id, index);
            urls.push(URL.createObjectURL(response.data));
          } catch (err) {
            console.error('Failed to fetch image for product ID:', id, 'index:', index, err);
          }
        }
        setImageUrls(urls);

        const commentsRes = await getComments(id, 'products');
        console.log('Comments data:', commentsRes.data);
        setComments(commentsRes.data);
        setError('');
      } catch (err) {
        setError('Erreur lors du chargement du produit ou des commentaires.');
        console.error('API Error:', err.response ? err.response.data : err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    return () => {
      imageUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imageUrls]);






  // Fonction pour générer un résumé et remplacer le commentaire
  const handleSummarize = async (commentId, commentText, originalText) => {
    // Vérifier si le commentaire est trop court pour être résumé
    const wordCount = commentText.split(' ').length;
    if (wordCount < 10) {
      alert('Le commentaire est déjà petit.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5003/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ review: commentText }),
      });
      if (!response.ok) throw new Error('Erreur lors de la summarization');
      const data = await response.json();
      const newSummary = data.summary;

      // Remplacer le commentaire par le résumé
      setComments(prevComments =>
        prevComments.map(comment =>
          comment._id === commentId ? { ...comment, text: newSummary } : comment
        )
      );
    } catch (err) {
      setError(`Erreur lors de la génération du résumé : ${err.message}`);
      console.error('Summarize Error:', err);
      // Si échec, garder le commentaire original
      alert('Échec du résumé, le commentaire reste inchangé.');
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
          <p style={{ fontSize: '1.2em', color: '#8a5a44', fontWeight: '600' }}>Chargement du produit...</p>
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

  if (!product) {
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
          <div style={{ fontSize: '4em', marginBottom: '20px' }}>🔍</div>
          <h2 style={{ color: '#8a5a44', marginBottom: '15px' }}>Produit non trouvé</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>Le produit que vous recherchez n'existe pas ou a été supprimé.</p>
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

  return (
    <div style={{
      fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif',
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

      {/* ===== Main Content ===== */}
      <div style={{
        maxWidth: '1200px',
        margin: '40px auto',
        padding: '0 20px'
      }}>
        {/* ===== Product Header ===== */}
        <div style={{
          background: 'linear-gradient(135deg, #fff, #f8f9fa)',
          borderRadius: '25px',
          padding: '40px',
          marginBottom: '30px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          border: '1px solid rgba(138, 90, 68, 0.1)',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: '3em',
            color: '#2c3e50',
            marginBottom: '20px',
            fontWeight: '700',
            textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
          }}>
            {product.name}
          </h1>
          
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '30px',
            marginBottom: '30px',
            flexWrap: 'wrap'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
              padding: '15px 25px',
              borderRadius: '15px',
              color: '#1976d2',
              fontWeight: '600',
              fontSize: '1.3em'
            }}>
              💰 {product.price} €
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #e8f5e8, #c8e6c9)',
              padding: '15px 25px',
              borderRadius: '15px',
              color: '#2e7d32',
              fontWeight: '600',
              fontSize: '1.3em'
            }}>
              📦 Stock: {product.stock || 0}
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #fff3e0, #ffe0b2)',
              padding: '15px 25px',
              borderRadius: '15px',
              color: '#ef6c00',
              fontWeight: '600',
              fontSize: '1.3em'
            }}>
              🏷️ {product.category}
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #f3e5f5, #e1bee7)',
            padding: '20px',
            borderRadius: '15px',
            marginBottom: '20px'
          }}>
            <p style={{
              fontSize: '1.1em',
              color: '#7b1fa2',
              fontWeight: '600',
              margin: '0'
            }}>
              👨‍🎨 Artisan: {product.artisanId && product.artisanId.nom && product.artisanId.prenom ? 
                `${product.artisanId.prenom} ${product.artisanId.nom}` : 'Artisan inconnu'}
            </p>
          </div>

        {product.description && (
            <div style={{
              background: 'rgba(138, 90, 68, 0.1)',
              padding: '20px',
              borderRadius: '15px',
              marginBottom: '20px'
            }}>
              <h3 style={{
                fontSize: '1.3em',
                color: '#8a5a44',
                marginBottom: '10px',
                fontWeight: '600'
              }}>
                📝 Description
              </h3>
              <p style={{
                fontSize: '1.1em',
                color: '#5c4b38',
                lineHeight: '1.6',
                margin: '0'
              }}>
                {product.description}
              </p>
            </div>
          )}

          {(product.material || product.size) && (
            <div style={{
              display: 'flex',
              gap: '20px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
        {product.material && (
                <div style={{
                  background: 'linear-gradient(135deg, #e0f2f1, #b2dfdb)',
                  padding: '15px 20px',
                  borderRadius: '12px',
                  color: '#00695c',
                  fontWeight: '600'
                }}>
                  🧱 Matériau: {product.material}
                </div>
        )}
        {product.size && (
                <div style={{
                  background: 'linear-gradient(135deg, #fce4ec, #f8bbd9)',
                  padding: '15px 20px',
                  borderRadius: '12px',
                  color: '#ad1457',
                  fontWeight: '600'
                }}>
                  📏 Taille: {product.size}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ===== Product Images ===== */}
        {imageUrls.length > 0 && (
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
              🖼️ Galerie d'Images
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '25px',
              justifyContent: 'center'
            }}>
          {imageUrls.map((url, index) => (
                <div key={index} className="card-hover" style={{
                  position: 'relative',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease'
                }}>
                  <img
              src={url}
              alt={`${product.name} - Vue ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '300px',
                      objectFit: 'cover',
                      transition: 'transform 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.transform = 'scale(1.05)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = 'scale(1)';
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: '0',
                    left: '0',
                    right: '0',
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                    color: '#fff',
                    padding: '20px',
                    textAlign: 'center'
                  }}>
                    <span style={{
                      fontSize: '1.1em',
                      fontWeight: '600'
                    }}>
                      Vue {index + 1}
                    </span>
                  </div>
                </div>
          ))}
        </div>
          </div>
        )}

        {/* ===== Comments Section ===== */}
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
            💬 Commentaires des Clients
          </h2>
          
          <div style={{
            maxHeight: '500px',
            overflowY: 'auto',
            paddingRight: '10px'
          }}>
            {comments.length > 0 ? (
              <div style={{
                display: 'grid',
                gap: '20px'
              }}>
                {comments.map((comment) => (
                  <div key={comment._id} className="card-hover" style={{
                    background: 'linear-gradient(135deg, #f8f9fa, #fff)',
                    borderRadius: '15px',
                    padding: '25px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                    border: '1px solid #e9ecef',
                    transition: 'all 0.3s ease'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '15px'
                    }}>
                      <div>
                        <h4 style={{
                          fontSize: '1.2em',
                          color: '#2c3e50',
                          margin: '0 0 5px 0',
                          fontWeight: '600'
                        }}>
                          👤 {comment.userId?.prenom && comment.userId?.nom ? 
                            `${comment.userId.prenom} ${comment.userId.nom}` : 'Utilisateur inconnu'}
                        </h4>
                        <p style={{
                          fontSize: '0.9em',
                          color: '#666',
                          margin: '0'
                        }}>
                          📅 {new Date(comment.createdAt).toLocaleString('fr-FR')}
                        </p>
                      </div>
                  <button
                        onClick={() => handleSummarize(comment._id, comment.text, comment.text)}
                        style={{
                          padding: '8px 16px',
                          background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '20px',
                          cursor: 'pointer',
                          fontSize: '0.9em',
                          fontWeight: '600',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 2px 8px rgba(138, 90, 68, 0.3)'
                        }}
                        onMouseOver={(e) => {
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 4px 12px rgba(138, 90, 68, 0.4)';
                        }}
                        onMouseOut={(e) => {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = '0 2px 8px rgba(138, 90, 68, 0.3)';
                        }}
                      >
                        📝 Résumer
                  </button>
                    </div>
                    <p style={{
                      fontSize: '1.1em',
                      color: '#2c3e50',
                      lineHeight: '1.6',
                      margin: '0',
                      background: 'rgba(138, 90, 68, 0.05)',
                      padding: '15px',
                      borderRadius: '10px'
                    }}>
                      {comment.text}
                    </p>
                  </div>
                ))}
                </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '40px',
                color: '#666'
              }}>
                <div style={{ fontSize: '4em', marginBottom: '20px' }}>💭</div>
                <h3 style={{ color: '#8a5a44', marginBottom: '10px' }}>Aucun commentaire</h3>
                <p>Ce produit n'a pas encore reçu de commentaires de la part des clients.</p>
              </div>
            )}
          </div>
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

      {/* ===== CSS Animations ===== */}
      <style>{`
        .card-hover:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 35px rgba(0,0,0,0.15) !important;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* Scrollbar styling */
        div::-webkit-scrollbar {
          width: 8px;
        }
        
        div::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        
        div::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #8a5a44, #d4a373);
          border-radius: 10px;
        }
        
        div::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #704838, #c19a6b);
        }
      `}</style>
    </div>
  );
}

export default ProductDetail2;