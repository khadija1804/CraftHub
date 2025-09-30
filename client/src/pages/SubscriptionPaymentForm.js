import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useNavigate, Link } from 'react-router-dom';
import { subscribe, confirmSubscription, getSubscriptionStatus } from '../services/api';
import NotificationToast from '../components/NotificationToast';
import useNotification from '../hooks/useNotification';

// Define stripePromise outside the component to ensure stability
const stripePublishableKey = 'pk_test_51S7EZZ3Bl87gtNv7WUrqH2gaXGTAjue6QYcixRwUefYtfKlLSZoPBl7LpbIDXV6Fc0lV96ropMk6fjzQX2ipQD1500bx764R13';
const stripePromise = loadStripe(stripePublishableKey);

function SubscriptionPaymentForm() {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [plan, setPlan] = useState('monthly');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const { notification, showNotification, hideNotification } = useNotification();

  // Fonction pour calculer les jours restants
  const calculateDaysRemaining = (expiryDate) => {
    if (!expiryDate) return 0;
    
    try {
      const today = new Date();
      const expiry = new Date(expiryDate);
      
      // Normaliser les dates (ignorer les heures)
      today.setHours(0, 0, 0, 0);
      expiry.setHours(0, 0, 0, 0);
      
      // Calculer la différence en millisecondes
      const diffTime = expiry - today;
      
      // Convertir en jours
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return Math.max(0, diffDays); // Retourner 0 si la date est passée
    } catch (error) {
      console.error('Erreur lors du calcul des jours restants:', error);
      return 0;
    }
  };

  // Vérifier l'état de l'abonnement au chargement
  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      // Vérifier si l'utilisateur est connecté
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found, user not authenticated');
        setSubscriptionStatus({ hasActiveSubscription: false, subscription: null });
        setCheckingStatus(false);
        return;
      }

      try {
        const response = await getSubscriptionStatus();
        setSubscriptionStatus(response.data);
      } catch (error) {
        console.error('Error checking subscription status:', error);
        
        // Si l'erreur est 401 (non authentifié), on continue sans abonnement
        if (error.response && error.response.status === 401) {
          console.log('User not authenticated, proceeding without subscription check');
          setSubscriptionStatus({ hasActiveSubscription: false, subscription: null });
        } else {
          showNotification('Erreur lors de la vérification de l\'abonnement', 'error');
        }
      } finally {
        setCheckingStatus(false);
      }
    };

    checkSubscriptionStatus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Vérifier si l'utilisateur est connecté
    const token = localStorage.getItem('token');
    if (!token) {
      showNotification("Vous devez être connecté pour effectuer un paiement.", 'warning');
      return;
    }
    
    if (!stripe || !elements) {
      showNotification("Stripe n'est pas initialisé.", 'error');
      return;
    }

    // Vérifier si l'artisan a déjà un abonnement actif
    if (subscriptionStatus && subscriptionStatus.hasActiveSubscription) {
      showNotification("Vous avez déjà un abonnement actif. Vous ne pouvez pas payer tant que votre abonnement actuel n'est pas expiré.", 'warning');
      return;
    }

    setLoading(true);
    setError(null);

    const amount = plan === 'monthly' ? 200 : 2200;
    const payload = { plan, amount };

    try {
      const response = await subscribe(payload);
      const { clientSecret } = response.data;
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: elements.getElement(CardElement) },
      });

      if (result.error) {
        showNotification(result.error.message, 'error');
      } else if (result.paymentIntent.status === 'succeeded') {
        await confirmSubscription({
          paymentIntentId: result.paymentIntent.id,
          status: 'succeeded',
        });
        showNotification('Abonnement activé avec succès !', 'success');
        setTimeout(() => {
          navigate('/artisan-home');
        }, 2000);
      }
    } catch (err) {
      // Gérer les erreurs spécifiques d'abonnement actif
      if (err.response && err.response.status === 400 && err.response.data.error === 'Vous avez déjà un abonnement actif') {
        showNotification(err.response.data.message, 'warning');
        setSubscriptionStatus(err.response.data);
      } else {
        showNotification("Erreur lors de l'abonnement.", 'error');
        console.error('Payment Error:', err.response ? err.response.data : err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const plans = [
    {
      id: 'monthly',
      name: 'Mensuel',
      price: '200',
      period: '/mois',
      description: 'Parfait pour commencer',
      features: [
        'Gestion illimitée des produits',
        'Statistiques détaillées',
        'Support client prioritaire',
        'Tableau de bord complet'
      ],
      popular: false
    },
    {
      id: 'annual',
      name: 'Annuel',
      price: '2200',
      period: '/an',
      description: 'Le plus économique',
      features: [
        'Tout du plan mensuel',
        '2 mois gratuits',
        'Fonctionnalités avancées',
        'Support premium 24/7',
        'Formations exclusives'
      ],
      popular: true,
      savings: 'Économisez 200€'
    }
  ];

  // Afficher un message de chargement
  if (checkingStatus) {
  return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        fontSize: '1.2em',
        color: '#8a5a44'
      }}>
        Vérification de votre abonnement...
      </div>
    );
  }

  // Vérifier si l'utilisateur est connecté
  const token = localStorage.getItem('token');
  if (!token) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        padding: '40px 20px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '4em', marginBottom: '20px' }}>🔒</div>
        <h2 style={{
          fontSize: '2em',
          fontWeight: 600,
          marginBottom: '20px',
          color: '#8a5a44'
        }}>
          Connexion requise
        </h2>
        <p style={{
          fontSize: '1.2em',
          marginBottom: '30px',
          color: '#666',
          lineHeight: '1.6'
        }}>
          Vous devez être connecté pour accéder à la page de paiement.
        </p>
        <Link to="/login" style={{
          background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
          color: '#fff',
          padding: '15px 30px',
          borderRadius: '25px',
          textDecoration: 'none',
          fontWeight: 600,
          fontSize: '1.1em',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 15px rgba(138, 90, 68, 0.3)'
        }} onMouseOver={(e) => {
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = '0 6px 20px rgba(138, 90, 68, 0.4)';
        }} onMouseOut={(e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 4px 15px rgba(138, 90, 68, 0.3)';
        }}>
          Se connecter
        </Link>
      </div>
    );
  }

  // Afficher l'état de l'abonnement actif
  if (subscriptionStatus && subscriptionStatus.hasActiveSubscription) {
    const subscription = subscriptionStatus.subscription;
    const expiryDate = new Date(subscription.expiryDate).toLocaleDateString('fr-FR');
    
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '30px',
        maxWidth: '800px',
        margin: '0 auto',
        padding: '40px 20px'
      }}>
        {/* ===== Hero Section ===== */}
        <div style={{
          textAlign: 'center',
          background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
          color: '#fff',
          padding: '60px 40px',
          borderRadius: '20px',
          boxShadow: '0 20px 40px rgba(138, 90, 68, 0.3)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative Elements */}
          <div style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '100px',
            height: '100px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '50%',
            opacity: 0.3
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: '-30px',
            left: '-30px',
            width: '60px',
            height: '60px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '50%',
            opacity: 0.2
          }}></div>

          <div style={{ fontSize: '4em', marginBottom: '20px' }}>✅</div>
          <h1 style={{
            fontSize: '2.5em',
            fontWeight: 700,
            marginBottom: '20px',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}>
            Abonnement Actif
          </h1>
          <p style={{
            fontSize: '1.3em',
            opacity: 0.9,
            marginBottom: '30px',
            lineHeight: '1.6'
          }}>
            Votre abonnement {subscription.plan === 'annual' ? 'annuel' : 'mensuel'} est actuellement actif
          </p>
        </div>

        {/* ===== Subscription Details ===== */}
        <div style={{
          background: '#fff',
          padding: '40px',
          borderRadius: '20px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          border: '1px solid #e8e8e8'
        }}>
          <h2 style={{
            fontSize: '1.8em',
            fontWeight: 600,
            marginBottom: '30px',
            color: '#3a2f1a',
            textAlign: 'center'
          }}>
            Détails de votre abonnement
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginBottom: '30px'
          }}>
            <div style={{
              padding: '20px',
              background: '#f8f1e9',
              borderRadius: '15px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2em', marginBottom: '10px' }}>📅</div>
              <h3 style={{ fontSize: '1.1em', fontWeight: 600, marginBottom: '5px', color: '#8a5a44' }}>
                Plan
              </h3>
              <p style={{ fontSize: '1.2em', fontWeight: 700, color: '#3a2f1a' }}>
                {subscription.plan === 'annual' ? 'Annuel' : 'Mensuel'}
              </p>
            </div>

            <div style={{
              padding: '20px',
              background: '#f8f1e9',
              borderRadius: '15px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2em', marginBottom: '10px' }}>💰</div>
              <h3 style={{ fontSize: '1.1em', fontWeight: 600, marginBottom: '5px', color: '#8a5a44' }}>
                Montant
              </h3>
              <p style={{ fontSize: '1.2em', fontWeight: 700, color: '#3a2f1a' }}>
                {subscription.amount} €
              </p>
            </div>

            <div style={{
              padding: '20px',
              background: '#f8f1e9',
              borderRadius: '15px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2em', marginBottom: '10px' }}>⏰</div>
              <h3 style={{ fontSize: '1.1em', fontWeight: 600, marginBottom: '5px', color: '#8a5a44' }}>
                Expiration
              </h3>
              <p style={{ fontSize: '1.2em', fontWeight: 700, color: '#3a2f1a' }}>
                {expiryDate}
              </p>
            </div>

            <div style={{
              padding: '20px',
              background: '#f8f1e9',
              borderRadius: '15px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2em', marginBottom: '10px' }}>📊</div>
              <h3 style={{ fontSize: '1.1em', fontWeight: 600, marginBottom: '5px', color: '#8a5a44' }}>
                Jours restants
              </h3>
              <p style={{ fontSize: '1.2em', fontWeight: 700, color: '#3a2f1a' }}>
                {calculateDaysRemaining(subscription.expiryDate)} jours
              </p>
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #e8f5e8, #f0f8f0)',
            padding: '20px',
            borderRadius: '15px',
            textAlign: 'center',
            border: '1px solid #c8e6c8'
          }}>
            <p style={{
              fontSize: '1.1em',
              color: '#2e7d32',
              margin: 0,
              fontWeight: 500
            }}>
              🎉 Vous pouvez utiliser toutes les fonctionnalités de CraftHub Artisan jusqu'au {expiryDate}
            </p>
          </div>
        </div>

        {/* ===== Action Buttons ===== */}
        <div style={{
          display: 'flex',
          gap: '20px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <Link to="/artisan-home" style={{
            background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
            color: '#fff',
            padding: '15px 30px',
            borderRadius: '25px',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '1.1em',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(138, 90, 68, 0.3)'
          }} onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px rgba(138, 90, 68, 0.4)';
          }} onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 15px rgba(138, 90, 68, 0.3)';
          }}>
            Retour à l'accueil
          </Link>
          
          <Link to="/artisan-statistics" style={{
            background: '#fff',
            color: '#8a5a44',
            padding: '15px 30px',
            borderRadius: '25px',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '1.1em',
            transition: 'all 0.3s ease',
            border: '2px solid #8a5a44',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
          }} onMouseOver={(e) => {
            e.target.style.background = '#8a5a44';
            e.target.style.color = '#fff';
            e.target.style.transform = 'translateY(-2px)';
          }} onMouseOut={(e) => {
            e.target.style.background = '#fff';
            e.target.style.color = '#8a5a44';
            e.target.style.transform = 'translateY(0)';
          }}>
            Voir les statistiques
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '50px',
      maxWidth: '1000px',
      margin: '0 auto'
    }}>
      {/* ===== Notification Toast ===== */}
      <NotificationToast 
        notification={notification} 
        onClose={hideNotification} 
      />
      
      {/* ===== Pricing Cards ===== */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '30px',
        marginBottom: '40px'
      }}>
        {plans.map((planData) => (
          <div
            key={planData.id}
            onClick={() => setPlan(planData.id)}
            style={{
              background: plan === planData.id 
                ? 'linear-gradient(135deg, #8a5a44, #d4a373)' 
                : '#fff',
              color: plan === planData.id ? '#fff' : '#3a2f1a',
              padding: '40px 30px',
              borderRadius: '20px',
              boxShadow: plan === planData.id 
                ? '0 20px 40px rgba(138, 90, 68, 0.3)' 
                : '0 10px 30px rgba(0,0,0,0.1)',
              border: plan === planData.id 
                ? '3px solid #d4a373' 
                : '2px solid rgba(212, 163, 115, 0.2)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              position: 'relative',
              transform: plan === planData.id ? 'translateY(-5px)' : 'translateY(0)'
            }}
            onMouseOver={(e) => {
              if (plan !== planData.id) {
                e.target.style.transform = 'translateY(-3px)';
                e.target.style.boxShadow = '0 15px 35px rgba(0,0,0,0.15)';
              }
            }}
            onMouseOut={(e) => {
              if (plan !== planData.id) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
              }
            }}
          >
            {/* Popular Badge */}
            {planData.popular && (
              <div style={{
                position: 'absolute',
                top: '-15px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'linear-gradient(135deg, #ff6b6b, #ff8e8e)',
                color: '#fff',
                padding: '8px 20px',
                borderRadius: '25px',
                fontSize: '0.9em',
                fontWeight: 600,
                boxShadow: '0 4px 15px rgba(255, 107, 107, 0.3)'
              }}>
                ⭐ Plus Populaire
              </div>
            )}

            {/* Savings Badge */}
            {planData.savings && (
              <div style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(255,255,255,0.2)',
                color: plan === planData.id ? '#fff' : '#8a5a44',
                padding: '6px 12px',
                borderRadius: '15px',
                fontSize: '0.8em',
                fontWeight: 600
              }}>
                {planData.savings}
              </div>
            )}

            {/* Plan Header */}
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <h3 style={{
                fontSize: '1.8em',
                fontWeight: 700,
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px'
              }}>
                {plan === planData.id && <span>✓</span>}
                {planData.name}
              </h3>
              <p style={{
                fontSize: '1em',
                opacity: 0.8,
                marginBottom: '20px'
              }}>
                {planData.description}
              </p>
              <div style={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'center',
                gap: '5px'
              }}>
                <span style={{
                  fontSize: '3em',
                  fontWeight: 800,
                  lineHeight: 1
                }}>
                  {planData.price}€
                </span>
                <span style={{
                  fontSize: '1.2em',
                  opacity: 0.7
                }}>
                  {planData.period}
                </span>
              </div>
            </div>

            {/* Features List */}
            <div style={{ marginBottom: '30px' }}>
              {planData.features.map((feature, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '12px',
                  fontSize: '1em'
                }}>
                  <span style={{
                    fontSize: '1.2em',
                    color: plan === planData.id ? '#fff' : '#8a5a44'
                  }}>
                    ✓
                  </span>
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            {/* Radio Button */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '10px',
              fontSize: '1.1em',
              fontWeight: 600
            }}>
          <input
            type="radio"
                name="plan"
                value={planData.id}
                checked={plan === planData.id}
            onChange={(e) => setPlan(e.target.value)}
                style={{
                  width: '20px',
                  height: '20px',
                  accentColor: plan === planData.id ? '#fff' : '#8a5a44'
                }}
              />
              <span>Sélectionner ce plan</span>
            </div>
          </div>
        ))}
      </div>

      {/* ===== Features Section ===== */}
      <div style={{
        background: '#fff',
        padding: '50px 40px',
        borderRadius: '20px',
        boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
        border: '1px solid rgba(212, 163, 115, 0.2)',
        marginBottom: '30px'
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '40px'
        }}>
          <h3 style={{
            fontSize: '2.2em',
            fontWeight: 700,
            color: '#3a2f1a',
            marginBottom: '15px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px'
          }}>
            <span>✨</span>
            Ce que vous obtenez avec CraftHub
          </h3>
          <p style={{
            color: '#6b5b47',
            fontSize: '1.2em',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Toutes les fonctionnalités dont vous avez besoin pour développer votre activité artisanale
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '30px'
        }}>
          {[
            {
              icon: '📦',
              title: 'Gestion des Produits',
              description: 'Créez, modifiez et organisez vos produits avec des images haute qualité'
            },
            {
              icon: '📊',
              title: 'Statistiques Avancées',
              description: 'Suivez vos ventes, vos clients et analysez les tendances du marché'
            },
            {
              icon: '🎨',
              title: 'Ateliers & Formations',
              description: 'Organisez des ateliers et partagez votre savoir-faire avec vos clients'
            },
            {
              icon: '💬',
              title: 'Communication Directe',
              description: 'Chat en temps réel avec vos clients et gestion des commandes'
            },
            {
              icon: '📱',
              title: 'Application Mobile',
              description: 'Gérez votre activité depuis n\'importe où avec notre app mobile'
            },
            {
              icon: '🛡️',
              title: 'Sécurité & Support',
              description: 'Paiements sécurisés et support technique dédié 24/7'
            }
          ].map((feature, index) => (
            <div key={index} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              padding: '30px 20px',
              background: 'linear-gradient(135deg, #f8f1e9, #fff)',
              borderRadius: '15px',
              border: '1px solid rgba(212, 163, 115, 0.1)',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-5px)';
              e.target.style.boxShadow = '0 10px 25px rgba(138, 90, 68, 0.15)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}>
              <div style={{
                fontSize: '3em',
                marginBottom: '20px',
                background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                {feature.icon}
              </div>
              <h4 style={{
                fontSize: '1.3em',
                fontWeight: 700,
                color: '#3a2f1a',
                marginBottom: '15px'
              }}>
                {feature.title}
              </h4>
              <p style={{
                color: '#6b5b47',
                fontSize: '1em',
                lineHeight: '1.6',
                margin: 0
              }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ===== Payment Form ===== */}
      <div style={{
        background: '#fff',
        padding: '40px',
        borderRadius: '20px',
        boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
        border: '1px solid rgba(212, 163, 115, 0.2)'
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '30px'
        }}>
          <h3 style={{
            fontSize: '1.8em',
            fontWeight: 700,
            color: '#3a2f1a',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px'
          }}>
            <span>💳</span>
            Informations de Paiement
          </h3>
          <p style={{
            color: '#6b5b47',
            fontSize: '1.1em'
          }}>
            Vos informations sont protégées par un chiffrement de niveau bancaire
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Card Element */}
          <div style={{
            marginBottom: '30px',
            padding: '20px',
            border: '2px solid rgba(212, 163, 115, 0.3)',
            borderRadius: '15px',
            backgroundColor: '#fafafa'
          }}>
            <label style={{
              display: 'block',
              marginBottom: '10px',
              fontWeight: 600,
              color: '#8a5a44',
              fontSize: '1.1em'
            }}>
              Carte de crédit ou débit
        </label>
            <CardElement 
              options={{ 
                style: { 
                  base: { 
                    fontSize: '16px', 
                    color: '#3a2f1a',
                    fontFamily: 'inherit'
                  } 
                } 
              }} 
            />
      </div>

          {/* Error Message */}
          {error && (
            <div style={{
              background: 'linear-gradient(135deg, #ff6b6b, #ff8e8e)',
              color: '#fff',
              padding: '15px 20px',
              borderRadius: '12px',
              marginBottom: '20px',
              textAlign: 'center',
              fontWeight: 600,
              boxShadow: '0 4px 15px rgba(255, 107, 107, 0.3)'
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Submit Button */}
      <button
        type="submit"
        disabled={!stripe || !elements || loading}
        style={{
              width: '100%',
              padding: '18px 30px',
              background: loading 
                ? 'linear-gradient(135deg, #ccc, #999)' 
                : 'linear-gradient(135deg, #8a5a44, #d4a373)',
          color: '#fff',
          border: 'none',
              borderRadius: '15px',
              fontSize: '1.2em',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: loading 
                ? '0 4px 15px rgba(0,0,0,0.1)' 
                : '0 8px 25px rgba(138, 90, 68, 0.3)',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 12px 35px rgba(138, 90, 68, 0.4)';
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 8px 25px rgba(138, 90, 68, 0.3)';
              }
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <span style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid #fff',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></span>
                Traitement en cours...
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <span>🚀</span>
                Confirmer l'abonnement - {plan === 'monthly' ? '200€/mois' : '2200€/an'}
              </span>
            )}
      </button>
    </form>

        {/* Security Badges */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '30px',
          marginTop: '30px',
          padding: '20px',
          background: 'rgba(138, 90, 68, 0.05)',
          borderRadius: '12px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#8a5a44',
            fontSize: '0.9em',
            fontWeight: 600
          }}>
            <span>🔒</span>
            <span>SSL Sécurisé</span>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#8a5a44',
            fontSize: '0.9em',
            fontWeight: 600
          }}>
            <span>💳</span>
            <span>Stripe</span>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#8a5a44',
            fontSize: '0.9em',
            fontWeight: 600
          }}>
            <span>🛡️</span>
            <span>PCI DSS</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionPaymentWrapper() {
  return (
    <div style={{ 
      fontFamily: '"Georgia", serif', 
      color: '#3a2f1a', 
      minHeight: '100vh', 
      backgroundColor: '#f5ece6', 
      margin: 0, 
      padding: 0, 
      display: 'flex', 
      flexDirection: 'column'
    }}>
      {/* CSS Animations */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
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
            <Link to="/artisan-home" style={{
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
              Accueil
            </Link>
            <Link to="/settings" style={{
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
              Paramètres
            </Link>
            <Link to="/artisan-orders" style={{
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
              Commandes
            </Link>
            <Link to="/subscription-payment" style={{
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
              Paiement
            </Link>
            <Link to="/artisan-statistics" style={{
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
              Statistiques
            </Link>
            <Link to="/profile" style={{
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
            <span style={{ fontSize: '1.5em' }}>💳</span>
            <span style={{
              color: '#8a5a44',
              fontWeight: 600,
              fontSize: '1.1em'
            }}>Paiement Sécurisé</span>
          </div>

          <h1 style={{
            fontSize: '3.5em',
            fontWeight: 800,
            color: '#3a2f1a',
            marginBottom: '20px',
            textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
            lineHeight: '1.2'
          }}>
            Choisissez Votre
            <span style={{
              background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}> Abonnement</span>
          </h1>

          <p style={{
            fontSize: '1.3em',
            color: '#6b5b47',
            maxWidth: '600px',
            margin: '0 auto 50px',
            lineHeight: '1.6'
          }}>
            Débloquez tout le potentiel de votre artisanat avec nos plans premium. 
            Vendez plus, gérez mieux, et développez votre activité artisanale.
          </p>
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
        <Elements stripe={stripePromise}>
          <SubscriptionPaymentForm />
        </Elements>
        </div>
      </main>

      {/* ===== Modern Footer ===== */}
      <footer style={{
        background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
        color: '#fff',
        padding: '60px 0 40px',
        marginTop: 'auto',
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
              <Link to="/artisan-home" style={{
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
                Accueil
              </Link>
              <Link to="/settings" style={{
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
                Paramètres
              </Link>
              <Link to="/artisan-orders" style={{
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
                Commandes
              </Link>
              <Link to="/artisan-statistics" style={{
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
                Statistiques
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