import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/api';
import { jwtDecode } from 'jwt-decode';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    try {
      console.log('Sending login request with:', { email, password }); // Debug log
      const { data } = await login({ email, password });
      console.log('Login response:', data); // Debug log
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.user._id);
      const decodedToken = jwtDecode(data.token);
      const role = decodedToken.role;
      setSuccess('Connexion réussie ! Redirection en cours...');
      setTimeout(() => {
        if (role === 'client') navigate('/client-home');
        else if (role === 'artisan') navigate('/artisan-home');
        else if (role === 'admin') navigate('/admin-home');
      }, 1500);
    } catch (err) {
      console.error('Login error:', err.response?.data || err); // Debug error
      setError(err.response?.data?.error || 'Échec de la connexion. Vérifiez vos identifiants.');
    }
  };

  return (
    <div style={{ fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif', backgroundColor: '#f8f1e9', color: '#3a2f1a', margin: 0, padding: 0, minHeight: '100vh', overflowX: 'hidden' }}>
      {/* Bannière héroïque */}
      <header style={{ background: 'linear-gradient(135deg, #8a5a44, #d4a373)', color: '#fff', textAlign: 'center', padding: '180px 20px 120px', position: 'relative', overflow: 'hidden' }}>
        <h1 style={{ fontSize: '5em', fontWeight: 700, margin: '0 0 30px', textShadow: '4px 4px 8px rgba(0,0,0,0.5)' }}>
          <Link to="/" style={{ color: '#fff', textDecoration: 'none' }}>CraftHub</Link>
        </h1>
        <p style={{ fontSize: '1.8em', margin: '0 auto 60px', maxWidth: '900px', lineHeight: '1.8' }}>
          Connectez-vous à votre compte pour accéder à votre espace personnel
        </p>
        <nav style={{ marginTop: '20px' }}>
          <Link to="/" style={{ 
            color: '#fff', 
            margin: '0 20px', 
            textDecoration: 'none', 
            fontWeight: 600, 
            fontSize: '1.2em',
            padding: '10px 20px',
            borderRadius: '25px',
            backgroundColor: 'rgba(255,255,255,0.2)',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(255,255,255,0.3)'
          }} onMouseOver={e => { 
            e.target.style.backgroundColor = 'rgba(255,255,255,0.3)'; 
            e.target.style.transform = 'translateY(-2px) scale(1.05)'; 
          }} onMouseOut={e => { 
            e.target.style.backgroundColor = 'rgba(255,255,255,0.2)'; 
            e.target.style.transform = 'translateY(0) scale(1)'; 
          }}>Accueil</Link>
          <Link to="/about" style={{ 
            color: '#fff', 
            margin: '0 20px', 
            textDecoration: 'none', 
            fontWeight: 600, 
            fontSize: '1.2em',
            padding: '10px 20px',
            borderRadius: '25px',
            backgroundColor: 'rgba(255,255,255,0.2)',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(255,255,255,0.3)'
          }} onMouseOver={e => { 
            e.target.style.backgroundColor = 'rgba(255,255,255,0.3)'; 
            e.target.style.transform = 'translateY(-2px) scale(1.05)'; 
          }} onMouseOut={e => { 
            e.target.style.backgroundColor = 'rgba(255,255,255,0.2)'; 
            e.target.style.transform = 'translateY(0) scale(1)'; 
          }}>À propos</Link>
        </nav>
        <div style={{ position: 'absolute', bottom: '-50px', left: '50%', transform: 'translateX(-50%)', width: '200px', height: '200px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(20px)' }}></div>
      </header>

      {/* Main Content - Modern Login Form */}
      <section style={{ 
        maxWidth: '1400px', 
        margin: '100px auto', 
        padding: '80px 40px', 
        backgroundColor: '#fff', 
        borderRadius: '30px', 
        boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative background elements */}
        <div style={{
          position: 'absolute',
          top: '-100px',
          right: '-100px',
          width: '200px',
          height: '200px',
          background: 'linear-gradient(45deg, #d4a373, #8a5a44)',
          borderRadius: '50%',
          opacity: 0.05
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '-50px',
          left: '-50px',
          width: '150px',
          height: '150px',
          background: 'linear-gradient(45deg, #8a5a44, #d4a373)',
          borderRadius: '50%',
          opacity: 0.05
        }}></div>

        <div style={{ 
          maxWidth: '500px', 
          margin: '0 auto',
          position: 'relative',
          zIndex: 1
        }}>
          {/* Header Section */}
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
              borderRadius: '50%',
              margin: '0 auto 30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 30px rgba(138, 90, 68, 0.3)'
            }}>
              <span style={{ fontSize: '2.5em', color: '#fff' }}>🔐</span>
            </div>
            <h2 style={{ 
              fontSize: '3.2em', 
              color: '#8a5a44', 
              marginBottom: '15px',
              fontWeight: 700,
              textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
            }}>Connexion</h2>
            <p style={{ 
              fontSize: '1.2em', 
              color: '#5c4b38', 
              margin: 0,
              opacity: 0.8
            }}>Accédez à votre espace personnel</p>
          </div>

          {/* Alert Messages */}
          {error && (
            <div style={{ 
              color: '#a94442', 
              backgroundColor: '#f8d7da', 
              border: '1px solid #f5c6cb',
              padding: '15px 20px', 
              borderRadius: '15px', 
              textAlign: 'center',
              marginBottom: '30px',
              fontSize: '1em',
              fontWeight: 500,
              boxShadow: '0 4px 15px rgba(169, 68, 66, 0.1)'
            }}>
              ⚠️ {error}
            </div>
          )}
          {success && (
            <div style={{ 
              color: '#155724', 
              backgroundColor: '#d4edda', 
              border: '1px solid #c3e6cb',
              padding: '15px 20px', 
              borderRadius: '15px', 
              textAlign: 'center',
              marginBottom: '30px',
              fontSize: '1em',
              fontWeight: 500,
              boxShadow: '0 4px 15px rgba(21, 87, 36, 0.1)'
            }}>
              ✅ {success}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            {/* Email Field */}
            <div style={{ position: 'relative' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                color: '#8a5a44', 
                fontWeight: 600,
                fontSize: '1.1em'
              }}>
                Adresse email
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute',
                  left: '20px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '1.2em',
                  color: '#d4a373',
                  zIndex: 1
                }}>📧</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                  style={{ 
                    width: '100%',
                    padding: '18px 20px 18px 55px', 
                    border: '2px solid #e8d5c4', 
                    borderRadius: '15px', 
                    fontSize: '1.1em', 
                    color: '#3a2f1a', 
                    outline: 'none', 
                    transition: 'all 0.3s ease',
                    backgroundColor: '#faf9f7',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
                  }}
                  onFocus={(e) => { 
                    e.target.style.borderColor = '#8a5a44'; 
                    e.target.style.backgroundColor = '#fff';
                    e.target.style.boxShadow = '0 8px 25px rgba(138, 90, 68, 0.15)';
                  }}
                  onBlur={(e) => { 
                    e.target.style.borderColor = '#e8d5c4'; 
                    e.target.style.backgroundColor = '#faf9f7';
                    e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.05)';
                  }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div style={{ position: 'relative' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                color: '#8a5a44', 
                fontWeight: 600,
                fontSize: '1.1em'
              }}>
                Mot de passe
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute',
                  left: '20px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '1.2em',
                  color: '#d4a373',
                  zIndex: 1
                }}>🔒</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Votre mot de passe"
                  required
                  style={{ 
                    width: '100%',
                    padding: '18px 20px 18px 55px', 
                    border: '2px solid #e8d5c4', 
                    borderRadius: '15px', 
                    fontSize: '1.1em', 
                    color: '#3a2f1a', 
                    outline: 'none', 
                    transition: 'all 0.3s ease',
                    backgroundColor: '#faf9f7',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
                  }}
                  onFocus={(e) => { 
                    e.target.style.borderColor = '#8a5a44'; 
                    e.target.style.backgroundColor = '#fff';
                    e.target.style.boxShadow = '0 8px 25px rgba(138, 90, 68, 0.15)';
                  }}
                  onBlur={(e) => { 
                    e.target.style.borderColor = '#e8d5c4'; 
                    e.target.style.backgroundColor = '#faf9f7';
                    e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.05)';
                  }}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              style={{ 
                padding: '20px 40px', 
                background: 'linear-gradient(135deg, #8a5a44, #d4a373)', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '15px', 
                fontSize: '1.3em', 
                fontWeight: 700, 
                cursor: 'pointer', 
                transition: 'all 0.3s ease',
                boxShadow: '0 8px 25px rgba(138, 90, 68, 0.3)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseOver={(e) => { 
                e.target.style.background = 'linear-gradient(135deg, #704838, #c68e5d)'; 
                e.target.style.transform = 'translateY(-3px) scale(1.02)'; 
                e.target.style.boxShadow = '0 12px 35px rgba(138, 90, 68, 0.4)';
              }}
              onMouseOut={(e) => { 
                e.target.style.background = 'linear-gradient(135deg, #8a5a44, #d4a373)'; 
                e.target.style.transform = 'translateY(0) scale(1)'; 
                e.target.style.boxShadow = '0 8px 25px rgba(138, 90, 68, 0.3)';
              }}
            >
              Se connecter
            </button>
          </form>

          {/* Links Section */}
          <div style={{ 
            textAlign: 'center', 
            marginTop: '40px',
            padding: '30px',
            backgroundColor: '#faf9f7',
            borderRadius: '15px',
            border: '1px solid #e8d5c4'
          }}>
            <p style={{ 
              margin: '0 0 15px', 
              color: '#5c4b38',
              fontSize: '1.1em'
            }}>
              Pas encore de compte ? 
              <Link to="/register" style={{ 
                color: '#8a5a44', 
                textDecoration: 'none', 
                fontWeight: 700,
                marginLeft: '8px',
                padding: '8px 16px',
                borderRadius: '20px',
                backgroundColor: 'rgba(138, 90, 68, 0.1)',
                transition: 'all 0.3s ease'
              }} onMouseOver={(e) => {
                e.target.style.backgroundColor = 'rgba(138, 90, 68, 0.2)';
                e.target.style.transform = 'scale(1.05)';
              }} onMouseOut={(e) => {
                e.target.style.backgroundColor = 'rgba(138, 90, 68, 0.1)';
                e.target.style.transform = 'scale(1)';
              }}>
                Créer un compte
              </Link>
            </p>
            <p style={{ 
              margin: '0', 
              color: '#5c4b38',
              fontSize: '1em'
            }}>
              <Link to="/forgot-password" style={{ 
                color: '#d4a373', 
                textDecoration: 'none', 
                fontWeight: 600,
                padding: '5px 10px',
                borderRadius: '10px',
                transition: 'all 0.3s ease'
              }} onMouseOver={(e) => {
                e.target.style.backgroundColor = 'rgba(212, 163, 115, 0.1)';
                e.target.style.color = '#8a5a44';
              }} onMouseOut={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = '#d4a373';
              }}>
                Mot de passe oublié ?
              </Link>
            </p>
          </div>
        </div>
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

          {/* Call to Action */}
          <div>
            <h4 style={{
              fontSize: '1.3em',
              fontWeight: 600,
              marginBottom: '20px',
              textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
            }}>
              Rejoignez-nous
            </h4>
            <p style={{
              fontSize: '1em',
              lineHeight: '1.6',
              marginBottom: '25px',
              opacity: 0.9
            }}>
              Inscrivez-vous pour explorer des créations uniques ou partagez votre talent avec le monde.
            </p>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '15px'
            }}>
              <Link to="/register" style={{
                padding: '15px 30px',
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: '#fff',
                textDecoration: 'none',
                borderRadius: '25px',
                fontWeight: 600,
                textAlign: 'center',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.3)'
              }} onMouseOver={(e) => {
                e.target.style.backgroundColor = 'rgba(255,255,255,0.3)';
                e.target.style.transform = 'translateY(-2px)';
              }} onMouseOut={(e) => {
                e.target.style.backgroundColor = 'rgba(255,255,255,0.2)';
                e.target.style.transform = 'translateY(0)';
              }}>
                Devenez membre
              </Link>
              <Link to="/login" style={{
                padding: '15px 30px',
                backgroundColor: '#fff',
                color: '#8a5a44',
                textDecoration: 'none',
                borderRadius: '25px',
                fontWeight: 600,
                textAlign: 'center',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
              }} onMouseOver={(e) => {
                e.target.style.backgroundColor = '#f8f1e9';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
              }} onMouseOut={(e) => {
                e.target.style.backgroundColor = '#fff';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
              }}>
                Se connecter
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

export default Login;