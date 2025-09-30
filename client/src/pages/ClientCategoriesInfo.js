import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const PRODUCT_CATEGORIES = [
  {
    title: 'Produits naturels, biologiques & bien-être',
    emoji: '🌿',
    description: 'Des produits naturels et biologiques pour votre bien-être quotidien',
    items: [
      'Savons artisanaux, bougies naturelles, huiles essentielles',
      'Cosmétiques naturels (baumes, crèmes, shampoings solides)',
      'Produits d\'aromathérapie et relaxation',
      'Compléments alimentaires naturels',
      'Produits de soin pour bébé'
    ],
    examples: ['Savon à l\'huile d\'olive', 'Bougie parfumée lavande', 'Crème hydratante bio']
  },
  {
    title: 'Maison, décoration & art de vivre',
    emoji: '🏺',
    description: 'Décorez votre intérieur avec des créations uniques et authentiques',
    items: [
      'Poterie, céramique, verrerie artisanale',
      'Textiles décoratifs (tapis, coussins, nappes, macramé)',
      'Tableaux, sculptures, calligraphies',
      'Décorations de fête (Noël, mariage, Ramadan, etc.)',
      'Vases, jardinières, objets de décoration'
    ],
    examples: ['Vase en céramique émaillée', 'Tapis berbère tissé main', 'Tableau calligraphie arabe']
  },
  {
    title: 'Mode, accessoires & bijoux',
    emoji: '👗',
    description: 'Des créations mode uniques pour vous démarquer',
    items: [
      'Vêtements faits main (couture, tricot, crochet)',
      'Bijoux (argent, cuivre, perles, pierres naturelles)',
      'Sacs, ceintures, portefeuilles, chaussures artisanales',
      'Accessoires en cuir, laine ou tissus recyclés',
      'Chapeaux, foulards, écharpes'
    ],
    examples: ['Robe en coton bio', 'Collier en argent et turquoise', 'Sac en cuir tanné naturel']
  },
  {
    title: 'Produits alimentaires artisanaux',
    emoji: '🍯',
    description: 'Des saveurs authentiques et naturelles pour vos papilles',
    items: [
      'Confitures, miel, sirops artisanaux',
      'Fromages, pains, biscuits, chocolats',
      'Huiles, épices, tisanes, cafés, thés',
      'Boissons artisanales (bière, jus naturels, kombucha)',
      'Pâtes, sauces, condiments faits maison'
    ],
    examples: ['Miel de thym de montagne', 'Confiture de figues', 'Pain au levain naturel']
  },
  {
    title: 'Jouets & loisirs créatifs',
    emoji: '🧸',
    description: 'Des jouets éducatifs et des kits créatifs pour petits et grands',
    items: [
      'Jouets en bois, jeux éducatifs',
      'Poupées, peluches cousues main',
      'Kits créatifs (DIY couture, broderie, peinture, mosaïque)',
      'Puzzles, jeux de société artisanaux',
      'Instruments de musique pour enfants'
    ],
    examples: ['Puzzle en bois de 100 pièces', 'Poupée en tissu brodée', 'Kit broderie traditionnelle']
  },
  {
    title: 'Mobilier & artisanat utilitaire',
    emoji: '🪵',
    description: 'Du mobilier et des objets utilitaires faits main',
    items: [
      'Meubles en bois, métal, bambou',
      'Ustensiles de cuisine (plateaux, cuillères, planches à découper)',
      'Articles de vannerie et maroquinerie',
      'Objets recyclés ou upcyclés',
      'Outils et accessoires de jardinage'
    ],
    examples: ['Table en bois massif', 'Planche à découper en olivier', 'Panier en osier']
  },
  {
    title: 'Arts visuels & artisanat artistique',
    emoji: '🎨',
    description: 'Des œuvres d\'art et créations artistiques uniques',
    items: [
      'Peintures, aquarelles, calligraphies',
      'Gravures, impressions, photographies artistiques',
      'Sculptures (bois, pierre, métal)',
      'Céramiques artistiques, poteries décoratives',
      'Mosaïques, vitraux, œuvres mixtes'
    ],
    examples: ['Aquarelle paysage tunisien', 'Sculpture en bois d\'olivier', 'Calligraphie arabe sur papier']
  },
  {
    title: 'Artisanat culturel & traditionnel',
    emoji: '🎭',
    description: 'Des créations qui préservent et célèbrent les traditions',
    items: [
      'Tapisseries, broderies traditionnelles',
      'Tenues folkloriques et costumes traditionnels',
      'Instruments de musique artisanaux',
      'Objets symboliques (artisanat berbère, arabe, africain…)',
      'Céramiques traditionnelles, poteries anciennes'
    ],
    examples: ['Tapis berbère traditionnel', 'Djellaba brodée main', 'Oud en bois de noyer']
  }
];

