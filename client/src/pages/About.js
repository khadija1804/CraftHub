import React from 'react';
import { Link } from 'react-router-dom';

function About() {
  return (
    <div style={{ 
      fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif', 
      backgroundColor: '#fafafa', 
      color: '#2c3e50', 
      margin: 0, 
      padding: 0, 
      minHeight: '100vh', 
      overflowX: 'hidden',
      lineHeight: '1.6'
    }}>
      {/* ===== Modern Hero Section ===== */}
      <header style={{ 
        background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
        color: '#fff', 
        textAlign: 'center', 
        padding: '120px 20px 80px', 
        position: 'relative', 
        overflow: 'hidden',
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        {/* Animated Background Elements */}
        <div style={{ 
          position: 'absolute', 
          top: '-100px', 
          left: '-100px', 
          width: '300px', 
          height: '300px', 
          background: 'rgba(255,255,255,0.1)', 
          borderRadius: '50%', 
          filter: 'blur(40px)',
          animation: 'float 6s ease-in-out infinite'
        }}></div>
        
        <div style={{ 
          position: 'absolute', 
          bottom: '-150px', 
          right: '-150px', 
          width: '400px', 
          height: '400px', 
          background: 'rgba(255,255,255,0.05)', 
          borderRadius: '50%', 
          filter: 'blur(60px)',
          animation: 'float 8s ease-in-out infinite reverse'
        }}></div>

        <div style={{ position: 'relative', zIndex: 2, maxWidth: '1000px' }}>
          <div style={{
            display: 'inline-block',
            padding: '8px 24px',
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: '50px',
            fontSize: '0.9em',
            fontWeight: '600',
            marginBottom: '30px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.3)'
          }}>
            ✨ Découvrez notre histoire
          </div>
          
          <h1 style={{ 
            fontSize: 'clamp(2.5rem, 5vw, 4rem)', 
            fontWeight: '800', 
            margin: '0 0 30px', 
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            letterSpacing: '-0.02em',
            lineHeight: '1.1'
          }}>
            À propos de CraftHub
          </h1>
          
          <p style={{ 
            fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)', 
            margin: '0 auto 50px', 
            maxWidth: '800px', 
            lineHeight: '1.7',
            opacity: '0.95',
            fontWeight: '400'
          }}>
            Découvrez l'histoire derrière notre passion pour l'artisanat et notre engagement envers les créateurs du monde entier.
          </p>

          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/visitor-explore" style={{ 
              padding: '16px 32px', 
              backgroundColor: 'rgba(255,255,255,0.2)', 
              color: '#fff', 
              textDecoration: 'none', 
              borderRadius: '50px', 
              fontWeight: '600', 
              transition: 'all 0.3s ease',
              border: '2px solid rgba(255,255,255,0.3)',
              backdropFilter: 'blur(10px)',
              fontSize: '1rem'
            }} onMouseOver={e => { 
              e.target.style.backgroundColor = 'rgba(255,255,255,0.3)'; 
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
            }} onMouseOut={e => { 
              e.target.style.backgroundColor = 'rgba(255,255,255,0.2)'; 
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}>
              🛍️ Explorer nos créations
            </Link>
            
            <Link to="/register" style={{ 
              padding: '16px 32px', 
              backgroundColor: '#fff', 
              color: '#8a5a44', 
              textDecoration: 'none', 
              borderRadius: '50px', 
              fontWeight: '600', 
              transition: 'all 0.3s ease',
              fontSize: '1rem'
            }} onMouseOver={e => { 
              e.target.style.backgroundColor = '#f8f9fa'; 
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
            }} onMouseOut={e => { 
              e.target.style.backgroundColor = '#fff'; 
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}>
              🚀 Rejoindre la communauté
            </Link>
          </div>
        </div>
      </header>

      {/* ===== Notre Histoire ===== */}
      <section style={{ 
        maxWidth: '1200px', 
        margin: '80px auto', 
        padding: '0 20px',
        position: 'relative'
      }}>
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '24px',
          padding: '80px 60px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.05)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative Elements */}
          <div style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '200px',
            height: '200px',
            background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
            borderRadius: '50%',
            opacity: 0.1,
            filter: 'blur(40px)'
          }}></div>

          <div style={{
            position: 'absolute',
            bottom: '-30px',
            left: '-30px',
            width: '150px',
            height: '150px',
            background: 'linear-gradient(135deg, #d4a373, #8a5a44)',
            borderRadius: '50%',
            opacity: 0.1,
            filter: 'blur(30px)'
          }}></div>

          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{
              display: 'inline-block',
              padding: '8px 20px',
              backgroundColor: 'rgba(138, 90, 68, 0.1)',
              color: '#8a5a44',
              borderRadius: '50px',
              fontSize: '0.9em',
              fontWeight: '600',
              marginBottom: '30px',
              border: '1px solid rgba(138, 90, 68, 0.2)'
            }}>
              📖 Notre Histoire
            </div>

            <h2 style={{ 
              color: '#2c3e50', 
              fontSize: 'clamp(2rem, 4vw, 3rem)', 
              fontWeight: '800', 
              textAlign: 'center', 
              marginBottom: '40px',
              letterSpacing: '-0.02em',
              lineHeight: '1.2'
            }}>
              Une vision née de la passion
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '60px',
              alignItems: 'center',
              marginBottom: '50px'
            }}>
              <div>
                <p style={{ 
                  color: '#5a6c7d', 
                  fontSize: '1.1em', 
                  lineHeight: '1.8',
                  marginBottom: '30px'
                }}>
                  Fondée en 2025 à Tunis, CraftHub est née d'une vision simple : reconnecter les gens avec l'artisanat traditionnel tout en offrant une plateforme moderne pour les artisans.
                </p>
                <p style={{ 
                  color: '#5a6c7d', 
                  fontSize: '1.1em', 
                  lineHeight: '1.8',
                  marginBottom: '30px'
                }}>
                  Inspirés par la richesse culturelle de la Tunisie, nous avons créé un espace où chaque pièce raconte une histoire, soutient une communauté et promeut la durabilité.
                </p>
                <div style={{
                  display: 'flex',
                  gap: '20px',
                  flexWrap: 'wrap'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 20px',
                    backgroundColor: 'rgba(138, 90, 68, 0.1)',
                    borderRadius: '50px',
                    fontSize: '0.9em',
                    fontWeight: '600',
                    color: '#8a5a44'
                  }}>
                    <span>🏛️</span>
                    <span>Fondé en 2025</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 20px',
                    backgroundColor: 'rgba(212, 163, 115, 0.1)',
                    borderRadius: '50px',
                    fontSize: '0.9em',
                    fontWeight: '600',
                    color: '#d4a373'
                  }}>
                    <span>📍</span>
                    <span>Basé à Tunis</span>
                  </div>
                </div>
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <div style={{
                  width: '300px',
                  height: '300px',
                  background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '4rem',
                  color: '#fff',
                  boxShadow: '0 20px 40px rgba(138, 90, 68, 0.3)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    width: '60px',
                    height: '60px',
                    background: 'rgba(255,255,255,0.2)',
                    borderRadius: '50%',
                    filter: 'blur(20px)'
                  }}></div>
                  <div style={{
                    position: 'absolute',
                    bottom: '20px',
                    left: '20px',
                    width: '40px',
                    height: '40px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '50%',
                    filter: 'blur(15px)'
                  }}></div>
                  <span style={{ position: 'relative', zIndex: 2 }}>🎨</span>
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <Link to="/visitor-explore" style={{ 
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '16px 32px', 
                backgroundColor: '#8a5a44', 
                color: '#fff', 
                textDecoration: 'none', 
                borderRadius: '50px', 
                fontWeight: '600', 
                transition: 'all 0.3s ease',
                fontSize: '1rem',
                boxShadow: '0 8px 25px rgba(138, 90, 68, 0.3)'
              }} onMouseOver={e => { 
                e.target.style.backgroundColor = '#704838'; 
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 12px 35px rgba(138, 90, 68, 0.4)';
              }} onMouseOut={e => { 
                e.target.style.backgroundColor = '#8a5a44'; 
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 8px 25px rgba(138, 90, 68, 0.3)';
              }}>
                🛍️ Explorer nos créations
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Notre Mission ===== */}
      <section style={{ 
        maxWidth: '1200px', 
        margin: '80px auto', 
        padding: '0 20px',
        position: 'relative'
      }}>
        <div style={{
          backgroundColor: 'linear-gradient(135deg, #faf3e9 0%, #f8f1e9 100%)',
          borderRadius: '24px',
          padding: '80px 60px',
          border: '1px solid rgba(138, 90, 68, 0.1)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Background Pattern */}
          <div style={{
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            background: 'radial-gradient(circle at 20% 80%, rgba(138, 90, 68, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(212, 163, 115, 0.05) 0%, transparent 50%)',
            zIndex: 1
          }}></div>

          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{
              display: 'inline-block',
              padding: '8px 20px',
              backgroundColor: 'rgba(138, 90, 68, 0.1)',
              color: '#8a5a44',
              borderRadius: '50px',
              fontSize: '0.9em',
              fontWeight: '600',
              marginBottom: '30px',
              border: '1px solid rgba(138, 90, 68, 0.2)'
            }}>
              🎯 Notre Mission
            </div>

            <h2 style={{ 
              color: '#2c3e50', 
              fontSize: 'clamp(2rem, 4vw, 3rem)', 
              fontWeight: '800', 
              textAlign: 'center', 
              marginBottom: '60px',
              letterSpacing: '-0.02em',
              lineHeight: '1.2'
            }}>
              Nos valeurs fondamentales
            </h2>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
              gap: '40px',
              marginBottom: '40px'
            }}>
              <div style={{ 
                padding: '40px 30px', 
                backgroundColor: '#fff', 
                borderRadius: '20px', 
                transition: 'all 0.3s ease',
                border: '1px solid rgba(0,0,0,0.05)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                position: 'relative',
                overflow: 'hidden'
              }} onMouseOver={e => {
                e.target.style.transform = 'translateY(-8px)';
                e.target.style.boxShadow = '0 20px 40px rgba(138, 90, 68, 0.15)';
              }} onMouseOut={e => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 10px 30px rgba(0,0,0,0.05)';
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-20px',
                  right: '-20px',
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
                  borderRadius: '50%',
                  opacity: 0.1,
                  filter: 'blur(20px)'
                }}></div>
                
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.5rem',
                  marginBottom: '25px',
                  boxShadow: '0 10px 25px rgba(138, 90, 68, 0.3)'
                }}>
                  🤝
                </div>
                
                <h3 style={{ 
                  fontSize: '1.5em', 
                  margin: '0 0 20px', 
                  color: '#2c3e50',
                  fontWeight: '700'
                }}>
                  Soutenir les artisans
                </h3>
                <p style={{ 
                  color: '#5a6c7d', 
                  lineHeight: '1.7',
                  fontSize: '1rem',
                  margin: 0
                }}>
                  Nous offrons une vitrine moderne pour que les artisans locaux vendent et partagent leur savoir-faire unique avec le monde entier.
                </p>
              </div>

              <div style={{ 
                padding: '40px 30px', 
                backgroundColor: '#fff', 
                borderRadius: '20px', 
                transition: 'all 0.3s ease',
                border: '1px solid rgba(0,0,0,0.05)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                position: 'relative',
                overflow: 'hidden'
              }} onMouseOver={e => {
                e.target.style.transform = 'translateY(-8px)';
                e.target.style.boxShadow = '0 20px 40px rgba(212, 163, 115, 0.15)';
              }} onMouseOut={e => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 10px 30px rgba(0,0,0,0.05)';
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-20px',
                  right: '-20px',
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(135deg, #d4a373, #8a5a44)',
                  borderRadius: '50%',
                  opacity: 0.1,
                  filter: 'blur(20px)'
                }}></div>
                
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(135deg, #d4a373, #8a5a44)',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.5rem',
                  marginBottom: '25px',
                  boxShadow: '0 10px 25px rgba(212, 163, 115, 0.3)'
                }}>
                  🌱
                </div>
                
                <h3 style={{ 
                  fontSize: '1.5em', 
                  margin: '0 0 20px', 
                  color: '#2c3e50',
                  fontWeight: '700'
                }}>
                  Promouvoir la durabilité
                </h3>
                <p style={{ 
                  color: '#5a6c7d', 
                  lineHeight: '1.7',
                  fontSize: '1rem',
                  margin: 0
                }}>
                  Nous encourageons l'utilisation de matériaux écologiques et des pratiques durables pour un avenir plus vert.
                </p>
              </div>

              <div style={{ 
                padding: '40px 30px', 
                backgroundColor: '#fff', 
                borderRadius: '20px', 
                transition: 'all 0.3s ease',
                border: '1px solid rgba(0,0,0,0.05)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                position: 'relative',
                overflow: 'hidden'
              }} onMouseOver={e => {
                e.target.style.transform = 'translateY(-8px)';
                e.target.style.boxShadow = '0 20px 40px rgba(138, 90, 68, 0.15)';
              }} onMouseOut={e => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 10px 30px rgba(0,0,0,0.05)';
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-20px',
                  right: '-20px',
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
                  borderRadius: '50%',
                  opacity: 0.1,
                  filter: 'blur(20px)'
                }}></div>
                
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.5rem',
                  marginBottom: '25px',
                  boxShadow: '0 10px 25px rgba(138, 90, 68, 0.3)'
                }}>
                  🎓
                </div>
                
                <h3 style={{ 
                  fontSize: '1.5em', 
                  margin: '0 0 20px', 
                  color: '#2c3e50',
                  fontWeight: '700'
                }}>
                  Éducation artisanale
                </h3>
                <p style={{ 
                  color: '#5a6c7d', 
                  lineHeight: '1.7',
                  fontSize: '1rem',
                  margin: 0
                }}>
                  Nous organisons des ateliers pour transmettre les techniques traditionnelles aux nouvelles générations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Notre Équipe ===== */}
      <section style={{ 
        maxWidth: '1200px', 
        margin: '80px auto', 
        padding: '0 20px',
        position: 'relative'
      }}>
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '24px',
          padding: '80px 60px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.05)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative Elements */}
          <div style={{
            position: 'absolute',
            top: '-100px',
            left: '-100px',
            width: '300px',
            height: '300px',
            background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
            borderRadius: '50%',
            opacity: 0.05,
            filter: 'blur(60px)'
          }}></div>

          <div style={{
            position: 'absolute',
            bottom: '-100px',
            right: '-100px',
            width: '300px',
            height: '300px',
            background: 'linear-gradient(135deg, #d4a373, #8a5a44)',
            borderRadius: '50%',
            opacity: 0.05,
            filter: 'blur(60px)'
          }}></div>

          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{
              display: 'inline-block',
              padding: '8px 20px',
              backgroundColor: 'rgba(138, 90, 68, 0.1)',
              color: '#8a5a44',
              borderRadius: '50px',
              fontSize: '0.9em',
              fontWeight: '600',
              marginBottom: '30px',
              border: '1px solid rgba(138, 90, 68, 0.2)'
            }}>
              👥 Notre Équipe
            </div>

            <h2 style={{ 
              color: '#2c3e50', 
              fontSize: 'clamp(2rem, 4vw, 3rem)', 
              fontWeight: '800', 
              textAlign: 'center', 
              marginBottom: '60px',
              letterSpacing: '-0.02em',
              lineHeight: '1.2'
            }}>
              Rencontrez les créateurs
            </h2>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
              gap: '50px',
              marginBottom: '40px'
            }}>
              <div style={{ 
                padding: '50px 40px', 
                background: 'linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%)',
                borderRadius: '24px', 
                transition: 'all 0.3s ease',
                border: '1px solid rgba(102, 126, 234, 0.1)',
                position: 'relative',
                overflow: 'hidden'
              }} onMouseOver={e => {
                e.target.style.transform = 'translateY(-8px)';
                e.target.style.boxShadow = '0 25px 50px rgba(138, 90, 68, 0.15)';
              }} onMouseOut={e => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-30px',
                  right: '-30px',
                  width: '100px',
                  height: '100px',
                  background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
                  borderRadius: '50%',
                  opacity: 0.1,
                  filter: 'blur(30px)'
                }}></div>

                <div style={{
                  width: '100px',
                  height: '100px',
                  background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '3rem',
                  marginBottom: '30px',
                  boxShadow: '0 15px 35px rgba(138, 90, 68, 0.3)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    width: '30px',
                    height: '30px',
                    background: 'rgba(255,255,255,0.3)',
                    borderRadius: '50%',
                    filter: 'blur(10px)'
                  }}></div>
                  <span style={{ position: 'relative', zIndex: 2 }}>👩‍💼</span>
                </div>
                
                <h3 style={{ 
                  fontSize: '1.8em', 
                  margin: '0 0 10px', 
                  color: '#2c3e50',
                  fontWeight: '800'
                }}>
                  Khadija Chaari
                </h3>
                <p style={{ 
                  color: '#8a5a44', 
                  fontSize: '1.1em',
                  fontWeight: '600',
                  margin: '0 0 20px'
                }}>
                  Fondatrice & Directrice
                </p>
                <p style={{ 
                  color: '#5a6c7d', 
                  lineHeight: '1.7',
                  fontSize: '1rem',
                  margin: 0
                }}>
                  Passionnée par l'artisanat tunisien, Khadija a lancé CraftHub pour préserver le patrimoine culturel et offrir une plateforme moderne aux artisans.
                </p>
              </div>

              <div style={{ 
                padding: '50px 40px', 
                background: 'linear-gradient(135deg, #f0fff4 0%, #e6fffa 100%)',
                borderRadius: '24px', 
                transition: 'all 0.3s ease',
                border: '1px solid rgba(16, 185, 129, 0.1)',
                position: 'relative',
                overflow: 'hidden'
              }} onMouseOver={e => {
                e.target.style.transform = 'translateY(-8px)';
                e.target.style.boxShadow = '0 25px 50px rgba(212, 163, 115, 0.15)';
              }} onMouseOut={e => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-30px',
                  right: '-30px',
                  width: '100px',
                  height: '100px',
                  background: 'linear-gradient(135deg, #d4a373, #8a5a44)',
                  borderRadius: '50%',
                  opacity: 0.1,
                  filter: 'blur(30px)'
                }}></div>

                <div style={{
                  width: '100px',
                  height: '100px',
                  background: 'linear-gradient(135deg, #d4a373, #8a5a44)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '3rem',
                  marginBottom: '30px',
                  boxShadow: '0 15px 35px rgba(212, 163, 115, 0.3)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    width: '30px',
                    height: '30px',
                    background: 'rgba(255,255,255,0.3)',
                    borderRadius: '50%',
                    filter: 'blur(10px)'
                  }}></div>
                  <span style={{ position: 'relative', zIndex: 2 }}>👩‍🎨</span>
                </div>
                
                <h3 style={{ 
                  fontSize: '1.8em', 
                  margin: '0 0 10px', 
                  color: '#2c3e50',
                  fontWeight: '800'
                }}>
                  Manel Saidane
                </h3>
                <p style={{ 
                  color: '#d4a373', 
                  fontSize: '1.1em',
                  fontWeight: '600',
                  margin: '0 0 20px'
                }}>
                  Responsable des Ateliers
                </p>
                <p style={{ 
                  color: '#5a6c7d', 
                  lineHeight: '1.7',
                  fontSize: '1rem',
                  margin: 0
                }}>
                  Manel coordonne nos ateliers pour partager les savoir-faire ancestraux et créer des expériences d'apprentissage enrichissantes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Appel à l'Action ===== */}
      <section style={{ 
        maxWidth: '1200px', 
        margin: '80px auto', 
        padding: '0 20px',
        position: 'relative'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
          borderRadius: '24px',
          padding: '80px 60px',
          position: 'relative',
          overflow: 'hidden',
          textAlign: 'center'
        }}>
          {/* Animated Background Elements */}
          <div style={{
            position: 'absolute',
            top: '-50px',
            left: '-50px',
            width: '200px',
            height: '200px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '50%',
            filter: 'blur(40px)',
            animation: 'float 6s ease-in-out infinite'
          }}></div>
          
          <div style={{
            position: 'absolute',
            bottom: '-50px',
            right: '-50px',
            width: '200px',
            height: '200px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '50%',
            filter: 'blur(40px)',
            animation: 'float 8s ease-in-out infinite reverse'
          }}></div>

          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '300px',
            height: '300px',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '50%',
            filter: 'blur(60px)',
            animation: 'pulse 4s ease-in-out infinite'
          }}></div>

          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{
              display: 'inline-block',
              padding: '8px 24px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: '#fff',
              borderRadius: '50px',
              fontSize: '0.9em',
              fontWeight: '600',
              marginBottom: '30px',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.3)'
            }}>
              🚀 Rejoignez-nous
            </div>

            <h2 style={{ 
              color: '#fff', 
              fontSize: 'clamp(2rem, 4vw, 3rem)', 
              fontWeight: '800', 
              marginBottom: '30px',
              letterSpacing: '-0.02em',
              lineHeight: '1.2',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}>
              Faites partie de l'histoire
            </h2>
            
            <p style={{ 
              color: 'rgba(255,255,255,0.9)', 
              fontSize: '1.2em', 
              lineHeight: '1.7',
              margin: '0 auto 50px',
              maxWidth: '800px',
              textShadow: '1px 1px 2px rgba(0,0,0,0.2)'
            }}>
              Que vous soyez artisan, amateur ou simple curieux, CraftHub vous invite à rejoindre une communauté dédiée à l'art et à la culture.
            </p>

            <div style={{ 
              display: 'flex', 
              gap: '20px', 
              justifyContent: 'center', 
              flexWrap: 'wrap',
              marginBottom: '40px'
            }}>
              <Link to="/register" style={{ 
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '18px 36px', 
                backgroundColor: '#fff', 
                color: '#8a5a44', 
                textDecoration: 'none', 
                borderRadius: '50px', 
                fontWeight: '700', 
                transition: 'all 0.3s ease',
                fontSize: '1.1rem',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                border: '2px solid transparent'
              }} onMouseOver={e => { 
                e.target.style.backgroundColor = '#f8f9fa'; 
                e.target.style.transform = 'translateY(-3px)';
                e.target.style.boxShadow = '0 15px 40px rgba(0,0,0,0.3)';
                e.target.style.borderColor = 'rgba(138, 90, 68, 0.3)';
              }} onMouseOut={e => { 
                e.target.style.backgroundColor = '#fff'; 
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
                e.target.style.borderColor = 'transparent';
              }}>
                🎨 Devenez membre
              </Link>
              
              <Link to="/visitor-explore" style={{ 
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '18px 36px', 
                backgroundColor: 'rgba(255,255,255,0.2)', 
                color: '#fff', 
                textDecoration: 'none', 
                borderRadius: '50px', 
                fontWeight: '700', 
                transition: 'all 0.3s ease',
                fontSize: '1.1rem',
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(255,255,255,0.3)'
              }} onMouseOver={e => { 
                e.target.style.backgroundColor = 'rgba(255,255,255,0.3)'; 
                e.target.style.transform = 'translateY(-3px)';
                e.target.style.boxShadow = '0 15px 40px rgba(0,0,0,0.2)';
              }} onMouseOut={e => { 
                e.target.style.backgroundColor = 'rgba(255,255,255,0.2)'; 
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}>
                🛍️ Explorer maintenant
              </Link>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '40px',
              flexWrap: 'wrap',
              marginTop: '40px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: 'rgba(255,255,255,0.8)',
                fontSize: '0.9em'
              }}>
                <span style={{ fontSize: '1.2em' }}>✨</span>
                <span>Communauté active</span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: 'rgba(255,255,255,0.8)',
                fontSize: '0.9em'
              }}>
                <span style={{ fontSize: '1.2em' }}>🎓</span>
                <span>Ateliers gratuits</span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: 'rgba(255,255,255,0.8)',
                fontSize: '0.9em'
              }}>
                <span style={{ fontSize: '1.2em' }}>🌱</span>
                <span>Écologique</span>
              </div>
            </div>
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
          position: 'relative',
          zIndex: 1
        }}>
          {/* Main Footer Content */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '40px',
            marginBottom: '40px'
          }}>
            {/* Brand Section */}
            <div>
              <h3 style={{
                fontSize: '1.8em',
                fontWeight: '700',
                marginBottom: '20px',
                color: '#fff'
              }}>
                🎨 CraftHub
              </h3>
              <p style={{
                fontSize: '1.1em',
                lineHeight: '1.6',
                marginBottom: '20px',
                opacity: 0.9
              }}>
                La plateforme qui connecte artisans et amateurs d'artisanat pour préserver et partager les savoir-faire traditionnels.
              </p>
              <div style={{ display: 'flex', gap: '15px' }}>
                <a href="https://facebook.com/crafthub" style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '45px',
                  height: '45px',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderRadius: '50%',
                  color: '#fff',
                  textDecoration: 'none',
                  fontSize: '1.2em',
                  transition: 'all 0.3s ease'
                }} onMouseOver={(e) => {
                  e.target.style.backgroundColor = 'rgba(255,255,255,0.2)';
                  e.target.style.transform = 'translateY(-2px)';
                }} onMouseOut={(e) => {
                  e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                  e.target.style.transform = 'translateY(0)';
                }}>
                  📘
                </a>
                <a href="https://instagram.com/crafthub" style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '45px',
                  height: '45px',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderRadius: '50%',
                  color: '#fff',
                  textDecoration: 'none',
                  fontSize: '1.2em',
                  transition: 'all 0.3s ease'
                }} onMouseOver={(e) => {
                  e.target.style.backgroundColor = 'rgba(255,255,255,0.2)';
                  e.target.style.transform = 'translateY(-2px)';
                }} onMouseOut={(e) => {
                  e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                  e.target.style.transform = 'translateY(0)';
                }}>
                  📷
                </a>
                <a href="https://twitter.com/crafthub" style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '45px',
                  height: '45px',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderRadius: '50%',
                  color: '#fff',
                  textDecoration: 'none',
                  fontSize: '1.2em',
                  transition: 'all 0.3s ease'
                }} onMouseOver={(e) => {
                  e.target.style.backgroundColor = 'rgba(255,255,255,0.2)';
                  e.target.style.transform = 'translateY(-2px)';
                }} onMouseOut={(e) => {
                  e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                  e.target.style.transform = 'translateY(0)';
                }}>
                  🐦
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 style={{
                fontSize: '1.3em',
                fontWeight: '600',
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
                <Link to="/explore" style={{
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
                  🛍️ Explorer les créations
                </Link>
                <Link to="/workshops" style={{
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
                  🎨 Ateliers
                </Link>
                <Link to="/register" style={{
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
                  👤 S'inscrire
                </Link>
                <Link to="/login" style={{
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
                  🔐 Se connecter
                </Link>
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <h4 style={{
                fontSize: '1.3em',
                fontWeight: '600',
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
                  gap: '10px'
                }}>
                  <span style={{ fontSize: '1.2em' }}>📧</span>
                  <a href="mailto:contact@crafthub.com" style={{
                    color: '#fff',
                    textDecoration: 'none',
                    fontSize: '1em',
                    transition: 'color 0.3s ease'
                  }} onMouseOver={(e) => e.target.style.color = '#d4a373'} onMouseOut={(e) => e.target.style.color = '#fff'}>
                    contact@crafthub.com
                  </a>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <span style={{ fontSize: '1.2em' }}>📍</span>
                  <span style={{ fontSize: '1em' }}>Tunis, Tunisie</span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <span style={{ fontSize: '1.2em' }}>🕒</span>
                  <span style={{ fontSize: '1em' }}>Lun - Ven: 9h - 18h</span>
                </div>
              </div>
            </div>

            {/* Newsletter */}
            <div>
              <h4 style={{
                fontSize: '1.3em',
                fontWeight: '600',
                marginBottom: '20px',
                textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
              }}>
                Newsletter
              </h4>
              <p style={{
                fontSize: '1em',
                marginBottom: '20px',
                opacity: 0.9
              }}>
                Restez informé des nouveaux artisans et ateliers !
              </p>
              <div style={{
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap'
              }}>
                <input type="email" placeholder="Votre email" style={{
                  flex: '1',
                  minWidth: '200px',
                  padding: '12px 16px',
                  border: 'none',
                  borderRadius: '25px',
                  fontSize: '1em',
                  outline: 'none',
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  color: '#3a2f1a'
                }} />
                <button style={{
                  padding: '12px 24px',
                  backgroundColor: '#d4a373',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '25px',
                  fontSize: '1em',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  whiteSpace: 'nowrap'
                }} onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#c19a6b';
                  e.target.style.transform = 'translateY(-2px)';
                }} onMouseOut={(e) => {
                  e.target.style.backgroundColor = '#d4a373';
                  e.target.style.transform = 'translateY(0)';
                }}>
                  S'abonner
                </button>
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
        </div>
      </footer>

      {/* ===== CSS Animations ===== */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.03; }
          50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.05; }
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
        
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #8a5a44, #d4a373);
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #704838, #c19a6b);
        }
        
        /* Selection styling */
        ::selection {
          background: rgba(138, 90, 68, 0.2);
          color: #2c3e50;
        }
        
        /* Focus styles for accessibility */
        a:focus, button:focus {
          outline: 2px solid #8a5a44;
          outline-offset: 2px;
        }
        
        /* Responsive text sizing */
        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.5rem !important;
          }
          
          .hero-subtitle {
            font-size: 1.1rem !important;
          }
        }
        
        /* Loading animation for images */
        img {
          transition: opacity 0.3s ease;
        }
        
        img[src=""] {
          opacity: 0;
        }
        
        /* Hover effects for cards */
        .card-hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .card-hover:hover {
          transform: translateY(-8px);
        }
        
        /* Gradient text effect */
        .gradient-text {
          background: linear-gradient(135deg, #8a5a44, #d4a373);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        /* Glass morphism effect */
        .glass {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        /* Shimmer effect for loading states */
        @keyframes shimmer {
          0% { background-position: -200px 0; }
          100% { background-position: calc(200px + 100%) 0; }
        }
        
        .shimmer {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200px 100%;
          animation: shimmer 1.5s infinite;
        }
      `}</style>
    </div>
  );
}

export default About;