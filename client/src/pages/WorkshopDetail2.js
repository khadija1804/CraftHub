import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getPublicWorkshop, getPublicWorkshopImage, addComment2, getComments } from '../services/api';

function WorkshopDetail2() {
  const [workshop, setWorkshop] = useState(null);
  const [imageUrls, setImageUrls] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const { id } = useParams();

  useEffect(() => {
    const fetchWorkshop = async () => {
      try {
        setLoading(true);
        const workRes = await getPublicWorkshop(id);
        setWorkshop(workRes.data);

        const urls = [];
        for (let index = 0; index < workRes.data.images.length; index++) {
          try {
            const response = await getPublicWorkshopImage(id, index);
            urls.push(URL.createObjectURL(response.data));
          } catch (err) {
            console.error('Failed to fetch image for workshop ID:', id, 'index:', index, err);
          }
        }
        setImageUrls(urls);

        // Récupérer les commentaires
        const commentsRes = await getComments(id, 'workshops');
        setComments(commentsRes.data);
        setError('');
      } catch (err) {
        setError('Erreur lors du chargement de l\'atelier ou des commentaires.');
        console.error('API Error:', err.response ? err.response.data : err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkshop();
  }, [id]);

  useEffect(() => {
    return () => {
      imageUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imageUrls]);

  const bookWorkshop = () => {
    alert(`${workshop.title} a été réservé !`);
  };

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
          <p style={{ fontSize: '1.2em', color: '#8a5a44', fontWeight: '600' }}>Chargement de l'atelier...</p>
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
          <a href="/admin-home" style={{
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
          </a>
        </div>
      </div>
    );
  }

  if (!workshop) {
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
          <h2 style={{ color: '#8a5a44', marginBottom: '15px' }}>Atelier non trouvé</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>L'atelier que vous recherchez n'existe pas ou a été supprimé.</p>
          <a href="/admin-home" style={{
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
          </a>
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
      {/* ===== Header Admin ===== */}
      <header style={{
        background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
        color: '#fff',
        padding: '20px 0',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{
            fontSize: '2.2em',
            margin: '0',
            fontWeight: '700',
            background: 'linear-gradient(45deg, #fff, #f0f0f0)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            <a href="/admin-home" style={{ color: 'inherit', textDecoration: 'none' }}>
              🎨 CraftHub Admin
            </a>
        </h1>
          <nav style={{ display: 'flex', gap: '25px', alignItems: 'center' }}>
            <a href="/admin-home" style={{
              color: 'rgba(255,255,255,0.9)',
              textDecoration: 'none',
              fontWeight: '600',
              padding: '8px 16px',
              borderRadius: '20px',
              transition: 'all 0.3s ease',
              background: 'rgba(255,255,255,0.1)'
            }}>
              🏠 Supervision
            </a>
            <a href="/admin/subscriptions" style={{
              color: 'rgba(255,255,255,0.9)',
              textDecoration: 'none',
              fontWeight: '600',
              padding: '8px 16px',
              borderRadius: '20px',
              transition: 'all 0.3s ease',
              background: 'rgba(255,255,255,0.1)'
            }}>
              💳 Abonnements
            </a>
            <a href="/admin-statistics" style={{
              color: 'rgba(255,255,255,0.9)',
              textDecoration: 'none',
              fontWeight: '600',
              padding: '8px 16px',
              borderRadius: '20px',
              transition: 'all 0.3s ease',
              background: 'rgba(255,255,255,0.1)'
            }}>
              📊 Statistiques
            </a>
            <a href="/login" style={{
              color: 'rgba(255,255,255,0.9)',
              textDecoration: 'none',
              fontWeight: '600',
              padding: '8px 16px',
              borderRadius: '20px',
              transition: 'all 0.3s ease',
              background: 'rgba(255,255,255,0.1)'
            }}>
              🚪 Déconnexion
            </a>
        </nav>
        </div>
      </header>

      {/* ===== Hero Section ===== */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(138, 90, 68, 0.1), rgba(212, 163, 115, 0.1))',
        padding: '60px 0',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          width: '100px',
          height: '100px',
          background: 'linear-gradient(45deg, rgba(138, 90, 68, 0.1), rgba(212, 163, 115, 0.1))',
          borderRadius: '50%',
          animation: 'float 6s ease-in-out infinite'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '30px',
          left: '30px',
          width: '60px',
          height: '60px',
          background: 'linear-gradient(45deg, rgba(212, 163, 115, 0.1), rgba(138, 90, 68, 0.1))',
          borderRadius: '50%',
          animation: 'float 4s ease-in-out infinite reverse'
        }}></div>
        
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: '3.5em',
            color: '#8a5a44',
            marginBottom: '20px',
            fontWeight: '800',
            textShadow: '0 4px 8px rgba(0,0,0,0.1)',
            background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            🛠️ Détails de l'Atelier
          </h1>
          <p style={{
            fontSize: '1.3em',
            color: '#666',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Informations complètes et gestion de l'atelier
          </p>
        </div>
      </div>

      {/* ===== Main Content ===== */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 20px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '40px',
        alignItems: 'start'
      }}>
        {/* ===== Workshop Header Info ===== */}
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '25px',
          padding: '40px',
          boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
          border: '1px solid rgba(138, 90, 68, 0.1)',
          gridColumn: '1 / -1',
          marginBottom: '20px'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '40px',
            alignItems: 'center'
          }}>
            <div>
              <h2 style={{
                fontSize: '2.8em',
                color: '#8a5a44',
                marginBottom: '20px',
                fontWeight: '700',
                lineHeight: '1.2'
              }}>
                {workshop.title}
              </h2>
              <p style={{
                fontSize: '1.2em',
                color: '#666',
                marginBottom: '15px',
                lineHeight: '1.6'
              }}>
                {workshop.description || 'Aucune description disponible.'}
              </p>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                marginTop: '20px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  background: 'linear-gradient(135deg, #e8f5e8, #c8e6c9)',
                  borderRadius: '20px',
                  color: '#2e7d32',
                  fontWeight: '600'
                }}>
                  👤 {workshop.artisanId && workshop.artisanId.nom && workshop.artisanId.prenom ? 
                    `${workshop.artisanId.prenom} ${workshop.artisanId.nom}` : 'Artisan inconnu'}
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  background: 'linear-gradient(135deg, #fff3e0, #ffe0b2)',
                  borderRadius: '20px',
                  color: '#f57c00',
                  fontWeight: '600'
                }}>
                  🏷️ {workshop.category}
                </div>
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
                padding: '25px',
                borderRadius: '20px',
                textAlign: 'center',
                border: '2px solid #2196f3'
              }}>
                <div style={{ fontSize: '2.5em', marginBottom: '10px' }}>💰</div>
                <h3 style={{
                  fontSize: '2em',
                  color: '#1976d2',
                  margin: '0 0 5px 0',
                  fontWeight: '700'
                }}>
                  {workshop.price || 'N/A'} €
                </h3>
                <p style={{
                  fontSize: '1.1em',
                  color: '#666',
                  margin: '0'
                }}>
                  Prix de l'atelier
                </p>
              </div>
              
              <div style={{
                background: workshop.places > 0 ? 
                  'linear-gradient(135deg, #e8f5e8, #c8e6c9)' : 
                  'linear-gradient(135deg, #ffebee, #ffcdd2)',
                padding: '25px',
                borderRadius: '20px',
                textAlign: 'center',
                border: `2px solid ${workshop.places > 0 ? '#4caf50' : '#f44336'}`
              }}>
                <div style={{ fontSize: '2.5em', marginBottom: '10px' }}>
                  {workshop.places > 0 ? '🎫' : '❌'}
                </div>
                <h3 style={{
                  fontSize: '2em',
                  color: workshop.places > 0 ? '#2e7d32' : '#d32f2f',
                  margin: '0 0 5px 0',
                  fontWeight: '700'
                }}>
                  {workshop.places !== undefined && workshop.places !== null ? workshop.places : 'N/A'}
                </h3>
                <p style={{
                  fontSize: '1.1em',
                  color: '#666',
                  margin: '0'
                }}>
                  {workshop.places === 0 ? 'Complet' : 'Places restantes'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ===== Workshop Details ===== */}
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '25px',
          padding: '40px',
          boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
          border: '1px solid rgba(138, 90, 68, 0.1)'
        }}>
          <h3 style={{
            fontSize: '1.8em',
            color: '#8a5a44',
            marginBottom: '25px',
            fontWeight: '700',
            textAlign: 'center'
          }}>
            📋 Informations Détaillées
          </h3>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              padding: '15px',
              background: 'linear-gradient(135deg, #f3e5f5, #e1bee7)',
              borderRadius: '15px'
            }}>
              <div style={{ fontSize: '1.5em' }}>📅</div>
              <div>
                <p style={{
                  fontSize: '1.1em',
                  color: '#8a5a44',
                  margin: '0 0 5px 0',
                  fontWeight: '600'
                }}>
                  Date de l'atelier
                </p>
                <p style={{
                  fontSize: '1em',
                  color: '#666',
                  margin: '0'
                }}>
                  {new Date(workshop.date).toLocaleString()}
                </p>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              padding: '15px',
              background: 'linear-gradient(135deg, #fff3e0, #ffe0b2)',
              borderRadius: '15px'
            }}>
              <div style={{ fontSize: '1.5em' }}>⏱️</div>
              <div>
                <p style={{
                  fontSize: '1.1em',
                  color: '#8a5a44',
                  margin: '0 0 5px 0',
                  fontWeight: '600'
                }}>
                  Durée
                </p>
                <p style={{
                  fontSize: '1em',
                  color: '#666',
                  margin: '0'
                }}>
                  {workshop.duration} heures
                </p>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              padding: '15px',
              background: 'linear-gradient(135deg, #e8f5e8, #c8e6c9)',
              borderRadius: '15px'
            }}>
              <div style={{ fontSize: '1.5em' }}>📍</div>
              <div>
                <p style={{
                  fontSize: '1.1em',
                  color: '#8a5a44',
                  margin: '0 0 5px 0',
                  fontWeight: '600'
                }}>
                  Lieu
                </p>
                <p style={{
                  fontSize: '1em',
                  color: '#666',
                  margin: '0'
                }}>
                  {workshop.location}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ===== Workshop Images ===== */}
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '25px',
          padding: '40px',
          boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
          border: '1px solid rgba(138, 90, 68, 0.1)'
        }}>
          <h3 style={{
            fontSize: '1.8em',
            color: '#8a5a44',
            marginBottom: '25px',
            fontWeight: '700',
            textAlign: 'center'
          }}>
            🖼️ Galerie d'Images
          </h3>
          
          {imageUrls.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px'
            }}>
          {imageUrls.map((url, index) => (
                <div key={index} style={{
                  position: 'relative',
                  borderRadius: '15px',
                  overflow: 'hidden',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                className="card-hover"
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 12px 35px rgba(0,0,0,0.25)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                }}>
                  <img
              src={url}
              alt={`${workshop.title} - Vue ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: '0',
                    left: '0',
                    right: '0',
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                    color: '#fff',
                    padding: '15px',
                    textAlign: 'center'
                  }}>
                    <p style={{
                      margin: '0',
                      fontSize: '0.9em',
                      fontWeight: '600'
                    }}>
                      Vue {index + 1}
                    </p>
                  </div>
                </div>
          ))}
        </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#666'
            }}>
              <div style={{ fontSize: '3em', marginBottom: '15px' }}>📷</div>
              <p style={{ fontSize: '1.1em', margin: '0' }}>
                Aucune image disponible pour cet atelier
              </p>
            </div>
          )}
        </div>

        {/* ===== Comments Section ===== */}
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '25px',
          padding: '40px',
          boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
          border: '1px solid rgba(138, 90, 68, 0.1)',
          gridColumn: '1 / -1'
        }}>
          <h3 style={{
            fontSize: '1.8em',
            color: '#8a5a44',
            marginBottom: '25px',
            fontWeight: '700',
            textAlign: 'center'
          }}>
            💬 Commentaires des Clients
          </h3>
          
            {comments.length > 0 ? (
            <div style={{
              display: 'grid',
              gap: '20px',
              maxHeight: '400px',
              overflowY: 'auto',
              paddingRight: '10px'
            }}>
              {comments.map((comment) => (
                <div key={comment._id} style={{
                  background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
                  borderRadius: '15px',
                  padding: '25px',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                  border: '1px solid rgba(138, 90, 68, 0.1)',
                  transition: 'all 0.3s ease'
                }}
                className="card-hover">
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '15px'
                  }}>
                    <div>
                      <p style={{
                        fontWeight: '700',
                        color: '#8a5a44',
                        margin: '0 0 5px 0',
                        fontSize: '1.1em'
                      }}>
                        👤 {comment.userId?.prenom && comment.userId?.nom ? 
                          `${comment.userId.prenom} ${comment.userId.nom}` : 'Utilisateur inconnu'}
                      </p>
                      <p style={{
                        color: '#666',
                        margin: '0',
                        fontSize: '0.9em'
                      }}>
                        📅 {new Date(comment.createdAt).toLocaleString()}
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
                        fontWeight: '600',
                        fontSize: '0.9em',
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
                  </div>
                  <p style={{
                    margin: '0',
                    lineHeight: '1.6',
                    color: '#333',
                    fontSize: '1em'
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
              <div style={{ fontSize: '3em', marginBottom: '15px' }}>💬</div>
              <p style={{ fontSize: '1.1em', margin: '0' }}>
                Aucun commentaire pour cet atelier pour le moment
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ===== Footer Admin ===== */}
      <footer style={{
        background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
        color: '#fff',
        padding: '50px 0 30px',
        marginTop: '60px'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '40px',
            marginBottom: '30px'
          }}>
            <div>
              <h3 style={{
                fontSize: '1.5em',
                marginBottom: '20px',
                fontWeight: '700'
              }}>
                🎨 CraftHub Admin
              </h3>
              <p style={{
                lineHeight: '1.6',
                opacity: '0.9'
              }}>
                Plateforme de gestion complète pour les artisans et leurs créations.
              </p>
            </div>
            
            <div>
              <h4 style={{
                fontSize: '1.2em',
                marginBottom: '15px',
                fontWeight: '600'
              }}>
                🔗 Liens Rapides
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <a href="/admin-home" style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none' }}>🏠 Supervision</a>
                <a href="/admin/subscriptions" style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none' }}>💳 Abonnements</a>
                <a href="/admin-statistics" style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none' }}>📊 Statistiques</a>
              </div>
            </div>
            
            <div>
              <h4 style={{
                fontSize: '1.2em',
                marginBottom: '15px',
                fontWeight: '600'
              }}>
                📞 Contact
              </h4>
              <p style={{ margin: '0 0 8px 0', opacity: '0.9' }}>
                📧 contact@crafthub.com
              </p>
              <p style={{ margin: '0 0 8px 0', opacity: '0.9' }}>
                📱 +1 (555) 123-4567
              </p>
          </div>
 
            <div>
              <h4 style={{
                fontSize: '1.2em',
                marginBottom: '15px',
                fontWeight: '600'
              }}>
                🌐 Suivez-nous
              </h4>
              <div style={{ display: 'flex', gap: '15px' }}>
                <a href="https://facebook.com/crafthub" style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none' }}>📘 Facebook</a>
                <a href="https://instagram.com/crafthub" style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none' }}>📷 Instagram</a>
              </div>
        </div>
      </div>

          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.2)',
            paddingTop: '20px',
            textAlign: 'center',
            opacity: '0.8'
          }}>
            <p style={{ margin: '0 0 10px 0' }}>
              © 2025 CraftHub. Tous droits réservés.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '0.9em' }}>
              <a href="/privacy" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>Confidentialité</a>
              <a href="/terms" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>Conditions</a>
              <a href="/cookies" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>Cookies</a>
            </div>
          </div>
        </div>
      </footer>

      {/* ===== CSS Animations ===== */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
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
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .card-hover {
          transition: all 0.3s ease;
        }
        
        .card-hover:hover {
          transform: translateY(-5px);
        }
        
        /* Scrollbar personnalisée */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #8a5a44, #d4a373);
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #704838, #c19a6b);
        }
      `}</style>
    </div>
  );
}

export default WorkshopDetail2;
