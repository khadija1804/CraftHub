import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPendingOrders } from '../services/api';

function ArtisanHeader() {
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);

  useEffect(() => {
    const fetchPendingOrders = async () => {
      try {
        const ordersResponse = await getPendingOrders();
        const orders = ordersResponse.data || [];
        
        // Compter les commandes en attente
        const pendingCount = orders
          .filter(payment => payment.type === 'cart')
          .reduce((total, payment) => 
            total + payment.items.filter(item => item.status === 'pending').length, 0
          );
        
        setPendingOrdersCount(pendingCount);
      } catch (err) {
        console.error('Error fetching pending orders:', err);
        setPendingOrdersCount(0);
      }
    };

    fetchPendingOrders();
    
    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(fetchPendingOrders, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return (
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
            background: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.3)',
            position: 'relative'
          }} onMouseOver={(e) => {
            e.target.style.background = 'rgba(255,255,255,0.3)';
            e.target.style.transform = 'translateY(-2px)';
          }} onMouseOut={(e) => {
            e.target.style.background = 'rgba(255,255,255,0.2)';
            e.target.style.transform = 'translateY(0)';
          }}>
            Commandes
            {/* Badge de notification */}
            {pendingOrdersCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                background: 'linear-gradient(135deg, #ff6b6b, #ff8e8e)',
                color: '#fff',
                borderRadius: '50%',
                minWidth: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8em',
                fontWeight: 700,
                boxShadow: '0 4px 12px rgba(255, 107, 107, 0.4)',
                animation: 'pulse 2s infinite',
                border: '2px solid #fff'
              }}>
                {pendingOrdersCount > 99 ? '99+' : pendingOrdersCount}
              </span>
            )}
          </Link>
          <Link to="/subscription-payment" style={{
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

      {/* CSS Animation */}
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
        `}
      </style>
    </header>
  );
}

export default ArtisanHeader;
