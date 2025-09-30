import React from 'react';
import { Link } from 'react-router-dom';
import ArtisanHeader from '../components/ArtisanHeader';
import ArtisanFooter from '../components/ArtisanFooter';

const CATS = [
  {
    title: 'Produits naturels, biologiques & bien-être',
    emoji: '🌿',
    items: [
      'Savons, bougies, huiles essentielles',
      'Cosmétiques naturels (baumes, crèmes, shampoings solides)',
      'Produits d’aromathérapie et relaxation',
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
      'Poupées, peluches cousues main',
      'Kits créatifs (DIY couture, broderie, peinture, mosaïque)',
    ],
  },
  {
    title: 'Mobilier & artisanat utilitaire',
    emoji: '🪵',
    items: [
      'Meubles en bois, métal, bambou',
      'Ustensiles de cuisine (plateaux, cuillères, planches à découper)',
      'Articles de vannerie et maroquinerie',
      'Objets recyclés ou upcyclés',
    ],
  },
  {
    title: 'Arts visuels & artisanat artistique',
    emoji: '🎨',
    items: [
      'Peintures, aquarelles, calligraphies',
      'Gravures, impressions, photographies artistiques',
      'Sculptures (bois, pierre, métal)',
    ],
  },
  {
    title: 'Artisanat culturel & traditionnel',
    emoji: '🎭',
    items: [
      'Tapisseries, broderies traditionnelles',
      'Tenues folkloriques',
      'Instruments de musique artisanaux',
      'Objets symboliques (ex : artisanat berbère, arabe, africain…)',
    ],
  },
];

export default function CategoriesInfo() {
  return (
    <div style={{ fontFamily: '"Georgia", serif', color: '#3a2f1a', minHeight: '100vh', backgroundColor: '#f8f1e9', margin: 0, padding: 0 }}>
      <ArtisanHeader />
      
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
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            padding: '40px',
            borderRadius: '20px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <div style={{ fontSize: '4em', marginBottom: '20px' }}>📚</div>
            <h1 style={{
              fontSize: '3em',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '20px',
              textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
            }}>
              Guide des Catégories
            </h1>
            <p style={{
              fontSize: '1.3em',
              color: '#6b5b47',
              marginBottom: '30px',
              lineHeight: '1.6'
            }}>
              Découvrez les différentes catégories pour classer vos produits artisanaux
            </p>
            <Link
              to="/artisan-home"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '15px 30px',
                background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
                color: '#fff',
                textDecoration: 'none',
                borderRadius: '10px',
                fontSize: '1.1em',
                fontWeight: 600,
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(138, 90, 68, 0.3)'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 25px rgba(138, 90, 68, 0.4)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(138, 90, 68, 0.3)';
              }}
            >
              ← Retour à l'accueil
            </Link>
          </div>
        </div>
      </section>

      {/* ===== Main Content ===== */}
      <section style={{
        maxWidth: '1200px',
        margin: '40px auto',
        padding: '0 30px'
      }}>
        <div style={{
          background: '#fff',
          borderRadius: '20px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          padding: '50px',
          border: '1px solid #e8e8e8'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '40px'
          }}>
            <h2 style={{
              fontSize: '2.2em',
              color: '#8a5a44',
              marginBottom: '15px',
              fontWeight: 600
            }}>
              Choisissez la catégorie appropriée
            </h2>
            <p style={{
              fontSize: '1.1em',
              color: '#6b5b47',
              lineHeight: '1.6',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Parcourez les catégories ci-dessous pour identifier où classer votre produit. 
              Chaque catégorie contient des exemples spécifiques pour vous guider.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '25px'
          }}>
            {CATS.map((category, index) => (
              <div
                key={category.title}
                style={{
                  background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                  borderRadius: '15px',
                  padding: '25px',
                  border: '1px solid #dee2e6',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-5px)';
                  e.target.style.boxShadow = '0 15px 35px rgba(0,0,0,0.1)';
                  e.target.style.borderColor = '#d4a373';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 5px 15px rgba(0,0,0,0.05)';
                  e.target.style.borderColor = '#dee2e6';
                }}
              >
                {/* Decorative corner */}
                <div style={{
                  position: 'absolute',
                  top: '0',
                  right: '0',
                  width: '60px',
                  height: '60px',
                  background: 'linear-gradient(135deg, #d4a373, #8a5a44)',
                  borderRadius: '0 15px 0 60px',
                  opacity: 0.1
                }}></div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '20px'
                }}>
                  <div style={{
                    fontSize: '2.5em',
                    marginRight: '15px',
                    filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.1))'
                  }}>
                    {category.emoji}
                  </div>
                  <h3 style={{
                    margin: 0,
                    color: '#8a5a44',
                    fontSize: '1.3em',
                    fontWeight: 600,
                    lineHeight: '1.3'
                  }}>
                    {category.title}
              </h3>
                </div>
                
                <div style={{
                  paddingLeft: '10px'
                }}>
                  <ul style={{
                    margin: 0,
                    padding: 0,
                    listStyle: 'none'
                  }}>
                    {category.items.map((item, itemIndex) => (
                      <li
                        key={itemIndex}
                        style={{
                          padding: '8px 0',
                          borderBottom: '1px solid rgba(138, 90, 68, 0.1)',
                          color: '#5a4631',
                          fontSize: '0.95em',
                          lineHeight: '1.4',
                          position: 'relative',
                          paddingLeft: '20px'
                        }}
                      >
                        <div style={{
                          position: 'absolute',
                          left: '0',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: '6px',
                          height: '6px',
                          background: 'linear-gradient(135deg, #d4a373, #8a5a44)',
                          borderRadius: '50%'
                        }}></div>
                        {item}
            </li>
          ))}
        </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div style={{
            textAlign: 'center',
            marginTop: '50px',
            padding: '30px',
            background: 'linear-gradient(135deg, #f8f1e9 0%, #e8d5c4 100%)',
            borderRadius: '15px',
            border: '1px solid #d4a373'
          }}>
            <h3 style={{
              color: '#8a5a44',
              fontSize: '1.5em',
              marginBottom: '15px',
              fontWeight: 600
            }}>
              Prêt à ajouter votre produit ?
            </h3>
            <p style={{
              color: '#6b5b47',
              marginBottom: '25px',
              fontSize: '1.1em'
            }}>
              Maintenant que vous connaissez les catégories, créez votre annonce !
            </p>
            <Link
              to="/add-product"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '15px 35px',
                background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
                color: '#fff',
                textDecoration: 'none',
                borderRadius: '10px',
                fontSize: '1.1em',
                fontWeight: 600,
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(138, 90, 68, 0.3)'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 25px rgba(138, 90, 68, 0.4)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(138, 90, 68, 0.3)';
              }}
            >
              ✨ Créer mon annonce
            </Link>
          </div>
        </div>
      </section>

      <ArtisanFooter />
    </div>
  );
}