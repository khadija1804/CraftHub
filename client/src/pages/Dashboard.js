import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getProducts, deleteProduct, getWorkshops, deleteWorkshop } from '../services/api';

function Dashboard() {
  const [products, setProducts] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      console.log('Fetching data...');
      const [prodRes, workRes] = await Promise.all([getProducts(), getWorkshops()]);
      console.log('Products response:', prodRes.data);
      console.log('Workshops response:', workRes.data);
      setProducts(prodRes.data || []);
      setWorkshops(workRes.data || []);
    };
    fetchData().catch(console.error);
  }, []);

  const handleDeleteProduct = async (id) => {
    try {
      console.log('Deleting product ID:', id);
      const response = await deleteProduct(id);
      console.log('Delete response:', response.data);
      setProducts(products.filter(p => p._id !== id));
    } catch (err) {
      console.error('Error deleting product ID:', id, 'Error:', err.response?.data || err.message);
      alert(`Failed to delete product ID ${id}: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleDeleteWorkshop = async (id) => {
    try {
      console.log('Deleting workshop ID:', id);
      const response = await deleteWorkshop(id);
      console.log('Delete response:', response.data);
      setWorkshops(workshops.filter(w => w._id !== id));
    } catch (err) {
      console.error('Error deleting workshop ID:', id, 'Error:', err.response?.data || err.message);
      alert(`Failed to delete workshop ID ${id}: ${err.response?.data?.error || err.message}`);
    }
  };

  return (
    <div style={{ fontFamily: '"Georgia", serif', color: '#3a2f1a', minHeight: '100vh', backgroundColor: '#f5ece6', margin: 0, padding: 0, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{ backgroundColor: '#8a5a44', color: '#fff', padding: '16px', textAlign: 'center', boxShadow: '0 6px 12px rgba(0,0,0,0.1)', position: 'sticky', top: 0, zIndex: 100 }}>
        <h1 style={{ fontSize: '2.2em', margin: '0', fontWeight: 700 }}>
          <Link to="/" style={{ color: '#fff', textDecoration: 'none', transition: 'color 0.3s' }} onMouseOver={(e) => (e.target.style.color = '#d4a373')} onMouseOut={(e) => (e.target.style.color = '#fff')}>
            CraftHub Tunisie
          </Link>
        </h1>
        <nav style={{ marginTop: '8px' }}>
          <Link to="/artisan-home" style={{ color: '#d4a373', margin: '0 12px', textDecoration: 'none', fontWeight: 500, transition: 'color 0.3s' }} onMouseOver={(e) => (e.target.style.color = '#fff')} onMouseOut={(e) => (e.target.style.color = '#d4a373')}>
            Accueil
          </Link>
          {localStorage.getItem('token') ? (
            <>
             <Link to="/settings" style={{ color: '#d4a373', margin: '0 15px', textDecoration: 'none', fontWeight: 500 }}>Paramètres</Link>
                          <Link to="/artisan-orders" style={{ color: '#d4a373', margin: '0 15px', textDecoration: 'none', fontWeight: 500 }}>Commandes</Link>
                          <Link to="/subscription-payment" style={{ color: '#d4a373', margin: '0 15px', textDecoration: 'none', fontWeight: 500 }}>Paiement</Link>
                            <Link to="/artisan-statistics" style={{ color: '#d4a373', margin: '0 15px', textDecoration: 'none', fontWeight: 500 }}>Statistique</Link>
                          <Link to="/profile" style={{ color: '#d4a373', margin: '0 15px', textDecoration: 'none', fontWeight: 500 }}>Profil</Link>
                          <Link to="/login" style={{ color: '#d4a373', margin: '0 15px', textDecoration: 'none', fontWeight: 500 }}>Déconnexion</Link>
                        </>
         
          ) : (
            <Link to="/login" style={{ color: '#d4a373', margin: '0 12px', textDecoration: 'none', fontWeight: 500, transition: 'color 0.3s' }} onMouseOver={(e) => (e.target.style.color = '#fff')} onMouseOut={(e) => (e.target.style.color = '#d4a373')}>
              Connexion
            </Link>
          )}
        </nav>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '200px', paddingTop:'20px', margin: '20px auto', maxWidth: '1600px', backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 6px 12px rgba(0,0,0,0.1)', overflow: 'auto' }}>
        {/* Section Ajouter Produit */}
        <div style={{ marginBottom: '30px', textAlign: 'center' }}>
          <h3 style={{ color: '#8a5a44', fontSize: '2em', marginBottom: '8px' }}>Gestion des Produits</h3>
          <button
            onClick={() => navigate('/add-product')}
            style={{
              padding: '12px 24px',
              backgroundColor: '#8a5a44',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1.2em',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background-color 0.3s, transform 0.2s',
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#704838';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#8a5a44';
              e.target.style.transform = 'scale(1)';
            }}
          >
            Ajouter Produit
          </button>
        </div>
        <h3 style={{ color: '#8a5a44', fontSize: '2em', marginBottom: '8px' }}>Liste des Produits</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '8px', padding: '8px', justifyItems: 'center' }}>
          {products.map((p) => (
            <div
              key={p._id}
              style={{
                padding: '16px',
                border: '2px solid #d4a373',
                borderRadius: '10px',
                backgroundColor: '#ffffff',
                boxShadow: '0 6px 16px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer',
                minHeight: '10px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                width: '100%',
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-5px)';
                e.target.style.boxShadow = '0 10px 20px rgba(0,0,0,0.2)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 6px 16px rgba(0,0,0,0.1)';
              }}
            >
              <div>
                <h4 style={{ fontSize: '1.8em', margin: '0 0 8px', color: '#8a5a44', fontWeight: 600 }}>{p.name}</h4>
                <p style={{ margin: '0 0 8px', color: '#5a4a3a', fontSize: '1.2em' }}>Prix : {p.price} €</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteProduct(p._id);
                }}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#a94442',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1.1em',
                  alignSelf: 'flex-end',
                  transition: 'background-color 0.3s',
                }}
                onMouseOver={(e) => (e.target.style.backgroundColor = '#8a2f2f')}
                onMouseOut={(e) => (e.target.style.backgroundColor = '#a94442')}
              >
                Supprimer
              </button>
            </div>
          ))}
        </div>

        {/* Section Ajouter Atelier */}
        <div style={{ marginTop: '30px', marginBottom: '30px', textAlign: 'center' }}>
          <h3 style={{ color: '#8a5a44', fontSize: '2em', marginBottom: '8px' }}>Gestion des Ateliers</h3>
          <button
            onClick={() => navigate('/add-workshop')}
            style={{
              padding: '12px 24px',
              backgroundColor: '#8a5a44',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1.2em',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background-color 0.3s, transform 0.2s',
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#704838';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#8a5a44';
              e.target.style.transform = 'scale(1)';
            }}
          >
            Ajouter Atelier
          </button>
        </div>
        <h3 style={{ color: '#8a5a44', fontSize: '2em', marginBottom: '8px' }}>Liste des Ateliers</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '8px', padding: '8px', justifyItems: 'center' }}>
          {workshops.map((w) => (
            <div
              key={w._id}
              style={{
                padding: '16px',
                border: '2px solid #d4a373',
                borderRadius: '10px',
                backgroundColor: '#ffffff',
                boxShadow: '0 6px 16px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer',
                minHeight: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                width: '100%',
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-5px)';
                e.target.style.boxShadow = '0 10px 20px rgba(0,0,0,0.2)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 6px 16px rgba(0,0,0,0.1)';
              }}
            >
              <div>
                <h4 style={{ fontSize: '1.8em', margin: '0 0 8px', color: '#8a5a44', fontWeight: 600 }}>{w.title}</h4>
                <p style={{ margin: '0 0 8px', color: '#5a4a3a', fontSize: '1.2em' }}>Date : {new Date(w.date).toLocaleString()}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteWorkshop(w._id);
                }}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#a94442',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1.1em',
                  alignSelf: 'flex-end',
                  transition: 'background-color 0.3s',
                }}
                onMouseOver={(e) => (e.target.style.backgroundColor = '#8a2f2f')}
                onMouseOut={(e) => (e.target.style.backgroundColor = '#a94442')}
              >
                Supprimer
              </button>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: '#8a5a44', color: '#fff', textAlign: 'center', padding: '20px', marginTop: 'auto' }}>
        <p style={{ margin: '0 0 8px', fontSize: '1.3em' }}>© 2025 CraftHub Tunisie. Tous droits réservés.</p>
        <p style={{ fontSize: '1.3em' }}>Contact : <a href="mailto:contact@crafthub.tn" style={{ color: '#d4a373', textDecoration: 'underline' }}>contact@crafthub.tn</a></p>
        <p style={{ fontSize: '1.3em' }}>Suivez-nous : <a href="https://facebook.com/crafthubtn" style={{ color: '#d4a373', textDecoration: 'underline', marginRight: '12px' }}>Facebook</a> | <a href="https://instagram.com/crafthubtn" style={{ color: '#d4a373', textDecoration: 'underline' }}>Instagram</a></p>
      </footer>
    </div>
  );
}

export default Dashboard;