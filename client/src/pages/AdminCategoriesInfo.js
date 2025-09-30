import React from 'react';
import { Link } from 'react-router-dom';

const CATS = [
  {
    title: 'Produits naturels, biologiques & bien-être',
    emoji: '🌿',
    items: [
      'Savons, bougies, huiles essentielles',
      'Cosmétiques naturels (baumes, crèmes, shampoings solides)',
      'Produits d\'aromathérapie et relaxation',
    ],
  },
  {
    title: 'Maison, décoration & art de vivre',
    emoji: '🏺',
    items: [
      'Poterie, céramique, verrerie',
      'Textiles décoratifs (tapis, coussins, nappes, macramé)',
      'Tableaux, sculptures, calligraphies',
      'Décorations de fête (Noël, mariage, Ramadan, etc.)',
    ],
  },
  {
    title: 'Mode, accessoires & bijoux',
    emoji: '👗',
    items: [
      'Vêtements faits main (couture, tricot, crochet)',
      'Bijoux (argent, cuivre, perles, pierres naturelles)',
      'Sacs, ceintures, portefeuilles, chaussures artisanales',
      'Accessoires en cuir, laine ou tissus recyclés',
    ],
  },
  {
    title: 'Produits alimentaires artisanaux',
    emoji: '🍯',
    items: [
      'Confitures, miel, sirops',
      'Fromages, pains, biscuits, chocolats',
      'Huiles, épices, tisanes, cafés, thés',
      'Boissons artisanales (bière, jus naturels, kombucha)',
    ],
  },
  {
    title: 'Jouets & loisirs créatifs',
    emoji: '🧸',
    items: [
      'Jouets en bois, jeux éducatifs',
      'Poupées, peluches, marionnettes',
      'Kits de loisirs créatifs (peinture, collage, modelage)',
      'Jeux de société artisanaux',
    ],
  },
  {
    title: 'Mobilier & artisanat utilitaire',
    emoji: '🪑',
    items: [
      'Meubles en bois (tables, chaises, étagères)',
      'Objets utilitaires (paniers, boîtes, porte-monnaie)',
      'Outils et ustensiles de cuisine',
      'Éclairage artisanal (lampes, bougeoirs)',
    ],
  },
  {
    title: 'Arts visuels & artisanat artistique',
    emoji: '🎨',
    items: [
      'Peintures, dessins, gravures',
      'Sculptures en bois, pierre, métal',
      'Photographie artistique',
      'Calligraphie et enluminure',
    ],
  },
  {
    title: 'Artisanat culturel & traditionnel',
    emoji: '🏛️',
    items: [
      'Objets du patrimoine tunisien',
      'Tapis, kilims, broderies traditionnelles',
      'Instruments de musique artisanaux',
      'Objets religieux et spirituels',
    ],
  },
];