const WORKSHOP_CATEGORIES = [
  {
    title: 'Menuiserie',
    emoji: '🪵',
    description: 'Apprenez à travailler le bois et créer des objets durables',
    items: [
      'Fabrication de meubles simples',
      'Sculpture sur bois',
      'Marqueterie et incrustation',
      'Restauration de meubles anciens',
      'Outils et techniques de base'
    ],
    examples: ['Table basse en chêne', 'Sculpture d\'animal', 'Boîte à bijoux marquetée']
  },
  {
    title: 'Poterie',
    emoji: '🏺',
    description: 'Découvrez l\'art de la céramique et de la poterie',
    items: [
      'Tournage de poterie',
      'Modelage et sculpture en argile',
      'Techniques d\'émaillage',
      'Cuisson et finitions',
      'Création de vaisselle artisanale'
    ],
    examples: ['Bols en céramique émaillée', 'Vase modelé à la main', 'Assiettes décoratives']
  },
  {
    title: 'Bijouterie',
    emoji: '💎',
    description: 'Créez des bijoux uniques en métal et pierres précieuses',
    items: [
      'Travail de l\'argent et du cuivre',
      'Sertissage de pierres',
      'Techniques de soudure',
      'Finitions et polissage',
      'Design et création de modèles'
    ],
    examples: ['Bague en argent et turquoise', 'Collier de perles', 'Boucles d\'oreilles en cuivre']
  },
  {
    title: 'Peinture',
    emoji: '🎨',
    description: 'Explorez différentes techniques picturales et styles',
    items: [
      'Peinture à l\'huile et acrylique',
      'Aquarelle et techniques mixtes',
      'Calligraphie et enluminure',
      'Peinture sur différents supports',
      'Histoire de l\'art et styles'
    ],
    examples: ['Portrait à l\'huile', 'Paysage à l\'aquarelle', 'Calligraphie arabe décorative']
  },
  {
    title: 'Sculpture',
    emoji: '🗿',
    description: 'Donnez forme à vos idées avec la sculpture',
    items: [
      'Sculpture sur pierre et marbre',
      'Modelage en terre et plâtre',
      'Sculpture sur bois',
      'Techniques de moulage',
      'Finitions et patines'
    ],
    examples: ['Buste en marbre', 'Sculpture abstraite en bois', 'Figurine en terre cuite']
  },
  {
    title: 'Textiles',
    emoji: '🧵',
    description: 'Maîtrisez l\'art du textile et de la couture',
    items: [
      'Couture et confection',
      'Broderie traditionnelle et moderne',
      'Tissage et tricot',
      'Teinture naturelle des tissus',
      'Création de motifs et designs'
    ],
    examples: ['Robe brodée traditionnelle', 'Tapis tissé main', 'Écharpe tricotée']
  },
  {
    title: 'Maroquinerie',
    emoji: '👜',
    description: 'Apprenez à travailler le cuir et créer des accessoires',
    items: [
      'Travail du cuir et techniques de base',
      'Couture et assemblage',
      'Finitions et teinture du cuir',
      'Création de sacs et accessoires',
      'Restauration d\'objets en cuir'
    ],
    examples: ['Sac en cuir tanné végétal', 'Portefeuille en cuir', 'Ceinture artisanale']
  },
  {
    title: 'Métallurgie',
    emoji: '⚒️',
    description: 'Découvrez l\'art de travailler les métaux',
    items: [
      'Forge et travail du fer',
      'Soudure et assemblage',
      'Finitions et patines',
      'Création d\'outils et objets',
      'Techniques de sécurité'
    ],
    examples: ['Couteau forgé à la main', 'Lanterne en fer forgé', 'Outils de jardinage']
  },
  {
    title: 'Verrerie',
    emoji: '🪟',
    description: 'Explorez l\'art du verre et ses techniques',
    items: [
      'Soufflage de verre',
      'Vitrail et techniques de coupe',
      'Fusing et thermoformage',
      'Gravure sur verre',
      'Création d\'objets décoratifs'
    ],
    examples: ['Vase en verre soufflé', 'Vitrail décoratif', 'Bougeoir en verre fusionné']
  },
  {
    title: 'Céramique',
    emoji: '🍶',
    description: 'Maîtrisez l\'art de la céramique et de la faïence',
    items: [
      'Techniques de modelage',
      'Émaillage et décoration',
      'Cuisson et fours',
      'Création de vaisselle',
      'Céramique artistique'
    ],
    examples: ['Service de vaisselle émaillée', 'Pot décoratif', 'Tasse artisanale']
  },
  {
    title: 'Vannerie',
    emoji: '🧺',
    description: 'Apprenez l\'art ancestral de la vannerie',
    items: [
      'Techniques de tressage',
      'Choix des matériaux naturels',
      'Création de paniers et corbeilles',
      'Finitions et entretien',
      'Design et formes traditionnelles'
    ],
    examples: ['Panier en osier', 'Corbeille à fruits', 'Sac en rotin']
  },
  {
    title: 'Bougies',
    emoji: '🕯️',
    description: 'Créez des bougies artisanales parfumées',
    items: [
      'Techniques de fonte de cire',
      'Création de parfums',
      'Moulage et façonnage',
      'Décoration et finitions',
      'Sécurité et conservation'
    ],
    examples: ['Bougie parfumée à la lavande', 'Bougie décorative colorée', 'Bougie en cire d\'abeille']
  },
  {
    title: 'Savonnerie',
    emoji: '🧼',
    description: 'Apprenez à fabriquer des savons naturels',
    items: [
      'Techniques de saponification',
      'Choix des huiles et ingrédients',
      'Création de parfums naturels',
      'Moulage et décoration',
      'Sécurité et conservation'
    ],
    examples: ['Savon à l\'huile d\'olive', 'Savon exfoliant au sel', 'Savon parfumé à la rose']
  },
  {
    title: 'Cuisine',
    emoji: '👨‍🍳',
    description: 'Découvrez les secrets de la cuisine artisanale',
    items: [
      'Techniques de base en cuisine',
      'Préparation de conserves',
      'Pâtisserie artisanale',
      'Cuisine traditionnelle',
      'Présentation et service'
    ],
    examples: ['Confiture de figues', 'Pain au levain', 'Pâtisseries orientales']
  },
  {
    title: 'Jardinage',
    emoji: '🌱',
    description: 'Apprenez l\'art du jardinage et de la culture',
    items: [
      'Techniques de jardinage biologique',
      'Cultivation d\'herbes aromatiques',
      'Compostage et fertilisation',
      'Aménagement paysager',
      'Conservation des récoltes'
    ],
    examples: ['Jardin d\'herbes aromatiques', 'Potager bio', 'Aménagement de balcon']
  }
];

