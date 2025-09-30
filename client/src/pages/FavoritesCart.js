import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getCart, removeFromCart, clearCart, getPublicProductImage } from "../services/api";
import PaymentWrapper from "./PaymentForm";

function FavoritesCart() {
  const [cart, setCart] = useState([]);
  const [deliveryInfo, setDeliveryInfo] = useState({ phone: "", address: "" });
  const [productImages, setProductImages] = useState({});
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    const fetchCart = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const cartRes = await getCart();
          // Extraire les items depuis data
          const items = cartRes.data.items || [];
          setCart(items);

          // Récupérer les images pour chaque produit
          const imageMap = {};
          for (const item of items) {
            const productId = item.productId?._id || item.productId;
            if (productId) {
              try {
                const response = await getPublicProductImage(productId, 0); // Première image
                const imageUrl = URL.createObjectURL(response.data);
                imageMap[productId] = imageUrl;
              } catch (imgErr) {
                console.error(`Erreur chargement image pour ${productId}:`, imgErr);
                imageMap[productId] = '/default-product-image.jpg'; // Image par défaut
              }
            }
          }
          setProductImages(imageMap);
        } catch (error) {
          console.error("Error fetching cart:", error);
        }
      }
    };
    fetchCart();

    // Nettoyage des URLs d'images
    return () => {
      Object.values(productImages).forEach((url) => {
        if (url instanceof Blob) URL.revokeObjectURL(url);
      });
    };
  }, []);

  const handleRemoveFromCart = async (productId) => {
    try {
      // Vérifier si productId est un objet et extraire _id si nécessaire
      const productIdToRemove = typeof productId === "object" ? productId._id : productId;
      console.log("Removing productId:", productIdToRemove); // Log pour déboguer
      await removeFromCart(productIdToRemove);
      const updatedCartRes = await getCart();
      setCart(updatedCartRes.data.items || []);
      // Mettre à jour les images après suppression
      const updatedImages = { ...productImages };
      delete updatedImages[productIdToRemove];
      setProductImages(updatedImages);
      setNotification({
        show: true,
        message: 'Article retiré du panier !',
        type: 'success'
      });
      setTimeout(() => {
        setNotification({ show: false, message: '', type: 'success' });
      }, 3000);
    } catch (error) {
      console.error(
        "Error removing from cart:",
        error.response?.data || error.message
      );
      setNotification({
        show: true,
        message: 'Erreur lors de la suppression de l\'article',
        type: 'error'
      });
      setTimeout(() => {
        setNotification({ show: false, message: '', type: 'error' });
      }, 4000);
    }
  };

  const total = cart.reduce((sum, item) => {
    const price = item.productId?.price || item.price || 0;
    const quantity = item.quantity || 1;
    if (price < 0 || quantity < 0) return sum;
    return sum + price * quantity;
  }, 0);

  // Assurer que le total est arrondi et converti en cents
  const displayAmount = Number(total.toFixed(2));      // 95.99
