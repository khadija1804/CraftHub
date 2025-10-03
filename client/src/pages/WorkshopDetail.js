import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPublicWorkshop, getPublicWorkshopImage, addComment2, getComments, deleteComment2, updateComment2 } from '../services/api';

function WorkshopDetail() {
  const [workshop, setWorkshop] = useState(null);
  const [imageUrls, setImageUrls] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const { id } = useParams();
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState('');
  const [isBooking, setIsBooking] = useState(false);

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

  const bookWorkshop = async () => {
    if (workshop.places === 0) {
      alert('Désolé, cet atelier est complet !');
      return;
    }
    
    setIsBooking(true);
    try {
      // Simulation d'une réservation
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert(`${workshop.title} a été réservé avec succès !`);
    } catch (err) {
      alert('Erreur lors de la réservation. Veuillez réessayer.');
    } finally {
      setIsBooking(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    try {
      await addComment2({ workshopId: id, text: commentText });
      setCommentText('');
      const commentsRes = await getComments(id, 'workshops');
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
      await deleteComment2(id, commentId);
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
      await updateComment2(id, commentId, { text: editText });
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

  const currentUserId = localStorage.getItem('userId');

  if (loading) return <p style={{ textAlign: 'center' }}>Chargement...</p>;
  if (error) return <p style={{ color: '#a94442', textAlign: 'center' }}>{error}</p>;
  if (!workshop) return <p style={{ textAlign: 'center' }}>Atelier non trouvé.</p>;

  return (
    <div style={{ 
      fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif', 
      color: '#3a2f1a', 
      minHeight: '100vh', 
      backgroundColor: '#f8f1e9', 
      margin: 0, 
      padding: 0
    }}>
      {/* ===== Modern Header - Updated ===== */}
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

      {/* ===== Modern Workshop Section ===== */}
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

        {/* Modern Workshop Card */}
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
            {/* Workshop Header */}
            <div style={{
              textAlign: 'center',
              marginBottom: '40px',
              paddingBottom: '30px',
              borderBottom: '2px solid rgba(212, 163, 115, 0.2)'
            }}>
              <h1 style={{
                fontSize: '3.5em',
                color: '#8a5a44',
                margin: '0 0 20px 0',
                fontWeight: 700,
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                animation: 'fadeInUp 1s ease-out'
              }}>
                {workshop.title}
              </h1>
              
              {/* Price Badge */}
              <div style={{
                display: 'inline-block',
                backgroundColor: '#d4a373',
                color: '#fff',
                padding: '12px 24px',
                borderRadius: '30px',
                fontSize: '1.4em',
                fontWeight: 700,
                boxShadow: '0 4px 16px rgba(212, 163, 115, 0.3)',
                marginBottom: '20px',
                border: '1px solid rgba(255,255,255,0.3)'
              }}>
                {workshop.price || 'N/A'} €
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
          Par {workshop.artisanId && workshop.artisanId.nom && workshop.artisanId.prenom ? `${workshop.artisanId.prenom} ${workshop.artisanId.nom}` : 'Artisan inconnu'}
                </span>
              </div>
            </div>

            {/* Workshop Images Gallery */}
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
              alt={`${workshop.title} - Vue ${index + 1}`}
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

            {/* Workshop Details */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '24px',
              marginBottom: '40px'
            }}>
              {/* Category */}
              <div style={{
                backgroundColor: 'rgba(212, 163, 115, 0.05)',
                padding: '24px',
                borderRadius: '16px',
                border: '1px solid rgba(212, 163, 115, 0.2)'
              }}>
                <h3 style={{
                  fontSize: '1.8em',
                  color: '#8a5a44',
                  margin: '0 0 12px 0',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  🏷️ Catégorie
                </h3>
                <p style={{
                  fontSize: '1.1em',
                  lineHeight: '1.6',
                  color: '#5c4b38',
                  margin: 0,
                  fontWeight: 500
                }}>
                  {workshop.category}
                </p>
              </div>

              {/* Date */}
              <div style={{
                backgroundColor: 'rgba(138, 90, 68, 0.05)',
                padding: '24px',
                borderRadius: '16px',
                border: '1px solid rgba(138, 90, 68, 0.2)'
              }}>
                <h3 style={{
                  fontSize: '1.8em',
                  color: '#8a5a44',
                  margin: '0 0 12px 0',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  📅 Date
                </h3>
                <p style={{
                  fontSize: '1.1em',
                  lineHeight: '1.6',
                  color: '#5c4b38',
                  margin: 0,
                  fontWeight: 500
                }}>
                  {new Date(workshop.date).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>

              {/* Booking Time */}
              <div style={{
                backgroundColor: 'rgba(212, 163, 115, 0.05)',
                padding: '24px',
                borderRadius: '16px',
                border: '1px solid rgba(212, 163, 115, 0.2)'
              }}>
                <h3 style={{
                  fontSize: '1.8em',
                  color: '#8a5a44',
                  margin: '0 0 12px 0',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  🕐 Heure
                </h3>
                <p style={{
                  fontSize: '1.1em',
                  lineHeight: '1.6',
                  color: '#5c4b38',
                  margin: 0,
                  fontWeight: 500
                }}>
                  {workshop.booking_time}
                </p>
              </div>

              {/* Duration */}
              <div style={{
                backgroundColor: 'rgba(138, 90, 68, 0.05)',
                padding: '24px',
                borderRadius: '16px',
                border: '1px solid rgba(138, 90, 68, 0.2)'
              }}>
                <h3 style={{
                  fontSize: '1.8em',
                  color: '#8a5a44',
                  margin: '0 0 12px 0',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  ⏱️ Durée
                </h3>
                <p style={{
                  fontSize: '1.1em',
                  lineHeight: '1.6',
                  color: '#5c4b38',
                  margin: 0,
                  fontWeight: 500
                }}>
                  {workshop.duration} heures
                </p>
              </div>

              {/* Location */}
              <div style={{
                backgroundColor: 'rgba(212, 163, 115, 0.05)',
                padding: '24px',
                borderRadius: '16px',
                border: '1px solid rgba(212, 163, 115, 0.2)'
              }}>
                <h3 style={{
                  fontSize: '1.8em',
                  color: '#8a5a44',
                  margin: '0 0 12px 0',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  📍 Lieu
                </h3>
                <p style={{
                  fontSize: '1.1em',
                  lineHeight: '1.6',
                  color: '#5c4b38',
                  margin: 0,
                  fontWeight: 500
                }}>
                  {workshop.location}
                </p>
              </div>

              {/* Available Places */}
              <div style={{
                backgroundColor: workshop.places > 0 ? 'rgba(46, 125, 50, 0.1)' : 'rgba(211, 47, 47, 0.1)',
                padding: '24px',
                borderRadius: '16px',
                border: `1px solid ${workshop.places > 0 ? 'rgba(46, 125, 50, 0.2)' : 'rgba(211, 47, 47, 0.2)'}`
              }}>
                <h3 style={{
                  fontSize: '1.8em',
                  color: workshop.places > 0 ? '#2e7d32' : '#d32f2f',
                  margin: '0 0 12px 0',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  {workshop.places > 0 ? '✅' : '❌'} Places disponibles
                </h3>
                <p style={{
                  fontSize: '1.1em',
                  lineHeight: '1.6',
                  color: workshop.places > 0 ? '#2e7d32' : '#d32f2f',
                  margin: 0,
                  fontWeight: 600
                }}>
                  {workshop.places !== undefined && workshop.places !== null ? workshop.places : 'N/A'}
                  {workshop.places === 0 && ' (Complet)'}
                </p>
              </div>
            </div>

            {/* Booking Button */}
            <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <button
            onClick={bookWorkshop}
                disabled={workshop.places === 0 || workshop.places === undefined || isBooking}
                style={{
                  padding: '16px 40px',
                  backgroundColor: workshop.places === 0 ? '#6c757d' : '#8a5a44',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '30px',
                  cursor: workshop.places === 0 ? 'not-allowed' : 'pointer',
                  fontSize: '1.1em',
                  fontWeight: 600,
                  transition: 'all 0.3s ease',
                  boxShadow: '0 6px 20px rgba(138, 90, 68, 0.3)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}
                onMouseOver={(e) => {
                  if (workshop.places > 0) {
                    e.target.style.backgroundColor = '#704838';
                    e.target.style.transform = 'translateY(-3px)';
                    e.target.style.boxShadow = '0 8px 25px rgba(138, 90, 68, 0.4)';
                  }
                }}
                onMouseOut={(e) => {
                  if (workshop.places > 0) {
                    e.target.style.backgroundColor = '#8a5a44';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 6px 20px rgba(138, 90, 68, 0.3)';
                  }
                }}
              >
                {isBooking ? 'Réservation en cours...' : 
                 workshop.places === 0 ? 'Atelier complet' : 
                 'Réserver cet atelier'}
          </button>
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
              fontSize: '1.8em',
              color: '#8a5a44',
              textAlign: 'center',
              margin: '0 0 30px 0',
              fontWeight: 600,
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
                              color: '#5c4b38',
                              fontSize: '1.1em'
                            }}>
                    {comment.userId?.prenom && comment.userId?.nom ? `${comment.userId.prenom} ${comment.userId.nom}` : 'Utilisateur inconnu'}
                  </p>
                            <p style={{
                              margin: '0',
                              color: '#5c4b38',
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
                        
                  {comment.userId?._id === currentUserId && (
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
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
                            <button
                              onClick={() => handleEditComment(comment._id, comment.text)}
                              style={{
                                padding: '8px 16px',
                                backgroundColor: '#ffc107',
                                color: '#212529',
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
                                e.target.style.backgroundColor = '#e0a800';
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 4px 12px rgba(255, 193, 7, 0.3)';
                              }}
                              onMouseOut={(e) => {
                                e.target.style.backgroundColor = '#ffc107';
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = 'none';
                              }}
                            >
                              ✏️ Modifier
                      </button>
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                              style={{
                                padding: '8px 16px',
                                backgroundColor: '#dc3545',
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
                                e.target.style.backgroundColor = '#c82333';
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 4px 12px rgba(220, 53, 69, 0.3)';
                              }}
                              onMouseOut={(e) => {
                                e.target.style.backgroundColor = '#dc3545';
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = 'none';
                              }}
                            >
                              🗑️ Supprimer
                      </button>
                          </div>
                        )}
                      </div>
                      
                      {/* Comment Content */}
                      {editingCommentId === comment._id ? (
                        <div>
                          <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            style={{
                              width: '100%',
                              minHeight: '80px',
                              padding: '12px',
                              borderRadius: '10px',
                              border: '2px solid #8a5a44',
                              marginBottom: '15px',
                              fontSize: '1em',
                              fontFamily: 'inherit',
                              resize: 'vertical'
                            }}
                            placeholder="Modifiez votre commentaire..."
                          />
                          <div style={{ display: 'flex', gap: '10px' }}>
                          <button
                            onClick={() => handleSaveEdit(comment._id)}
                              style={{
                                padding: '8px 20px',
                                backgroundColor: '#28a745',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '20px',
                                cursor: 'pointer',
                                fontWeight: '500',
                                transition: 'all 0.3s ease'
                              }}
                              onMouseOver={(e) => {
                                e.target.style.backgroundColor = '#218838';
                                e.target.style.transform = 'translateY(-1px)';
                              }}
                              onMouseOut={(e) => {
                                e.target.style.backgroundColor = '#28a745';
                                e.target.style.transform = 'translateY(0)';
                              }}
                            >
                              💾 Sauvegarder
                          </button>
                          <button
                            onClick={handleCancelEdit}
                              style={{
                                padding: '8px 20px',
                                backgroundColor: '#6c757d',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '20px',
                                cursor: 'pointer',
                                fontWeight: '500',
                                transition: 'all 0.3s ease'
                              }}
                              onMouseOver={(e) => {
                                e.target.style.backgroundColor = '#5a6268';
                                e.target.style.transform = 'translateY(-1px)';
                              }}
                              onMouseOut={(e) => {
                                e.target.style.backgroundColor = '#6c757d';
                                e.target.style.transform = 'translateY(0)';
                              }}
                            >
                              ❌ Annuler
                          </button>
                          </div>
                        </div>
                      ) : (
                        <p style={{
                          margin: '0',
                          fontSize: '1em',
                          lineHeight: '1.6',
                          color: '#5c4b38',
                          fontWeight: 500
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
                    Soyez le premier à laisser un commentaire sur cet atelier !
                  </p>
                </div>
            )}
          </div>

            {/* Add Comment Form */}
            <div style={{
              borderTop: '2px solid rgba(212, 163, 115, 0.2)',
              paddingTop: '30px'
            }}>
              <h4 style={{
                fontSize: '1.3em',
                color: '#8a5a44',
                marginBottom: '20px',
                fontWeight: 600
              }}>
                Ajouter un commentaire
              </h4>
              <form onSubmit={handleCommentSubmit}>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Partagez votre expérience avec cet atelier..."
                  style={{
                    width: '100%',
                    minHeight: '120px',
                    padding: '15px',
                    borderRadius: '12px',
                    border: '2px solid rgba(212, 163, 115, 0.2)',
                    marginBottom: '20px',
                    fontSize: '1em',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    backgroundColor: '#fff',
                    color: '#5c4b38',
                    transition: 'border-color 0.3s ease',
                    fontWeight: 500
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#8a5a44'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(212, 163, 115, 0.2)'}
                />
                <div style={{ textAlign: 'right' }}>
            <button
              type="submit"
                    disabled={!commentText.trim()}
                    style={{
                      padding: '12px 30px',
                      backgroundColor: commentText.trim() ? '#8a5a44' : '#6c757d',
                      color: '#fff',
                      border: '1px solid rgba(255,255,255,0.3)',
                      borderRadius: '30px',
                      cursor: commentText.trim() ? 'pointer' : 'not-allowed',
                      fontSize: '1em',
                      fontWeight: '600',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 12px rgba(138, 90, 68, 0.3)'
                    }}
                    onMouseOver={(e) => {
                      if (commentText.trim()) {
                        e.target.style.backgroundColor = '#704838';
                        e.target.style.transform = 'translateY(-2px)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (commentText.trim()) {
                        e.target.style.backgroundColor = '#8a5a44';
                        e.target.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    📤 Publier le commentaire
                  </button>
                </div>
          </form>
            </div>
          </div>
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
    </div>
  );
}

export default WorkshopDetail;