export default function ClientCategoriesInfo() {
  const [activeTab, setActiveTab] = useState('products');

  return (
    <div style={{ 
      fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif', 
      color: '#3a2f1a', 
      minHeight: '100vh', 
      backgroundColor: '#f8f1e9', 
      margin: 0, 
      padding: 0 
    }}>
      {/* ===== Modern Header ===== */}
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
          <Link to="/client-home" style={{
            fontSize: '2.2em',
            fontWeight: 700,
            color: '#fff',
            textDecoration: 'none',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            transition: 'transform 0.3s ease'
          }} onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'} onMouseOut={(e) => e.target.style.transform = 'scale(1)'}>
            CraftHub
          </Link>
          <Link to="/client-home" style={{
            color: '#fff',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '1.1em',
            padding: '10px 20px',
            borderRadius: '25px',
            transition: 'all 0.3s ease',
            background: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.3)'
          }} onMouseOver={(e) => {
            e.target.style.background = 'rgba(255,255,255,0.3)';
            e.target.style.transform = 'translateY(-2px)';
          }} onMouseOut={(e) => {
            e.target.style.background = 'rgba(255,255,255,0.2)';
            e.target.style.transform = 'translateY(0)';
          }}>
            ← Retour à l'exploration
          </Link>
        </div>
      </header>

      {/* ===== Hero Section ===== */}
      <section style={{
        background: 'linear-gradient(135deg, #8a5a44 0%, #d4a373 50%, #f8f1e9 100%)',
        padding: '80px 0',
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
          padding: '0 30px',
          textAlign: 'center',
          position: 'relative',
          zIndex: 2
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            padding: '50px 40px',
            borderRadius: '25px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            border: '1px solid rgba(255,255,255,0.3)'
          }}>
            <div style={{ fontSize: '4em', marginBottom: '20px' }}>📚</div>
            <h1 style={{
              fontSize: '3.2em',
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
              lineHeight: '1.6',
              maxWidth: '700px',
              margin: '0 auto 30px'
            }}>
              Découvrez toutes les catégories de produits et d'ateliers disponibles sur CraftHub. 
              Trouvez exactement ce que vous cherchez !
            </p>
          </div>
        </div>
      </section>

      {/* ===== Tab Navigation ===== */}
      <div style={{
        maxWidth: '1200px',
        margin: '40px auto 0',
        padding: '0 30px'
      }}>
        <div style={{
          background: '#fff',
          padding: '0',
          borderRadius: '20px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          border: '1px solid rgba(138, 90, 68, 0.1)',
          overflow: 'hidden'
        }}>
          <div style={{
            display: 'flex',
            background: 'linear-gradient(135deg, #f8f1e9, #fff)',
            borderBottom: '1px solid rgba(138, 90, 68, 0.1)'
          }}>
            <button
              onClick={() => setActiveTab('products')}
              style={{
                background: activeTab === 'products' ? 'linear-gradient(45deg, #d4a373, #c78c5d)' : 'transparent',
                border: 'none',
                fontSize: '1.2em',
                fontWeight: activeTab === 'products' ? 700 : 600,
                color: activeTab === 'products' ? '#fff' : '#8a5a44',
                padding: '25px 50px',
                cursor: 'pointer',
                borderRadius: '0',
                transition: 'all 0.3s ease',
                flex: 1,
                position: 'relative',
                textShadow: activeTab === 'products' ? '1px 1px 2px rgba(0,0,0,0.2)' : 'none'
              }}
              onMouseOver={(e) => {
                if (activeTab !== 'products') {
                  e.currentTarget.style.backgroundColor = 'rgba(212, 163, 115, 0.1)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseOut={(e) => {
                if (activeTab !== 'products') {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              🛍️ Produits ({PRODUCT_CATEGORIES.length} catégories)
            </button>

            <button
              onClick={() => setActiveTab('workshops')}
              style={{
                background: activeTab === 'workshops' ? 'linear-gradient(45deg, #d4a373, #c78c5d)' : 'transparent',
                border: 'none',
                fontSize: '1.2em',
                fontWeight: activeTab === 'workshops' ? 700 : 600,
                color: activeTab === 'workshops' ? '#fff' : '#8a5a44',
                padding: '25px 50px',
                cursor: 'pointer',
                borderRadius: '0',
                transition: 'all 0.3s ease',
                flex: 1,
                position: 'relative',
                textShadow: activeTab === 'workshops' ? '1px 1px 2px rgba(0,0,0,0.2)' : 'none'
              }}
              onMouseOver={(e) => {
                if (activeTab !== 'workshops') {
                  e.currentTarget.style.backgroundColor = 'rgba(212, 163, 115, 0.1)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseOut={(e) => {
                if (activeTab !== 'workshops') {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              🛠️ Ateliers ({WORKSHOP_CATEGORIES.length} catégories)
            </button>
          </div>
        </div>
      </div>

      {/* ===== Content Area ===== */}
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
            marginBottom: '50px'
          }}>
            <h2 style={{
              fontSize: '2.5em',
              color: '#8a5a44',
              marginBottom: '20px',
              fontWeight: 700
            }}>
              {activeTab === 'products' ? 'Catégories de Produits' : 'Catégories d\'Ateliers'}
            </h2>
            <p style={{
              fontSize: '1.2em',
              color: '#6b5b47',
              lineHeight: '1.6',
              maxWidth: '700px',
              margin: '0 auto'
            }}>
              {activeTab === 'products' 
                ? 'Explorez nos différentes catégories de produits artisanaux. Chaque catégorie contient des exemples concrets pour vous aider à trouver ce que vous cherchez.'
                : 'Découvrez nos ateliers créatifs par catégorie. Apprenez de nouvelles techniques et créez vos propres œuvres d\'art !'
              }
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '30px'
          }}>
            {(activeTab === 'products' ? PRODUCT_CATEGORIES : WORKSHOP_CATEGORIES).map((category, index) => (
              <div
                key={category.title}
                style={{
                  background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                  borderRadius: '20px',
                  padding: '30px',
                  border: '1px solid #dee2e6',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-8px)';
                  e.target.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
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
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(135deg, #d4a373, #8a5a44)',
                  borderRadius: '0 20px 0 80px',
                  opacity: 0.1
                }}></div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '20px'
                }}>
                  <div style={{
                    fontSize: '3em',
                    marginRight: '20px',
                    filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.1))'
                  }}>
                    {category.emoji}
                  </div>
                  <div>
                    <h3 style={{
                      margin: '0 0 8px 0',
                      color: '#8a5a44',
                      fontSize: '1.4em',
                      fontWeight: 700,
                      lineHeight: '1.3'
                    }}>
                      {category.title}
                    </h3>
                    <p style={{
                      margin: 0,
                      color: '#6b5b47',
                      fontSize: '1em',
                      lineHeight: '1.4',
                      fontStyle: 'italic'
                    }}>
                      {category.description}
                    </p>
                  </div>
                </div>
                
                <div style={{
                  marginBottom: '20px'
                }}>
                  <h4 style={{
                    color: '#8a5a44',
                    fontSize: '1.1em',
                    fontWeight: 600,
                    marginBottom: '10px'
                  }}>
                    Types d'articles :
                  </h4>
                  <ul style={{
                    margin: 0,
                    padding: 0,
                    listStyle: 'none'
                  }}>
                    {category.items.map((item, itemIndex) => (
                      <li
                        key={itemIndex}
                        style={{
                          padding: '6px 0',
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

                <div style={{
                  background: 'rgba(212, 163, 115, 0.1)',
                  padding: '15px',
                  borderRadius: '10px',
                  border: '1px solid rgba(212, 163, 115, 0.2)'
                }}>
                  <h4 style={{
                    color: '#8a5a44',
                    fontSize: '1em',
                    fontWeight: 600,
                    marginBottom: '8px'
                  }}>
                    Exemples concrets :
                  </h4>
                  <p style={{
                    margin: 0,
                    color: '#6b5b47',
                    fontSize: '0.9em',
                    lineHeight: '1.4'
                  }}>
                    {category.examples.join(' • ')}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div style={{
            textAlign: 'center',
            marginTop: '60px',
            padding: '40px',
            background: 'linear-gradient(135deg, #f8f1e9 0%, #e8d5c4 100%)',
            borderRadius: '20px',
            border: '1px solid #d4a373'
          }}>
            <h3 style={{
              color: '#8a5a44',
              fontSize: '1.8em',
              marginBottom: '20px',
              fontWeight: 700
            }}>
              Prêt à explorer ?
            </h3>
            <p style={{
              color: '#6b5b47',
              marginBottom: '30px',
              fontSize: '1.2em',
              lineHeight: '1.6'
            }}>
              Maintenant que vous connaissez nos catégories, découvrez nos produits et ateliers !
            </p>
            <Link
              to="/client-home"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                padding: '18px 40px',
                background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
                color: '#fff',
                textDecoration: 'none',
                borderRadius: '15px',
                fontSize: '1.2em',
                fontWeight: 700,
                transition: 'all 0.3s ease',
                boxShadow: '0 6px 20px rgba(138, 90, 68, 0.3)'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-3px)';
                e.target.style.boxShadow = '0 10px 30px rgba(138, 90, 68, 0.4)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 6px 20px rgba(138, 90, 68, 0.3)';
              }}
            >
              🚀 Commencer l'exploration
            </Link>
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
          textAlign: 'center'
        }}>
          <h3 style={{
            fontSize: '2em',
            fontWeight: 700,
            marginBottom: '20px',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}>
            CraftHub
          </h3>
          <p style={{
            fontSize: '1.2em',
            lineHeight: '1.6',
            marginBottom: '30px',
            opacity: 0.9,
            maxWidth: '600px',
            margin: '0 auto 30px'
          }}>
            Votre plateforme de confiance pour découvrir et acheter des produits artisanaux authentiques. 
            Connectons les artisans talentueux avec des clients passionnés.
          </p>
          
          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.2)',
            marginTop: '40px',
            paddingTop: '20px'
          }}>
            <p style={{
              fontSize: '1em',
              opacity: 0.8,
              margin: 0
            }}>
              © 2025 CraftHub. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>

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
        `}
      </style>
    </div>
  );
}