const amountCents   = Math.round(displayAmount * 100);
 // const amountInCents = Math.round(total * 100); // Exemple : 64.832 devient 6483

  const handlePaymentSuccess = async (paymentId) => {
    try {
      // Vider le panier côté serveur
      await clearCart(); // Appel à l'endpoint /cart/clear
      console.log("Cart cleared on server with Payment ID:", paymentId);
      // Mettre à jour l'état local
      setCart([]);
      setProductImages({});
      setNotification({
        show: true,
        message: `Paiement réussi ! Livraison enregistrée pour ${deliveryInfo.phone}`,
        type: 'success'
      });
      setTimeout(() => {
        setNotification({ show: false, message: '', type: 'success' });
      }, 5000);
    } catch (error) {
      console.error(
        "Error clearing cart:",
        error.response?.data || error.message
      );
      setNotification({
        show: true,
        message: 'Paiement réussi, mais erreur lors du vidage du panier',
        type: 'error'
      });
      setTimeout(() => {
        setNotification({ show: false, message: '', type: 'error' });
      }, 4000);
    }
  };

  const handleDeliveryChange = (e) => {
    const { name, value } = e.target;
    setDeliveryInfo((prev) => ({ ...prev, [name]: value }));
  };

  const itemsWithArtisan = cart
    .map((item) => {
      const productId = item.productId?._id || item.productId;
      if (!productId) {
        console.error("Invalid productId for item:", item);
        return null;
      }
      const preparedItem = {
        _id: productId,
        name: item.productId?.name || item.name || 'Produit inconnu',
        quantity: item.quantity || 1,
        artisanId: item.productId?.artisanId?._id || item.artisanId,
        price: item.productId?.price || item.price || 0
      };
      console.log("Prepared item for payment:", preparedItem);
      return preparedItem;
    })
    .filter((item) => item !== null);

  return (
    <div
      style={{
        fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif',
        color: "#3a2f1a",
        minHeight: "100vh",
        backgroundColor: "#f8f1e9",
        margin: 0,
        padding: 0
      }}
    >
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
            <div style={{ fontSize: '4em', marginBottom: '20px' }}>🛒</div>
            <h1 style={{
              fontSize: '3.2em',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '20px',
              textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
            }}>
              Mon Panier
            </h1>
            <p style={{
              fontSize: '1.3em',
              color: '#6b5b47',
              marginBottom: '30px',
              lineHeight: '1.6',
              maxWidth: '600px',
              margin: '0 auto 30px'
            }}>
              Finalisez votre commande et découvrez nos produits artisanaux
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
                {cart.length} {cart.length === 1 ? 'article' : 'articles'}
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
        {cart.length === 0 ? (
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

            <div style={{ fontSize: '6em', marginBottom: '30px' }}>🛒</div>
            <h3 style={{
              fontSize: '2em',
              color: '#8a5a44',
              marginBottom: '20px',
              fontWeight: 700
            }}>
              Votre panier est vide
            </h3>
            <p style={{
              color: '#6b5b47',
              fontSize: '1.2em',
              marginBottom: '30px',
              lineHeight: '1.6'
            }}>
              Découvrez nos produits artisanaux et ajoutez-les à votre panier !
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
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 400px',
            gap: '40px',
            alignItems: 'start'
          }}>
            {/* Cart Items */}
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
                🛍️ Articles dans votre panier
              </h2>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
              }}>
                {cart.map((item, index) => {
                const productId = item.productId?._id || item.productId;
                  const itemTotal = ((item.productId?.price || item.price || 0) * (item.quantity || 1));
                  
                return (
                    <div
                    key={productId}
                    style={{
                        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                        borderRadius: '20px',
                        padding: '0',
                        border: '1px solid rgba(138, 90, 68, 0.1)',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        overflow: 'hidden',
                        animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
                        boxShadow: '0 5px 15px rgba(0,0,0,0.05)'
                      }}
                      onMouseOver={(e) => {
                        e.target.style.transform = 'translateY(-3px)';
                        e.target.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 5px 15px rgba(0,0,0,0.05)';
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        height: '150px'
                      }}>
                        {/* Image Section */}
                    {productImages[productId] && (
                          <div style={{
                            width: '150px',
                            height: '100%',
                            overflow: 'hidden',
                            borderRadius: '20px 0 0 20px',
                            position: 'relative',
                            flexShrink: 0
                          }}>
                      <img
                        src={productImages[productId]}
                        alt={item.productId?.name || item.name || "Image produit"}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                transition: 'transform 0.3s ease'
                              }}
                            />
                          </div>
                        )}

                        {/* Content Section */}
                        <div style={{ 
                          flex: 1, 
                          padding: '20px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between'
                        }}>
                          {/* Top Section */}
                          <div>
                            <h3 style={{
                              margin: '0 0 10px 0',
                              fontSize: '1.3em',
                              color: '#8a5a44',
                              fontWeight: 700,
                              lineHeight: '1.3'
                            }}>
                              {item.productId?.name || item.name || "Produit inconnu"}
                            </h3>

                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '15px',
                              marginBottom: '15px'
                            }}>
                              <div style={{
                                background: 'linear-gradient(135deg, #d4a373, #c78c5d)',
                                color: '#fff',
                                padding: '6px 12px',
                                borderRadius: '12px',
                                fontSize: '1em',
                                fontWeight: 700,
                                boxShadow: '0 2px 8px rgba(212, 163, 115, 0.3)'
                              }}>
                                {(item.productId?.price || item.price || 0).toFixed(2)} €
                              </div>
                              <div style={{
                                color: '#6b5b47',
                                fontSize: '0.9em',
                                fontWeight: 600
                              }}>
                                Quantité: {item.quantity || 1}
                              </div>
                              <div style={{
                                background: 'linear-gradient(135deg, #28a745, #20c997)',
                                color: '#fff',
                                padding: '6px 12px',
                                borderRadius: '12px',
                                fontSize: '1em',
                                fontWeight: 700,
                                boxShadow: '0 2px 8px rgba(40, 167, 69, 0.3)'
                              }}>
                                Total: ${itemTotal.toFixed(2)}
                              </div>
                            </div>
                          </div>

                          {/* Bottom Section - Remove Button */}
                          <div style={{
                            display: 'flex',
                            justifyContent: 'flex-end'
                          }}>
                    <button
                      onClick={() => handleRemoveFromCart(productId)}
                      style={{
                                padding: '10px 20px',
                                background: 'linear-gradient(135deg, #dc3545, #c82333)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '0.9em',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 2px 8px rgba(220, 53, 69, 0.3)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                              onMouseOver={(e) => {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 4px 12px rgba(220, 53, 69, 0.4)';
                              }}
                              onMouseOut={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 2px 8px rgba(220, 53, 69, 0.3)';
                              }}
                            >
                              ❌ Retirer du panier
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
                💳 Finaliser la commande
              </h3>

              {/* Delivery Form */}
              <div style={{
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                padding: '25px',
                borderRadius: '15px',
                marginBottom: '30px',
                border: '1px solid rgba(138, 90, 68, 0.1)'
              }}>
                <h4 style={{
                  fontSize: '1.2em',
                  color: '#8a5a44',
                  marginBottom: '20px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  📍 Détails de livraison
                </h4>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '1em',
                    color: '#8a5a44',
                    marginBottom: '8px',
                    fontWeight: 600
                  }}>
                    Numéro de téléphone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={deliveryInfo.phone}
                    onChange={handleDeliveryChange}
                    placeholder="Ex: +216 12345678"
                    style={{
                      width: '100%',
                      padding: '12px 15px',
                      fontSize: '1em',
                      border: '2px solid #d4a373',
                      borderRadius: '10px',
                      background: '#fff',
                      transition: 'all 0.3s ease',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#8a5a44';
                      e.target.style.boxShadow = '0 0 0 3px rgba(138, 90, 68, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#d4a373';
                      e.target.style.boxShadow = 'none';
                    }}
                    required
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '1em',
                    color: '#8a5a44',
                    marginBottom: '8px',
                    fontWeight: 600
                  }}>
                    Adresse de livraison
                  </label>
                  <textarea
                    name="address"
                    value={deliveryInfo.address}
                    onChange={handleDeliveryChange}
                    placeholder="Ex: 12 Rue des Artisans, Tunis"
                    style={{
                      width: '100%',
                      padding: '12px 15px',
                      fontSize: '1em',
                      border: '2px solid #d4a373',
                      borderRadius: '10px',
                      minHeight: '80px',
                      background: '#fff',
                      transition: 'all 0.3s ease',
                      resize: 'vertical',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#8a5a44';
                      e.target.style.boxShadow = '0 0 0 3px rgba(138, 90, 68, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#d4a373';
                      e.target.style.boxShadow = 'none';
                    }}
                    required
                  />
                </div>
              </div>

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
                  Total de la commande
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
                  Frais de livraison inclus
                </p>
              </div>

              {/* Payment Button */}
              <PaymentWrapper
                amountCents={amountCents}
                displayAmount={displayAmount}
                currency="EUR"
                type="cart"
                items={itemsWithArtisan}
                deliveryInfo={deliveryInfo}
                onSuccess={handlePaymentSuccess}
              />
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

export default FavoritesCart;