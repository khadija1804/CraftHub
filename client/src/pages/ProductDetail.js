import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPublicProduct, getPublicProductImage, addComment, getComments, deleteComment, updateComment, addToCart as addToCartAPI } from '../services/api';
import { translateText } from "../services/ai"
function ProductDetail() {
  const [product, setProduct] = useState(null);
  const [imageUrls, setImageUrls] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const { id } = useParams();
  const [editingCommentId, setEditingCommentId] = useState(null); // Pour suivre le commentaire en édition
  const [editText, setEditText] = useState(''); // Texte en cours d’édition
  const [translatedDesc, setTranslatedDesc] = useState("");
const [targetLang, setTargetLang] = useState("en"); // "en" | "fr" | "ar"
const [isTranslating, setIsTranslating] = useState(false);
const [translateError, setTranslateError] = useState("");
const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

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

  // Ajuster la quantité initiale en fonction du stock disponible
  useEffect(() => {
    if (product?.stock !== undefined) {
      if (product.stock <= 0) {
        setQuantity(0);
      } else if (quantity > product.stock) {
        setQuantity(Math.min(quantity, product.stock));
      } else if (quantity === 0 && product.stock > 0) {
        setQuantity(1);
      }
    }
  }, [product?.stock, quantity]);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value) || 1;
    const maxStock = product?.stock || 0;
    
    if (maxStock <= 0) {
      setQuantity(0);
      return;
    }
    
    // Limiter la quantité au stock disponible
    const validQuantity = Math.min(Math.max(1, value), maxStock);
    setQuantity(validQuantity);
  };

  const addToCart = async () => {
    const token = localStorage.getItem("token");
    
    // Vérifier si l'utilisateur est connecté
    if (!token) {
      setNotification({
        show: true,
        message: 'Vous devez être connecté pour ajouter des produits au panier.',
        type: 'error'
      });
      setTimeout(() => {
        setNotification({ show: false, message: '', type: 'error' });
      }, 4000);
      return;
    }

    // Vérifier le stock disponible
    const availableStock = product?.stock || 0;
    
    if (availableStock <= 0) {
      setNotification({
        show: true,
        message: 'Ce produit n\'est plus en stock.',
        type: 'error'
      });
      setTimeout(() => {
        setNotification({ show: false, message: '', type: 'error' });
      }, 4000);
      return;
    }

    if (quantity > availableStock) {
      setNotification({
        show: true,
        message: `Stock insuffisant. Seulement ${availableStock} article(s) disponible(s).`,
        type: 'error'
      });
      setTimeout(() => {
        setNotification({ show: false, message: '', type: 'error' });
      }, 4000);
      return;
    }

    if (quantity <= 0) {
      setNotification({
        show: true,
        message: 'Veuillez sélectionner une quantité valide.',
        type: 'error'
      });
      setTimeout(() => {
        setNotification({ show: false, message: '', type: 'error' });
      }, 3000);
      return;
    }

    try {
      // Ajouter au panier via l'API
      await addToCartAPI({
        productId: product._id,
        quantity,
        artisanId: product.artisanId?._id || product.artisanId,
        name: product.name || "Produit inconnu"
      });

      setNotification({
        show: true,
        message: `${quantity} x ${product.name} ajouté au panier !`,
        type: 'success'
      });
      
      // Auto-hide notification after 4 seconds
      setTimeout(() => {
        setNotification({ show: false, message: '', type: 'success' });
      }, 4000);
      
    } catch (error) {
      console.error('Erreur lors de l\'ajout au panier:', error);
      setNotification({
        show: true,
        message: 'Erreur lors de l\'ajout au panier. Veuillez réessayer.',
        type: 'error'
      });
      setTimeout(() => {
        setNotification({ show: false, message: '', type: 'error' });
      }, 4000);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    try {
      await addComment({ productId: id, text: commentText });
      setCommentText('');
      const commentsRes = await getComments(id, 'products');
      setComments(commentsRes.data);
      alert('Commentaire ajouté avec succès !');
    } catch (err) {
      setError('Erreur lors de l\'ajout du commentaire.');
      console.error('Comment Error:', err.response ? err.response.data : err.message);
    }
  };

  const handleSummarize = async (commentId, commentText, originalText) => {
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

      setComments(prevComments =>
        prevComments.map(comment =>
          comment._id === commentId ? { ...comment, text: newSummary } : comment
        )
      );
    } catch (err) {
      setError(`Erreur lors de la génération du résumé : ${err.message}`);
      console.error('Summarize Error:', err);
      alert('Échec du résumé, le commentaire reste inchangé.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(id, commentId); // Appelle l'API pour supprimer
      setComments(comments.filter(comment => comment._id !== commentId));
      alert('Commentaire supprimé avec succès !');
    } catch (err) {
      setError('Erreur lors de la suppression du commentaire.');
      console.error('Delete Comment Error:', err.response ? err.response.data : err.message);
    }
  };

  const handleEditComment = (commentId, currentText) => {
    setEditingCommentId(commentId);
    setEditText(currentText);
  };

  const handleSaveEdit = async (commentId) => {
    try {
      await updateComment(id, commentId, { text: editText }); // Appelle l'API pour mettre à jour
      setComments(comments.map(comment =>
        comment._id === commentId ? { ...comment, text: editText } : comment
      ));
      setEditingCommentId(null);
      setEditText('');
      alert('Commentaire modifié avec succès !');
    } catch (err) {
      setError('Erreur lors de la modification du commentaire.');
      console.error('Edit Comment Error:', err.response ? err.response.data : err.message);
    }
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditText('');
  };

  const currentUserId = localStorage.getItem('userId'); // Récupère l'ID de l'utilisateur connecté

  if (loading) return <p style={{ textAlign: 'center' }}>Chargement...</p>;
  if (error) return <p style={{ color: '#a94442', textAlign: 'center' }}>{error}</p>;
  if (!product) return <p style={{ textAlign: 'center' }}>Produit non trouvé.</p>;

  return (
    <div style={{ fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif', color: '#3a2f1a', minHeight: '100vh', backgroundColor: '#f8f1e9', margin: 0, padding: 0 }}>
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
          <Link to="/client-home" style={{
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
              Déconnexion
            </Link>
        </nav>
        </div>
      </header>

      {/* ===== Hero Section ===== */}
      <section style={{
        background: 'linear-gradient(135deg, #8a5a44 0%, #d4a373 50%, #f8f1e9 100%)',
        padding: '60px 0',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative Elements */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '150px',
          height: '150px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '50%',
          animation: 'float 6s ease-in-out infinite'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '-30px',
          left: '-30px',
          width: '100px',
          height: '100px',
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
            padding: '40px',
            borderRadius: '25px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            border: '1px solid rgba(255,255,255,0.3)'
          }}>
            <h1 style={{
              fontSize: '3.2em',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '20px',
              textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
            }}>
              {product.name}
            </h1>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '20px',
              marginBottom: '30px',
              flexWrap: 'wrap'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #d4a373, #c78c5d)',
                color: '#fff',
                padding: '15px 30px',
                borderRadius: '25px',
                fontSize: '1.8em',
                fontWeight: 700,
                boxShadow: '0 8px 25px rgba(212, 163, 115, 0.3)',
                textShadow: '1px 1px 2px rgba(0,0,0,0.2)'
              }}>
                {product.price} €
              </div>
              <div style={{
                background: 'rgba(138, 90, 68, 0.1)',
                color: '#8a5a44',
                padding: '10px 20px',
                borderRadius: '20px',
                fontSize: '1.1em',
                fontWeight: 600,
                border: '2px solid rgba(138, 90, 68, 0.2)'
              }}>
                Par {product.artisanId && product.artisanId.nom && product.artisanId.prenom ? `${product.artisanId.prenom} ${product.artisanId.nom}` : 'Artisan inconnu'}
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

          {/* Product Images Gallery */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '25px',
            marginBottom: '50px'
          }}>
            {imageUrls.map((url, index) => (
              <div
                key={index}
                style={{
                  position: 'relative',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-8px)';
                  e.target.style.boxShadow = '0 20px 40px rgba(0,0,0,0.2)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)';
                }}
              >
                <img
                  src={url}
                  alt={`${product.name} - Vue ${index + 1}`}
                  style={{
                    width: '100%',
                    height: '300px',
                    objectFit: 'cover',
                    transition: 'transform 0.3s ease'
                  }}
                />
                <div style={{
                  position: 'absolute',
                  top: '15px',
                  right: '15px',
                  background: 'rgba(0,0,0,0.7)',
                  color: '#fff',
                  padding: '8px 12px',
                  borderRadius: '15px',
                  fontSize: '0.9em',
                  fontWeight: 600
                }}>
                  Vue {index + 1}
                </div>
              </div>
            ))}
          </div>

          {/* Product Details Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '40px',
            marginBottom: '50px'
          }}>
            {/* Description Section */}
            <div style={{
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              padding: '30px',
              borderRadius: '20px',
              border: '1px solid rgba(138, 90, 68, 0.1)'
            }}>
              <h3 style={{
                fontSize: '1.8em',
                color: '#8a5a44',
                marginBottom: '20px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                📝 Description
              </h3>
        {product.description && (
                <p style={{
                  fontSize: '1.1em',
                  lineHeight: '1.6',
                  color: '#5a4631',
                  marginBottom: '20px'
                }}>
                  {product.description}
                </p>
              )}

              {/* Translation Section */}
              <div style={{
                background: 'rgba(138, 90, 68, 0.05)',
                padding: '20px',
                borderRadius: '15px',
                border: '1px solid rgba(138, 90, 68, 0.1)'
              }}>
                <h4 style={{
                  fontSize: '1.2em',
                  color: '#8a5a44',
                  marginBottom: '15px',
                  fontWeight: 600
                }}>
                  🌐 Traduction
                </h4>
                <div style={{
                  display: 'flex',
                  gap: '10px',
                  marginBottom: '15px',
                  flexWrap: 'wrap',
                  alignItems: 'center'
                }}>
                  <label style={{
                    fontSize: '1em',
                    color: '#5a4631',
                    fontWeight: 600
                  }}>
                    Langue :
                  </label>
  <select
    value={targetLang}
    onChange={(e) => setTargetLang(e.target.value)}
                    style={{
                      padding: '10px 15px',
                      borderRadius: '10px',
                      border: '2px solid #d4a373',
                      backgroundColor: '#fff',
                      fontSize: '1em',
                      color: '#5a4631',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#8a5a44'}
                    onBlur={(e) => e.target.style.borderColor = '#d4a373'}
                  >
                    <option value="en">🇺🇸 Anglais</option>
                    <option value="fr">🇫🇷 Français</option>
                    <option value="ar">🇹🇳 Arabe</option>
  </select>
  <button
    disabled={isTranslating || !product?.description}
    onClick={async () => {
      try {
        setIsTranslating(true);
        setTranslateError("");
        // Déterminer la langue source et cible correctement
        const { translation } = await translateText(product.description, targetLang, undefined);
        setTranslatedDesc(translation);
      } catch (e) {
        setTranslateError(e.message || "Erreur inconnue");
      } finally {
        setIsTranslating(false);
      }
    }}
                    style={{
                      padding: '10px 20px',
                      background: isTranslating || !product?.description 
                        ? 'linear-gradient(135deg, #ccc, #999)' 
                        : 'linear-gradient(135deg, #8a5a44, #d4a373)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '15px',
                      fontSize: '1em',
                      fontWeight: 600,
                      cursor: isTranslating || !product?.description ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 15px rgba(138, 90, 68, 0.3)'
                    }}
                    onMouseOver={(e) => {
                      if (!isTranslating && product?.description) {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 6px 20px rgba(138, 90, 68, 0.4)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!isTranslating && product?.description) {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 15px rgba(138, 90, 68, 0.3)';
                      }
                    }}
                  >
                    {isTranslating ? "⏳ Traduction..." : "🔄 Traduire"}
  </button>
</div>
                {translateError && (
                  <p style={{
                    color: '#dc3545',
                    fontSize: '0.9em',
                    marginTop: '10px',
                    padding: '10px',
                    background: 'rgba(220, 53, 69, 0.1)',
                    borderRadius: '8px',
                    border: '1px solid rgba(220, 53, 69, 0.2)'
                  }}>
                    {translateError}
                  </p>
                )}
{translatedDesc && (
                  <div style={{
                    background: 'rgba(212, 163, 115, 0.1)',
                    padding: '15px',
                    borderRadius: '10px',
                    border: '1px solid rgba(212, 163, 115, 0.2)'
                  }}>
                    <p style={{
                      fontSize: '1em',
                      lineHeight: '1.5',
                      color: '#5a4631',
                      margin: 0,
                      fontStyle: 'italic'
                    }}>
    <strong>Traduction :</strong> {translatedDesc}
  </p>
                  </div>
                )}
              </div>
            </div>

            {/* Product Specifications */}
            <div style={{
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              padding: '30px',
              borderRadius: '20px',
              border: '1px solid rgba(138, 90, 68, 0.1)'
            }}>
              <h3 style={{
                fontSize: '1.8em',
                color: '#8a5a44',
                marginBottom: '20px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                ⚙️ Spécifications
              </h3>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '15px'
              }}>
        {product.material && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    padding: '15px',
                    background: 'rgba(138, 90, 68, 0.05)',
                    borderRadius: '12px',
                    border: '1px solid rgba(138, 90, 68, 0.1)'
                  }}>
                    <span style={{ fontSize: '1.5em' }}>🪵</span>
                    <div>
                      <div style={{
                        fontSize: '0.9em',
                        color: '#8a5a44',
                        fontWeight: 600,
                        marginBottom: '2px'
                      }}>
                        Matériau
                      </div>
                      <div style={{
                        fontSize: '1.1em',
                        color: '#5a4631',
                        fontWeight: 500
                      }}>
                        {product.material}
                      </div>
                    </div>
                  </div>
        )}
        {product.size && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    padding: '15px',
                    background: 'rgba(138, 90, 68, 0.05)',
                    borderRadius: '12px',
                    border: '1px solid rgba(138, 90, 68, 0.1)'
                  }}>
                    <span style={{ fontSize: '1.5em' }}>📏</span>
                    <div>
                      <div style={{
                        fontSize: '0.9em',
                        color: '#8a5a44',
                        fontWeight: 600,
                        marginBottom: '2px'
                      }}>
                        Taille
                      </div>
                      <div style={{
                        fontSize: '1.1em',
                        color: '#5a4631',
                        fontWeight: 500
                      }}>
                        {product.size}
                      </div>
                    </div>
                  </div>
                )}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  padding: '15px',
                  background: 'rgba(138, 90, 68, 0.05)',
                  borderRadius: '12px',
                  border: '1px solid rgba(138, 90, 68, 0.1)'
                }}>
                  <span style={{ fontSize: '1.5em' }}>👨‍🎨</span>
                  <div>
                    <div style={{
                      fontSize: '0.9em',
                      color: '#8a5a44',
                      fontWeight: 600,
                      marginBottom: '2px'
                    }}>
                      Artisan
                    </div>
                    <div style={{
                      fontSize: '1.1em',
                      color: '#5a4631',
                      fontWeight: 500
                    }}>
                      {product.artisanId && product.artisanId.nom && product.artisanId.prenom 
                        ? `${product.artisanId.prenom} ${product.artisanId.nom}` 
                        : 'Artisan inconnu'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
        </div>

          {/* Purchase Section */}
          <div style={{
            background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
            padding: '40px',
            borderRadius: '25px',
            textAlign: 'center',
            color: '#fff',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Decorative Elements */}
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '80px',
              height: '80px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '50%',
              opacity: 0.3
            }}></div>
            <div style={{
              position: 'absolute',
              bottom: '-30px',
              left: '-30px',
              width: '100px',
              height: '100px',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '50%',
              opacity: 0.2
            }}></div>

            <h3 style={{
              fontSize: '2em',
              marginBottom: '30px',
              fontWeight: 700,
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}>
              🛒 Ajouter au panier
            </h3>
            
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '20px',
              marginBottom: '30px',
              flexWrap: 'wrap'
            }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '15px',
                background: 'rgba(255,255,255,0.2)',
                padding: '15px 25px',
                borderRadius: '20px',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.3)'
              }}>
                {/* Affichage du stock disponible */}
                <div style={{
                  fontSize: '1.1em',
                  fontWeight: 600,
                  color: product?.stock > 0 ? '#4CAF50' : '#f44336',
                  textAlign: 'center'
                }}>
                  {product?.stock > 0 
                    ? `Stock disponible : ${product.stock} article(s)`
                    : 'Rupture de stock'
                  }
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  justifyContent: 'center'
                }}>
                  <label style={{
                    fontSize: '1.2em',
                    fontWeight: 600
                  }}>
                    Quantité :
                  </label>
                  <input
                    type="number"
                    min={product?.stock > 0 ? "1" : "0"}
                    max={product?.stock || 0}
                    value={quantity}
                    onChange={handleQuantityChange}
                    disabled={!product?.stock || product.stock <= 0}
                    style={{
                      width: '80px',
                      padding: '12px',
                      borderRadius: '10px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      backgroundColor: product?.stock > 0 ? 'rgba(255,255,255,0.9)' : 'rgba(200,200,200,0.6)',
                      fontSize: '1.1em',
                      fontWeight: 600,
                      textAlign: 'center',
                      color: product?.stock > 0 ? '#8a5a44' : '#999',
                      cursor: product?.stock > 0 ? 'text' : 'not-allowed'
                    }}
                  />
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <button
                onClick={addToCart}
                disabled={!product?.stock || product.stock <= 0}
                style={{
                  padding: '20px 40px',
                  background: product?.stock > 0 ? 'rgba(255,255,255,0.2)' : 'rgba(100,100,100,0.3)',
                  color: product?.stock > 0 ? '#fff' : '#ccc',
                  border: `2px solid ${product?.stock > 0 ? 'rgba(255,255,255,0.3)' : 'rgba(150,150,150,0.3)'}`,
                  borderRadius: '25px',
                  fontSize: '1.3em',
                  fontWeight: 700,
                  cursor: product?.stock > 0 ? 'pointer' : 'not-allowed',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
                  opacity: product?.stock > 0 ? 1 : 0.6
                }}
                onMouseOver={(e) => {
                  if (product?.stock > 0) {
                    e.target.style.background = 'rgba(255,255,255,0.3)';
                    e.target.style.transform = 'translateY(-3px) scale(1.05)';
                    e.target.style.boxShadow = '0 15px 35px rgba(0,0,0,0.3)';
                  }
                }}
                onMouseOut={(e) => {
                  if (product?.stock > 0) {
                    e.target.style.background = 'rgba(255,255,255,0.2)';
                    e.target.style.transform = 'translateY(0) scale(1)';
                    e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.2)';
                  }
                }}
              >
                {product?.stock > 0 ? '🛒 Ajouter au panier' : '❌ Rupture de stock'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Comments Section ===== */}
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

          <h3 style={{
            fontSize: '2.2em',
            color: '#8a5a44',
            textAlign: 'center',
            marginBottom: '40px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '15px'
          }}>
            💬 Commentaires
          </h3>

          {/* Comments List */}
          <div style={{
            maxHeight: '500px',
            overflowY: 'auto',
            marginBottom: '40px',
            paddingRight: '10px'
          }}>
            {comments.length > 0 ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
              }}>
                {comments.map((comment) => (
                  <div key={comment._id} style={{
                    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                    borderRadius: '20px',
                    padding: '25px',
                    border: '1px solid rgba(138, 90, 68, 0.1)',
                    position: 'relative',
                    transition: 'all 0.3s ease'
                  }} onMouseOver={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
                  }} onMouseOut={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}>
                    {/* Comment Header */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '15px',
                      flexWrap: 'wrap',
                      gap: '10px'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px'
                      }}>
                        <div style={{
                          width: '50px',
                          height: '50px',
                          background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontSize: '1.2em',
                          fontWeight: 700,
                          textShadow: '1px 1px 2px rgba(0,0,0,0.2)'
                        }}>
                          {comment.userId?.prenom ? comment.userId.prenom.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <p style={{
                            fontWeight: 700,
                            margin: '0 0 5px 0',
                            color: '#8a5a44',
                            fontSize: '1.1em'
                          }}>
                            {comment.userId?.prenom && comment.userId?.nom ? `${comment.userId.prenom} ${comment.userId.nom}` : 'Utilisateur inconnu'}
                          </p>
                          <p style={{
                            margin: 0,
                            color: '#6b5b47',
                            fontSize: '0.9em',
                            opacity: 0.8
                          }}>
                            {new Date(comment.createdAt).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      {comment.userId?._id === currentUserId && (
                        <div style={{
                          display: 'flex',
                          gap: '10px',
                          flexWrap: 'wrap'
                        }}>
                          <button
                            onClick={() => handleSummarize(comment._id, comment.text, comment.text)}
                            style={{
                              padding: '8px 15px',
                              background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '15px',
                              cursor: 'pointer',
                              fontSize: '0.9em',
                              fontWeight: 600,
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
                            📝 Résumer
                          </button>
                          <button
                            onClick={() => handleEditComment(comment._id, comment.text)}
                            style={{
                              padding: '8px 15px',
                              background: 'linear-gradient(135deg, #d4a373, #c78c5d)',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '15px',
                              cursor: 'pointer',
                              fontSize: '0.9em',
                              fontWeight: 600,
                              transition: 'all 0.3s ease',
                              boxShadow: '0 4px 15px rgba(212, 163, 115, 0.3)'
                            }}
                            onMouseOver={(e) => {
                              e.target.style.transform = 'translateY(-2px)';
                              e.target.style.boxShadow = '0 6px 20px rgba(212, 163, 115, 0.4)';
                            }}
                            onMouseOut={(e) => {
                              e.target.style.transform = 'translateY(0)';
                              e.target.style.boxShadow = '0 4px 15px rgba(212, 163, 115, 0.3)';
                            }}
                          >
                            ✏️ Modifier
                          </button>
                          <button
                            onClick={() => handleDeleteComment(comment._id)}
                            style={{
                              padding: '8px 15px',
                              background: 'linear-gradient(135deg, #dc3545, #c82333)',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '15px',
                              cursor: 'pointer',
                              fontSize: '0.9em',
                              fontWeight: 600,
                              transition: 'all 0.3s ease',
                              boxShadow: '0 4px 15px rgba(220, 53, 69, 0.3)'
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
                            🗑️ Supprimer
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Comment Content */}
                    {editingCommentId === comment._id ? (
                      <div style={{
                        background: 'rgba(138, 90, 68, 0.05)',
                        padding: '20px',
                        borderRadius: '15px',
                        border: '2px solid rgba(138, 90, 68, 0.2)'
                      }}>
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          style={{
                            width: '100%',
                            minHeight: '100px',
                            padding: '15px',
                            borderRadius: '12px',
                            border: '2px solid #d4a373',
                            fontSize: '1em',
                            fontFamily: 'inherit',
                            resize: 'vertical',
                            backgroundColor: '#fff'
                          }}
                          placeholder="Modifiez votre commentaire..."
                        />
                        <div style={{
                          display: 'flex',
                          gap: '10px',
                          marginTop: '15px',
                          justifyContent: 'flex-end'
                        }}>
                          <button
                            onClick={handleCancelEdit}
                            style={{
                              padding: '10px 20px',
                              background: 'linear-gradient(135deg, #6c757d, #5a6268)',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '12px',
                              cursor: 'pointer',
                              fontSize: '0.9em',
                              fontWeight: 600,
                              transition: 'all 0.3s ease'
                            }}
                            onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                          >
                            ❌ Annuler
                          </button>
                          <button
                            onClick={() => handleSaveEdit(comment._id)}
                            style={{
                              padding: '10px 20px',
                              background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '12px',
                              cursor: 'pointer',
                              fontSize: '0.9em',
                              fontWeight: 600,
                              transition: 'all 0.3s ease'
                            }}
                            onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                          >
                            ✅ Sauvegarder
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p style={{
                        margin: 0,
                        fontSize: '1.1em',
                        lineHeight: '1.6',
                        color: '#5a4631'
                      }}>
                        {comment.text}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                borderRadius: '20px',
                border: '2px dashed rgba(138, 90, 68, 0.3)'
              }}>
                <div style={{ fontSize: '4em', marginBottom: '20px' }}>💬</div>
                <h4 style={{
                  fontSize: '1.5em',
                  color: '#8a5a44',
                  marginBottom: '10px',
                  fontWeight: 600
                }}>
                  Aucun commentaire pour l'instant
                </h4>
                <p style={{
                  color: '#6b5b47',
                  fontSize: '1.1em',
                  margin: 0
                }}>
                  Soyez le premier à laisser un commentaire sur ce produit !
                </p>
              </div>
            )}
          </div>

          {/* Add Comment Form */}
          <div style={{
            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
            padding: '30px',
            borderRadius: '20px',
            border: '1px solid rgba(138, 90, 68, 0.1)'
          }}>
            <h4 style={{
              fontSize: '1.5em',
              color: '#8a5a44',
              marginBottom: '20px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              ✍️ Ajouter un commentaire
            </h4>
            <form onSubmit={handleCommentSubmit}>
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Partagez votre avis sur ce produit..."
                style={{
                  width: '100%',
                  minHeight: '120px',
                  padding: '20px',
                  borderRadius: '15px',
                  border: '2px solid #d4a373',
                  fontSize: '1.1em',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  backgroundColor: '#fff',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#8a5a44'}
                onBlur={(e) => e.target.style.borderColor = '#d4a373'}
              />
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginTop: '20px'
              }}>
                <button
                  type="submit"
                  style={{
                    padding: '15px 30px',
                    background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontSize: '1.1em',
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
                  📤 Publier le commentaire
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

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
          <div style={{ textAlign: 'left' }}>
            <h4 style={{
              fontSize: '1.3em',
              fontWeight: 600,
              marginBottom: '20px',
              textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
            }}>
              Navigation
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
                opacity: 0.9,
                transition: 'all 0.3s ease',
                padding: '5px 0'
              }} onMouseOver={(e) => {
                e.target.style.opacity = '1';
                e.target.style.transform = 'translateX(5px)';
              }} onMouseOut={(e) => {
                e.target.style.opacity = '0.9';
                e.target.style.transform = 'translateX(0)';
              }}>
                🏠 Explorer les produits
              </Link>
              <Link to="/favorites-cart" style={{
                color: '#fff',
                textDecoration: 'none',
                fontSize: '1em',
                opacity: 0.9,
                transition: 'all 0.3s ease',
                padding: '5px 0'
              }} onMouseOver={(e) => {
                e.target.style.opacity = '1';
                e.target.style.transform = 'translateX(5px)';
              }} onMouseOut={(e) => {
                e.target.style.opacity = '0.9';
                e.target.style.transform = 'translateX(0)';
              }}>
                ❤️ Mes favoris
              </Link>
              <Link to="/panier" style={{
                color: '#fff',
                textDecoration: 'none',
                fontSize: '1em',
                opacity: 0.9,
                transition: 'all 0.3s ease',
                padding: '5px 0'
              }} onMouseOver={(e) => {
                e.target.style.opacity = '1';
                e.target.style.transform = 'translateX(5px)';
              }} onMouseOut={(e) => {
                e.target.style.opacity = '0.9';
                e.target.style.transform = 'translateX(0)';
              }}>
                🛒 Mon panier
              </Link>
              <Link to="/workshop-booking" style={{
                color: '#fff',
                textDecoration: 'none',
                fontSize: '1em',
                opacity: 0.9,
                transition: 'all 0.3s ease',
                padding: '5px 0'
              }} onMouseOver={(e) => {
                e.target.style.opacity = '1';
                e.target.style.transform = 'translateX(5px)';
              }} onMouseOut={(e) => {
                e.target.style.opacity = '0.9';
                e.target.style.transform = 'translateX(0)';
              }}>
                📅 Mes réservations
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div style={{ textAlign: 'left' }}>
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
              gap: '12px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '1em',
                opacity: 0.9
              }}>
                <span>📧</span>
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
                fontSize: '1em',
                opacity: 0.9
              }}>
                <span>📞</span>
                <span>+216 12 345 678</span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '1em',
                opacity: 0.9
              }}>
                <span>📍</span>
                <span>Tunis, Tunisie</span>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.2)',
          marginTop: '40px',
          paddingTop: '20px',
          textAlign: 'center'
        }}>
          <p style={{
            fontSize: '1em',
            opacity: 0.8,
            margin: 0
          }}>
            © 2025 CraftHub. Tous droits réservés.
          </p>
        </div>
      </footer>

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

export default ProductDetail;