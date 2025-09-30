import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { addProduct, checkSubscriptionStatus } from '../services/api';
import { generateRAG } from '../services/ai';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ArtisanHeader from '../components/ArtisanHeader';
import ArtisanFooter from '../components/ArtisanFooter';

function AddProduct() {
  const [product, setProduct] = useState({
    name: '',
    price: 0,
    category: '',
    description: '',
    stock: 0,
    material: '',
    size: '',
    images: [],
  });
  const [error, setError] = useState('');
  const [estimatedPrice, setEstimatedPrice] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [imageUrls, setImageUrls] = useState([null, null, null]);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(true);
  
  // États pour la génération SEO
  const [seoKeywords, setSeoKeywords] = useState('');
  const [isGeneratingSeo, setIsGeneratingSeo] = useState(false);
  const [seoError, setSeoError] = useState('');
  const [generatedDescription, setGeneratedDescription] = useState('');
  const [showSeoPreview, setShowSeoPreview] = useState(false);
  
  const navigate = useNavigate();

  // Vérifier le statut d'abonnement au chargement
  useEffect(() => {
    const checkSubscription = async () => {
      try {
        setIsCheckingSubscription(true);
        const response = await checkSubscriptionStatus();
        setSubscriptionStatus(response.data);
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'abonnement:', error);
        setError('Erreur lors de la vérification de votre abonnement');
      } finally {
        setIsCheckingSubscription(false);
      }
    };

    checkSubscription();
  }, []);

  // Estimation de prix
