import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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

  const bookWorkshop = () => {
    alert(`${workshop.title} a été réservé !`);
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
    <div style={{ fontFamily: '"Georgia", serif', color: '#3a2f1a', minHeight: '100vh', backgroundColor: '#f8f1e9', margin: 0, padding: 0 }}>
      <header style={{ backgroundColor: '#8a5a44', color: '#fff', padding: '20px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h1 style={{ fontSize: '2em', margin: '0', fontWeight: 700 }}>
          <a href="/client-home" style={{ color: '#fff', textDecoration: 'none' }}>CraftHub</a>
        </h1>
             <nav style={{ marginTop: '10px' }}>
          <a href="/client-home" style={{ color: '#d4a373', margin: '0 15px', textDecoration: 'none', fontWeight: 500 }}>Acceuil</a>
          <a href="/favorites-cart" style={{ color: '#d4a373', margin: '0 15px', textDecoration: 'none', fontWeight: 500 }}>Favoris</a>
          <a href="/panier" style={{ color: '#d4a373', margin: '0 15px', textDecoration: 'none', fontWeight: 500 }}>Panier</a>
          <a href="/workshop-booking" style={{ color: '#d4a373', margin: '0 15px', textDecoration: 'none', fontWeight: 500 }}>Réservations</a>          
          <a href="/client-profile" style={{ color: '#d4a373', margin: '0 15px', textDecoration: 'none', fontWeight: 500 }}>Profil</a>
          <a href="/login" style={{ color: '#d4a373', margin: '0 15px', textDecoration: 'none', fontWeight: 500 }}>Déconnexion</a>
        </nav>
      </header>

      <div style={{ padding: '40px', maxWidth: '800px', margin: '50px auto', backgroundColor: '#fff', borderRadius: '20px', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize: '2.5em', color: '#8a5a44', textAlign: 'center', marginBottom: '20px' }}>{workshop.title}</h2>
        <p style={{ fontSize: '1.2em', textAlign: 'center', marginBottom: '10px' }}>Prix : {workshop.price || 'N/A'} €</p>
        <p style={{ fontSize: '1em', textAlign: 'center', marginBottom: '10px' }}>Catégorie : {workshop.category}</p>
        <p style={{ fontSize: '1em', textAlign: 'center', marginBottom: '10px' }}>Date : {new Date(workshop.date).toLocaleString()}</p>
        <p style={{ fontSize: '1em', textAlign: 'center', marginBottom: '10px' }}>Durée : {workshop.duration} heures</p>
        <p style={{ fontSize: '1em', textAlign: 'center', marginBottom: '10px' }}>Lieu : {workshop.location}</p>
        <p style={{ fontSize: '1em', textAlign: 'center', marginBottom: '30px' }}>
          Par {workshop.artisanId && workshop.artisanId.nom && workshop.artisanId.prenom ? `${workshop.artisanId.prenom} ${workshop.artisanId.nom}` : 'Artisan inconnu'}
        </p>
        <p style={{ fontSize: '1.2em', textAlign: 'center', marginBottom: '20px', color: workshop.places > 0 ? '#2e7d32' : '#d32f2f' }}>
          Places restantes : {workshop.places !== undefined && workshop.places !== null ? workshop.places : 'N/A'}
          {workshop.places === 0 && ' (Complet)'}
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center', marginBottom: '30px' }}>
          {imageUrls.map((url, index) => (
            <img
              key={index}
              src={url}
              alt={`${workshop.title} - Vue ${index + 1}`}
              style={{ width: '300px', height: '300px', objectFit: 'cover', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}
            />
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button
            onClick={bookWorkshop}
            style={{ padding: '8px 15px', backgroundColor: '#8a5a44', color: '#fff', border: 'none', borderRadius: '20px', cursor: 'pointer', transition: 'background-color 0.3s' }}
            onMouseOver={(e) => (e.target.style.backgroundColor = '#704838')}
            onMouseOut={(e) => (e.target.style.backgroundColor = '#8a5a44')}
            disabled={workshop.places === 0 || workshop.places === undefined}
          >
            Réserver
          </button>
        </div>

        {/* Section des commentaires avec boutons de gestion */}
        <div style={{ marginTop: '30px' }}>
          <h3 style={{ fontSize: '1.5em', color: '#8a5a44', textAlign: 'center' }}>Commentaires</h3>
          <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '20px' }}>
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment._id} style={{ border: '1px solid #ddd', borderRadius: '5px', padding: '10px', marginBottom: '10px', backgroundColor: '#f9f9f9' }}>
                  <p style={{ fontWeight: 'bold', margin: '0' }}>
                    {comment.userId?.prenom && comment.userId?.nom ? `${comment.userId.prenom} ${comment.userId.nom}` : 'Utilisateur inconnu'}
                  </p>
                  <p style={{ margin: '5px 0', color: '#666' }}>
                    {new Date(comment.createdAt).toLocaleString()}
                  </p>
                  {comment.userId?._id === currentUserId && (
                    <>
                      <button
                        onClick={() => handleSummarize(comment._id, comment.text, comment.text)}
                        style={{ padding: '5px 10px', backgroundColor: '#8a5a44', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', marginBottom: '5px', transition: 'background-color 0.3s' }}
                        onMouseOver={(e) => (e.target.style.backgroundColor = '#704838')}
                        onMouseOut={(e) => (e.target.style.backgroundColor = '#8a5a44')}
                      >
                        Résumer
                      </button>
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                        style={{ padding: '5px 10px', backgroundColor: '#ff4444', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', marginLeft: '5px', marginBottom: '5px', transition: 'background-color 0.3s' }}
                        onMouseOver={(e) => (e.target.style.backgroundColor = '#cc0000')}
                        onMouseOut={(e) => (e.target.style.backgroundColor = '#ff4444')}
                      >
                        Supprimer
                      </button>
                      {editingCommentId === comment._id ? (
                        <>
                          <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            style={{ width: '100%', minHeight: '50px', padding: '5px', borderRadius: '5px', border: '1px solid #d4a373', marginTop: '5px' }}
                          />
                          <button
                            onClick={() => handleSaveEdit(comment._id)}
                            style={{ padding: '5px 10px', backgroundColor: '#8a5a44', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', marginRight: '5px', marginTop: '5px', transition: 'background-color 0.3s' }}
                            onMouseOver={(e) => (e.target.style.backgroundColor = '#704838')}
                            onMouseOut={(e) => (e.target.style.backgroundColor = '#8a5a44')}
                          >
                            Sauvegarder
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            style={{ padding: '5px 10px', backgroundColor: '#d4a373', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', marginTop: '5px', transition: 'background-color 0.3s' }}
                            onMouseOver={(e) => (e.target.style.backgroundColor = '#c68e5d')}
                            onMouseOut={(e) => (e.target.style.backgroundColor = '#d4a373')}
                          >
                            Annuler
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleEditComment(comment._id, comment.text)}
                          style={{ padding: '5px 10px', backgroundColor: '#d4a373', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', marginLeft: '5px', marginBottom: '5px', transition: 'background-color 0.3s' }}
                          onMouseOver={(e) => (e.target.style.backgroundColor = '#c68e5d')}
                          onMouseOut={(e) => (e.target.style.backgroundColor = '#d4a373')}
                        >
                          Modifier
                        </button>
                      )}
                    </>
                  )}
                  <p style={{ margin: '5px 0' }}>{editingCommentId === comment._id ? editText : comment.text}</p>
                </div>
              ))
            ) : (
              <p style={{ textAlign: 'center', color: '#666' }}>Aucun commentaire pour l'instant.</p>
            )}
          </div>
          <form onSubmit={handleCommentSubmit} style={{ marginTop: '10px' }}>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Écrivez votre commentaire ici..."
              style={{ width: '100%', minHeight: '100px', padding: '10px', borderRadius: '5px', border: '1px solid #d4a373', marginBottom: '10px' }}
            />
            <button
              type="submit"
              style={{ padding: '8px 15px', backgroundColor: '#8a5a44', color: '#fff', border: 'none', borderRadius: '20px', cursor: 'pointer', transition: 'background-color 0.3s' }}
              onMouseOver={(e) => (e.target.style.backgroundColor = '#704838')}
              onMouseOut={(e) => (e.target.style.backgroundColor = '#8a5a44')}
            >Soumettre</button>
          </form>
        </div>
      </div>

      <footer style={{ backgroundColor: '#8a5a44', color: '#fff', textAlign: 'center', padding: '30px', marginTop: '50px' }}>
        <p style={{ margin: '0 0 10px', fontSize: '1em' }}>© 2025 CraftHub. Tous droits réservés.</p>
        <p style={{ fontSize: '1em' }}>Contact : <a href="mailto:contact@crafthub.com" style={{ color: '#d4a373', textDecoration: 'underline' }}>contact@crafthub.com</a></p>
        <p style={{ fontSize: '1em' }}>Suivez-nous : <a href="https://facebook.com/crafthub" style={{ color: '#d4a373', textDecoration: 'underline', marginRight: '15px' }}>Facebook</a> | <a href="https://instagram.com/crafthub" style={{ color: '#d4a373', textDecoration: 'underline' }}>Instagram</a></p>
      </footer>
    </div>
  );
}

export default WorkshopDetail;