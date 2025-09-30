import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ArtisanFooter from '../components/ArtisanFooter';

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Lien de réinitialisation invalide.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`http://localhost:5000/api/auth/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage('Mot de passe réinitialisé avec succès. Vous allez être redirigé vers la page de connexion.');
        setError('');
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setError(data.error || 'Une erreur est survenue.');
      }
    } catch (err) {
      setError('Erreur de connexion. Veuillez réessayer.');
      setMessage('');
      console.error('Reset Password Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif', 
      color: '#3a2f1a', 
      minHeight: '100vh', 
      backgroundColor: '#f8f1e9', 
      margin: 0, 
      padding: 0,
      position: 'relative'
    }}>
      {/* Modern Header */}
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
          alignItems: 'center'
        }}>
          <Link to="/" style={{ textDecoration: 'none', color: '#fff' }}>
            <h1 style={{
              fontSize: '2.2em',
              margin: 0,
              fontWeight: 700,
              background: 'linear-gradient(45deg, #fff, #f0f0f0)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>
              🎨 CraftHub
        </h1>
          </Link>
          <nav style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
            <Link 
              to="/" 
              style={{ 
                color: '#fff', 
                textDecoration: 'none', 
                fontWeight: 600,
                fontSize: '1.1em',
                padding: '10px 20px',
                borderRadius: '25px',
                transition: 'all 0.3s ease',
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)'
              }}
              onMouseOver={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.2)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.1)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              🏠 Accueil
            </Link>
            <Link 
              to="/login" 
              style={{ 
                color: '#fff', 
                textDecoration: 'none', 
                fontWeight: 600,
                fontSize: '1.1em',
                padding: '10px 20px',
                borderRadius: '25px',
                transition: 'all 0.3s ease',
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)'
              }}
              onMouseOver={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.2)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.1)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              🔐 Se connecter
            </Link>
        </nav>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        minHeight: 'calc(100vh - 200px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        position: 'relative'
      }}>
        {/* Background Decorative Elements */}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: '200px',
          height: '200px',
          background: 'linear-gradient(45deg, rgba(138, 90, 68, 0.1), rgba(212, 163, 115, 0.1))',
          borderRadius: '50%',
          zIndex: 1
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '20%',
          right: '15%',
          width: '150px',
          height: '150px',
          background: 'linear-gradient(45deg, rgba(212, 163, 115, 0.1), rgba(138, 90, 68, 0.1))',
          borderRadius: '50%',
          zIndex: 1
        }}></div>

        {/* Reset Password Card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '30px',
          padding: '50px',
          maxWidth: '500px',
          width: '100%',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          position: 'relative',
          zIndex: 2,
          textAlign: 'center'
        }}>
          {/* Icon */}
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
            borderRadius: '50%',
            margin: '0 auto 30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.5em',
            boxShadow: '0 10px 20px rgba(138, 90, 68, 0.3)'
          }}>
            🔑
          </div>

          <h2 style={{
            fontSize: '2.5em',
            color: '#8a5a44',
            marginBottom: '15px',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Nouveau mot de passe
          </h2>
          
          <p style={{
            fontSize: '1.2em',
            color: '#666',
            marginBottom: '40px',
            lineHeight: 1.6
          }}>
            Créez un mot de passe sécurisé pour votre compte CraftHub
          </p>

          {/* Messages */}
          {message && (
            <div style={{
              background: 'linear-gradient(135deg, #4caf50, #66bb6a)',
              color: '#fff',
              padding: '15px 20px',
              borderRadius: '15px',
              marginBottom: '30px',
              fontSize: '1.1em',
              fontWeight: 600,
              boxShadow: '0 5px 15px rgba(76, 175, 80, 0.3)'
            }}>
              ✅ {message}
            </div>
          )}
          
          {error && (
            <div style={{
              background: 'linear-gradient(135deg, #f44336, #ef5350)',
              color: '#fff',
              padding: '15px 20px',
              borderRadius: '15px',
              marginBottom: '30px',
              fontSize: '1.1em',
              fontWeight: 600,
              boxShadow: '0 5px 15px rgba(244, 67, 54, 0.3)'
            }}>
              ❌ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
            {/* New Password Field */}
            <div style={{ marginBottom: '25px' }}>
              <label htmlFor="newPassword" style={{
                display: 'block',
                fontSize: '1.1em',
                marginBottom: '10px',
                color: '#3a2f1a',
                fontWeight: 600
              }}>
              Nouveau mot de passe
            </label>
              <div style={{ position: 'relative' }}>
            <input
                  type={showPassword ? 'text' : 'password'}
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={{
                width: '100%',
                    padding: '15px 50px 15px 20px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '15px',
                    fontSize: '1.1em',
                    transition: 'all 0.3s ease',
                    background: 'rgba(255,255,255,0.8)',
                    backdropFilter: 'blur(10px)'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#8a5a44';
                    e.target.style.boxShadow = '0 0 0 3px rgba(138, 90, 68, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e0e0e0';
                    e.target.style.boxShadow = 'none';
              }}
              required
            />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '15px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    fontSize: '1.2em',
                    cursor: 'pointer',
                    color: '#8a5a44'
                  }}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
          </div>

            {/* Confirm Password Field */}
            <div style={{ marginBottom: '35px' }}>
              <label htmlFor="confirmPassword" style={{
                display: 'block',
                fontSize: '1.1em',
                marginBottom: '10px',
                color: '#3a2f1a',
                fontWeight: 600
              }}>
              Confirmer le mot de passe
            </label>
              <div style={{ position: 'relative' }}>
            <input
                  type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{
                width: '100%',
                    padding: '15px 50px 15px 20px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '15px',
                    fontSize: '1.1em',
                    transition: 'all 0.3s ease',
                    background: 'rgba(255,255,255,0.8)',
                    backdropFilter: 'blur(10px)'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#8a5a44';
                    e.target.style.boxShadow = '0 0 0 3px rgba(138, 90, 68, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e0e0e0';
                    e.target.style.boxShadow = 'none';
              }}
              required
            />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '15px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    fontSize: '1.2em',
                    cursor: 'pointer',
                    color: '#8a5a44'
                  }}
                >
                  {showConfirmPassword ? '🙈' : '👁️'}
                </button>
              </div>
          </div>

            {/* Submit Button */}
          <button
            type="submit"
              disabled={loading}
            style={{
              width: '100%',
                padding: '18px',
                background: loading 
                  ? 'linear-gradient(135deg, #ccc, #999)' 
                  : 'linear-gradient(135deg, #8a5a44, #d4a373)',
              color: '#fff',
              border: 'none',
              borderRadius: '20px',
                fontSize: '1.2em',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 10px 20px rgba(138, 90, 68, 0.3)',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}
              onMouseOver={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 15px 30px rgba(138, 90, 68, 0.4)';
                }
              }}
              onMouseOut={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 10px 20px rgba(138, 90, 68, 0.3)';
                }
              }}
            >
              {loading ? '⏳ Traitement...' : '🔐 Réinitialiser le mot de passe'}
          </button>
        </form>

          {/* Back to Login Link */}
          <div style={{ marginTop: '30px', textAlign: 'center' }}>
            <Link 
              to="/login" 
              style={{
                color: '#8a5a44',
                textDecoration: 'none',
                fontSize: '1.1em',
                fontWeight: 600,
                padding: '10px 20px',
                borderRadius: '25px',
                transition: 'all 0.3s ease',
                background: 'rgba(138, 90, 68, 0.1)',
                display: 'inline-block'
              }}
              onMouseOver={(e) => {
                e.target.style.background = 'rgba(138, 90, 68, 0.2)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'rgba(138, 90, 68, 0.1)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              ← Retour à la connexion
            </Link>
          </div>
      </div>
      </main>

      {/* Footer */}
      <ArtisanFooter />
    </div>
  );
}

export default ResetPassword;