// Estimation de prix (debounce + abort + meilleurs messages)
// Estimation de prix avec notification de chargement
useEffect(() => {
  const controller = new AbortController();

  const name = product?.name?.trim() || '';
  const canEstimate = name.length >= 3; // au moins 3 caractères pour éviter le bruit
  
  if (!canEstimate) {
    setIsAnalyzing(false);
    setEstimatedPrice(null);
    return;
  }

  // Afficher la notification de chargement
  setIsAnalyzing(true);
  toast.info('🔍 Analyse du marché en cours... Recherche de produits similaires', {
    position: "top-right",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });

  const t = setTimeout(async () => {
    try {
      const body = { name };
      console.log('[estimate] sending body:', body);

      const res = await fetch('http://localhost:5005/estimate-price-from-scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify(body),
      });

      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        console.error('Estimation error:', res.status, payload);
        setError(
          payload?.error
            ? `${payload.error} — reçu: ${JSON.stringify(payload.received || {})}`
            : `Erreur d'estimation (HTTP ${res.status})`
        );
        setIsAnalyzing(false);
        toast.error('❌ Erreur lors de l\'analyse du marché', {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      if (payload?.estimated_price != null) {
        setEstimatedPrice(payload.estimated_price);
        setProduct(prev => ({ ...prev, price: payload.estimated_price }));
        setIsAnalyzing(false);
        
        // Notification de succès avec le prix trouvé
        toast.success(`💰 Prix suggéré trouvé : ${payload.estimated_price.toFixed(2)} €`, {
          position: "top-right",
          autoClose: 4000,
        });
      } else {
        setEstimatedPrice(null);
        setIsAnalyzing(false);
        console.log('Aucun prix fiable trouvé (message):', payload?.message);
        toast.warning('⚠️ Aucun produit similaire trouvé sur le marché', {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (e) {
      if (e.name === 'AbortError') return;
      console.error('Fetch estimation failed:', e);
      setError('Échec de l\'estimation (réseau).');
      setIsAnalyzing(false);
      toast.error('❌ Erreur de connexion lors de l\'analyse', {
        position: "top-right",
        autoClose: 3000,
      });
    }
  }, 800); // Augmenté à 800ms pour laisser le temps de voir la notification

  return () => {
    controller.abort();
    clearTimeout(t);
  };
}, [product.name]);

  // Nettoyage des URLs d'objets
  useEffect(() => {
    return () => {
      imageUrls.forEach(url => {
        if (url) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [imageUrls]);

  // Vérification des images avant soumission
  const validateImages = async () => {
    const formData = new FormData();
    product.images.forEach((image, index) => {
      if (image) formData.append('images', image);
    });

    try {
      const response = await fetch('http://localhost:5007/analyze-image', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error); // Pop-up pour erreur d'image floue
        return false;
      }
      toast.success('Images validées avec succès !'); // Pop-up de succès
      return true;
    } catch (err) {
      toast.error('Erreur lors de l’analyse des images.');
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Product data before submit:", product);

    // Vérifier l'abonnement avant de permettre l'ajout
    if (!subscriptionStatus?.hasActiveSubscription) {
      toast.error('Vous devez avoir un abonnement actif pour ajouter des produits !');
      return;
    }

    // Vérifie les images avant soumission
    const imagesValid = await validateImages();
    if (!imagesValid) return;

    const formData = new FormData();
    formData.append('name', product.name);
    formData.append('price', product.price);
    formData.append('category', product.category);
    formData.append('description', product.description);
    formData.append('stock', product.stock);
    formData.append('material', product.material);
    formData.append('size', product.size);
    product.images.forEach((image) => {
      if (image) formData.append('images', image);
    });

    try {
      await addProduct(formData);
      toast.success('Produit ajouté avec succès !'); // Pop-up de succès
      navigate('/Profile');
    } catch (err) {
      toast.error('Erreur lors de l\'ajout du produit. Vérifiez vos informations.');
      console.error('Error response:', err.response ? err.response.data : err);
    }
  };

  const handleImageChange = (e, index) => {
    const file = e.target.files[0];
    const newImages = [...product.images];
    newImages[index] = file;
    setProduct({ ...product, images: newImages });

    // Créer l'URL pour l'aperçu
    if (file) {
      const newImageUrls = [...imageUrls];
      newImageUrls[index] = URL.createObjectURL(file);
      setImageUrls(newImageUrls);
    } else {
      const newImageUrls = [...imageUrls];
      newImageUrls[index] = null;
      setImageUrls(newImageUrls);
    }
  };

  // Fonction pour générer la description SEO
  const handleGenerateSeo = async () => {
    if (!seoKeywords.trim()) {
      toast.error('Veuillez saisir des mots-clés');
      return;
    }

    const keywords = seoKeywords.trim().split(',').map(k => k.trim()).filter(k => k);
    if (keywords.length < 3 || keywords.length > 5) {
      toast.error('Veuillez saisir entre 3 et 5 mots-clés séparés par des virgules');
      return;
    }

    setIsGeneratingSeo(true);
    setSeoError('');
    setShowSeoPreview(false);

    try {
      const contexteProduitMinimal = {
        nom: product.name || 'Produit artisanal',
        categorie: product.category || 'Artisanat',
        prix: product.price || 0
      };

      const result = await generateRAG({ keywords, contexteProduitMinimal });
      
      if (result.descriptionHtml) {
        setGeneratedDescription(result.descriptionHtml);
        setShowSeoPreview(true);
        toast.success('Description SEO générée avec succès !');
      } else {
        throw new Error('Aucune description générée');
      }
    } catch (error) {
      console.error('Erreur génération SEO:', error);
      setSeoError(error.message || 'Erreur lors de la génération');
      toast.error('Erreur lors de la génération de la description SEO');
    } finally {
      setIsGeneratingSeo(false);
    }
  };

  // Fonction pour insérer la description générée
  const handleInsertSeoDescription = () => {
    // Convertir le HTML en texte formaté pour le textarea
    const textDescription = generatedDescription
      .replace(/<h[1-6][^>]*>/g, '\n\n') // Remplacer les titres par des sauts de ligne
      .replace(/<\/h[1-6]>/g, '') // Supprimer les balises fermantes des titres
      .replace(/<p[^>]*>/g, '') // Supprimer les balises <p>
      .replace(/<\/p>/g, '\n\n') // Remplacer </p> par des sauts de ligne
      .replace(/<ul[^>]*>/g, '') // Supprimer <ul>
      .replace(/<\/ul>/g, '') // Supprimer </ul>
      .replace(/<li[^>]*>/g, '• ') // Remplacer <li> par des puces
      .replace(/<\/li>/g, '\n') // Remplacer </li> par des sauts de ligne
      .replace(/<strong[^>]*>/g, '**') // Remplacer <strong> par **
      .replace(/<\/strong>/g, '**') // Remplacer </strong> par **
      .replace(/<em[^>]*>/g, '*') // Remplacer <em> par *
      .replace(/<\/em>/g, '*') // Remplacer </em> par *
      .replace(/<br\s*\/?>/g, '\n') // Remplacer <br> par des sauts de ligne
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Nettoyer les sauts de ligne multiples
      .trim();
    
    setProduct({ ...product, description: textDescription });
    setShowSeoPreview(false);
    setSeoKeywords('');
    setGeneratedDescription('');
    toast.success('Description insérée avec succès !');
  };

 const categories = [
  { value: 'Produits naturels, biologiques & bien-être', label: '🌿 Nature & Bien-être & Bio' },
  { value: 'Maison, décoration & art de vivre', label: '🏠 Maison & Décoration & art de vivre' },
  { value: 'Mode, accessoires & bijoux', label: '💎 Mode & Bijoux' },
  { value: 'Produits alimentaires artisanaux', label: '🍯 Alimentaire Artisanal' },
  { value: 'Jouets & loisirs créatifs', label: '🎨 Jouets & Créatif' },
  { value: 'Mobilier & artisanat utilitaire', label: '🪑 Mobilier & Utilitaire' },
  { value: 'Arts visuels & artisanat artistique', label: '🎭 Arts Visuels & artisanat artistique' },
  { value: 'Artisanat culturel & traditionnel', label: '🏛️ Culturel & Traditionnel' }
];

  // Écran de chargement pendant la vérification de l'abonnement
  if (isCheckingSubscription) {
    return (
      <div style={{ fontFamily: '"Georgia", serif', color: '#3a2f1a', minHeight: '100vh', backgroundColor: '#f8f1e9', margin: 0, padding: 0 }}>
        <ArtisanHeader />
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
          flexDirection: 'column'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #8a5a44',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ marginTop: '20px', fontSize: '1.1em', color: '#8a5a44' }}>
            Vérification de votre abonnement...
          </p>
        </div>
        <ArtisanFooter />
      </div>
    );
  }

  // Écran d'erreur si pas d'abonnement actif
  if (subscriptionStatus && !subscriptionStatus.hasActiveSubscription) {
    return (
      <div style={{ fontFamily: '"Georgia", serif', color: '#3a2f1a', minHeight: '100vh', backgroundColor: '#f8f1e9', margin: 0, padding: 0 }}>
        <ArtisanHeader />
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
          flexDirection: 'column',
          padding: '40px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
            color: '#fff',
            padding: '40px',
            borderRadius: '20px',
            textAlign: 'center',
            maxWidth: '600px',
            boxShadow: '0 10px 30px rgba(220, 38, 38, 0.3)'
          }}>
            <div style={{ fontSize: '4em', marginBottom: '20px' }}>🔒</div>
            <h2 style={{ fontSize: '2em', marginBottom: '20px', fontWeight: '700' }}>
              Abonnement Requis
            </h2>
            <p style={{ fontSize: '1.2em', marginBottom: '30px', lineHeight: '1.6' }}>
              {subscriptionStatus.message || 'Vous devez avoir un abonnement actif pour ajouter des produits à votre boutique.'}
            </p>
            <div style={{ marginBottom: '30px' }}>
              <Link 
                to="/subscription" 
                style={{
                  background: 'linear-gradient(45deg, #8a5a44, #704838)',
                  color: '#fff',
                  padding: '15px 30px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  fontSize: '1.1em',
                  fontWeight: '600',
                  display: 'inline-block',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(138, 90, 68, 0.3)'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(138, 90, 68, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(138, 90, 68, 0.3)';
                }}
              >
                💳 S'abonner maintenant
              </Link>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <Link 
                to="/artisan-profile" 
                style={{
                  color: '#fff',
                  textDecoration: 'none',
                  fontSize: '1em',
                  opacity: 0.8
                }}
              >
                ← Retour au profil
              </Link>
            </div>
          </div>
        </div>
        <ArtisanFooter />
      </div>
    );
  }

  return (
    <div style={{ fontFamily: '"Georgia", serif', color: '#3a2f1a', minHeight: '100vh', backgroundColor: '#f8f1e9', margin: 0, padding: 0 }}>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
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
            <div style={{ fontSize: '4em', marginBottom: '20px' }}>✨</div>
            <h1 style={{
              fontSize: '3em',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '20px',
              textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
            }}>
              Créer un Nouveau Produit
            </h1>
            <p style={{
              fontSize: '1.3em',
              color: '#6b5b47',
              marginBottom: '30px',
              lineHeight: '1.6'
            }}>
              Partagez votre savoir-faire artisanal avec le monde
            </p>
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
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '30px' }} encType="multipart/form-data">
            
            {/* ===== Informations de Base ===== */}
            <div style={{
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              padding: '30px',
              borderRadius: '15px',
              border: '1px solid #dee2e6'
            }}>
              <h3 style={{
                fontSize: '1.5em',
                color: '#8a5a44',
                marginBottom: '25px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                📝 Informations de Base
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px' }}>
                {/* Nom du Produit */}
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: 600,
                    color: '#3a2f1a',
                    fontSize: '1.1em'
                  }}>
                    Nom du Produit *
                  </label>
                  <input
                    type="text"
                    value={product.name}
                    onChange={(e) => setProduct({ ...product, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '15px',
                      border: '2px solid #e9ecef',
                      borderRadius: '10px',
                      fontSize: '1em',
                      transition: 'all 0.3s ease',
                      backgroundColor: '#fff'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#8a5a44';
                      e.target.style.boxShadow = '0 0 0 3px rgba(138, 90, 68, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e9ecef';
                      e.target.style.boxShadow = 'none';
                    }}
                    placeholder="Entrez le nom de votre produit"
                    required
                  />
                </div>

                {/* Prix */}
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: 600,
                    color: '#3a2f1a',
                    fontSize: '1.1em'
                  }}>
                    Prix (€) *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="number"
                      value={product.price}
                      onChange={(e) => setProduct({ ...product, price: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '15px',
                        border: isAnalyzing ? '2px solid #ffc107' : '2px solid #e9ecef',
                        borderRadius: '10px',
                        fontSize: '1em',
                        transition: 'all 0.3s ease',
                        backgroundColor: isAnalyzing ? '#fff3cd' : '#fff',
                        paddingRight: isAnalyzing ? '50px' : '15px'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#8a5a44';
                        e.target.style.boxShadow = '0 0 0 3px rgba(138, 90, 68, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = isAnalyzing ? '#ffc107' : '#e9ecef';
                        e.target.style.boxShadow = 'none';
                      }}
                      min="0"
                      step="0.01"
                      placeholder={isAnalyzing ? "Analyse en cours..." : "0.00"}
                      required
                    />
                    {isAnalyzing && (
                      <div style={{
                        position: 'absolute',
                        right: '15px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}>
                        <div style={{
                          width: '16px',
                          height: '16px',
                          border: '2px solid #ffc107',
                          borderTop: '2px solid transparent',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite'
                        }}></div>
                        <span style={{
                          fontSize: '0.8em',
                          color: '#856404',
                          fontWeight: 600
                        }}>Analyse...</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Messages d'état */}
                  {isAnalyzing && (
                    <div style={{
                      marginTop: '8px',
                      padding: '8px 12px',
                      background: 'linear-gradient(135deg, #fff3cd, #ffeaa7)',
                      borderRadius: '8px',
                      color: '#856404',
                      fontSize: '0.9em',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      🔍 Recherche de produits similaires sur le marché...
                    </div>
                  )}
                  
                  {estimatedPrice && !isAnalyzing && (
                    <div style={{
                      marginTop: '8px',
                      padding: '8px 12px',
                      background: 'linear-gradient(135deg, #d4edda, #c3e6cb)',
                      borderRadius: '8px',
                      color: '#155724',
                      fontSize: '0.9em',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      💰 Prix suggéré basé sur le marché : {estimatedPrice.toFixed(2)} €
                    </div>
                  )}
                </div>

                {/* Catégorie */}
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: 600,
                    color: '#3a2f1a',
                    fontSize: '1.1em'
                  }}>
                    Catégorie *
                  </label>
                  <select
                    value={product.category}
                    onChange={(e) => setProduct({ ...product, category: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '15px',
                      border: '2px solid #e9ecef',
                      borderRadius: '10px',
                      fontSize: '1em',
                      transition: 'all 0.3s ease',
                      backgroundColor: '#fff',
                      cursor: 'pointer'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#8a5a44';
                      e.target.style.boxShadow = '0 0 0 3px rgba(138, 90, 68, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e9ecef';
                      e.target.style.boxShadow = 'none';
                    }}
                    required
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                  <div style={{ marginTop: '8px' }}>
                    <Link
                      to="/categories-info"
                      style={{ 
                        color: '#8a5a44', 
                        textDecoration: 'underline', 
                        fontSize: '0.9em',
                        fontWeight: 500
                      }}
                    >
                      📚 En savoir plus sur les catégories
                    </Link>
                  </div>
                </div>

                {/* Stock */}
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: 600,
                    color: '#3a2f1a',
                    fontSize: '1.1em'
                  }}>
                    Stock Disponible *
                  </label>
                  <input
                    type="number"
                    value={product.stock}
                    onChange={(e) => setProduct({ ...product, stock: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '15px',
                      border: '2px solid #e9ecef',
                      borderRadius: '10px',
                      fontSize: '1em',
                      transition: 'all 0.3s ease',
                      backgroundColor: '#fff'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#8a5a44';
                      e.target.style.boxShadow = '0 0 0 3px rgba(138, 90, 68, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e9ecef';
                      e.target.style.boxShadow = 'none';
                    }}
                    min="0"
                    placeholder="0"
                    required
                  />
                </div>
              </div>
            </div>

            {/* ===== Description ===== */}
            <div style={{
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              padding: '30px',
              borderRadius: '15px',
              border: '1px solid #dee2e6'
            }}>
              <h3 style={{
                fontSize: '1.5em',
                color: '#8a5a44',
                marginBottom: '25px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                📝 Description Détaillée
              </h3>
              
              {/* Interface SEO */}
              <div style={{
                background: '#fff',
                padding: '20px',
                borderRadius: '10px',
                border: '1px solid #e9ecef',
                marginBottom: '20px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  marginBottom: '15px',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ flex: '1', minWidth: '200px' }}>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '5px', 
                      fontWeight: 600,
                      color: '#3a2f1a',
                      fontSize: '0.9em'
                    }}>
                      Mots-clés SEO (3-5 mots séparés par des virgules)
                    </label>
                    <input
                      type="text"
                      value={seoKeywords}
                      onChange={(e) => setSeoKeywords(e.target.value)}
                      placeholder="Ex: artisanat, fait main, écologique, unique, qualité"
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '2px solid #e9ecef',
                        borderRadius: '8px',
                        fontSize: '0.9em',
                        transition: 'all 0.3s ease',
                        backgroundColor: '#fff'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#8a5a44';
                        e.target.style.boxShadow = '0 0 0 2px rgba(138, 90, 68, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e9ecef';
                        e.target.style.boxShadow = 'none';
                      }}
                      disabled={isGeneratingSeo}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateSeo}
                    disabled={isGeneratingSeo || !seoKeywords.trim()}
                    style={{
                      padding: '10px 20px',
                      background: isGeneratingSeo ? '#6c757d' : 'linear-gradient(135deg, #8a5a44, #d4a373)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.9em',
                      fontWeight: 600,
                      cursor: isGeneratingSeo ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      opacity: isGeneratingSeo || !seoKeywords.trim() ? 0.6 : 1
                    }}
                  >
                    {isGeneratingSeo ? (
                      <>
                        <div style={{
                          width: '12px',
                          height: '12px',
                          border: '2px solid #fff',
                          borderTop: '2px solid transparent',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite'
                        }}></div>
                        Génération...
                      </>
                    ) : (
                      <>
                        🤖 Générer (SEO IA)
                      </>
                    )}
                  </button>
                </div>

                {/* Messages d'erreur SEO */}
                {seoError && (
                  <div style={{
                    padding: '10px',
                    background: 'linear-gradient(135deg, #f8d7da, #f5c6cb)',
                    borderRadius: '8px',
                    color: '#721c24',
                    fontSize: '0.9em',
                    marginBottom: '10px',
                    border: '1px solid #f5c6cb'
                  }}>
                    ❌ {seoError}
                  </div>
                )}

                {/* Aperçu de la description générée */}
                {showSeoPreview && generatedDescription && (
                  <div style={{
                    background: 'linear-gradient(135deg, #d4edda, #c3e6cb)',
                    padding: '15px',
                    borderRadius: '8px',
                    border: '1px solid #c3e6cb',
                    marginBottom: '15px'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '10px'
                    }}>
                      <h4 style={{
                        color: '#155724',
                        fontSize: '1em',
                        fontWeight: 600,
                        margin: 0
                      }}>
                        ✨ Aperçu de la description générée :
                      </h4>
                      <button
                        type="button"
                        onClick={() => setShowSeoPreview(false)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#155724',
                          fontSize: '1.2em',
                          cursor: 'pointer',
                          padding: '0',
                          lineHeight: 1
                        }}
                      >
                        ×
                      </button>
                    </div>
                    <div style={{
                      background: '#fff',
                      padding: '12px',
                      borderRadius: '6px',
                      border: '1px solid #c3e6cb',
                      marginBottom: '10px',
                      maxHeight: '200px',
                      overflowY: 'auto',
                      fontSize: '0.9em',
                      lineHeight: '1.4'
                    }}
                    dangerouslySetInnerHTML={{ __html: generatedDescription }}
                    />
                    <button
                      type="button"
                      onClick={handleInsertSeoDescription}
                      style={{
                        padding: '8px 16px',
                        background: 'linear-gradient(135deg, #28a745, #20c997)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.9em',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      📝 Insérer dans la description
                    </button>
                  </div>
                )}
              </div>
              
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: 600,
                  color: '#3a2f1a',
                  fontSize: '1.1em'
                }}>
                  Description du Produit *
                </label>
                <textarea
                  value={product.description}
                  onChange={(e) => setProduct({ ...product, description: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '15px',
                    border: '2px solid #e9ecef',
                    borderRadius: '10px',
                    fontSize: '1em',
                    transition: 'all 0.3s ease',
                    backgroundColor: '#fff',
                    minHeight: '120px',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#8a5a44';
                    e.target.style.boxShadow = '0 0 0 3px rgba(138, 90, 68, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e9ecef';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="Décrivez votre produit en détail : matériaux utilisés, techniques, dimensions, etc..."
                  required
                />
              </div>
            </div>

            {/* ===== Détails Techniques ===== */}
            <div style={{
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              padding: '30px',
              borderRadius: '15px',
              border: '1px solid #dee2e6'
            }}>
              <h3 style={{
                fontSize: '1.5em',
                color: '#8a5a44',
                marginBottom: '25px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                🔧 Détails Techniques
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px' }}>
                {/* Matériau */}
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: 600,
                    color: '#3a2f1a',
                    fontSize: '1.1em'
                  }}>
                    Matériau
                  </label>
                  <input
                    type="text"
                    value={product.material}
                    onChange={(e) => setProduct({ ...product, material: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '15px',
                      border: '2px solid #e9ecef',
                      borderRadius: '10px',
                      fontSize: '1em',
                      transition: 'all 0.3s ease',
                      backgroundColor: '#fff'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#8a5a44';
                      e.target.style.boxShadow = '0 0 0 3px rgba(138, 90, 68, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e9ecef';
                      e.target.style.boxShadow = 'none';
                    }}
                    placeholder="Ex: laine, argile, bois, métal..."
                  />
                </div>

                {/* Taille */}
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: 600,
                    color: '#3a2f1a',
                    fontSize: '1.1em'
                  }}>
                    Taille / Dimensions
                  </label>
                  <input
                    type="text"
                    value={product.size}
                    onChange={(e) => setProduct({ ...product, size: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '15px',
                      border: '2px solid #e9ecef',
                      borderRadius: '10px',
                      fontSize: '1em',
                      transition: 'all 0.3s ease',
                      backgroundColor: '#fff'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#8a5a44';
                      e.target.style.boxShadow = '0 0 0 3px rgba(138, 90, 68, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e9ecef';
                      e.target.style.boxShadow = 'none';
                    }}
                    placeholder="Ex: S, M, L, 50x70 cm, 15cm de diamètre..."
                  />
                </div>
              </div>
            </div>

            {/* ===== Images ===== */}
            <div style={{
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              padding: '30px',
              borderRadius: '15px',
              border: '1px solid #dee2e6'
            }}>
              <h3 style={{
                fontSize: '1.5em',
                color: '#8a5a44',
                marginBottom: '25px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                📸 Images du Produit
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} style={{
                    background: '#fff',
                    padding: '20px',
                    borderRadius: '10px',
                    border: '2px dashed #dee2e6',
                    textAlign: 'center',
                    transition: 'all 0.3s ease'
                  }}>
                    <div style={{ fontSize: '2em', marginBottom: '10px' }}>📷</div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, index)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #dee2e6',
                        borderRadius: '8px',
                        fontSize: '0.9em',
                        cursor: 'pointer'
                      }}
                    />
                    {product.images[index] && (
                      <div style={{
                        marginTop: '10px',
                        padding: '8px',
                        background: 'linear-gradient(135deg, #d4edda, #c3e6cb)',
                        borderRadius: '8px',
                        color: '#155724',
                        fontSize: '0.9em',
                        fontWeight: 600
                      }}>
                        ✓ Image sélectionnée
                      </div>
                    )}
                    
                    {/* Aperçu de l'image */}
                    {imageUrls[index] && (
                      <div style={{
                        marginTop: '15px',
                        padding: '10px',
                        background: '#f8f9fa',
                        borderRadius: '8px',
                        border: '1px solid #e9ecef'
                      }}>
                        <div style={{
                          fontSize: '0.9em',
                          color: '#6c757d',
                          marginBottom: '8px',
                          fontWeight: 600
                        }}>
                          Aperçu :
                        </div>
                        <img
                          src={imageUrls[index]}
                          alt={`Aperçu ${index + 1}`}
                          style={{
                            width: '100%',
                            maxWidth: '200px',
                            height: '150px',
                            objectFit: 'cover',
                            borderRadius: '6px',
                            border: '1px solid #dee2e6',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}
                        />
                        <div style={{
                          marginTop: '8px',
                          fontSize: '0.8em',
                          color: '#6c757d',
                          wordBreak: 'break-all'
                        }}>
                          {product.images[index]?.name}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ===== Actions ===== */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '20px',
              marginTop: '30px'
            }}>
              <Link
                to="/artisan-home"
                style={{
                  padding: '15px 30px',
                  background: 'linear-gradient(135deg, #6c757d, #5a6268)',
                  color: '#fff',
                  textDecoration: 'none',
                  borderRadius: '10px',
                  fontSize: '1.1em',
                  fontWeight: 600,
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 16px rgba(0,0,0,0.2)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                ← Annuler
              </Link>
              
              <button
                type="submit"
                style={{
                  padding: '15px 40px',
                  background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '1.1em',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 16px rgba(0,0,0,0.2)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                ✨ Créer le Produit
              </button>
            </div>
          </form>
        </div>
      </section>

      <ArtisanFooter />
      <ToastContainer />
    </div>
  );
}

export default AddProduct;