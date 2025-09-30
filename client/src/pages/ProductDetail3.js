import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getPublicProduct, getPublicProductImage, addComment, getComments } from '../services/api';
import ArtisanHeader from '../components/ArtisanHeader';
import ArtisanFooter from '../components/ArtisanFooter';

function ProductDetail3() {
  const [product, setProduct] = useState(null);
  const [imageUrls, setImageUrls] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const { id } = useParams();
  const navigate = useNavigate();

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

  if (loading) return <p style={{ textAlign: 'center' }}>Chargement...</p>;
  if (error) return <p style={{ color: '#a94442', textAlign: 'center' }}>{error}</p>;
  if (!product) return <p style={{ textAlign: 'center' }}>Produit non trouvé.</p>;

  return (
    <div style={{ fontFamily: '"Georgia", serif', color: '#3a2f1a', minHeight: '100vh', backgroundColor: '#f8f1e9', margin: 0, padding: 0 }}>
      <ArtisanHeader />

      {/* ===== Modern Product Section ===== */}
      <section style={{
        maxWidth: '1200px',
        margin: '40px auto',
        padding: '0 30px',
        display: 'flex',
        flexDirection: 'column',
        gap: '30px',
      }}>
        {/* Error Messages */}
        {error && (
          <div style={{
            color: '#8a5a44',
            backgroundColor: '#fff',
            padding: '16px 24px',
            borderRadius: '12px',
            textAlign: 'center',
            marginBottom: '20px',
            border: '1px solid #d4a373',
            boxShadow: '0 4px 12px rgba(138, 90, 68, 0.1)',
            fontSize: '16px',
            fontWeight: '500'
          }}>
            {error}
          </div>
        )}

        {/* Modern Product Card */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '20px',
          padding: '40px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          border: '1px solid rgba(212, 163, 115, 0.2)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative background pattern */}
          <div style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '200px',
            height: '200px',
            background: 'linear-gradient(135deg, rgba(212, 163, 115, 0.1) 0%, rgba(138, 90, 68, 0.05) 100%)',
            borderRadius: '50%',
            zIndex: 0
          }} />
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* Product Header */}
            <div style={{
              textAlign: 'center',
              marginBottom: '40px',
              paddingBottom: '30px',
              borderBottom: '2px solid rgba(212, 163, 115, 0.2)'
            }}>
              <h1 style={{
                fontSize: '2.8em',
                color: '#8a5a44',
                margin: '0 0 20px 0',
                fontWeight: 700,
                letterSpacing: '-0.5px',
                textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
              }}>
                {product.name}
              </h1>
              
              {/* Price Badge */}
              <div style={{
                display: 'inline-block',
                backgroundColor: '#d4a373',
                color: '#fff',
                padding: '12px 24px',
                borderRadius: '25px',
                fontSize: '1.4em',
                fontWeight: 700,
                boxShadow: '0 4px 16px rgba(212, 163, 115, 0.3)',
                marginBottom: '20px'
              }}>
                {product.price} €
              </div>

              {/* Artisan Info */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                marginTop: '20px',
                padding: '12px 20px',
                backgroundColor: 'rgba(138, 90, 68, 0.1)',
                borderRadius: '20px',
                border: '1px solid rgba(138, 90, 68, 0.2)',
                maxWidth: '400px',
                margin: '20px auto 0'
              }}>
                <span style={{ fontSize: '1.2em' }}>👨‍🎨</span>
                <span style={{ fontSize: '1.1em', fontWeight: 600, color: '#8a5a44' }}>
          Par {product.artisanId && product.artisanId.nom && product.artisanId.prenom ? `${product.artisanId.prenom} ${product.artisanId.nom}` : 'Artisan inconnu'}
                </span>
              </div>
            </div>

            {/* Product Images Gallery */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px',
              marginBottom: '40px'
            }}>
          {imageUrls.map((url, index) => (
                <div key={index} style={{
                  position: 'relative',
                  aspectRatio: '1/1',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  transition: 'transform 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.18)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                }}>
                  <img
              src={url}
              alt={`${product.name} - Vue ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.3s ease'
                    }}
                    onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                    onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                  />
                  {/* Image number badge */}
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    color: '#fff',
                    padding: '6px 12px',
                    borderRadius: '12px',
                    fontSize: '0.9em',
                    fontWeight: 600,
                    backdropFilter: 'blur(10px)'
                  }}>
                    {index + 1}
                  </div>
                </div>
          ))}
        </div>

            {/* Product Details */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '24px',
              marginBottom: '40px'
            }}>
              {/* Description */}
              {product.description && (
                <div style={{
                  backgroundColor: 'rgba(212, 163, 115, 0.05)',
                  padding: '24px',
                  borderRadius: '16px',
                  border: '1px solid rgba(212, 163, 115, 0.2)'
                }}>
                  <h3 style={{
                    fontSize: '1.3em',
                    color: '#8a5a44',
                    margin: '0 0 12px 0',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    📝 Description
                  </h3>
                  <p style={{
                    fontSize: '1em',
                    lineHeight: '1.6',
                    color: '#3a2f1a',
                    margin: 0
                  }}>
                    {product.description}
                  </p>
                </div>
              )}

              {/* Material */}
              {product.material && (
                <div style={{
                  backgroundColor: 'rgba(138, 90, 68, 0.05)',
                  padding: '24px',
                  borderRadius: '16px',
                  border: '1px solid rgba(138, 90, 68, 0.2)'
                }}>
                  <h3 style={{
                    fontSize: '1.3em',
                    color: '#8a5a44',
                    margin: '0 0 12px 0',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    🧱 Matériau
                  </h3>
                  <p style={{
                    fontSize: '1em',
                    lineHeight: '1.6',
                    color: '#3a2f1a',
                    margin: 0
                  }}>
                    {product.material}
                  </p>
                </div>
              )}

              {/* Size */}
              {product.size && (
                <div style={{
                  backgroundColor: 'rgba(212, 163, 115, 0.05)',
                  padding: '24px',
                  borderRadius: '16px',
                  border: '1px solid rgba(212, 163, 115, 0.2)'
                }}>
                  <h3 style={{
                    fontSize: '1.3em',
                    color: '#8a5a44',
                    margin: '0 0 12px 0',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    📏 Taille
                  </h3>
                  <p style={{
                    fontSize: '1em',
                    lineHeight: '1.6',
                    color: '#3a2f1a',
                    margin: 0
                  }}>
                    {product.size}
                  </p>
                </div>
              )}

              {/* Stock */}
              {product.stock !== undefined && (
                <div style={{
                  backgroundColor: product.stock === 0 ? 'rgba(220, 38, 38, 0.05)' : 'rgba(138, 90, 68, 0.05)',
                  padding: '24px',
                  borderRadius: '16px',
                  border: product.stock === 0 ? '1px solid rgba(220, 38, 38, 0.3)' : '1px solid rgba(138, 90, 68, 0.2)'
                }}>
                  <h3 style={{
                    fontSize: '1.3em',
                    color: product.stock === 0 ? '#dc2626' : '#8a5a44',
                    margin: '0 0 12px 0',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    {product.stock === 0 ? '⚠️' : '📦'} Stock
                  </h3>
                  <p style={{
                    fontSize: '1em',
                    lineHeight: '1.6',
                    color: product.stock === 0 ? '#dc2626' : '#3a2f1a',
                    margin: 0,
                    fontWeight: 600
                  }}>
                    {product.stock === 0 
                      ? 'Rupture de stock - Attendre un nouveau arrivage' 
                      : `${product.stock} unités disponibles`
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ===== Modern Comments Section ===== */}
      <section style={{
        maxWidth: '1200px',
        margin: '40px auto',
        padding: '0 30px'
      }}>
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '20px',
          padding: '40px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          border: '1px solid rgba(212, 163, 115, 0.2)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative background pattern */}
          <div style={{
            position: 'absolute',
            top: '-30px',
            left: '-30px',
            width: '150px',
            height: '150px',
            background: 'linear-gradient(135deg, rgba(138, 90, 68, 0.1) 0%, rgba(212, 163, 115, 0.05) 100%)',
            borderRadius: '50%',
            zIndex: 0
          }} />
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h3 style={{
              fontSize: '2em',
              color: '#8a5a44',
              textAlign: 'center',
              margin: '0 0 30px 0',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px'
            }}>
              💬 Commentaires
            </h3>
            
            <div style={{
              maxHeight: '400px',
              overflowY: 'auto',
              marginBottom: '20px',
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
                      backgroundColor: 'rgba(212, 163, 115, 0.05)',
                      border: '1px solid rgba(212, 163, 115, 0.2)',
                      borderRadius: '16px',
                      padding: '20px',
                      transition: 'all 0.3s ease',
                      position: 'relative'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(212, 163, 115, 0.1)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(212, 163, 115, 0.15)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(212, 163, 115, 0.05)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}>
                      {/* Comment Header */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '12px',
                        flexWrap: 'wrap',
                        gap: '10px'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            backgroundColor: '#d4a373',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontWeight: 600,
                            fontSize: '1.1em'
                          }}>
                            {comment.userId?.prenom ? comment.userId.prenom.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <p style={{
                              fontWeight: '600',
                              margin: '0',
                              color: '#8a5a44',
                              fontSize: '1.1em'
                            }}>
                              {comment.userId?.prenom && comment.userId?.nom ? `${comment.userId.prenom} ${comment.userId.nom}` : 'Utilisateur inconnu'}
                            </p>
                            <p style={{
                              margin: '0',
                              color: '#8a5a44',
                              fontSize: '0.9em',
                              opacity: 0.7
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
                        
                  <button
                          onClick={() => handleSummarize(comment._id, comment.text, comment.text)}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#8a5a44',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            fontSize: '0.9em',
                            fontWeight: '600',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                          onMouseOver={(e) => {
                            e.target.style.backgroundColor = '#704838';
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 4px 12px rgba(112, 72, 56, 0.3)';
                          }}
                          onMouseOut={(e) => {
                            e.target.style.backgroundColor = '#8a5a44';
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = 'none';
                          }}
                        >
                          ✂️ Résumer
                  </button>
                      </div>
                      
                      {/* Comment Content */}
                      <p style={{
                        margin: '0',
                        fontSize: '1em',
                        lineHeight: '1.6',
                        color: '#3a2f1a'
                      }}>
                        {comment.text}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  backgroundColor: 'rgba(212, 163, 115, 0.05)',
                  borderRadius: '16px',
                  border: '2px dashed rgba(212, 163, 115, 0.3)'
                }}>
                  <div style={{ fontSize: '4em', marginBottom: '20px' }}>💬</div>
                  <h4 style={{
                    color: '#8a5a44',
                    fontSize: '1.3em',
                    margin: '0 0 10px 0',
                    fontWeight: 600
                  }}>
                    Aucun commentaire pour l'instant
                  </h4>
                  <p style={{
                    color: '#8a5a44',
                    fontSize: '1em',
                    margin: 0,
                    opacity: 0.7
                  }}>
                   
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <ArtisanFooter />
    </div>
  );
}

export default ProductDetail3;