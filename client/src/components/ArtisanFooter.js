import React from 'react';
import { Link } from 'react-router-dom';

function ArtisanFooter() {
  return (
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
  );
}

export default ArtisanFooter;
