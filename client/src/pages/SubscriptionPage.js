import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { subscribe, getSubscriptionStatus } from '../services/api';

function SubscriptionPage() {
  const [plan, setPlan] = useState('monthly');
  const [status, setStatus] = useState('pending');
  const [expiryDate, setExpiryDate] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await getSubscriptionStatus();
        setStatus(response.status);
        setExpiryDate(response.expiryDate);
      } catch (err) {
        setError('Erreur lors de la vérification du statut.');
      }
    };
    checkStatus();
  }, []);

  const handleSubscribe = async () => {
    try {
      const amount = plan === 'monthly' ? 200 : 2200;
      await subscribe({ plan, amount });
      const response = await getSubscriptionStatus();
      setStatus(response.status);
      setExpiryDate(response.expiryDate);
      alert('Abonnement activé avec succès !');
    } catch (err) {
      setError('Erreur lors de l\'abonnement.');
    }
  };

  return (
    <div style={{ fontFamily: '"Georgia", serif', color: '#3a2f1a', minHeight: '100vh', backgroundColor: '#f8f1e9', margin: 0, padding: 0 }}>
      <header style={{ backgroundColor: '#8a5a44', color: '#fff', padding: '20px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h1 style={{ fontSize: '2em', margin: '0', fontWeight: 700 }}>
          <Link to="/artisan-home" style={{ color: '#fff', textDecoration: 'none' }}>CraftHub Artisan</Link>
        </h1>
        <nav style={{ marginTop: '10px' }}>
          <Link to="/artisan-home" style={{ color: '#d4a373', margin: '0 15px', textDecoration: 'none', fontWeight: 500 }}>Accueil</Link>
          <Link to="/artisan-orders" style={{ color: '#d4a373', margin: '0 15px', textDecoration: 'none', fontWeight: 500 }}>Commandes</Link>
          <Link to="/artisan-profile" style={{ color: '#d4a373', margin: '0 15px', textDecoration: 'none', fontWeight: 500 }}>Profil</Link>
          <Link to="/subscription" style={{ color: '#d4a373', margin: '0 15px', textDecoration: 'none', fontWeight: 500 }}>Abonnement</Link>
          <Link to="/login" style={{ color: '#d4a373', margin: '0 15px', textDecoration: 'none', fontWeight: 500 }}>Déconnexion</Link>
        </nav>
      </header>

      <div style={{ padding: '40px', maxWidth: '1200px', margin: '50px auto', backgroundColor: '#fff', borderRadius: '20px', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize: '2.5em', color: '#8a5a44', textAlign: 'center', marginBottom: '30px' }}>Choisir un Abonnement</h2>
        {error && <p style={{ color: '#a94442', textAlign: 'center' }}>{error}</p>}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <label>
            <input
              type="radio"
              value="monthly"
              checked={plan === 'monthly'}
              onChange={(e) => setPlan(e.target.value)}
            /> Mensuel - 200 $
          </label>
          <label style={{ marginLeft: '20px' }}>
            <input
              type="radio"
              value="annual"
              checked={plan === 'annual'}
              onChange={(e) => setPlan(e.target.value)}
            /> Annuel - 2200 $
          </label>
        </div>
        <button
          onClick={handleSubscribe}
          style={{ padding: '10px 20px', backgroundColor: '#8a5a44', color: '#fff', border: 'none', borderRadius: '20px', cursor: 'pointer', margin: '0 auto', display: 'block' }}
          disabled={status === 'paid'}
        >
          S'abonner
        </button>
        <p style={{ textAlign: 'center', marginTop: '20px' }}>
          Statut : {status === 'paid' ? `Payé (valable jusqu'au ${new Date(expiryDate).toLocaleDateString()})` : 'En attente de paiement'}
        </p>
        {status === 'pending' && (
          <p style={{ color: '#a94442', textAlign: 'center' }}>
            Votre abonnement est en attente. Abonnez-vous pour débloquer toutes les fonctionnalités.
          </p>
        )}
      </div>

      <footer style={{ backgroundColor: '#8a5a44', color: '#fff', textAlign: 'center', padding: '30px', marginTop: '50px' }}>
        <p style={{ margin: '0 0 10px', fontSize: '1em' }}>© 2025 CraftHub. Tous droits réservés.</p>
        <p style={{ fontSize: '1em' }}>Contact : <a href="mailto:contact@crafthub.com" style={{ color: '#d4a373', textDecoration: 'underline' }}>contact@crafthub.com</a></p>
        <p style={{ fontSize: '1em' }}>Suivez-nous : <a href="https://facebook.com/crafthub" style={{ color: '#d4a373', textDecoration: 'underline', marginRight: '15px' }}>Facebook</a> | <a href="https://instagram.com/crafthub" style={{ color: '#d4a373', textDecoration: 'underline' }}>Instagram</a></p>
      </footer>
    </div>
  );
}

export default SubscriptionPage;