const AdminCategoriesInfo = () => {
  return (
    <div style={{ 
      fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif', 
      color: '#3a2f1a', 
      minHeight: '100vh', 
      backgroundColor: '#f8f1e9', 
      margin: 0, 
      padding: 0,
      position: 'relative'
    }}>
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
              transform: translateX(-20px);
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
          .card-hover {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .card-hover:hover {
            transform: translateY(-8px) scale(1.02);
            box-shadow: 0 20px 40px rgba(0,0,0,0.15);
          }
        `}
      </style>

      {/* ===== Admin Header ===== */}
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
          <Link to="/admin-home" style={{
            fontSize: '2.2em',
            fontWeight: 700,
            color: '#fff',
            textDecoration: 'none',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            transition: 'transform 0.3s ease'
          }} onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'} onMouseOut={(e) => e.target.style.transform = 'scale(1)'}>
            CraftHub Admin
          </Link>

          {/* Navigation */}
          <nav style={{
            display: 'flex',
            gap: '30px',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <Link to="/admin-home" style={{
              color: '#fff',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '1.1em',
              padding: '12px 24px',
              borderRadius: '25px',
              transition: 'all 0.3s ease',
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)'
            }} onMouseOver={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.2)';
              e.target.style.transform = 'translateY(-2px)';
            }} onMouseOut={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.1)';
              e.target.style.transform = 'translateY(0)';
            }}>
              🏠 Accueil Admin
            </Link>
            <Link to="/admin-categories-info" style={{
              color: '#fff',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '1.1em',
              padding: '12px 24px',
              borderRadius: '25px',
              transition: 'all 0.3s ease',
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)'
            }} onMouseOver={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.3)';
              e.target.style.transform = 'translateY(-2px)';
            }} onMouseOut={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.2)';
              e.target.style.transform = 'translateY(0)';
            }}>
              📚 Catégories
            </Link>
            <Link to="/" style={{
              color: '#fff',
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
      <div style={{
        background: 'linear-gradient(135deg, #8a5a44 0%, #d4a373 50%, #f8f1e9 100%)',
        padding: '80px 40px',
        margin: '0',
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
          textAlign: 'center',
          position: 'relative',
          zIndex: 2
        }}>
          <h1 style={{
            fontSize: '3.5em',
            color: '#fff',
            marginBottom: '20px',
            fontWeight: 700,
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            animation: 'fadeInUp 1s ease-out'
          }}>
            Guide des Catégories Admin
          </h1>
          <p style={{
            fontSize: '1.4em',
            color: 'rgba(255,255,255,0.9)',
            marginBottom: '40px',
            maxWidth: '600px',
            margin: '0 auto 40px',
            lineHeight: '1.6',
            animation: 'fadeInUp 1s ease-out 0.2s both'
          }}>
            Comprendre et gérer les catégories de produits et ateliers
          </p>
          <div style={{
            display: 'flex',
            gap: '20px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            animation: 'fadeInUp 1s ease-out 0.4s both'
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
              padding: '15px 30px',
              borderRadius: '30px',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#fff',
              fontSize: '1.1em',
              fontWeight: 600
            }}>
              📚 {CATS.length} Catégories
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
              padding: '15px 30px',
              borderRadius: '30px',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#fff',
              fontSize: '1.1em',
              fontWeight: 600
            }}>
              🎯 Gestion Admin
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          padding: "60px 40px",
          maxWidth: "1400px",
          margin: "-30px auto 0",
          backgroundColor: "#fff",
          borderRadius: "30px 30px 0 0",
          boxShadow: "0 -10px 30px rgba(0,0,0,0.1)",
          position: 'relative',
          zIndex: 3
        }}
      >
        {/* ===== Introduction Section ===== */}
        <div style={{
          background: 'linear-gradient(135deg, #f8f1e9, #fff)',
          padding: '40px',
          borderRadius: '25px',
          marginBottom: '50px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          border: '1px solid rgba(138, 90, 68, 0.1)'
        }}>
          <h2 style={{
            fontSize: '2.2em',
            color: '#8a5a44',
            textAlign: 'center',
            marginBottom: '20px',
            fontWeight: 700
          }}>
            🎯 Gestion des Catégories
          </h2>
          <p style={{
            fontSize: '1.2em',
            color: '#5c4b38',
            textAlign: 'center',
            lineHeight: '1.6',
            maxWidth: '800px',
            margin: '0 auto 30px'
          }}>
            En tant qu'administrateur, vous pouvez superviser et gérer toutes les catégories de produits et ateliers. 
            Utilisez ces informations pour mieux comprendre l'organisation du contenu et aider les artisans à classer leurs créations.
          </p>
          
          {/* ===== Statistics Button ===== */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: '30px'
          }}>
            <Link to="/admin-category-statistics" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              padding: '15px 30px',
              background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: '25px',
              fontWeight: '600',
              fontSize: '1.1em',
              transition: 'all 0.3s ease',
              boxShadow: '0 6px 20px rgba(138, 90, 68, 0.3)',
              border: '2px solid rgba(255,255,255,0.2)'
            }} onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-3px)';
              e.target.style.boxShadow = '0 8px 25px rgba(138, 90, 68, 0.4)';
              e.target.style.background = 'linear-gradient(135deg, #a66c55, #e6b894)';
            }} onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 6px 20px rgba(138, 90, 68, 0.3)';
              e.target.style.background = 'linear-gradient(135deg, #8a5a44, #d4a373)';
            }}>
              <span style={{ fontSize: '1.3em' }}>📊</span>
              Voir les Statistiques des Catégories
            </Link>
          </div>
        </div>

        {/* ===== Categories Grid ===== */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '30px',
          marginBottom: '50px'
        }}>
          {CATS.map((cat, index) => (
            <div key={index} className="card-hover" style={{
              background: 'linear-gradient(135deg, #fff, #f8f9fa)',
              borderRadius: '20px',
              padding: '30px',
              boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
              border: '1px solid #e9ecef',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Category Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                marginBottom: '20px',
                paddingBottom: '15px',
                borderBottom: '2px solid #f8f9fa'
              }}>
                <div style={{
                  fontSize: '2.5em',
                  background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
                  borderRadius: '15px',
                  width: '60px',
                  height: '60px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 15px rgba(138, 90, 68, 0.3)'
                }}>
                  {cat.emoji}
                </div>
                <h3 style={{
                  fontSize: '1.4em',
                  fontWeight: '700',
                  color: '#2c3e50',
                  margin: 0,
                  lineHeight: '1.3'
                }}>
                  {cat.title}
                </h3>
              </div>

              {/* Category Items */}
              <div>
                <h4 style={{
                  fontSize: '1.1em',
                  fontWeight: '600',
                  color: '#8a5a44',
                  marginBottom: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>📋</span>
                  Exemples de produits :
                </h4>
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0
                }}>
                  {cat.items.map((item, itemIndex) => (
                    <li key={itemIndex} style={{
                      padding: '8px 0',
                      borderBottom: '1px solid #f8f9fa',
                      fontSize: '0.95em',
                      color: '#5c4b38',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                      <span style={{
                        color: '#d4a373',
                        fontWeight: 'bold',
                        fontSize: '1.1em'
                      }}>•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          ))}
        </div>

      </div>

      {/* ===== Admin Footer ===== */}
      <footer style={{
        background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
        color: '#fff',
        padding: '40px 0',
        textAlign: 'center',
        marginTop: '50px'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 30px'
        }}>
          <h3 style={{
            fontSize: '1.8em',
            marginBottom: '20px',
            fontWeight: 700
          }}>
            CraftHub Admin Panel
          </h3>
          <p style={{
            fontSize: '1.1em',
            marginBottom: '20px',
            opacity: 0.9
          }}>
            Gestion avancée des catégories et du contenu
          </p>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '30px',
            flexWrap: 'wrap'
          }}>
            <Link to="/admin-home" style={{
              color: '#fff',
              textDecoration: 'none',
              fontSize: '1em',
              fontWeight: 600,
              padding: '10px 20px',
              borderRadius: '20px',
              background: 'rgba(255,255,255,0.1)',
              transition: 'all 0.3s ease'
            }} onMouseOver={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.2)';
              e.target.style.transform = 'translateY(-2px)';
            }} onMouseOut={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.1)';
              e.target.style.transform = 'translateY(0)';
            }}>
              Retour à l'accueil admin
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AdminCategoriesInfo;
