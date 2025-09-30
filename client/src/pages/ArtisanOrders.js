import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPendingOrders, confirmShipment } from '../services/api';
import ArtisanHeader from '../components/ArtisanHeader';
import ArtisanFooter from '../components/ArtisanFooter';
import NotificationToast from '../components/NotificationToast';
import useNotification from '../hooks/useNotification';

function ArtisanOrders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const { notification, showNotification, hideNotification } = useNotification();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ordersResponse = await getPendingOrders();
        console.log('Orders response:', ordersResponse.data); // Vérifier les données
        setOrders(ordersResponse.data || []);
      } catch (err) {
        setError(`Erreur lors du chargement des données: ${err.response?.data?.error || err.message}`);
        console.error('Fetch Error:', err);
      }
    };
    fetchData();
  }, []);

  const handleConfirmShipment = async (paymentId, itemId) => {
    try {
      await confirmShipment({ paymentId, itemId });
      setOrders(orders.map(order =>
        order._id.toString() === paymentId
          ? {
              ...order,
              items: order.items.map(item =>
                item._id.toString() === itemId ? { ...item, status: 'completed' } : item
              ),
            }
          : order
      ));
      showNotification('Commande marquée comme envoyée !', 'success');
    } catch (err) {
      showNotification('Erreur lors de la confirmation d\'envoi.', 'error');
      console.error('Confirm Shipment Error:', err);
    }
  };

  return (
    <div style={{ fontFamily: '"Georgia", serif', color: '#3a2f1a', minHeight: '100vh', backgroundColor: '#f8f1e9', margin: 0, padding: 0 }}>
      <style>
        {`
          @keyframes slideInRight {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          
          @keyframes slideOutRight {
            from {
              transform: translateX(0);
              opacity: 1;
            }
            to {
              transform: translateX(100%);
              opacity: 0;
            }
          }
        `}
      </style>
      <ArtisanHeader />
      
      {/* ===== Notification Toast ===== */}
      <NotificationToast 
        notification={notification} 
        onClose={hideNotification} 
      />

      {/* ===== Hero Section ===== */}
      <section style={{
        background: 'linear-gradient(135deg, #f8f1e9 0%, #e8d5c4 100%)',
        padding: '80px 0',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative Elements */}
        <div style={{
          position: 'absolute',
          top: '-100px',
          right: '-100px',
          width: '300px',
          height: '300px',
          background: 'linear-gradient(45deg, rgba(212, 163, 115, 0.1), rgba(138, 90, 68, 0.1))',
          borderRadius: '50%',
          opacity: 0.6
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '-150px',
          left: '-150px',
          width: '400px',
          height: '400px',
          background: 'linear-gradient(45deg, rgba(138, 90, 68, 0.05), rgba(212, 163, 115, 0.05))',
          borderRadius: '50%',
          opacity: 0.8
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
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            background: 'rgba(138, 90, 68, 0.1)',
            padding: '12px 24px',
            borderRadius: '50px',
            marginBottom: '30px',
            border: '1px solid rgba(138, 90, 68, 0.2)'
          }}>
            <span style={{ fontSize: '1.5em' }}>📦</span>
            <span style={{
              color: '#8a5a44',
              fontWeight: 600,
              fontSize: '1.1em'
            }}>Gestion des Commandes</span>
          </div>

          <h1 style={{
            fontSize: '3.5em',
            fontWeight: 800,
            color: '#3a2f1a',
              marginBottom: '20px',
            textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
            lineHeight: '1.2'
          }}>
            Mes
            <span style={{
              background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}> Commandes</span>
          </h1>

          <p style={{
            fontSize: '1.3em',
            color: '#6b5b47',
            maxWidth: '600px',
            margin: '0 auto 50px',
            lineHeight: '1.6'
          }}>
            Gérez efficacement vos commandes, suivez les expéditions et maintenez vos clients informés.
          </p>

          {/* Statistics Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '30px',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.8)',
              padding: '30px 20px',
              borderRadius: '20px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              border: '1px solid rgba(212, 163, 115, 0.2)'
            }}>
              <div style={{
                fontSize: '2.5em',
                marginBottom: '10px'
              }}>📋</div>
              <div style={{
                fontSize: '2em',
                fontWeight: 700,
                color: '#8a5a44',
                marginBottom: '5px'
              }}>
                {orders.filter(payment => payment.type === 'cart').length}
              </div>
              <div style={{
                color: '#6b5b47',
                fontSize: '1em',
                fontWeight: 600
              }}>Commandes Total</div>
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.8)',
              padding: '30px 20px',
              borderRadius: '20px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              border: '1px solid rgba(212, 163, 115, 0.2)'
            }}>
              <div style={{
                fontSize: '2.5em',
                marginBottom: '10px'
              }}>⏳</div>
              <div style={{
                fontSize: '2em',
                fontWeight: 700,
                color: '#ff6b6b',
                marginBottom: '5px'
              }}>
                {orders
                  .filter(payment => payment.type === 'cart')
                  .reduce((total, payment) => 
                    total + payment.items.filter(item => item.status === 'pending').length, 0
                  )}
              </div>
              <div style={{
                color: '#6b5b47',
                fontSize: '1em',
                fontWeight: 600
              }}>En Attente</div>
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.8)',
              padding: '30px 20px',
              borderRadius: '20px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              border: '1px solid rgba(212, 163, 115, 0.2)'
            }}>
              <div style={{
                fontSize: '2.5em',
                marginBottom: '10px'
              }}>✅</div>
              <div style={{
                fontSize: '2em',
                fontWeight: 700,
                color: '#4ecdc4',
                marginBottom: '5px'
              }}>
                {orders
                  .filter(payment => payment.type === 'cart')
                  .reduce((total, payment) => 
                    total + payment.items.filter(item => item.status === 'completed').length, 0
                  )}
              </div>
              <div style={{
                color: '#6b5b47',
                fontSize: '1em',
                fontWeight: 600
              }}>Expédiées</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Main Content ===== */}
      <main style={{
        flex: 1,
        padding: '60px 0',
        background: '#f8f1e9',
        position: 'relative'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 30px'
        }}>
          {/* Error Message */}
          {error && (
            <div style={{
              background: 'linear-gradient(135deg, #ff6b6b, #ff8e8e)',
              color: '#fff',
              padding: '20px 30px',
              borderRadius: '15px',
              marginBottom: '30px',
              textAlign: 'center',
              fontWeight: 600,
              boxShadow: '0 8px 25px rgba(255, 107, 107, 0.3)',
              fontSize: '1.1em'
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Empty State */}
          {orders.length === 0 && !error && (
            <div style={{
              background: '#fff',
              padding: '80px 40px',
              borderRadius: '20px',
              boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
              border: '1px solid rgba(212, 163, 115, 0.2)',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '5em',
                marginBottom: '30px',
                opacity: 0.6
              }}>📦</div>
              <h3 style={{
                fontSize: '2em',
                fontWeight: 700,
                color: '#3a2f1a',
                marginBottom: '20px'
              }}>
                Aucune commande en attente
              </h3>
              <p style={{
                fontSize: '1.2em',
                color: '#6b5b47',
                marginBottom: '30px',
                maxWidth: '500px',
                margin: '0 auto 30px'
              }}>
                Vous n'avez actuellement aucune commande en attente de traitement. 
                Vos nouvelles commandes apparaîtront ici.
              </p>
              <Link to="/artisan-home" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
                color: '#fff',
                padding: '15px 30px',
                borderRadius: '25px',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '1.1em',
                transition: 'all 0.3s ease',
                boxShadow: '0 8px 25px rgba(138, 90, 68, 0.3)'
              }} onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 12px 35px rgba(138, 90, 68, 0.4)';
              }} onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 8px 25px rgba(138, 90, 68, 0.3)';
              }}>
                <span>🏠</span>
                Retour à l'accueil
              </Link>
            </div>
          )}

          {/* Orders List */}
          {orders.length > 0 && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '30px'
            }}>
              {orders
                .filter(payment => payment.type === 'cart')
                .map((payment) => (
                  <div key={payment._id} style={{
                    background: '#fff',
                    borderRadius: '20px',
                    boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
                    border: '1px solid rgba(212, 163, 115, 0.2)',
                    overflow: 'hidden'
                  }}>
                    {/* Order Header */}
                    <div style={{
                      background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
                      color: '#fff',
                      padding: '25px 30px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '20px'
                    }}>
                      <div>
                        <h3 style={{
                          fontSize: '1.5em',
                          fontWeight: 700,
                          marginBottom: '5px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px'
                        }}>
                          <span>📋</span>
                          Commande #{payment._id.slice(-8).toUpperCase()}
                        </h3>
                        <p style={{
                          fontSize: '1em',
                          opacity: 0.9,
                          margin: 0
                        }}>
                          Client: {payment.userId?.email || 'Non disponible'}
                        </p>
                      </div>
                      <div style={{
                        textAlign: 'right'
                      }}>
                        <div style={{
                          fontSize: '1.2em',
                          fontWeight: 600,
                          marginBottom: '5px'
                        }}>
                          {new Date(payment.createdAt).toLocaleDateString('fr-FR')}
                        </div>
                        <div style={{
                          fontSize: '0.9em',
                          opacity: 0.8
                        }}>
                          {new Date(payment.createdAt).toLocaleTimeString('fr-FR')}
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div style={{
                      padding: '30px'
                    }}>
                      {payment.items
                        .filter(item => item.status === 'pending')
                        .map((item, index) => (
                          <div key={`${payment._id}-${item._id}`} style={{
                            background: 'linear-gradient(135deg, #f8f1e9, #fff)',
                            padding: '25px',
                            borderRadius: '15px',
                            marginBottom: '20px',
                            border: '1px solid rgba(212, 163, 115, 0.1)',
                            position: 'relative'
                          }}>
                            {/* Item Header */}
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                              marginBottom: '20px',
                              flexWrap: 'wrap',
              gap: '15px'
                            }}>
                              <div style={{ flex: 1 }}>
                                <h4 style={{
                                  fontSize: '1.3em',
                                  fontWeight: 700,
                                  color: '#3a2f1a',
                                  marginBottom: '8px'
                                }}>
                                  {item.name || item.title || 'Produit inconnu'}
                                </h4>
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '15px',
                                  flexWrap: 'wrap'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                                    gap: '5px',
                                    background: 'rgba(138, 90, 68, 0.1)',
                                    padding: '6px 12px',
                                    borderRadius: '20px',
                                    fontSize: '0.9em',
                                    fontWeight: 600,
                                    color: '#8a5a44'
                                  }}>
                                    <span>📦</span>
                                    <span>Quantité: {item.quantity || 1}</span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                                    gap: '5px',
                                    background: 'rgba(255, 107, 107, 0.1)',
                                    padding: '6px 12px',
                                    borderRadius: '20px',
                                    fontSize: '0.9em',
                                    fontWeight: 600,
                                    color: '#ff6b6b'
                                  }}>
                                    <span>⏳</span>
                                    <span>En attente</span>
                                  </div>
                                </div>
                              </div>
                              <div style={{
                                textAlign: 'right'
                              }}>
                                <div style={{
                                  fontSize: '1.8em',
                                  fontWeight: 700,
                                  color: '#8a5a44',
                                  marginBottom: '5px'
                                }}>
                                  {(item.price * (item.quantity || 1)).toFixed(2)}€
                                </div>
                                <div style={{
                                  fontSize: '0.9em',
                                  color: '#6b5b47'
                                }}>
                                  {item.price}€ × {item.quantity || 1}
                                </div>
                              </div>
                            </div>

                            {/* Delivery Info */}
                            <div style={{
                              background: 'rgba(255,255,255,0.5)',
                              padding: '20px',
                              borderRadius: '12px',
                              marginBottom: '20px',
                              border: '1px solid rgba(212, 163, 115, 0.1)'
                            }}>
                              <h5 style={{
                                fontSize: '1.1em',
                                fontWeight: 600,
                                color: '#3a2f1a',
                                marginBottom: '15px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                              }}>
                                <span>🚚</span>
                                Informations de livraison
                              </h5>
                              <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                                gap: '15px'
                              }}>
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '10px'
              }}>
                <span style={{ fontSize: '1.2em' }}>📞</span>
                                  <div>
                                    <div style={{
                                      fontSize: '0.9em',
                                      color: '#6b5b47',
                                      fontWeight: 600
                                    }}>Téléphone</div>
                                    <div style={{
                                      fontSize: '1em',
                                      color: '#3a2f1a'
                                    }}>{payment.deliveryInfo?.phone || 'Non disponible'}</div>
                                  </div>
              </div>
              <div style={{
                display: 'flex',
                                  alignItems: 'flex-start',
                                  gap: '10px'
              }}>
                <span style={{ fontSize: '1.2em' }}>📍</span>
                                  <div>
                                    <div style={{
                                      fontSize: '0.9em',
                                      color: '#6b5b47',
                                      fontWeight: 600
                                    }}>Adresse</div>
                                    <div style={{
                                      fontSize: '1em',
                                      color: '#3a2f1a'
                                    }}>{payment.deliveryInfo?.address || 'Non disponible'}</div>
              </div>
            </div>
          </div>
        </div>

                            {/* Action Button */}
        <div style={{
                              display: 'flex',
                              justifyContent: 'center'
                            }}>
                              <button
                                onClick={() => handleConfirmShipment(payment._id, item._id)}
                                style={{
                                  background: 'linear-gradient(135deg, #4ecdc4, #44a08d)',
                                  color: '#fff',
                                  border: 'none',
                                  padding: '15px 30px',
                                  borderRadius: '25px',
                                  fontSize: '1.1em',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  transition: 'all 0.3s ease',
                                  boxShadow: '0 8px 25px rgba(78, 205, 196, 0.3)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '10px'
                                }}
                                onMouseOver={(e) => {
                                  e.target.style.transform = 'translateY(-2px)';
                                  e.target.style.boxShadow = '0 12px 35px rgba(78, 205, 196, 0.4)';
                                }}
                                onMouseOut={(e) => {
                                  e.target.style.transform = 'translateY(0)';
                                  e.target.style.boxShadow = '0 8px 25px rgba(78, 205, 196, 0.3)';
                                }}
                              >
                                <span>✅</span>
                                Marquer comme expédié
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </main>

      <ArtisanFooter />
    </div>
  );
}

export default ArtisanOrders;