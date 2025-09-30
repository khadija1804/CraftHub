import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getProducts, getWorkshops, getProductImage, getWorkshopImage, getProfile, createProfile, deleteProduct, deleteWorkshop } from '../services/api';
import { isWorkshopExpired, getWorkshopStatus, formatWorkshopDate } from '../utils/workshopUtils';
import axios from 'axios'; // [AJOUT] pour l'appel API concurrents
import CompetitorModal from '../components/CompetitorModal';
import ArtisanHeader from '../components/ArtisanHeader';
import ArtisanFooter from '../components/ArtisanFooter';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 

function ArtisanProfile() {
  const [products, setProducts] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const [imageUrls, setImageUrls] = useState({});
  const [profile, setProfile] = useState({ nom: '', prenom: '', bio: '', history: '', photo: null });
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('products');
  const navigate = useNavigate();

  // [AJOUT] états pour le modal concurrents
  const [isCompOpen, setIsCompOpen] = useState(false);
  const [compOffers, setCompOffers] = useState([]);
  const [compLoading, setCompLoading] = useState(false);
  const [compError, setCompError] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch products and workshops
        const [prodRes, workRes] = await Promise.all([getProducts(), getWorkshops()]);
        setProducts(prodRes.data || []);
        setWorkshops(workRes.data || []);

        // Fetch images
        const urls = {};
        for (const p of prodRes.data || []) {
          if (p.images && p.images.length > 0) {
            try {
              const response = await getProductImage(p._id, 0);
              urls[p._id] = URL.createObjectURL(response.data);
            } catch (err) {
              console.error('Failed to fetch image for product ID:', p._id, err);
            }
          }
        }
        for (const w of workRes.data || []) {
          if (w.images && w.images.length > 0) {
            try {
              const response = await getWorkshopImage(w._id, 0);
              urls[w._id] = URL.createObjectURL(response.data);
            } catch (err) {
              console.error('Failed to fetch image for workshop ID:', w._id, err);
            }
          }
        }
        setImageUrls(urls);

        // Fetch or create profile
        try {
          const profileRes = await getProfile();
          console.log('Profile data:', profileRes.data); // Debug API response
          setProfile(profileRes.data || { nom: '', prenom: '', bio: '', history: '', photo: null });
        } catch (err) {
          if (err.response?.status === 404) {
            console.log('Profile not found, attempting to create one');
            try {
              const createRes = await createProfile();
              console.log('Profile created:', createRes.data);
              const retryProfileRes = await getProfile();
              setProfile(retryProfileRes.data || { nom: '', prenom: '', bio: '', history: '', photo: null });
            } catch (createErr) {
              console.error('Failed to create profile:', createErr.response?.data || createErr.message);
              setError('Erreur lors de la création du profil. Veuillez réessayer.');
            }
          } else {
            console.error('Failed to fetch profile:', err.response?.data || err.message);
            setError('Erreur lors du chargement du profil. Veuillez réessayer.');
          }
        }
      } catch (err) {
        setError('Erreur lors du chargement des données. Veuillez réessayer.');
        console.error('Fetch Error:', err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    return () => {
      Object.values(imageUrls).forEach(url => URL.revokeObjectURL(url));
    };
  }, [imageUrls]);

  // Helper function to convert Buffer data to Uint8Array
  const bufferToUint8Array = (bufferData) => {
    try {
      if (bufferData && Array.isArray(bufferData.data)) {
        return new Uint8Array(bufferData.data);
      }
      return null;
    } catch (err) {
      console.error('Failed to convert Buffer to Uint8Array:', err);
      return null;
    }
  };

  // Create profile image URL from Buffer data
  const getProfileImageUrl = () => {
    if (profile.photo && profile.photo.data && profile.photo.contentType) {
      try {
        const uint8Array = bufferToUint8Array(profile.photo.data);
        if (uint8Array) {
          const blob = new Blob([uint8Array], { type: profile.photo.contentType });
          return URL.createObjectURL(blob);
        }
      } catch (err) {
        console.error('Failed to create profile image Blob:', err);
      }
    }
    return 'https://placehold.co/150x150'; // Fallback if Blob creation fails
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Fonction de suppression de produit
  const handleDeleteProduct = async (productId, productName) => {
    // Notification de confirmation personnalisée
    toast.warning(
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '1.2em', marginBottom: '8px' }}>⚠️</div>
        <div style={{ fontWeight: '600', marginBottom: '4px' }}>Confirmer la suppression</div>
        <div style={{ fontSize: '0.9em', color: '#666' }}>
          Êtes-vous sûr de vouloir supprimer le produit <strong>"{productName}"</strong> ?
        </div>
        <div style={{ marginTop: '12px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <button
            onClick={() => {
              toast.dismiss();
              confirmDeleteProduct(productId, productName);
            }}
            style={{
              background: 'linear-gradient(135deg, #dc3545, #c82333)',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '0.9em',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 4px 8px rgba(220, 53, 69, 0.3)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            Oui, supprimer
          </button>
          <button
            onClick={() => toast.dismiss()}
            style={{
              background: 'linear-gradient(135deg, #6c757d, #5a6268)',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '0.9em',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 4px 8px rgba(108, 117, 125, 0.3)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            Annuler
          </button>
        </div>
      </div>,
      {
        position: "top-center",
        autoClose: false,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        style: {
          background: 'linear-gradient(135deg, #fff3cd, #ffeaa7)',
          border: '1px solid #ffeaa7',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          minWidth: '350px'
        }
      }
    );
  };

  const confirmDeleteProduct = async (productId, productName) => {
    try {
      await deleteProduct(productId);
      // Mettre à jour la liste des produits
      setProducts(products.filter(p => p._id !== productId));
      // Supprimer l'URL de l'image de la mémoire
      if (imageUrls[productId]) {
        URL.revokeObjectURL(imageUrls[productId]);
        const newImageUrls = { ...imageUrls };
        delete newImageUrls[productId];
        setImageUrls(newImageUrls);
      }
      
      // Notification de succès
      toast.success(
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5em', marginBottom: '8px' }}>✅</div>
          <div style={{ fontWeight: '600', marginBottom: '4px' }}>Produit supprimé !</div>
          <div style={{ fontSize: '0.9em', color: '#666' }}>
            Le produit <strong>"{productName}"</strong> a été supprimé avec succès
          </div>
        </div>,
        {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          style: {
            background: 'linear-gradient(135deg, #d4edda, #c3e6cb)',
            border: '1px solid #c3e6cb',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            minWidth: '300px'
          }
        }
      );
    } catch (err) {
      console.error('Erreur lors de la suppression du produit:', err);
      toast.error(
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5em', marginBottom: '8px' }}>❌</div>
          <div style={{ fontWeight: '600', marginBottom: '4px' }}>Erreur de suppression</div>
          <div style={{ fontSize: '0.9em', color: '#666' }}>
            Impossible de supprimer le produit. Veuillez réessayer.
          </div>
        </div>,
        {
          position: "top-center",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          style: {
            background: 'linear-gradient(135deg, #f8d7da, #f5c6cb)',
            border: '1px solid #f5c6cb',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            minWidth: '300px'
          }
        }
      );
    }
  };

  // Fonction de suppression d'atelier
  const handleDeleteWorkshop = async (workshopId, workshopTitle) => {
    // Notification de confirmation personnalisée
    toast.warning(
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '1.2em', marginBottom: '8px' }}>⚠️</div>
        <div style={{ fontWeight: '600', marginBottom: '4px' }}>Confirmer la suppression</div>
        <div style={{ fontSize: '0.9em', color: '#666' }}>
          Êtes-vous sûr de vouloir supprimer l'atelier <strong>"{workshopTitle}"</strong> ?
        </div>
        <div style={{ marginTop: '12px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <button
            onClick={() => {
              toast.dismiss();
              confirmDeleteWorkshop(workshopId, workshopTitle);
            }}
            style={{
              background: 'linear-gradient(135deg, #dc3545, #c82333)',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '0.9em',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 4px 8px rgba(220, 53, 69, 0.3)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            Oui, supprimer
          </button>
          <button
            onClick={() => toast.dismiss()}
            style={{
              background: 'linear-gradient(135deg, #6c757d, #5a6268)',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '0.9em',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 4px 8px rgba(108, 117, 125, 0.3)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            Annuler
          </button>
        </div>
      </div>,
      {
        position: "top-center",
        autoClose: false,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        style: {
          background: 'linear-gradient(135deg, #fff3cd, #ffeaa7)',
          border: '1px solid #ffeaa7',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          minWidth: '350px'
        }
      }
    );
  };

  const confirmDeleteWorkshop = async (workshopId, workshopTitle) => {
    try {
      await deleteWorkshop(workshopId);
      // Mettre à jour la liste des ateliers
      setWorkshops(workshops.filter(w => w._id !== workshopId));
      // Supprimer l'URL de l'image de la mémoire
      if (imageUrls[workshopId]) {
        URL.revokeObjectURL(imageUrls[workshopId]);
        const newImageUrls = { ...imageUrls };
        delete newImageUrls[workshopId];
        setImageUrls(newImageUrls);
      }
      
      // Notification de succès
      toast.success(
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5em', marginBottom: '8px' }}>✅</div>
          <div style={{ fontWeight: '600', marginBottom: '4px' }}>Atelier supprimé !</div>
          <div style={{ fontSize: '0.9em', color: '#666' }}>
            L'atelier <strong>"{workshopTitle}"</strong> a été supprimé avec succès
          </div>
        </div>,
        {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          style: {
            background: 'linear-gradient(135deg, #d4edda, #c3e6cb)',
            border: '1px solid #c3e6cb',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            minWidth: '300px'
          }
        }
      );
    } catch (err) {
      console.error('Erreur lors de la suppression de l\'atelier:', err);
      toast.error(
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5em', marginBottom: '8px' }}>❌</div>
          <div style={{ fontWeight: '600', marginBottom: '4px' }}>Erreur de suppression</div>
          <div style={{ fontSize: '0.9em', color: '#666' }}>
            Impossible de supprimer l'atelier. Veuillez réessayer.
          </div>
        </div>,
        {
          position: "top-center",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          style: {
            background: 'linear-gradient(135deg, #f8d7da, #f5c6cb)',
            border: '1px solid #f5c6cb',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            minWidth: '300px'
          }
        }
      );
    }
  };
   // [AJOUT] ouverture du modal + appel backend pour concurrents
// [REMPLACER EN ENTIER]
const openCompetitors = async (product) => {
  setSelectedProduct(product);
  setIsCompOpen(true);
  setCompOffers([]);
  setCompError('');
  setCompLoading(true);

  try {
    const res = await axios.post(
      'http://localhost:5005/estimate-price-from-scrape',
      { name: product.name },
      { timeout: 20000 }
    );

    // 1) OFFERS (nouveau format: ebay + amazon + gshopping)
    const offersArr = Array.isArray(res.data?.offers) ? res.data.offers : [];

    const normalizedOffers = offersArr
      .map(o => {
        const url = o.url || o.link || '';
        if (!url) return null;
        return {
          title: (o.title || o.name || 'Offre concurrente').toString(),
          url,
          price: (typeof o.price === 'number' ? o.price : null),
          currency: o.currency || 'EUR',          // souvent EUR pour Amazon/Shopping
          source: o.source || 'unknown',          // "ebay" | "amazon" | "gshopping"
          domain: o.domain || (() => {
            try { return new URL(url).hostname.replace(/^www\./,''); } catch { return ''; }
          })(),
          sim: typeof o.sim === 'number' ? o.sim : 0
        };
      })
      .filter(Boolean);

    // 2) SAMPLES (ancien format eBay) -> fallback/complément
    const samples = Array.isArray(res.data?.samples) ? res.data.samples : [];
    const legacyFromSamples = samples
      .map(s => {
        const url = s.link || s.url || '';
        if (!url) return null;
        let price = null;
        if (Array.isArray(s.snippet_price_usd) && s.snippet_price_usd.length) {
          const firstNum = s.snippet_price_usd.find(v => typeof v === 'number');
          price = typeof firstNum === 'number' ? firstNum : null;
        }
        let title = s.title || s.name || '';
        if (!title && url) {
          try { title = new URL(url).hostname.replace(/^www\./,''); } catch {}
        }
        return {
          title: title || 'Offre concurrente',
          url,
          price,
          currency: 'EUR',
          source: 'ebay',
          domain: (() => {
            try { return new URL(url).hostname.replace(/^www\./,''); } catch { return ''; }
          })(),
          sim: 0
        };
      })
      .filter(Boolean);

    // 3) Fusion + déduplication par URL
    const byUrl = new Map();
    [...normalizedOffers, ...legacyFromSamples].forEach(o => {
      if (!byUrl.has(o.url)) byUrl.set(o.url, o);
    });
    let merged = Array.from(byUrl.values());

    // 4) Tri: pertinence (sim) desc, puis prix asc, puis source (amazon/gshopping/ebay)
    const sourceRank = { amazon: 0, gshopping: 1, ebay: 2, unknown: 3 };
    merged.sort((a, b) => {
      if ((b.sim || 0) !== (a.sim || 0)) return (b.sim || 0) - (a.sim || 0);
      if (a.price != null && b.price != null && a.price !== b.price) return a.price - b.price;
      return (sourceRank[a.source] ?? 9) - (sourceRank[b.source] ?? 9);
    });

    setCompOffers(merged);

    if (!merged.length) {
      const msg = res.data?.message || "Aucun lien concurrent trouvé pour ce produit.";
      setCompError(msg);
    }
  } catch (e) {
    const msg = e.response?.data?.error || e.response?.data?.message || e.message;
    setCompError(msg || "Erreur lors de la recherche des concurrents.");
  } finally {
    setCompLoading(false);
  }
};
// ——— Accordéon raffiné, étroit & centré ———
// Accordéon aligné à gauche (même ligne de base que le bouton)
function AccordionItem({ title, open = false, children }) {
  const [isOpen, setIsOpen] = React.useState(open);
  const color = "#8a5a44";
  return (
    <div className="ap-acc" style={{ margin: "10px 0" }}>
      <button
        onClick={() => setIsOpen(v => !v)}
        style={{
          width: "100%",
          textAlign: "left",
          background: color,
          color: "#fff",
          border: "none",
          borderRadius: 10,
          padding: "10px 14px",
          fontWeight: 600,
          fontSize: "0.95rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          boxShadow: "0 6px 16px rgba(0,0,0,.12)",
        }}
        aria-expanded={isOpen}
      >
        <span>{title}</span>
        <span style={{ fontSize: 18, lineHeight: 1 }}>{isOpen ? "−" : "+"}</span>
      </button>

      {isOpen && (
        <div
          style={{
            background: "#fff",
            border: `1px solid ${color}33`,
            borderTop: "none",
            padding: "14px 16px",
            color: "#3a2f1a",
            lineHeight: 1.6,
            fontSize: ".92rem",
            borderRadius: "0 0 10px 10px",
            boxShadow: "0 6px 14px rgba(0,0,0,.08)",
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}



  return (
    <div style={{ fontFamily: '"Georgia", serif', color: '#3a2f1a', minHeight: '100vh', backgroundColor: '#f8f1e9', margin: 0, padding: 0 }}>
      <ArtisanHeader />

     {/* ===== Modern Profile Section ===== */}
<section
  style={{
    maxWidth: '1200px',
    margin: '40px auto',
    padding: '0 30px',
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
  }}
>
  {/* Error Messages */}
  {error && (
    <div
      style={{
        color: '#8a5a44',
        backgroundColor: '#fff',
        padding: '16px 24px',
        borderRadius: '12px',
        textAlign: 'center',
        marginBottom: '20px',
        border: '1px solid #d4a373',
        boxShadow: '0 4px 12px rgba(138, 90, 68, 0.1)',
        fontSize: '16px',
        fontWeight: '500'
      }}
    >
      {error}
    </div>
  )}

  {profile.nom === '' && profile.prenom === '' && (
    <div
      style={{
        color: '#8a5a44',
        textAlign: 'center',
        marginBottom: '20px',
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '12px',
        border: '1px solid #d4a373',
        boxShadow: '0 4px 12px rgba(138, 90, 68, 0.1)',
        fontSize: '16px'
      }}
    >
      Aucun profil trouvé. Votre profil a été créé automatiquement.{' '}
      <Link to="/profile/edit" style={{ 
        color: '#d4a373', 
        textDecoration: 'none',
        fontWeight: '600',
        transition: 'color 0.3s ease'
      }}
      onMouseOver={(e) => e.currentTarget.style.color = '#8a5a44'}
      onMouseOut={(e) => e.currentTarget.style.color = '#d4a373'}
      >
        Modifiez votre profil
      </Link>
    </div>
  )}

  {/* Modern Profile Header */}
  <div
    style={{
      backgroundColor: '#fff',
      borderRadius: '20px',
      padding: '40px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
      border: '1px solid rgba(212, 163, 115, 0.2)',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '32px',
      flexWrap: 'wrap',
      position: 'relative',
      overflow: 'hidden'
    }}
  >
    {/* Decorative background pattern */}
    <div style={{
      position: 'absolute',
      top: '-50px',
      right: '-50px',
      width: '200px',
      height: '200px',
      background: 'linear-gradient(135deg, rgba(212, 163, 115, 0.1) 0%, rgba(138, 90, 68, 0.05) 100%)',
      borderRadius: '50%',
      zIndex: 0
    }} />
    
    {/* Avatar with modern styling */}
    <div style={{ position: 'relative', zIndex: 1 }}>
    <img
      src={getProfileImageUrl()}
      alt={`${profile.prenom} ${profile.nom}`}
      style={{
          width: '180px',
          height: '180px',
        borderRadius: '50%',
        objectFit: 'cover',
          border: '4px solid #d4a373',
        background: '#fff',
          boxShadow: '0 8px 24px rgba(138, 90, 68, 0.2)',
          transition: 'transform 0.3s ease'
      }}
      onError={(e) => {
          e.currentTarget.src = 'https://placehold.co/180x180';
        e.currentTarget.onerror = null;
      }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
      />
    </div>

    {/* Profile content */}
    <div style={{ flex: 1, minWidth: 300, position: 'relative', zIndex: 1 }}>
      <h2 style={{ 
        fontSize: '2.2em', 
        margin: '0 0 16px 0', 
        color: '#8a5a44', 
        lineHeight: 1.2, 
        fontWeight: 700,
        letterSpacing: '-0.5px'
      }}>
        {`${profile.prenom} ${profile.nom}` || 'Inconnu Artisan'}
      </h2>

      <div style={{ 
        display: 'flex', 
        gap: '32px', 
        margin: '20px 0', 
        fontSize: '1.1em', 
        color: '#8a5a44',
        flexWrap: 'wrap'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          backgroundColor: 'rgba(212, 163, 115, 0.1)',
          borderRadius: '20px',
          border: '1px solid rgba(212, 163, 115, 0.2)'
        }}>
          <span style={{ fontSize: '1.2em' }}>📦</span>
          <span><strong>{products.length}</strong> produits</span>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          backgroundColor: 'rgba(212, 163, 115, 0.1)',
          borderRadius: '20px',
          border: '1px solid rgba(212, 163, 115, 0.2)'
        }}>
          <span style={{ fontSize: '1.2em' }}>🎨</span>
          <span><strong>{workshops.length}</strong> ateliers</span>
        </div>
      </div>

      {/* Modern accordions */}
      <div style={{ maxWidth: 700, marginTop: '24px' }}>
        <AccordionItem title="Je me présente">
          {profile.bio || 'Artisan passionné | Créations uniques et ateliers créatifs'}
        </AccordionItem>

        <AccordionItem title="Mon parcours">
          {profile.historique && profile.historique.length > 0 ? (
            <div style={{ marginTop: '10px' }}>
              {profile.historique.map((event, index) => (
                <div key={index} style={{
                  backgroundColor: 'rgba(212, 163, 115, 0.1)',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  marginBottom: '12px',
                  border: '1px solid rgba(212, 163, 115, 0.3)',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(212, 163, 115, 0.15)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(212, 163, 115, 0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}>
                  <p style={{ 
                    margin: '0 0 8px 0', 
                    color: '#5c4b38', 
                    fontWeight: '500',
                    fontSize: '1em',
                    lineHeight: '1.4'
                  }}>
                    {event.event}
                  </p>
                  <small style={{ 
                    color: '#8a5a44', 
                    opacity: 0.8,
                    fontSize: '0.9em'
                  }}>
                    {new Date(event.date).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </small>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              backgroundColor: 'rgba(212, 163, 115, 0.05)',
              padding: '20px',
              borderRadius: '12px',
              border: '2px dashed rgba(212, 163, 115, 0.3)',
              textAlign: 'center',
              color: '#8a5a44',
              fontStyle: 'italic'
            }}>
              Aucun événement dans votre parcours pour le moment.
            </div>
          )}
        </AccordionItem>

        <Link
          to="/profile/edit"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '14px 24px',
            backgroundColor: '#d4a373',
            color: '#fff',
            borderRadius: '12px',
            fontWeight: '600',
            textDecoration: 'none',
            fontSize: '16px',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 16px rgba(212, 163, 115, 0.3)',
            marginTop: '20px',
            border: 'none',
            cursor: 'pointer'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#b88d5a';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(212, 163, 115, 0.4)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#d4a373';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(212, 163, 115, 0.3)';
          }}
          aria-label="Modifier le profil"
        >
          ✏️ Modifier le profil
        </Link>
      </div>
    </div>
  </div>

  {/* Modern Tab Navigation with Add Buttons */}
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '16px',
      backgroundColor: '#fff',
      borderRadius: '16px',
      padding: '8px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
      border: '1px solid rgba(212, 163, 115, 0.2)',
      maxWidth: '600px',
      margin: '0 auto',
      flexWrap: 'wrap'
    }}
  >
    {/* Add Product Button */}
    <Link
      to="/add-product"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 20px',
        backgroundColor: '#8a5a44',
        color: '#fff',
        textDecoration: 'none',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: 600,
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 12px rgba(138, 90, 68, 0.3)',
        whiteSpace: 'nowrap'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.backgroundColor = '#6d4530';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 6px 16px rgba(138, 90, 68, 0.4)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.backgroundColor = '#8a5a44';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(138, 90, 68, 0.3)';
      }}
      aria-label="Ajouter un produit"
    >
      ➕ Ajouter Produit
    </Link>

    {/* Tab Navigation Container */}
    <div
      style={{
        display: 'flex',
        gap: '0',
        backgroundColor: 'rgba(212, 163, 115, 0.1)',
        borderRadius: '12px',
        padding: '4px',
        flex: 1,
        minWidth: '300px'
      }}
    >
      <button
        onClick={() => setActiveTab('products')}
        style={{
          background: activeTab === 'products' ? '#d4a373' : 'transparent',
          border: 'none',
          fontSize: '16px',
          fontWeight: activeTab === 'products' ? 600 : 500,
          color: activeTab === 'products' ? '#fff' : '#8a5a44',
          padding: '12px 32px',
          cursor: 'pointer',
          borderRadius: '10px',
          transition: 'all 0.3s ease',
          flex: 1
        }}
        onMouseOver={(e) => {
          if (activeTab !== 'products') {
            e.currentTarget.style.backgroundColor = 'rgba(212, 163, 115, 0.2)';
          }
        }}
        onMouseOut={(e) => {
          if (activeTab !== 'products') {
            e.currentTarget.style.backgroundColor = 'transparent';
          }
        }}
        aria-label="Afficher les produits"
      >
        📦 Produits
      </button>

      <button
        onClick={() => setActiveTab('workshops')}
        style={{
          background: activeTab === 'workshops' ? '#d4a373' : 'transparent',
          border: 'none',
          fontSize: '16px',
          fontWeight: activeTab === 'workshops' ? 600 : 500,
          color: activeTab === 'workshops' ? '#fff' : '#8a5a44',
          padding: '12px 32px',
          cursor: 'pointer',
          borderRadius: '10px',
          transition: 'all 0.3s ease',
          flex: 1
        }}
        onMouseOver={(e) => {
          if (activeTab !== 'workshops') {
            e.currentTarget.style.backgroundColor = 'rgba(212, 163, 115, 0.2)';
          }
        }}
        onMouseOut={(e) => {
          if (activeTab !== 'workshops') {
            e.currentTarget.style.backgroundColor = 'transparent';
          }
        }}
        aria-label="Afficher les ateliers"
      >
        🎨 Ateliers
      </button>
    </div>

    {/* Add Workshop Button */}
    <Link
      to="/add-workshop"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 20px',
        backgroundColor: '#8a5a44',
        color: '#fff',
        textDecoration: 'none',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: 600,
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 12px rgba(138, 90, 68, 0.3)',
        whiteSpace: 'nowrap'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.backgroundColor = '#6d4530';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 6px 16px rgba(138, 90, 68, 0.4)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.backgroundColor = '#8a5a44';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(138, 90, 68, 0.3)';
      }}
      aria-label="Ajouter un atelier"
    >
      ➕ Ajouter Atelier
    </Link>
  </div>
</section>


      <section style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 30px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '24px',
          marginBottom: '40px'
        }}>
          {activeTab === 'products' && products.length > 0 ? (
            products.map((p) => (
              <div key={p._id} style={{
                position: 'relative',
                aspectRatio: '1/1',
                backgroundColor: '#fff',
                border: '1px solid rgba(212, 163, 115, 0.2)',
                borderRadius: '16px',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                cursor: 'pointer'
              }}
              onMouseOver={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
              }}
              >
                {imageUrls[p._id] ? (
                  <img
                    src={imageUrls[p._id]}
                    alt={p.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      console.log('Image load failed for product ID:', p._id);
                      e.target.src = 'https://placehold.co/293x293';
                      e.target.onerror = null; // Prevent infinite error loop
                    }}
                  />
                ) : (
                  <img
                    src="https://placehold.co/293x293"
                    alt="Product placeholder"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      console.log('Placeholder image load failed for product ID:', p._id);
                      e.target.style.display = 'none'; // Hide if placeholder fails
                      e.target.onerror = null;
                    }}
                  />
                )}
               
                  {/* Modern Action Buttons */}
<div
  style={{
    position: 'absolute',
    top: '12px',
    left: '12px',
    right: '12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '8px',
  }}
>
  {/* Competitors Button */}
  <button
    onClick={() => openCompetitors(p)}
    style={{
      backgroundColor: 'rgba(138, 90, 68, 0.9)',
      color: '#fff',
      border: 'none',
      padding: '8px 12px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      transition: 'all 0.3s ease',
      backdropFilter: 'blur(10px)',
    }}
    onMouseOver={(e)=> {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.backgroundColor = 'rgba(138, 90, 68, 1)';
      e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.25)';
    }}
    onMouseOut={(e)=> {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.backgroundColor = 'rgba(138, 90, 68, 0.9)';
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
    }}
    aria-label={`Voir concurrents pour ${p.name}`}
  >
    🔍 Concurrents
  </button>

  {/* Right side buttons */}
  <div style={{ display: 'flex', gap: '8px' }}>
    {/* Edit Button */}
    <Link
      to={`/edit-product/${p._id}`}
      style={{
        backgroundColor: 'rgba(212, 163, 115, 0.9)',
        color: '#fff',
        padding: '8px 12px',
        borderRadius: '8px',
        textDecoration: 'none',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        transition: 'all 0.3s ease',
        backdropFilter: 'blur(10px)',
      }}
      onMouseOver={(e)=> { 
        e.currentTarget.style.transform = 'translateY(-2px)'; 
        e.currentTarget.style.backgroundColor = 'rgba(212, 163, 115, 1)'; 
        e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.25)';
      }}
      onMouseOut={(e)=> { 
        e.currentTarget.style.transform = 'translateY(0)'; 
        e.currentTarget.style.backgroundColor = 'rgba(212, 163, 115, 0.9)'; 
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
      }}
      aria-label={`Modifier le produit ${p.name}`}
    >
      ✏️ Modifier
    </Link>

    {/* Delete Button */}
    <button
      onClick={() => handleDeleteProduct(p._id, p.name)}
      style={{
        backgroundColor: 'rgba(220, 53, 69, 0.9)',
        color: '#fff',
        border: 'none',
        padding: '8px',
        borderRadius: '8px',
        fontSize: '16px',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        transition: 'all 0.3s ease',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '36px',
        height: '36px'
      }}
      onMouseOver={(e)=> {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.backgroundColor = 'rgba(220, 53, 69, 1)';
        e.currentTarget.style.boxShadow = '0 6px 16px rgba(220, 53, 69, 0.4)';
      }}
      onMouseOut={(e)=> {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.backgroundColor = 'rgba(220, 53, 69, 0.9)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
      }}
      aria-label={`Supprimer le produit ${p.name}`}
    >
      🗑️
    </button>
  </div>
</div>
                <div style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '12px',
                  right: '12px',
                  color: '#fff',
                  backgroundColor: 'rgba(138, 90, 68, 0.9)',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}>
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>{p.name}</div>
                  <div style={{ fontSize: '16px', fontWeight: '700' }}>{p.price} €</div>
                </div>
              </div>
            ))
          ) : activeTab === 'products' && (
            <div style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '60px 20px',
              backgroundColor: '#fff',
              borderRadius: '16px',
              border: '1px solid rgba(212, 163, 115, 0.2)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
              <h3 style={{ color: '#8a5a44', fontSize: '20px', fontWeight: '600', margin: '0 0 8px 0' }}>Aucun produit ajouté</h3>
              <p style={{ color: '#8e8e8e', margin: '0 0 20px 0' }}>Commencez par ajouter votre premier produit</p>
              <Link to="/add-product" style={{ 
                color: '#fff', 
                backgroundColor: '#d4a373',
                padding: '12px 24px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                display: 'inline-block'
              }} 
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#b88d5a';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#d4a373';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              aria-label="Ajouter un produit">
                + Ajouter un produit
              </Link>
            </div>
          )}
          {activeTab === 'workshops' && workshops.length > 0 ? (
            workshops.map((w) => {
              const isExpired = isWorkshopExpired(w.date);
              const workshopStatus = getWorkshopStatus(w.date);
              
              return (
                <div key={w._id} style={{
                  position: 'relative',
                  aspectRatio: '1/1',
                  backgroundColor: isExpired 
                    ? 'rgba(220, 38, 38, 0.05)'
                    : '#fff',
                  border: isExpired 
                    ? '2px solid rgba(220, 38, 38, 0.3)'
                    : '1px solid rgba(212, 163, 115, 0.2)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  boxShadow: isExpired 
                    ? '0 4px 16px rgba(220, 38, 38, 0.15)'
                    : '0 4px 16px rgba(0,0,0,0.08)',
                  cursor: 'pointer'
                }}
                onMouseOver={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = isExpired 
                    ? '0 8px 24px rgba(220, 38, 38, 0.25)'
                    : '0 8px 24px rgba(0,0,0,0.15)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = isExpired 
                    ? '0 4px 16px rgba(220, 38, 38, 0.15)'
                    : '0 4px 16px rgba(0,0,0,0.08)';
                }}
                >
                {imageUrls[w._id] ? (
                  <img
                    src={imageUrls[w._id]}
                    alt={w.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      filter: isExpired ? 'grayscale(0.3) brightness(0.7)' : 'none'
                    }}
                    onError={(e) => {
                      console.log('Image load failed for workshop ID:', w._id);
                      e.target.src = 'https://placehold.co/293x293';
                      e.target.onerror = null; // Prevent infinite error loop
                    }}
                  />
                ) : (
                  <img
                    src="https://placehold.co/293x293"
                    alt="Workshop placeholder"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      filter: isExpired ? 'grayscale(0.3) brightness(0.7)' : 'none'
                    }}
                    onError={(e) => {
                      console.log('Placeholder image load failed for workshop ID:', w._id);
                      e.target.style.display = 'none'; // Hide if placeholder fails
                      e.target.onerror = null;
                    }}
                  />
                )}
                
                {/* Expired Overlay */}
                {isExpired && (
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: 'rgba(220, 38, 38, 0.9)',
                    color: '#fff',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: '700',
                    textAlign: 'center',
                    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.4)',
                    backdropFilter: 'blur(10px)',
                    zIndex: 2
                  }}>
                    ⚠️ ATELIER EXPIRÉ
                  </div>
                )}
                {/* Action Buttons for Workshop */}
                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'center'
                  }}
                >
                  {/* Edit Button */}
                  <Link
                    to={`/edit-workshop/${w._id}`}
                    style={{
                      backgroundColor: 'rgba(212, 163, 115, 0.9)',
                      color: '#fff',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontWeight: '500',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                      transition: 'all 0.3s ease',
                      backdropFilter: 'blur(10px)',
                    }}
                    onMouseOver={(e)=> { 
                      e.currentTarget.style.transform = 'translateY(-2px)'; 
                      e.currentTarget.style.backgroundColor = 'rgba(212, 163, 115, 1)'; 
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.25)';
                    }}
                    onMouseOut={(e)=> { 
                      e.currentTarget.style.transform = 'translateY(0)'; 
                      e.currentTarget.style.backgroundColor = 'rgba(212, 163, 115, 0.9)'; 
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                    }}
                    aria-label={`Modifier l'atelier ${w.title}`}
                  >
                    ✏️ Modifier
                  </Link>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteWorkshop(w._id, w.title)}
                    style={{
                      backgroundColor: 'rgba(220, 53, 69, 0.9)',
                      color: '#fff',
                      border: 'none',
                      padding: '8px',
                      borderRadius: '8px',
                      fontSize: '16px',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                      transition: 'all 0.3s ease',
                      backdropFilter: 'blur(10px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: '36px',
                      height: '36px'
                    }}
                    onMouseOver={(e)=> {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.backgroundColor = 'rgba(220, 53, 69, 1)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(220, 53, 69, 0.4)';
                    }}
                    onMouseOut={(e)=> {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.backgroundColor = 'rgba(220, 53, 69, 0.9)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                    }}
                    aria-label={`Supprimer l'atelier ${w.title}`}
                  >
                    🗑️
                  </button>
                </div>
                <div style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '12px',
                  right: '12px',
                  color: '#fff',
                  backgroundColor: isExpired 
                    ? 'rgba(220, 38, 38, 0.9)'
                    : 'rgba(138, 90, 68, 0.9)',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  backdropFilter: 'blur(10px)',
                  boxShadow: isExpired 
                    ? '0 4px 12px rgba(220, 38, 38, 0.3)'
                    : '0 4px 12px rgba(0,0,0,0.2)'
                }}>
                  <div style={{ 
                    fontWeight: '600', 
                    marginBottom: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    {w.title}
                    {isExpired && (
                      <span style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        padding: '2px 6px',
                        borderRadius: '10px',
                        fontSize: '10px',
                        fontWeight: '700'
                      }}>
                        EXPIRÉ
                      </span>
                    )}
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    fontSize: '12px', 
                    opacity: '0.9' 
                  }}>
                    <span style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '4px',
                      color: isExpired ? '#ffcccb' : '#fff'
                    }}>
                      📅 {formatWorkshopDate(w.date)}
                    </span>
                    <span style={{
                      backgroundColor: isExpired 
                        ? 'rgba(255, 255, 255, 0.2)'
                        : 'rgba(40, 167, 69, 0.8)',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      👥 {w.places || 0} places
                    </span>
                  </div>
                </div>
              </div>
              );
            })
          ) : activeTab === 'workshops' && (
            <div style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '60px 20px',
              backgroundColor: '#fff',
              borderRadius: '16px',
              border: '1px solid rgba(212, 163, 115, 0.2)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎨</div>
              <h3 style={{ color: '#8a5a44', fontSize: '20px', fontWeight: '600', margin: '0 0 8px 0' }}>Aucun atelier créé</h3>
              <p style={{ color: '#8e8e8e', margin: '0 0 20px 0' }}>Créez votre premier atelier pour partager votre savoir-faire</p>
              <Link to="/add-workshop" style={{ 
                color: '#fff', 
                backgroundColor: '#d4a373',
                padding: '12px 24px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                display: 'inline-block'
              }} 
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#b88d5a';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#d4a373';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              aria-label="Ajouter un atelier">
                + Créer un atelier
              </Link>
            </div>
          )}
        </div>
        
      </section>
       {/* [AJOUT] Rendu du modal concurrents */}
  <CompetitorModal
  open={isCompOpen}
 onClose={() => setIsCompOpen(false)}
  productName={selectedProduct?.name || ''}
  currentPrice={Number(selectedProduct?.price) || null}
 offers={compOffers}
  isLoading={compLoading}
 error={compError}
 />

      <ArtisanFooter />
      
      {/* Toast Notifications */}
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{
          fontSize: '14px'
        }}
      />
    </div>
  );
}

export default ArtisanProfile;