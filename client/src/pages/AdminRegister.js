import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/api';

function AdminRegister() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [adminCode, setAdminCode] = useState(''); // Champ pour un code admin (optionnel)
  const [role, setRole] = useState('admin');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (password.length < 8) { // Mot de passe plus fort pour admin
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    // Validation optionnelle du code admin (ex. : "ADMIN2025")
    if (adminCode !== 'ADMIN2025') { // Remplacez par votre code sécurisé
      setError('Code administrateur incorrect.');
      return;
    }
    try {
      console.log('Sending admin register request with:', { email, password, role, nom, prenom });
      const { data } = await register({ email, password, role, nom, prenom });
      console.log('Admin register response:', data);
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.user._id);
      setSuccess('Inscription administrateur réussie ! Redirection en cours...');
      setTimeout(() => {
        navigate('/admin-home');
      }, 1500);
    } catch (err) {
      console.error('Admin register error:', err.response?.data || err);
      setError(err.response?.data?.error || 'Échec de l\'inscription admin. Vérifiez vos informations.');
    }
  };

  return (
    <div style={{ fontFamily: '"Georgia", serif', color: '#3a2f1a', minHeight: '100vh', backgroundColor: '#f8f1e9', margin: 0, padding: 0 }}>
      {/* Header */}
      <header style={{ backgroundColor: '#8a5a44', color: '#fff', padding: '20px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h1 style={{ fontSize: '2em', margin: '0', fontWeight: 700 }}>
          <Link to="/" style={{ color: '#fff', textDecoration: 'none' }}>CraftHub</Link>
        </h1>
        <nav style={{ marginTop: '10px' }}>
          <Link to="/" style={{ color: '#d4a373', margin: '0 15px', textDecoration: 'none', fontWeight: 500 }}>Accueil</Link>
          <Link to="/about" style={{ color: '#d4a373', margin: '0 15px', textDecoration: 'none', fontWeight: 500 }}>À propos</Link>
        </nav>
      </header>

      {/* Main Content */}
      <div style={{ padding: '40px', maxWidth: '500px', margin: '50px auto', backgroundColor: '#fff', borderRadius: '20px', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize: '2.5em', color: '#8a5a44', textAlign: 'center', marginBottom: '30px' }}>Inscription Administrateur</h2>
        {error && <p style={{ color: '#a94442', backgroundColor: '#f2dede', padding: '10px', borderRadius: '5px', textAlign: 'center' }}>{error}</p>}
        {success && <p style={{ color: '#3c763d', backgroundColor: '#dff0d8', padding: '10px', borderRadius: '5px', textAlign: 'center' }}>{success}</p>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <input
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            placeholder="Nom"
            required
            style={{ padding: '15px', border: '2px solid #d4a373', borderRadius: '25px', fontSize: '1.1em', color: '#3a2f1a', outline: 'none', transition: 'border-color 0.3s' }}
            onFocus={(e) => (e.target.style.borderColor = '#8a5a44')}
            onBlur={(e) => (e.target.style.borderColor = '#d4a373')}
          />
          <input
            type="text"
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
            placeholder="Prénom"
            required
            style={{ padding: '15px', border: '2px solid #d4a373', borderRadius: '25px', fontSize: '1.1em', color: '#3a2f1a', outline: 'none', transition: 'border-color 0.3s' }}
            onFocus={(e) => (e.target.style.borderColor = '#8a5a44')}
            onBlur={(e) => (e.target.style.borderColor = '#d4a373')}
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            style={{ padding: '15px', border: '2px solid #d4a373', borderRadius: '25px', fontSize: '1.1em', color: '#3a2f1a', outline: 'none', transition: 'border-color 0.3s' }}
            onFocus={(e) => (e.target.style.borderColor = '#8a5a44')}
            onBlur={(e) => (e.target.style.borderColor = '#d4a373')}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe (min. 8 caractères)"
            required
            style={{ padding: '15px', border: '2px solid #d4a373', borderRadius: '25px', fontSize: '1.1em', color: '#3a2f1a', outline: 'none', transition: 'border-color 0.3s' }}
            onFocus={(e) => (e.target.style.borderColor = '#8a5a44')}
            onBlur={(e) => (e.target.style.borderColor = '#d4a373')}
          />
          <input
            type="text"
            value={adminCode}
            onChange={(e) => setAdminCode(e.target.value)}
            placeholder="Code Administrateur"
            required
            style={{ padding: '15px', border: '2px solid #d4a373', borderRadius: '25px', fontSize: '1.1em', color: '#3a2f1a', outline: 'none', transition: 'border-color 0.3s' }}
            onFocus={(e) => (e.target.style.borderColor = '#8a5a44')}
            onBlur={(e) => (e.target.style.borderColor = '#d4a373')}
          />
          <button
            type="submit"
            style={{ padding: '15px', backgroundColor: '#8a5a44', color: '#fff', border: 'none', borderRadius: '25px', fontSize: '1.2em', fontWeight: 600, cursor: 'pointer', transition: 'background-color 0.3s, transform 0.3s' }}
            onMouseOver={(e) => { e.target.style.backgroundColor = '#704838'; e.target.style.transform = 'scale(1.05)'; }}
            onMouseOut={(e) => { e.target.style.backgroundColor = '#8a5a44'; e.target.style.transform = 'scale(1)'; }}
          >S'inscrire</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '20px', color: '#5c4b38' }}>Retour à l'inscription standard ? <Link to="/register" style={{ color: '#8a5a44', textDecoration: 'underline', fontWeight: 600 }}>Inscription Client/Artisan</Link></p>
      </div>

      {/* Footer */}
      <footer style={{ backgroundColor: '#8a5a44', color: '#fff', textAlign: 'center', padding: '30px', marginTop: '50px' }}>
        <p style={{ margin: '0 0 10px', fontSize: '1em' }}>© 2025 CraftHub. Tous droits réservés.</p>
        <p style={{ fontSize: '1em' }}>Contact : <a href="mailto:contact@crafthub.com" style={{ color: '#d4a373', textDecoration: 'underline' }}>contact@crafthub.com</a></p>
        <p style={{ fontSize: '1em' }}>Suivez-nous : <a href="https://facebook.com/crafthub" style={{ color: '#d4a373', textDecoration: 'underline', marginRight: '15px' }}>Facebook</a> | <a href="https://instagram.com/crafthub" style={{ color: '#d4a373', textDecoration: 'underline' }}>Instagram</a></p>
      </footer>
    </div>
  );
}

export default AdminRegister;