import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { getBookings, removeBooking, confirmBooking, getPublicWorkshopImage } from '../services/api';
import PaymentWrapper from './PaymentForm';
import { isWorkshopExpired, getWorkshopStatus, formatWorkshopDate } from '../utils/workshopUtils';

function WorkshopBooking() {
  const location = useLocation();
  const [bookedWorkshops, setBookedWorkshops] = useState(location.state?.bookings || []);
  const [workshopPlaces, setWorkshopPlaces] = useState({});
  const [workshopImages, setWorkshopImages] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

useEffect(() => {
  let isMounted = true;
  const createdBlobUrls = []; // on mémorise ce qu’on crée pour bien les révoquer

  const fetchBookingsAndImages = async () => {
    setLoading(true);
    setError(null);
    try {
      const bookingsRes = await getBookings();
      console.log('Bookings data:', bookingsRes.data);

      const pendingBookings = Array.isArray(bookingsRes.data) ? bookingsRes.data : [];
      const validatedBookings = pendingBookings.map(workshop => ({
        ...workshop,
        price: workshop.workshopId?.price || 0,
        workshopId: {
          ...workshop.workshopId,
          title: workshop.workshopId?.title || 'Titre inconnu',
          date: workshop.workshopId?.date || new Date(),
          price: workshop.workshopId?.price || 0
        }
      }));

      if (!isMounted) return;

      setBookedWorkshops(validatedBookings);

      // Initialiser les places
      const initialPlaces = validatedBookings.reduce((acc, workshop) => ({
        ...acc,
        [workshop._id]: workshop.workshopId?.places || 10
      }), {});
      setWorkshopPlaces(initialPlaces);

      // Récupérer les images publiques
      const imageMap = {};
      for (const workshop of validatedBookings) {
        try {
          const response = await getPublicWorkshopImage(workshop.workshopId._id, 0); // Première image
          const imageUrl = URL.createObjectURL(response.data);
          imageMap[workshop.workshopId._id] = imageUrl;
          createdBlobUrls.push(imageUrl); // mémorise pour cleanup
        } catch (imgErr) {
          console.error(`Erreur chargement image pour ${workshop.workshopId._id}:`, imgErr);
          imageMap[workshop.workshopId._id] = '/default-workshop-image.jpg';
        }
      }

      if (!isMounted) return;
      setWorkshopImages(imageMap);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(`Erreur : ${err.message}`);

      // fallback local si on a des bookings dans location.state
      const fromState = location.state?.bookings || [];
      const pendingBookings = Array.isArray(fromState)
        ? fromState.filter(w => w.status === 'pending')
        : [];
      const validatedBookings = pendingBookings.map(workshop => ({
        ...workshop,
        price: workshop.workshopId?.price || 0,
        workshopId: {
          ...workshop.workshopId,
          title: workshop.workshopId?.title || 'Titre inconnu',
          date: workshop.workshopId?.date || new Date(),
          price: workshop.workshopId?.price || 0
        }
      }));

      setBookedWorkshops(validatedBookings);

      const initialPlaces = validatedBookings.reduce((acc, workshop) => ({
        ...acc,
        [workshop._id]: workshop.workshopId?.places || 10
      }), {});
      setWorkshopPlaces(initialPlaces);

      const imageMap = validatedBookings.reduce((acc, workshop) => ({
        ...acc,
        [workshop.workshopId._id]: '/default-workshop-image.jpg'
      }), {});
      setWorkshopImages(imageMap);
    } finally {
      if (isMounted) setLoading(false);
    }
  };

  fetchBookingsAndImages();

  // ✅ Cleanup correct des blob: URLs
  return () => {
    isMounted = false;
    createdBlobUrls.forEach((url) => {
      if (typeof url === 'string' && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
  };
}, [location.state]);

// Rafraîchissement périodique du panier de réservations (sans recharger les images)
useEffect(() => {
  const id = setInterval(async () => {
    try {
      const bookingsRes = await getBookings();
      const pending = Array.isArray(bookingsRes.data) ? bookingsRes.data : [];

      const validated = pending.map(workshop => ({
        ...workshop,
        price: workshop.workshopId?.price || 0,
        workshopId: {
          ...workshop.workshopId,
          title: workshop.workshopId?.title || 'Titre inconnu',
          date: workshop.workshopId?.date || new Date(),
          price: workshop.workshopId?.price || 0
        }
      }));

      setBookedWorkshops(validated);

      const nextPlaces = validated.reduce((acc, w) => ({
        ...acc,
        [w._id]: w.workshopId?.places || 10
      }), {});
      setWorkshopPlaces(nextPlaces);
    } catch (_e) {
      // silencieux en polling
    }
  }, 15000); // 15s (mets 5000 en dev si tu veux tester vite)

  return () => clearInterval(id);
}, []);




  const handleRemoveBooking = async (id) => {
    try {
      console.log('Attempting to remove booking with id:', id);
      await removeBooking(id);
      const bookingsRes = await getBookings();
      const validatedBookings = Array.isArray(bookingsRes.data) ? bookingsRes.data.map(workshop => ({
        ...workshop,
        price: workshop.workshopId?.price || 0,
        workshopId: {
          ...workshop.workshopId,
          price: workshop.workshopId?.price || 0
        }
      })) : [];
      setBookedWorkshops(validatedBookings);
      const initialPlaces = validatedBookings.reduce((acc, workshop) => ({
        ...acc,
        [workshop._id]: workshop.workshopId?.places || 10
      }), {});
      setWorkshopPlaces(initialPlaces);
      setNotification({
        show: true,
        message: 'Réservation annulée avec succès !',
        type: 'success'
      });
      setTimeout(() => {
        setNotification({ show: false, message: '', type: 'success' });
      }, 3000);
    } catch (err) {
      console.error('Error removing booking:', err.response?.data || err.message);
      setNotification({
        show: true,
        message: 'Erreur lors de l\'annulation de la réservation',
        type: 'error'
      });
      setTimeout(() => {
        setNotification({ show: false, message: '', type: 'error' });
      }, 4000);
    }
  };

  // Calculer le total en excluant les ateliers expirés
  const total = bookedWorkshops.reduce((sum, workshop) => {
    const isExpired = isWorkshopExpired(workshop.workshopId?.date);
    if (isExpired) return sum; // Exclure les ateliers expirés du total
    return sum + ((workshop.workshopId?.price || 0) * (workshop.quantity || 1));
  }, 0);

  // Compter les ateliers non expirés
  const activeWorkshops = bookedWorkshops.filter(workshop => !isWorkshopExpired(workshop.workshopId?.date));

const handlePaymentSuccess = async () => {
  try {
    const bookingIds = bookedWorkshops.map(workshop => workshop._id);
    console.log('Sending bookingIds to confirm:', bookingIds);

    if (bookingIds.length > 0) {
      const items = bookedWorkshops.map(workshop => ({
        _id: workshop.workshopId?._id,
        workshopId: workshop.workshopId?._id,
        quantity: workshop.quantity || 1,
        price: workshop.workshopId?.price || 0,
        title: workshop.workshopId?.title || 'Titre inconnu', // Ajouter le titre
      }));
      console.log('Sending items to confirm:', items); // Débogage
      const response = await confirmBooking({ bookingIds, items });
      console.log('Confirm booking response:', response.data);
    }
    setNotification({
      show: true,
      message: 'Paiement réussi ! Les réservations sont confirmées.',
      type: 'success'
    });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 5000);
    setBookedWorkshops([]);
    setWorkshopPlaces({});
    setWorkshopImages({});
  } catch (err) {
    const errorMessage = err.response?.data?.details || err.response?.data?.error || err.message;
    setNotification({
      show: true,
      message: 'Erreur lors de la confirmation des réservations',
      type: 'error'
    });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'error' });
    }, 4000);
    console.error('Payment error:', err.response?.data || err);
    if (errorMessage.includes('Transaction numbers are only allowed')) {
      setNotification({
        show: true,
        message: 'Erreur : Les transactions nécessitent une réplica set MongoDB',
        type: 'error'
      });
      setTimeout(() => {
        setNotification({ show: false, message: '', type: 'error' });
      }, 5000);
    }
  }
};
  if (loading) return (
    <div style={{
      fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif',
      minHeight: '100vh',
      backgroundColor: '#f8f1e9',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        background: '#fff',
        padding: '40px',
        borderRadius: '20px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '3em', marginBottom: '20px' }}>⏳</div>
        <p style={{ fontSize: '1.2em', color: '#8a5a44', margin: 0 }}>Chargement de vos réservations...</p>
      </div>
    </div>
  );

  if (error) return (
    <div style={{
      fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif',
      minHeight: '100vh',
      backgroundColor: '#f8f1e9',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #f8d7da, #f5c6cb)',
        color: '#721c24',
        padding: '40px',
        borderRadius: '20px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        textAlign: 'center',
        border: '1px solid #f5c6cb'
      }}>
        <div style={{ fontSize: '3em', marginBottom: '20px' }}>⚠️</div>
        <p style={{ fontSize: '1.2em', margin: 0 }}>{error}</p>
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif', color: '#3a2f1a', minHeight: '100vh', backgroundColor: '#f8f1e9', margin: 0, padding: 0 }}>
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
            <div style={{ fontSize: '4em', marginBottom: '20px' }}>🛠️</div>
            <h1 style={{
              fontSize: '3.2em',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '20px',
              textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
            }}>
              Mes Réservations d'Ateliers
            </h1>
            <p style={{
              fontSize: '1.3em',
              color: '#6b5b47',
              marginBottom: '30px',
              lineHeight: '1.6',
              maxWidth: '600px',
              margin: '0 auto 30px'
            }}>
              Gérez vos réservations d'ateliers artisanaux et confirmez vos participations
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
                {bookedWorkshops.length} {bookedWorkshops.length === 1 ? 'réservation' : 'réservations'}
              </div>
              <div style={{
                background: 'linear-gradient(135deg, #28a745, #20c997)',
                color: '#fff',
                padding: '15px 30px',
                borderRadius: '25px',
                fontSize: '1.2em',
                fontWeight: 700,
                boxShadow: '0 8px 25px rgba(40, 167, 69, 0.3)',
                textShadow: '1px 1px 2px rgba(0,0,0,0.2)'
              }}>
                Total: ${total.toFixed(2)}
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
        {bookedWorkshops.length === 0 ? (
          /* Empty State */
          <div style={{
            background: '#fff',
            borderRadius: '25px',
            boxShadow: '0 15px 40px rgba(0,0,0,0.1)',
            padding: '80px 50px',
            textAlign: 'center',
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

            <div style={{ fontSize: '6em', marginBottom: '30px' }}>🛠️</div>
            <h3 style={{
              fontSize: '2em',
              color: '#8a5a44',
              marginBottom: '20px',
              fontWeight: 700
            }}>
              Aucune réservation d'atelier
            </h3>
            <p style={{
              color: '#6b5b47',
              fontSize: '1.2em',
              marginBottom: '30px',
              lineHeight: '1.6'
            }}>
              Découvrez nos ateliers artisanaux et réservez votre place !
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
              🚀 Découvrir les ateliers
            </Link>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 400px',
            gap: '40px',
            alignItems: 'start'
          }}>
            {/* Workshop Bookings */}
            <div style={{
              background: '#fff',
              borderRadius: '25px',
              boxShadow: '0 15px 40px rgba(0,0,0,0.1)',
              padding: '40px',
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

              <h2 style={{
                fontSize: '2em',
                color: '#8a5a44',
                marginBottom: '30px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '15px'
              }}>
                🛠️ Ateliers réservés
              </h2>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
              }}>
                {bookedWorkshops.map((workshop, index) => {
                  const workshopTotal = ((workshop.workshopId?.price || 0) * (workshop.quantity || 1));
                  const isExpired = isWorkshopExpired(workshop.workshopId?.date);
                  const workshopStatus = getWorkshopStatus(workshop.workshopId?.date);
                  
                  return (
                    <div
                      key={workshop._id}
                      style={{
                        background: isExpired 
                          ? 'linear-gradient(135deg, rgba(220, 38, 38, 0.05) 0%, rgba(185, 28, 28, 0.05) 100%)'
                          : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                        borderRadius: '20px',
                        padding: '0',
                        border: isExpired 
                          ? '2px solid rgba(220, 38, 38, 0.3)'
                          : '1px solid rgba(138, 90, 68, 0.1)',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        overflow: 'hidden',
                        animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
                        boxShadow: isExpired 
                          ? '0 5px 15px rgba(220, 38, 38, 0.1)'
                          : '0 5px 15px rgba(0,0,0,0.05)'
                      }}
                      onMouseOver={(e) => {
                        e.target.style.transform = 'translateY(-3px)';
                        e.target.style.boxShadow = isExpired 
                          ? '0 10px 25px rgba(220, 38, 38, 0.2)'
                          : '0 10px 25px rgba(0,0,0,0.1)';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = isExpired 
                          ? '0 5px 15px rgba(220, 38, 38, 0.1)'
                          : '0 5px 15px rgba(0,0,0,0.05)';
                      }}
                    >
                      {/* Badge d'expiration */}
                      {isExpired && (
                        <div style={{
                          position: 'absolute',
                          top: '15px',
                          right: '15px',
                          background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                          color: '#fff',
                          padding: '8px 16px',
                          borderRadius: '25px',
                          fontSize: '0.9em',
                          fontWeight: '700',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: '0 4px 12px rgba(220, 38, 38, 0.4)',
                          zIndex: 3
                        }}>
                          ⚠️ ATELIER EXPIRÉ
                        </div>
                      )}

                      <div style={{
                        display: 'flex',
                        height: '200px'
                      }}>
                        {/* Image Section */}
                        {workshopImages[workshop.workshopId._id] && (
                          <div style={{
                            width: '200px',
                            height: '100%',
                            overflow: 'hidden',
                            borderRadius: '20px 0 0 20px',
                            position: 'relative',
                            flexShrink: 0
                          }}>
                            <img
                              src={workshopImages[workshop.workshopId._id]}
                              alt={workshop.workshopId?.title || 'Image de l\'atelier'}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                transition: 'transform 0.3s ease',
                                filter: isExpired ? 'grayscale(50%)' : 'none'
                              }}
                            />
                            {/* Overlay pour les ateliers expirés */}
                            {isExpired && (
                              <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'rgba(220, 38, 38, 0.3)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff',
                                fontSize: '1.2em',
                                fontWeight: '700'
                              }}>
                                EXPIRÉ
                              </div>
                            )}
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
                          {/* Top Section */}
                          <div>
                            <h3 style={{
                              margin: '0 0 15px 0',
                              fontSize: '1.4em',
                              color: '#8a5a44',
                              fontWeight: 700,
                              lineHeight: '1.3'
                            }}>
                              {workshop.workshopId?.title || 'Titre inconnu'}
                            </h3>

                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                              gap: '15px',
                              marginBottom: '20px'
                            }}>
                              <div style={{
                                background: 'linear-gradient(135deg, #d4a373, #c78c5d)',
                                color: '#fff',
                                padding: '8px 15px',
                                borderRadius: '12px',
                                fontSize: '0.9em',
                                fontWeight: 700,
                                boxShadow: '0 2px 8px rgba(212, 163, 115, 0.3)',
                                textAlign: 'center'
                              }}>
                                💰 {(workshop.workshopId?.price || 0).toFixed(2)} €
                              </div>
                              <div style={{
                                background: isExpired 
                                  ? 'linear-gradient(135deg, #dc2626, #b91c1c)'
                                  : 'linear-gradient(135deg, #17a2b8, #138496)',
                                color: '#fff',
                                padding: '8px 15px',
                                borderRadius: '12px',
                                fontSize: '0.9em',
                                fontWeight: 700,
                                boxShadow: isExpired 
                                  ? '0 2px 8px rgba(220, 38, 38, 0.3)'
                                  : '0 2px 8px rgba(23, 162, 184, 0.3)',
                                textAlign: 'center'
                              }}>
                                📅 {formatWorkshopDate(workshop.workshopId?.date)}
                              </div>
                              <div style={{
                                background: 'linear-gradient(135deg, #28a745, #20c997)',
                                color: '#fff',
                                padding: '8px 15px',
                                borderRadius: '12px',
                                fontSize: '0.9em',
                                fontWeight: 700,
                                boxShadow: '0 2px 8px rgba(40, 167, 69, 0.3)',
                                textAlign: 'center'
                              }}>
                                👥 Quantité: {workshop.quantity || 1}
                              </div>
                              <div style={{
                                background: 'linear-gradient(135deg, #6f42c1, #5a32a3)',
                                color: '#fff',
                                padding: '8px 15px',
                                borderRadius: '12px',
                                fontSize: '0.9em',
                                fontWeight: 700,
                                boxShadow: '0 2px 8px rgba(111, 66, 193, 0.3)',
                                textAlign: 'center'
                              }}>
                                📍 {workshop.workshopId?.location || 'Non spécifié'}
                              </div>
                            </div>

                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '15px',
                              marginBottom: '15px'
                            }}>
                              <div style={{
                                background: 'linear-gradient(135deg, #fd7e14, #e55a00)',
                                color: '#fff',
                                padding: '10px 20px',
                                borderRadius: '15px',
                                fontSize: '1.1em',
                                fontWeight: 700,
                                boxShadow: '0 4px 15px rgba(253, 126, 20, 0.3)'
                              }}>
                                Total: ${workshopTotal.toFixed(2)}
                              </div>
                              <div style={{
                                color: '#6b5b47',
                                fontSize: '0.9em',
                                fontWeight: 600
                              }}>
                                Places restantes: {workshopPlaces[workshop._id] || (workshop.workshopId?.places || 9)}
                              </div>
                            </div>
                          </div>

                          {/* Bottom Section - Cancel Button */}
                          <div style={{
                            display: 'flex',
                            justifyContent: 'flex-end'
                          }}>
                            <button
                              onClick={() => handleRemoveBooking(workshop._id)}
                              style={{
                                padding: '12px 25px',
                                background: 'linear-gradient(135deg, #dc3545, #c82333)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '15px',
                                fontSize: '1em',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 4px 15px rgba(220, 53, 69, 0.3)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
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
                              ❌ Annuler la réservation
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Checkout Section */}
            <div style={{
              background: '#fff',
              borderRadius: '25px',
              boxShadow: '0 15px 40px rgba(0,0,0,0.1)',
              padding: '40px',
              border: '1px solid rgba(138, 90, 68, 0.1)',
              position: 'sticky',
              top: '100px',
              height: 'fit-content'
            }}>
              <h3 style={{
                fontSize: '1.8em',
                color: '#8a5a44',
                marginBottom: '30px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                💳 Confirmer les réservations
              </h3>

              {/* Total Summary */}
              <div style={{
                background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
                color: '#fff',
                padding: '25px',
                borderRadius: '15px',
                marginBottom: '30px',
                textAlign: 'center'
              }}>
                <h4 style={{
                  fontSize: '1.3em',
                  marginBottom: '15px',
                  fontWeight: 700
                }}>
                  Total des réservations
                </h4>
                <div style={{
                  fontSize: '2.5em',
                  fontWeight: 700,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                }}>
                  ${total.toFixed(2)}
                </div>
                <p style={{
                  fontSize: '0.9em',
                  opacity: 0.9,
                  margin: '10px 0 0 0'
                }}>
                  {activeWorkshops.length} {activeWorkshops.length === 1 ? 'atelier' : 'ateliers'} actif{activeWorkshops.length > 1 ? 's' : ''}
                  {bookedWorkshops.length > activeWorkshops.length && (
                    <span style={{ color: '#dc2626', fontWeight: '600' }}>
                      {' '}({bookedWorkshops.length - activeWorkshops.length} expiré{bookedWorkshops.length - activeWorkshops.length > 1 ? 's' : ''})
                    </span>
                  )}
                </p>
              </div>

              {/* Payment Button */}
              {activeWorkshops.length > 0 ? (
                <PaymentWrapper
                  amountCents={Math.round(total * 100)}
                  displayAmount={total}
                  currency="EUR"
                  type="reservation"
                  items={activeWorkshops.map(w => ({
                    _id: w.workshopId?._id, // Utiliser l'ID de l'atelier, pas de la réservation
                    name: w.workshopId?.title || 'Titre inconnu',
                    title: w.workshopId?.title || 'Titre inconnu', // Ajouter aussi le title
                    price: w.workshopId?.price || 0,
                    quantity: w.quantity || 1,
                    artisanId: w.workshopId?.artisanId,
                  }))}
                  onSuccess={handlePaymentSuccess}
                />
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '20px',
                  background: 'rgba(220, 38, 38, 0.1)',
                  borderRadius: '12px',
                  border: '1px solid rgba(220, 38, 38, 0.3)'
                }}>
                  <div style={{ fontSize: '2em', marginBottom: '10px' }}>⚠️</div>
                  <h4 style={{ color: '#dc2626', margin: '0 0 10px 0' }}>
                    Aucun atelier actif
                  </h4>
                  <p style={{ color: '#dc2626', margin: 0, fontSize: '0.9em' }}>
                    Tous les ateliers sont expirés. Veuillez réserver de nouveaux ateliers.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
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

export default WorkshopBooking;