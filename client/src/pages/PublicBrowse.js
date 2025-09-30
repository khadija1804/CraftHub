import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  getPublicProducts,
  getPublicWorkshops,
  getPublicProductImage,
  getPublicWorkshopImage,
  addToCart,
  getCart,
  addBooking,
  getBookings,
  removeBooking,
  addFavorite,
  removeFavorite,
  getFavorites
} from "../services/api";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { isWorkshopExpired } from "../utils/workshopUtils";

function PublicBrowse() {
  const [products, setProducts] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const [imageUrls, setImageUrls] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filteredWorkshops, setFilteredWorkshops] = useState([]);

  const [filters, setFilters] = useState({
    productCategory: "all",
    workshopCategory: "all",
    region: "all",
    priceRange: "all"
  });
  const [activeTab, setActiveTab] = useState('products');
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [favorites, setFavorites] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [workshopPlaces, setWorkshopPlaces] = useState({});
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [bookingTimeouts, setBookingTimeouts] = useState({});
  const [timeRemaining, setTimeRemaining] = useState({});
  const isMounted = useRef(true);

  const blobToUrl = useCallback((blob) => {
    return blob ? URL.createObjectURL(blob) : "/placeholder-image.jpg";
  }, []);

  // Timer pour le compte à rebours des réservations
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(workshopId => {
          if (updated[workshopId] > 0) {
            updated[workshopId] = updated[workshopId] - 1;
          } else {
            delete updated[workshopId];
          }
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Dans useEffect...
  useEffect(() => {
    isMounted.current = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [prodRes, workRes] = await Promise.all([
          getPublicProducts(),
          getPublicWorkshops()
        ]);
        setProducts(prodRes.data || []);
        setWorkshops(workRes.data || []);
        setFilteredProducts(prodRes.data || []);
        setFilteredWorkshops(workRes.data || []);

        const urls = {};
        for (const p of prodRes.data || []) {
          if (p.images && p.images.length > 0) {
            try {
              const response = await getPublicProductImage(p._id, 0);
              urls[p._id] = blobToUrl(response.data);
            } catch (err) {
              console.error(
                "Failed to fetch image for product ID:",
                p._id,
                err
              );
            }
          }
        }
        for (const w of workRes.data || []) {
          if (w.images && w.images.length > 0) {
            try {
              const response = await getPublicWorkshopImage(w._id, 0);
              urls[w._id] = blobToUrl(response.data);
            } catch (err) {
              console.error(
                "Failed to fetch image for workshop ID:",
                w._id,
                err
              );
            }
          }
          setWorkshopPlaces((prev) => ({ ...prev, [w._id]: w.places || 10 }));
        }
        setImageUrls(urls);
        setError("");

        const token = localStorage.getItem("token");
        if (token) {
          try {
            const decodedToken = jwtDecode(token);
            const userId =
              decodedToken.userId ||
              decodedToken.id ||
              decodedToken.sub ||
              decodedToken.user_id;
            if (userId) {
              const cartRes = await getCart();
              setCart(cartRes.data.items || []);
              const bookingsRes = await getBookings();
              setBookings(bookingsRes.data || []);
              const favRes = await getFavorites();
              setFavorites(favRes.data || []);
            }
          } catch (err) {
            console.error("Error fetching cart, bookings, or favorites:", err);
          }
        }

        if (token) {
          try {
            const decodedToken = jwtDecode(token);
            const userId =
              decodedToken.userId ||
              decodedToken.id ||
              decodedToken.sub ||
              decodedToken.user_id;
            if (userId) {
              const response = await axios.post(
                "http://localhost:5001/recommend",
                { userId },
                {
                  headers: { "Content-Type": "application/json" },
                  timeout: 10000
                }
              );
              const recs = response.data.recommendations || [];
              if (isMounted.current && Array.isArray(recs))
                setRecommendations(recs);
            }
          } catch (err) {
            console.error("Recommendation fetch error:", err);
          }
        } else {
          const shuffled = prodRes.data
            .sort(() => 0.5 - Math.random())
            .slice(0, 5);
          if (isMounted.current) setRecommendations(shuffled);
        }
      } catch (err) {
        setError("Erreur lors du chargement des données. Vérifiez la console.");
        console.error(
          "API Error:",
          err.response ? err.response.data : err.message
        );
      } finally {
        if (isMounted.current) setLoading(false);
      }
    };
    fetchData();

    return () => {
      isMounted.current = false;
      Object.values(imageUrls).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [blobToUrl]);

  // Recherche dynamique
  useEffect(() => {
    const searchLower = searchTerm.toLowerCase();
    
    if (searchTerm.trim() === '') {
      // Si pas de recherche, afficher tous les produits et ateliers
      setFilteredProducts(products);
      setFilteredWorkshops(workshops);
    } else {
      // Filtrer les produits par nom de produit ou nom d'artisan
      const filteredProds = products.filter(product => 
        product.name.toLowerCase().includes(searchLower) ||
        (product.artisanId && 
          (`${product.artisanId.prenom} ${product.artisanId.nom}`.toLowerCase().includes(searchLower) ||
           product.artisanId.prenom.toLowerCase().includes(searchLower) ||
           product.artisanId.nom.toLowerCase().includes(searchLower)))
      );
      
      // Filtrer les ateliers par nom d'atelier ou nom d'artisan
      const filteredWorks = workshops.filter(workshop => 
        workshop.title.toLowerCase().includes(searchLower) ||
        (workshop.artisanId && 
          (`${workshop.artisanId.prenom} ${workshop.artisanId.nom}`.toLowerCase().includes(searchLower) ||
           workshop.artisanId.prenom.toLowerCase().includes(searchLower) ||
           workshop.artisanId.nom.toLowerCase().includes(searchLower)))
      );
      
      setFilteredProducts(filteredProds);
      setFilteredWorkshops(filteredWorks);
    }
  }, [searchTerm, products, workshops]);

  const finalFilteredProducts = filteredProducts.filter(
    (p) =>
      (filters.productCategory === "all" || p.category === filters.productCategory) &&
      (filters.priceRange === "all" ||
        (filters.priceRange === "0-50" && p.price >= 0 && p.price <= 50) ||
        (filters.priceRange === "50-100" && p.price > 50 && p.price <= 100) ||
        (filters.priceRange === "100+" && p.price > 100))
  );

  const finalFilteredWorkshops = filteredWorkshops.filter(
    (w) =>
      (filters.workshopCategory === "all" || w.category === filters.workshopCategory) &&
      (filters.region === "all" ||
        w.location.toLowerCase().includes(filters.region.toLowerCase())) &&
      (filters.priceRange === "all" ||
        (filters.priceRange === "0-50" && w.price >= 0 && w.price <= 50) ||
        (filters.priceRange === "50-100" && w.price > 50 && w.price <= 100) ||
        (filters.priceRange === "100+" && w.price > 100))
  );

  const handleAddToCart = async (product) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setNotification({
        show: true,
        message: "Veuillez vous connecter pour ajouter un produit au panier.",
        type: 'error'
      });
      setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000);
      return;
    }
    console.log("Handling add to cart - Product:", product);
    const quantity = quantities[product._id] || 1;
    const available = Number(product.stock) || 0;

    if (available <= 0) {
      setNotification({
        show: true,
        message: "Stock épuisé pour ce produit.",
        type: 'error'
      });
      setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000);
      return;
    }
    if (quantity > available) {
      setNotification({
        show: true,
        message: `Quantité demandée (${quantity}) > stock disponible (${available}).`,
        type: 'error'
      });
      setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000);
      setQuantities(prev => ({ ...prev, [product._id]: available }));
      return;
    }

    if (quantity > 0) {
      try {
        await addToCart({
          productId: product._id,
          quantity,
          artisanId: product.artisanId?._id,
          name: product.name || "Produit inconnu"
        });
        console.log(
          "Cart add request sent with artisanId, fetching updated cart..."
        );
        const updatedCartResponse = await getCart();
        console.log("Received updated cart response:", updatedCartResponse);
        const updatedCart = updatedCartResponse.data;
        if (!updatedCart || typeof updatedCart !== "object") {
          throw new Error("Réponse de panier invalide (structure incorrecte)");
        }
        if (updatedCart.error) {
          throw new Error(`Erreur API: ${updatedCart.error}`);
        }
        if (!Array.isArray(updatedCart.items)) {
          throw new Error("Réponse de panier invalide (items non défini)");
        }
        setCart(updatedCart.items);
        const addedItem = updatedCart.items.find(
          (item) => item.productId?._id === product._id
        );
        const itemName =
          addedItem?.productId?.name || product.name || "Produit inconnu";
        
        // Afficher la notification moderne de succès
        setNotification({
          show: true,
          message: `${quantity} x ${itemName} a été ajouté au panier !`,
          type: 'success',
          itemType: 'cart',
          itemName: itemName,
          quantity: quantity,
          productPrice: product.price
        });
        
        // Auto-hide notification after 4 seconds
        setTimeout(() => {
          setNotification({ show: false, message: '', type: 'success' });
        }, 4000);
      } catch (error) {
        console.error(
          "Erreur lors de l'ajout au panier:",
          error.response?.data || error.message
        );
        setNotification({
          show: true,
          message: "Erreur lors de l'ajout au panier. Veuillez réessayer.",
          type: 'error'
        });
        setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000);
        setCart([]);
      }
    } else {
      setNotification({
        show: true,
        message: "Veuillez sélectionner une quantité valide.",
        type: 'error'
      });
      setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000);
    }
  };
  const bookWorkshop = async (workshop) => {
    const quantity = quantities[workshop._id] || 1;
    const availablePlaces = workshopPlaces[workshop._id] || 0;

    if (quantity <= 0) {
      setNotification({
        show: true,
        message: "Veuillez sélectionner une quantité valide.",
        type: 'error'
      });
      setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000);
      return;
    }

    if (quantity > availablePlaces) {
      setNotification({
        show: true,
        message: `Désolé, il ne reste que ${availablePlaces} place(s) disponible(s).`,
        type: 'error'
      });
      setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000);
      return;
    }

    try {
      await addBooking({ workshopId: workshop._id, quantity });
      const updatedBookings = await getBookings();
      setBookings(updatedBookings);
      setWorkshopPlaces((prev) => ({
        ...prev,
        [workshop._id]: availablePlaces - quantity
      }));
      setQuantities((prev) => ({ ...prev, [workshop._id]: 1 }));
      
      // Initialiser le timer de compte à rebours (5 minutes = 300 secondes)
      setTimeRemaining(prev => ({
        ...prev,
        [workshop._id]: 300
      }));

      // Afficher la notification moderne de réservation
      setNotification({
        show: true,
        message: `${quantity} place(s) pour ${workshop.title} a(ont) été réservé(s) ! Il reste ${availablePlaces - quantity} place(s).`,
        type: 'success',
        workshopId: workshop._id,
        quantity: quantity,
        remainingPlaces: availablePlaces - quantity
      });

      // Programmer l'annulation automatique après 5 minutes
      const cancelTimeout = setTimeout(async () => {
        try {
          // Annuler la réservation automatiquement
          const bookings = await getBookings();
          const bookingToCancel = bookings.data.find(b => 
            b.workshopId === workshop._id && 
            b.quantity === quantity &&
            b.status === 'pending'
          );
          
          if (bookingToCancel) {
            await removeBooking(bookingToCancel._id);
            setNotification({
              show: true,
              message: `Réservation pour ${workshop.title} annulée automatiquement (paiement non effectué dans les 5 minutes).`,
              type: 'warning'
            });
            
            // Mettre à jour les places disponibles
            setWorkshopPlaces((prev) => ({
              ...prev,
              [workshop._id]: (prev[workshop._id] || 0) + quantity
            }));
            
            // Mettre à jour la liste des réservations
            const updatedBookingsAfterCancel = await getBookings();
            setBookings(updatedBookingsAfterCancel);
          }
        } catch (error) {
          console.error('Erreur lors de l\'annulation automatique:', error);
        }
      }, 5 * 60 * 1000); // 5 minutes

      // Stocker le timeout pour pouvoir l'annuler si nécessaire
      setBookingTimeouts(prev => ({
        ...prev,
        [workshop._id]: cancelTimeout
      }));

    } catch (error) {
      console.error("Erreur lors de la réservation:", error);
      setNotification({
        show: true,
        message: "Erreur lors de la réservation. Veuillez réessayer.",
        type: 'error'
      });
      setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000);
      setWorkshopPlaces((prev) => ({
        ...prev,
        [workshop._id]: availablePlaces
      }));
    }
  };

 const handleQuantityChange = (id, value, max = Infinity) => {
 const n = Number.isFinite(value) ? value : 1;
  if (max <= 0) {
    // Pas de stock -> quantité forcée à 0 et input désactivé
     setQuantities(prev => ({ ...prev, [id]: 0 }));
  } else {
     const capped = Math.min(Math.max(1, n), max);
     setQuantities(prev => ({ ...prev, [id]: capped }));
   }
 };
const addToFavorites = async (item) => {
  const token = localStorage.getItem("token");
  if (!token) {
    setNotification({
      show: true,
      message: "Veuillez vous connecter pour ajouter aux favoris.",
      type: 'error'
    });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000);
    return;
  }
  try {
    const isFavorite = favorites.some((fav) => fav._id === item._id);
    const itemType = item.price !== undefined ? "product" : "workshop"; // Utilise item.price pour déterminer le type
    const favoriteData = {
      itemId: item._id,
      itemType: itemType,
    };
    console.log("Favorite data being sent:", favoriteData); // Vérifie les données

    if (isFavorite) {
      await removeFavorite(favoriteData);
      setFavorites(favorites.filter((fav) => fav._id !== item._id));
      setNotification({
        show: true,
        message: `"${item.name || item.title}" retiré des favoris !`,
        type: 'success',
        itemType: itemType,
        itemName: item.name || item.title
      });
    } else {
      await addFavorite(favoriteData);
      setFavorites([...favorites, { ...item, imageUrl: imageUrls[item._id] || (item.images && item.images[0]), itemType }]);
      setNotification({
        show: true,
        message: `"${item.name || item.title}" ajouté aux favoris !`,
        type: 'success',
        itemType: itemType,
        itemName: item.name || item.title
      });
    }
    
    // Auto-hide notification after 4 seconds
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 4000);
  } catch (err) {
    setError("Erreur lors de la gestion des favoris: " + err.message);
    setNotification({
      show: true,
      message: "Erreur lors de la gestion des favoris. Veuillez réessayer.",
      type: 'error'
    });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000);
    console.error("Favorite error:", err);
  }
};

  const isGoogleMapsLink = (text) => {
    return (
      text &&
      (text.startsWith("https://goo.gl") ||
        text.startsWith("https://google.com/maps"))
    );
  };

  useEffect(() => {
    const loadRecImages = async () => {
      const urls = {};
      for (const r of recommendations) {
        if (r.images && r.images.length > 0) {
          try {
            const response = await getPublicProductImage(r._id, 0);
            urls[r._id] = blobToUrl(response.data);
          } catch (err) {
            console.error(
              "Failed to fetch image for recommendation ID:",
              r._id,
              err
            );
            urls[r._id] = "/placeholder-image.jpg";
          }
        }
      }
      setImageUrls((prev) => ({ ...prev, ...urls }));
    };
    if (recommendations.length > 0) loadRecImages();
  }, [recommendations, blobToUrl]);

  return (
    <div
      style={{
        fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif',
        color: "#3a2f1a",
        minHeight: "100vh",
        backgroundColor: "#f8f1e9",
        margin: 0,
        padding: 0
      }}
    >
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
          {/* Logo */}
          <Link to="/" style={{
            fontSize: '2.2em',
            fontWeight: 700,
            color: '#fff',
            textDecoration: 'none',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            transition: 'transform 0.3s ease'
          }} onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'} onMouseOut={(e) => e.target.style.transform = 'scale(1)'}>
            CraftHub
          </Link>

          {/* Navigation */}
          <nav style={{
            display: 'flex',
            gap: '30px',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
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
              Explorer
            </Link>
            <Link to="/favorites-cart" style={{
              color: '#fff',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '1.1em',
              padding: '10px 20px',
              borderRadius: '25px',
              transition: 'all 0.3s ease',
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)'
            }} onMouseOver={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.2)';
              e.target.style.transform = 'translateY(-2px)';
            }} onMouseOut={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.1)';
              e.target.style.transform = 'translateY(0)';
            }}>
              Favoris
            </Link>
            <Link to="/panier" style={{
              color: '#fff',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '1.1em',
              padding: '10px 20px',
              borderRadius: '25px',
              transition: 'all 0.3s ease',
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)'
            }} onMouseOver={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.2)';
              e.target.style.transform = 'translateY(-2px)';
            }} onMouseOut={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.1)';
              e.target.style.transform = 'translateY(0)';
            }}>
              Panier
            </Link>
            <Link to="/workshop-booking" style={{
              color: '#fff',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '1.1em',
              padding: '10px 20px',
              borderRadius: '25px',
              transition: 'all 0.3s ease',
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)'
            }} onMouseOver={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.2)';
              e.target.style.transform = 'translateY(-2px)';
            }} onMouseOut={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.1)';
              e.target.style.transform = 'translateY(0)';
            }}>
              Réservations
            </Link>
            <Link to="/client-profile" style={{
              color: '#fff',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '1.1em',
              padding: '10px 20px',
              borderRadius: '25px',
              transition: 'all 0.3s ease',
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)'
            }} onMouseOver={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.2)';
              e.target.style.transform = 'translateY(-2px)';
            }} onMouseOut={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.1)';
              e.target.style.transform = 'translateY(0)';
            }}>
              Profil
            </Link>
            <Link to="/login" style={{
              color: '#8a5a44',
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
            Découvrez l'Artisanat Tunisien
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
            Explorez une collection unique de produits artisanaux authentiques et d'ateliers créatifs
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
              🎨 {products.length} Produits
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
              🛠️ {workshops.length} Ateliers
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
        {error && (
          <p
            style={{
              color: "#a94442",
              backgroundColor: "#f2dede",
              padding: "10px",
              borderRadius: "5px",
              textAlign: "center"
            }}
          >
            {error}
          </p>
        )}
        {loading && <p style={{ textAlign: "center" }}>Chargement...</p>}

        {/* ===== Dynamic Filters Section ===== */}
        <div style={{
          background: 'linear-gradient(135deg, #f8f1e9, #fff)',
          padding: '40px',
          borderRadius: '25px',
          marginBottom: '50px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          border: '1px solid rgba(138, 90, 68, 0.1)'
        }}>
          <h3 style={{
            fontSize: '1.8em',
            color: '#8a5a44',
            textAlign: 'center',
            marginBottom: '30px',
            fontWeight: 600
          }}>
            🔍 Filtres de Recherche - {activeTab === 'products' ? 'Produits' : 'Ateliers'}
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: activeTab === 'products' 
              ? 'repeat(auto-fit, minmax(250px, 1fr))' 
              : 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '25px',
            alignItems: 'end'
          }}>
            {/* Category Filter - Dynamic based on active tab */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '1.1em',
                fontWeight: 600,
                color: '#5c4b38',
                marginBottom: '10px'
              }}>
                📂 Catégorie {activeTab === 'products' ? 'Produits' : 'Ateliers'}
              </label>
              <select
                value={activeTab === 'products' ? filters.productCategory : filters.workshopCategory}
                onChange={(e) => setFilters({ 
                  ...filters, 
                  [activeTab === 'products' ? 'productCategory' : 'workshopCategory']: e.target.value 
                })}
                style={{
                  width: '100%',
                  padding: '15px 20px',
                  borderRadius: '15px',
                  border: '2px solid #d4a373',
                  backgroundColor: '#fff',
                  fontSize: '1em',
                  color: '#5c4b38',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
                }}
                onMouseOver={(e) => {
                  e.target.style.borderColor = '#8a5a44';
                  e.target.style.boxShadow = '0 6px 20px rgba(138, 90, 68, 0.15)';
                }}
                onMouseOut={(e) => {
                  e.target.style.borderColor = '#d4a373';
                  e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.05)';
                }}
              >
                {activeTab === 'products' ? (
                  <>
                    <option value="all">🌟 Toutes catégories produits</option>
                    <option value="Produits naturels, biologiques & bien-être">🌿 Produits naturels & bien-être</option>
                    <option value="Maison, décoration & art de vivre">🏠 Maison & décoration</option>
                    <option value="Mode, accessoires & bijoux">👗 Mode & bijoux</option>
                    <option value="Produits alimentaires artisanaux">🍯 Alimentaires artisanaux</option>
                    <option value="Jouets & loisirs créatifs">🎨 Jouets & loisirs</option>
                    <option value="Mobilier & artisanat utilitaire">🪑 Mobilier & utilitaire</option>
                    <option value="Arts visuels & artisanat artistique">🎭 Arts visuels</option>
                    <option value="Artisanat culturel & traditionnel">🏛️ Culturel & traditionnel</option>
                  </>
                ) : (
                  <>
                    <option value="all">🌟 Toutes catégories ateliers</option>
                    <option value="woodworking">🪵 Menuiserie</option>
                    <option value="pottery">🏺 Poterie</option>
                    <option value="jewelry">💎 Bijouterie</option>
                    <option value="painting">🎨 Peinture</option>
                    <option value="sculpture">🗿 Sculpture</option>
                    <option value="textiles">🧵 Textiles</option>
                    <option value="leatherwork">👜 Maroquinerie</option>
                    <option value="metalwork">⚒️ Métallurgie</option>
                    <option value="glasswork">🪟 Verrerie</option>
                    <option value="ceramics">🍶 Céramique</option>
                    <option value="basketry">🧺 Vannerie</option>
                    <option value="candlemaking">🕯️ Bougies</option>
                    <option value="soapmaking">🧼 Savonnerie</option>
                    <option value="cooking">👨‍🍳 Cuisine</option>
                    <option value="gardening">🌱 Jardinage</option>
                  </>
                )}
              </select>
            </div>

            {/* Price Filter */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '1.1em',
                fontWeight: 600,
                color: '#5c4b38',
                marginBottom: '10px'
              }}>
                💰 Prix
              </label>
              <select
                value={filters.priceRange}
                onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}
                style={{
                  width: '100%',
                  padding: '15px 20px',
                  borderRadius: '15px',
                  border: '2px solid #d4a373',
                  backgroundColor: '#fff',
                  fontSize: '1em',
                  color: '#5c4b38',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
                }}
                onMouseOver={(e) => {
                  e.target.style.borderColor = '#8a5a44';
                  e.target.style.boxShadow = '0 6px 20px rgba(138, 90, 68, 0.15)';
                }}
                onMouseOut={(e) => {
                  e.target.style.borderColor = '#d4a373';
                  e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.05)';
                }}
              >
                <option value="all">💎 Tous prix</option>
                <option value="0-50">💵 0 - 50 €</option>
                <option value="50-100">💸 50 - 100 €</option>
                <option value="100+">💎 100+ €</option>
              </select>
            </div>

            {/* Region Filter - Only for Workshops */}
            {activeTab === 'workshops' && (
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '1.1em',
                  fontWeight: 600,
                  color: '#5c4b38',
                  marginBottom: '10px'
                }}>
                  📍 Région
                </label>
                <select
                  value={filters.region}
                  onChange={(e) => setFilters({ ...filters, region: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '15px 20px',
                    borderRadius: '15px',
                    border: '2px solid #d4a373',
                    backgroundColor: '#fff',
                    fontSize: '1em',
                    color: '#5c4b38',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.borderColor = '#8a5a44';
                    e.target.style.boxShadow = '0 6px 20px rgba(138, 90, 68, 0.15)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.borderColor = '#d4a373';
                    e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.05)';
                  }}
                >
                  <option value="all">🌍 Toutes régions</option>
                  <option value="tunis">🏛️ Tunis</option>
                  <option value="sfax">🏭 Sfax</option>
                  <option value="sousse">🏖️ Sousse</option>
                  <option value="nabeul">🌺 Nabeul</option>
                  <option value="bizerte">⚓ Bizerte</option>
                  <option value="gabès">🏜️ Gabès</option>
                  <option value="monastir">🕌 Monastir</option>
                  <option value="kairouan">🕌 Kairouan</option>
                  <option value="gafsa">⛰️ Gafsa</option>
                  <option value="tozeur">🌴 Tozeur</option>
                  <option value="medenine">🏺 Medenine</option>
                  <option value="tataouine">🏜️ Tataouine</option>
                  <option value="kebili">🌵 Kebili</option>
                  <option value="kasserine">🏔️ Kasserine</option>
                  <option value="sidi bouzid">🌾 Sidi Bouzid</option>
                  <option value="mahdia">🏖️ Mahdia</option>
                  <option value="jendouba">🌲 Jendouba</option>
                  <option value="kef">🏔️ Kef</option>
                  <option value="siliana">🌿 Siliana</option>
                  <option value="manouba">🏘️ Manouba</option>
                  <option value="ben arous">🏢 Ben Arous</option>
                  <option value="ariana">🌹 Ariana</option>
                  <option value="zaghouan">🌿 Zaghouan</option>
                  <option value="béja">🌾 Béja</option>
                </select>
              </div>
            )}

            {/* Info Button */}
            <div style={{ display: 'flex', alignItems: 'end' }}>
              <Link
                to="/client-categories-info"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '15px 25px',
                  backgroundColor: '#8a5a44',
                  color: '#fff',
                  borderRadius: '15px',
                  fontWeight: '600',
                  textDecoration: 'none',
                  fontSize: '1em',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(138, 90, 68, 0.3)',
                  width: '100%',
                  justifyContent: 'center'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#a66c55';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(138, 90, 68, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = '#8a5a44';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(138, 90, 68, 0.3)';
                }}
              >
                ℹ️ En savoir plus
              </Link>
            </div>
          </div>
        </div>

        {/* ===== Tab Navigation ===== */}
        <div style={{
          background: '#fff',
          padding: '0',
          borderRadius: '20px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          marginBottom: '40px',
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
                fontSize: '1.1em',
                fontWeight: activeTab === 'products' ? 700 : 600,
                color: activeTab === 'products' ? '#fff' : '#8a5a44',
                padding: '20px 40px',
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
              🛍️ Produits ({finalFilteredProducts.length})
            </button>

            <button
              onClick={() => setActiveTab('workshops')}
              style={{
                background: activeTab === 'workshops' ? 'linear-gradient(45deg, #d4a373, #c78c5d)' : 'transparent',
                border: 'none',
                fontSize: '1.1em',
                fontWeight: activeTab === 'workshops' ? 700 : 600,
                color: activeTab === 'workshops' ? '#fff' : '#8a5a44',
                padding: '20px 40px',
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
              🛠️ Ateliers ({finalFilteredWorkshops.length})
            </button>
          </div>
        </div>

        {!loading && recommendations.length > 0 && (
          <div
            style={{
              margin: "50px 0",
              padding: "40px",
              background: 'linear-gradient(135deg, #f8f1e9, #fff)',
              borderRadius: "25px",
              boxShadow: "0 15px 35px rgba(0,0,0,0.1)",
              border: '1px solid rgba(138, 90, 68, 0.1)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Decorative Elements */}
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '80px',
              height: '80px',
              background: 'linear-gradient(45deg, #d4a373, #8a5a44)',
              borderRadius: '50%',
              opacity: 0.1
            }}></div>
            <div style={{
              position: 'absolute',
              bottom: '-30px',
              left: '-30px',
              width: '60px',
              height: '60px',
              background: 'linear-gradient(45deg, #8a5a44, #d4a373)',
              borderRadius: '50%',
              opacity: 0.1
            }}></div>
            
            <h3
              style={{
                fontSize: "2.2em",
                color: "#8a5a44",
                textAlign: "center",
                marginBottom: "30px",
                fontWeight: 700,
                textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
                position: 'relative',
                zIndex: 2
              }}
            >
              ⭐ Recommandations Personnalisées
            </h3>
            <p style={{
              textAlign: 'center',
              color: '#5c4b38',
              fontSize: '1.1em',
              marginBottom: '30px',
              opacity: 0.8
            }}>
              Découvrez nos suggestions spécialement sélectionnées pour vous
            </p>
            <div
              style={{
                display: "flex",
                overflowX: "auto",
                gap: "25px",
                paddingBottom: "20px",
                paddingRight: "10px"
              }}
            >
              {recommendations.map((item, index) => (
                <div
                  key={item._id}
                  className="card-hover"
                  style={{
                    minWidth: "220px",
                    backgroundColor: "#fff",
                    borderRadius: "20px",
                    padding: "20px",
                    boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
                    border: '1px solid rgba(138, 90, 68, 0.1)',
                    position: 'relative',
                    overflow: 'hidden',
                    animation: `slideIn 0.6s ease-out ${index * 0.1}s both`
                  }}
                >
                  {/* Badge Recommandé */}
                  <div style={{
                    position: 'absolute',
                    top: '15px',
                    right: '15px',
                    background: 'linear-gradient(45deg, #ff6b6b, #ff8e8e)',
                    color: '#fff',
                    padding: '5px 12px',
                    borderRadius: '15px',
                    fontSize: '0.8em',
                    fontWeight: 600,
                    boxShadow: '0 2px 8px rgba(255, 107, 107, 0.3)'
                  }}>
                    ⭐ Recommandé
                  </div>
                  <img
                    src={imageUrls[item._id] || "/placeholder-image.jpg"}
                    alt={item.name || "Product Image"}
                    style={{
                      width: "100%",
                      height: "140px",
                      objectFit: "cover",
                      borderRadius: "15px",
                      marginBottom: "15px",
                      boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                    }}
                    onError={(e) => {
                      e.target.src = "/placeholder-image.jpg";
                      e.target.style.opacity = "0.5";
                    }}
                  />
                  <h4
                    style={{
                      fontSize: "1.1em",
                      color: "#5a4032",
                      margin: "0 0 10px 0",
                      fontWeight: 600,
                      lineHeight: '1.3',
                      minHeight: '2.6em',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {item.name || "Produit"}
                  </h4>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '15px'
                  }}>
                    <span style={{
                      fontSize: "1.2em",
                      color: "#8a5a44",
                      fontWeight: 700
                    }}>
                      {item.price !== undefined ? `${item.price} €` : "N/A"}
                    </span>
                    <span style={{
                      fontSize: "0.9em",
                      color: "#7a6a53",
                      background: '#f8f1e9',
                      padding: '4px 8px',
                      borderRadius: '10px'
                    }}>
                      En stock
                    </span>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    gap: '10px',
                    flexDirection: 'column'
                  }}>
                    <Link
                      to={`/product/${item._id}`}
                      style={{
                        color: "#8a5a44",
                        fontSize: "0.95em",
                        textDecoration: "none",
                        textAlign: 'center',
                        padding: '8px 0',
                        border: '1px solid #d4a373',
                        borderRadius: '10px',
                        transition: 'all 0.3s ease',
                        fontWeight: 600
                      }}
                      onMouseOver={(e) => {
                        e.target.style.backgroundColor = '#d4a373';
                        e.target.style.color = '#fff';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                        e.target.style.color = '#8a5a44';
                      }}
                    >
                      👁️ Voir détails
                    </Link>
                    <button
                      onClick={() => handleAddToCart(item)}
                      style={{
                        padding: "10px 15px",
                        background: 'linear-gradient(45deg, #d4a373, #c78c5d)',
                        color: "#fff",
                        border: "none",
                        borderRadius: "12px",
                        cursor: "pointer",
                        fontSize: "0.9em",
                        fontWeight: 600,
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 15px rgba(212, 163, 115, 0.3)'
                      }}
                      onMouseOver={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 6px 20px rgba(212, 163, 115, 0.4)';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 15px rgba(212, 163, 115, 0.3)';
                      }}
                    >
                      🛒 Ajouter au panier
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== Barre de Recherche ===== */}
        <div style={{
          background: '#fff',
          padding: '30px',
          borderRadius: '20px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          marginBottom: '30px',
          border: '1px solid rgba(138, 90, 68, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            marginBottom: '20px'
          }}>
            <div style={{
              fontSize: '1.5em',
              color: '#8a5a44'
            }}>
              🔍
            </div>
            <h3 style={{
              fontSize: '1.3em',
              fontWeight: '600',
              color: '#2c3e50',
              margin: 0
            }}>
              Recherche Dynamique
            </h3>
          </div>
          
          <div style={{
            position: 'relative',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            <input
              type="text"
              placeholder="Rechercher par nom de produit, artisan ou atelier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '15px 20px 15px 50px',
                border: '2px solid #e9ecef',
                borderRadius: '25px',
                fontSize: '1em',
                outline: 'none',
                transition: 'all 0.3s ease',
                backgroundColor: '#f8f9fa'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#8a5a44';
                e.target.style.backgroundColor = '#fff';
                e.target.style.boxShadow = '0 4px 15px rgba(138, 90, 68, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e9ecef';
                e.target.style.backgroundColor = '#f8f9fa';
                e.target.style.boxShadow = 'none';
              }}
            />
            <div style={{
              position: 'absolute',
              left: '18px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '1.2em',
              color: '#8a5a44'
            }}>
              🔍
            </div>
            
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  position: 'absolute',
                  right: '15px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  fontSize: '1.2em',
                  color: '#6c757d',
                  cursor: 'pointer',
                  padding: '5px',
                  borderRadius: '50%',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#e9ecef';
                  e.target.style.color = '#dc3545';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#6c757d';
                }}
              >
                ✕
              </button>
            )}
          </div>
          
          {searchTerm && (
            <div style={{
              marginTop: '15px',
              textAlign: 'center',
              color: '#6c757d',
              fontSize: '0.9em'
            }}>
              {finalFilteredProducts.length + finalFilteredWorkshops.length} résultat{(finalFilteredProducts.length + finalFilteredWorkshops.length) > 1 ? 's' : ''} trouvé{(finalFilteredProducts.length + finalFilteredWorkshops.length) > 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* ===== Content Area ===== */}
        <div style={{
          background: '#fff',
          borderRadius: '20px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          border: '1px solid rgba(138, 90, 68, 0.1)',
          overflow: 'hidden',
          minHeight: '600px'
        }}>
          {/* Products Section */}
          {activeTab === 'products' && (
            <div style={{ padding: '40px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '40px',
                flexWrap: 'wrap',
                gap: '20px'
              }}>
                <h3 style={{ 
                  color: "#8a5a44", 
                  fontSize: "2.2em", 
                  margin: 0,
                  fontWeight: 700,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
                }}>
                  🛍️ Nos Produits Artisanaux
                </h3>
                <div style={{
                  background: 'linear-gradient(45deg, #d4a373, #8a5a44)',
                  color: '#fff',
                  padding: '10px 20px',
                  borderRadius: '20px',
                  fontSize: '1em',
                  fontWeight: 600,
                  boxShadow: '0 4px 15px rgba(138, 90, 68, 0.3)'
                }}>
                  {finalFilteredProducts.length} produit{finalFilteredProducts.length > 1 ? 's' : ''} trouvé{finalFilteredProducts.length > 1 ? 's' : ''}
                </div>
              </div>
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "30px",
            marginBottom: "60px"
          }}
        >
         {finalFilteredProducts.length > 0 ? (
  finalFilteredProducts.map((p, index) => {
    const available = Number(p.stock) || 0;
    const currentQty = quantities[p._id] ?? 1;

    return (
      <li
        key={p._id}
        className="card-hover"
        style={{
          backgroundColor: "#fff",
          borderRadius: "20px",
          padding: "0",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          border: '1px solid rgba(138, 90, 68, 0.1)',
          overflow: 'hidden',
          position: 'relative',
          animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
        }}
      >
        {/* Product Image */}
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          {imageUrls[p._id] && (
            <img
              src={imageUrls[p._id]}
              alt={p.name}
              style={{
                width: "100%",
                height: "200px",
                objectFit: "cover",
                transition: 'transform 0.3s ease'
              }}
              onError={(e) => {
                e.target.style.display = "none";
                console.log("Image load failed for product ID:", p._id);
              }}
            />
          )}
          
          {/* Stock Badge */}
          <div style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            background: available > 0 ? 'linear-gradient(45deg, #4CAF50, #66BB6A)' : 'linear-gradient(45deg, #f44336, #ef5350)',
            color: '#fff',
            padding: '6px 12px',
            borderRadius: '15px',
            fontSize: '0.8em',
            fontWeight: 600,
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
          }}>
            {available > 0 ? `📦 ${available} en stock` : '❌ Épuisé'}
          </div>
        </div>

        {/* Product Info */}
        <div style={{ padding: '20px' }}>
          <h4 style={{
            fontSize: '1.2em',
            color: '#5a4032',
            margin: '0 0 10px 0',
            fontWeight: 600,
            lineHeight: '1.3',
            minHeight: '2.6em',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {p.name}
          </h4>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '15px'
          }}>
            <span style={{
              fontSize: '1.4em',
              color: '#8a5a44',
              fontWeight: 700
            }}>
              {p.price} €
            </span>
            <span style={{
              fontSize: '0.9em',
              color: '#7a6a53',
              background: '#f8f1e9',
              padding: '4px 8px',
              borderRadius: '10px'
            }}>
              {p.category}
            </span>
          </div>

          <p style={{
            fontSize: "0.9em",
            color: "#5c4b38",
            margin: "0 0 15px 0",
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            👨‍🎨 Par{" "}
            {p.artisanId && p.artisanId._id ? (
              <Link
                to={`/client-artisan-profile/${p.artisanId._id}`}
                style={{
                  color: "#d4a373",
                  textDecoration: "none",
                  fontWeight: 600,
                  transition: 'color 0.3s ease'
                }}
                onMouseOver={(e) => e.target.style.color = '#8a5a44'}
                onMouseOut={(e) => e.target.style.color = '#d4a373'}
              >
                {p.artisanId.prenom} {p.artisanId.nom}
              </Link>
            ) : (
              "Artisan inconnu"
            )}
          </p>

          {/* Quantity and Actions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '15px',
            flexWrap: 'wrap'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#f8f1e9',
              padding: '8px 12px',
              borderRadius: '12px',
              border: '1px solid #d4a373'
            }}>
              <label style={{
                fontSize: '0.9em',
                color: '#5c4b38',
                fontWeight: 600
              }}>
                Qté:
              </label>
              <input
                type="number"
                min={available > 0 ? 1 : 0}
                max={available}
                value={available > 0 ? Math.min(currentQty, available) : 0}
                disabled={available <= 0}
                onChange={(e) =>
                  handleQuantityChange(
                    p._id,
                    parseInt(e.target.value, 10),
                    available
                  )
                }
                style={{
                  width: '60px',
                  padding: '6px 8px',
                  borderRadius: '8px',
                  border: '1px solid #d4a373',
                  textAlign: 'center',
                  fontSize: '0.9em',
                  opacity: available > 0 ? 1 : 0.5,
                  backgroundColor: available > 0 ? '#fff' : '#f5f5f5'
                }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '10px',
            flexDirection: 'column'
          }}>
            <button
              onClick={() => handleAddToCart(p)}
              disabled={available <= 0 || currentQty < 1 || currentQty > available}
              title={available > 0 ? "" : "Stock épuisé"}
              style={{
                padding: "12px 20px",
                background: available > 0 ? 'linear-gradient(45deg, #d4a373, #c78c5d)' : 'linear-gradient(45deg, #c7b8a5, #b8a595)',
                color: "#fff",
                border: "none",
                borderRadius: "12px",
                cursor: available > 0 ? "pointer" : "not-allowed",
                transition: "all 0.3s ease",
                fontSize: '0.95em',
                fontWeight: 600,
                boxShadow: available > 0 ? '0 4px 15px rgba(212, 163, 115, 0.3)' : 'none'
              }}
              onMouseOver={(e) => {
                if (available > 0) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(212, 163, 115, 0.4)';
                }
              }}
              onMouseOut={(e) => {
                if (available > 0) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(212, 163, 115, 0.3)';
                }
              }}
            >
              {available > 0 ? "🛒 Ajouter au panier" : "❌ Stock épuisé"}
            </button>

            <div style={{
              display: 'flex',
              gap: '8px'
            }}>
              <button
                onClick={() => addToFavorites(p)}
                style={{
                  flex: 1,
                  padding: "10px 15px",
                  background: favorites.some((fav) => fav._id === p._id)
                    ? 'linear-gradient(45deg, #ff4d4d, #ff6666)'
                    : 'linear-gradient(45deg, #ff9999, #ffb3b3)',
                  color: "#fff",
                  border: "none",
                  borderRadius: "10px",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  fontSize: '0.9em',
                  fontWeight: 600,
                  boxShadow: '0 3px 10px rgba(255, 77, 77, 0.3)'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 5px 15px rgba(255, 77, 77, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 3px 10px rgba(255, 77, 77, 0.3)';
                }}
              >
                {favorites.some((fav) => fav._id === p._id) ? "❤️" : "🤍"}
              </button>

              <Link
                to={`/product/${p._id}`}
                style={{
                  flex: 1,
                  color: "#8a5a44",
                  textDecoration: "none",
                  textAlign: 'center',
                  padding: '10px 15px',
                  border: '1px solid #d4a373',
                  borderRadius: '10px',
                  transition: 'all 0.3s ease',
                  fontSize: '0.9em',
                  fontWeight: 600,
                  background: 'transparent'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#d4a373';
                  e.target.style.color = '#fff';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#8a5a44';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                👁️ Voir
              </Link>
            </div>
          </div>
        </div>
      </li>
    );
  })
) : (
  <p style={{ color: "#5c4b38", textAlign: "center", width: "100%" }}>
    Aucun produit disponible pour le moment.
  </p>
)}
              </ul>
            </div>
          )}

          {/* Workshops Section */}
          {activeTab === 'workshops' && (
            <div style={{ padding: '40px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '40px',
                flexWrap: 'wrap',
                gap: '20px'
              }}>
                <h3 style={{ 
                  color: "#8a5a44", 
                  fontSize: "2.2em", 
                  margin: 0,
                  fontWeight: 700,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
                }}>
                  🛠️ Ateliers Créatifs
                </h3>
                <div style={{
                  background: 'linear-gradient(45deg, #d4a373, #8a5a44)',
                  color: '#fff',
                  padding: '10px 20px',
                  borderRadius: '20px',
                  fontSize: '1em',
                  fontWeight: 600,
                  boxShadow: '0 4px 15px rgba(138, 90, 68, 0.3)'
                }}>
                  {finalFilteredWorkshops.length} atelier{finalFilteredWorkshops.length > 1 ? 's' : ''} trouvé{finalFilteredWorkshops.length > 1 ? 's' : ''}
                </div>
              </div>
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
                    gap: "30px"
                  }}
                >
                  
                  {finalFilteredWorkshops.length > 0 ? (
                    finalFilteredWorkshops.map((w, index) => (
                      <li
                        key={w._id}
                        className="card-hover"
                        style={{
                          backgroundColor: "#fff",
                          borderRadius: "20px",
                          padding: "0",
                          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                          border: '1px solid rgba(138, 90, 68, 0.1)',
                          overflow: 'hidden',
                          position: 'relative',
                          animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                        }}
                      >
                        {/* Workshop Image */}
                        <div style={{ position: 'relative', overflow: 'hidden' }}>
                          {imageUrls[w._id] && (
                            <img
                              src={imageUrls[w._id]}
                              alt={w.title}
                              style={{
                                width: "100%",
                                height: "200px",
                                objectFit: "cover",
                                transition: 'transform 0.3s ease'
                              }}
                              onError={(e) => {
                                e.target.style.display = "none";
                                console.log("Image load failed for workshop ID:", w._id);
                              }}
                            />
                          )}
                          
                          {/* Places Badge */}
                          <div style={{
                            position: 'absolute',
                            top: '15px',
                            right: '15px',
                            background: (workshopPlaces[w._id] || w.places || 10) > 0 
                              ? 'linear-gradient(45deg, #4CAF50, #66BB6A)' 
                              : 'linear-gradient(45deg, #f44336, #ef5350)',
                            color: '#fff',
                            padding: '6px 12px',
                            borderRadius: '15px',
                            fontSize: '0.8em',
                            fontWeight: 600,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                          }}>
                            {(workshopPlaces[w._id] || w.places || 10) > 0 
                              ? `🎫 ${workshopPlaces[w._id] || w.places || 10} places` 
                              : '❌ Complet'}
                          </div>

                          {/* Date Badge */}
                          <div style={{
                            position: 'absolute',
                            top: '15px',
                            left: '15px',
                            background: 'rgba(0,0,0,0.7)',
                            color: '#fff',
                            padding: '6px 12px',
                            borderRadius: '15px',
                            fontSize: '0.8em',
                            fontWeight: 600,
                            backdropFilter: 'blur(10px)'
                          }}>
                            📅 {new Date(w.date).toLocaleDateString('fr-FR')}
                          </div>
                        </div>

                        {/* Workshop Info */}
                        <div style={{ padding: '20px' }}>
                          <h4 style={{
                            fontSize: '1.3em',
                            color: '#5a4032',
                            margin: '0 0 15px 0',
                            fontWeight: 600,
                            lineHeight: '1.3',
                            minHeight: '2.6em',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                            {w.title}
                          </h4>
                          
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '15px'
                          }}>
                            <span style={{
                              fontSize: '1.4em',
                              color: '#8a5a44',
                              fontWeight: 700
                            }}>
                              {w.price || "N/A"} €
                            </span>
                            <span style={{
                              fontSize: '0.9em',
                              color: '#7a6a53',
                              background: '#f8f1e9',
                              padding: '4px 8px',
                              borderRadius: '10px'
                            }}>
                              {w.category}
                            </span>
                          </div>

                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            marginBottom: '15px'
                          }}>
                            <p style={{
                              fontSize: "0.9em",
                              color: "#5c4b38",
                              margin: 0,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px'
                            }}>
                              👨‍🎨 Par{" "}
                              {w.artisanId && w.artisanId._id ? (
                                <Link
                                  to={`/client-artisan-profile/${w.artisanId._id}`}
                                  style={{
                                    color: "#d4a373",
                                    textDecoration: "none",
                                    fontWeight: 600,
                                    transition: 'color 0.3s ease'
                                  }}
                                  onMouseOver={(e) => e.target.style.color = '#8a5a44'}
                                  onMouseOut={(e) => e.target.style.color = '#d4a373'}
                                >
                                  {w.artisanId.prenom} {w.artisanId.nom}
                                </Link>
                              ) : (
                                "Artisan inconnu"
                              )}
                            </p>
                            
                            <p style={{
                              fontSize: "0.9em",
                              color: "#5c4b38",
                              margin: 0,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px'
                            }}>
                              📍 Lieu:{" "}
                              {isGoogleMapsLink(w.location) ? (
                                <a
                                  href={w.location}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ 
                                    color: "#d4a373", 
                                    textDecoration: "none",
                                    fontWeight: 600,
                                    transition: 'color 0.3s ease'
                                  }}
                                  onMouseOver={(e) => e.target.style.color = '#8a5a44'}
                                  onMouseOut={(e) => e.target.style.color = '#d4a373'}
                                >
                                  Voir sur la carte
                                </a>
                              ) : (
                                <span style={{ fontWeight: 600 }}>{w.location}</span>
                              )}
                            </p>
                          </div>
                          {/* Quantity and Actions */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            marginBottom: '15px',
                            flexWrap: 'wrap'
                          }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              background: '#f8f1e9',
                              padding: '8px 12px',
                              borderRadius: '12px',
                              border: '1px solid #d4a373'
                            }}>
                              <label style={{
                                fontSize: '0.9em',
                                color: '#5c4b38',
                                fontWeight: 600
                              }}>
                                Places:
                              </label>
                              <input
                                type="number"
                                min="1"
                                max={workshopPlaces[w._id] || w.places || 10}
                                value={quantities[w._id] || 1}
                                onChange={(e) =>
                                  handleQuantityChange(w._id, parseInt(e.target.value))
                                }
                                style={{
                                  width: '60px',
                                  padding: '6px 8px',
                                  borderRadius: '8px',
                                  border: '1px solid #d4a373',
                                  textAlign: 'center',
                                  fontSize: '0.9em',
                                  backgroundColor: '#fff'
                                }}
                              />
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div style={{
                            display: 'flex',
                            gap: '10px',
                            flexDirection: 'column'
                          }}>
                            <button
                              onClick={() => !isWorkshopExpired(w.date) && bookWorkshop(w)}
                              disabled={isWorkshopExpired(w.date)}
                              style={{
                                padding: "12px 20px",
                                background: isWorkshopExpired(w.date) 
                                  ? 'linear-gradient(45deg, #9ca3af, #6b7280)'
                                  : 'linear-gradient(45deg, #8a5a44, #704838)',
                                color: "#fff",
                                border: "none",
                                borderRadius: "12px",
                                cursor: isWorkshopExpired(w.date) ? "not-allowed" : "pointer",
                                transition: "all 0.3s ease",
                                fontSize: '0.95em',
                                fontWeight: 600,
                                boxShadow: isWorkshopExpired(w.date) 
                                  ? '0 2px 8px rgba(156, 163, 175, 0.3)'
                                  : '0 4px 15px rgba(138, 90, 68, 0.3)',
                                opacity: isWorkshopExpired(w.date) ? 0.6 : 1
                              }}
                              onMouseOver={(e) => {
                                if (!isWorkshopExpired(w.date)) {
                                  e.target.style.transform = 'translateY(-2px)';
                                  e.target.style.boxShadow = '0 6px 20px rgba(138, 90, 68, 0.4)';
                                }
                              }}
                              onMouseOut={(e) => {
                                if (!isWorkshopExpired(w.date)) {
                                  e.target.style.transform = 'translateY(0)';
                                  e.target.style.boxShadow = '0 4px 15px rgba(138, 90, 68, 0.3)';
                                }
                              }}
                            >
                              {isWorkshopExpired(w.date) ? '⏰ Atelier expiré' : '🎫 Réserver maintenant'}
                            </button>

                            <Link
                              to={`/workshop/${w._id}`}
                              style={{
                                color: "#8a5a44",
                                textDecoration: "none",
                                textAlign: 'center',
                                padding: '10px 15px',
                                border: '1px solid #d4a373',
                                borderRadius: '10px',
                                transition: 'all 0.3s ease',
                                fontSize: '0.9em',
                                fontWeight: 600,
                                background: 'transparent'
                              }}
                              onMouseOver={(e) => {
                                e.target.style.backgroundColor = '#d4a373';
                                e.target.style.color = '#fff';
                                e.target.style.transform = 'translateY(-1px)';
                              }}
                              onMouseOut={(e) => {
                                e.target.style.backgroundColor = 'transparent';
                                e.target.style.color = '#8a5a44';
                                e.target.style.transform = 'translateY(0)';
                              }}
                            >
                              👁️ Voir détails
                            </Link>
                          </div>
                        </div>
                      </li>
                    ))
                  ) : (
                    <div style={{
                      gridColumn: '1 / -1',
                      textAlign: 'center',
                      padding: '60px 20px',
                      background: 'linear-gradient(135deg, #f8f1e9, #fff)',
                      borderRadius: '20px',
                      border: '1px solid rgba(138, 90, 68, 0.1)'
                    }}>
                      <div style={{
                        fontSize: '4em',
                        marginBottom: '20px'
                      }}>
                        🛠️
                      </div>
                      <h4 style={{
                        color: "#8a5a44",
                        fontSize: '1.5em',
                        marginBottom: '10px',
                        fontWeight: 600
                      }}>
                        Aucun atelier disponible
                      </h4>
                      <p style={{
                        color: "#5c4b38",
                        fontSize: '1.1em',
                        opacity: 0.8
                      }}>
                        Revenez bientôt pour découvrir nos nouveaux ateliers créatifs !
                      </p>
                    </div>
                  )}
              </ul>
            </div>
          )}
        </div>
      </div>
      

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
              <Link to="/client-home" style={{
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
                Explorer
              </Link>
              <Link to="/favorites-cart" style={{
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
                Favoris
              </Link>
              <Link to="/panier" style={{
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
                Panier
              </Link>
              <Link to="/workshop-booking" style={{
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
                Réservations
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

      {/* ===== Modern Notification ===== */}
      {notification.show && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 10000,
          animation: 'slideIn 0.5s ease-out'
        }}>
          <div style={{
            background: notification.type === 'success' 
              ? 'linear-gradient(135deg, #28a745, #20c997)' 
              : notification.type === 'error'
              ? 'linear-gradient(135deg, #dc3545, #fd7e14)'
              : 'linear-gradient(135deg, #ffc107, #fd7e14)',
            color: '#fff',
            padding: '24px 32px',
            borderRadius: '20px',
            boxShadow: '0 15px 40px rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)',
            minWidth: '350px',
            maxWidth: '450px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Decorative elements */}
            <div style={{
              position: 'absolute',
              top: '-15px',
              right: '-15px',
              width: '40px',
              height: '40px',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '50%',
              opacity: 0.5
            }}></div>
            <div style={{
              position: 'absolute',
              bottom: '-20px',
              left: '-20px',
              width: '50px',
              height: '50px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '50%',
              opacity: 0.3
            }}></div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              position: 'relative',
              zIndex: 2
            }}>
              <div style={{
                fontSize: '2.5em',
                filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))'
              }}>
                {notification.type === 'success' ? 
                  (notification.workshopId ? '✅' : 
                   notification.itemType === 'cart' ? '🛒' : '❤️') : 
                  notification.type === 'error' ? '❌' : '⚠️'}
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{
                  margin: '0 0 8px 0',
                  fontSize: '1.3em',
                  fontWeight: 700,
                  textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
                }}>
                  {notification.type === 'success' ? 
                    (notification.workshopId ? 'Réservation confirmée !' : 
                     notification.itemType === 'cart' ? 'Produit ajouté au panier !' : 'Favoris mis à jour !') : 
                   notification.type === 'error' ? 'Erreur' : 'Attention !'}
                </h4>
                <p style={{
                  margin: '0 0 12px 0',
                  fontSize: '1.1em',
                  opacity: 0.95,
                  lineHeight: '1.4'
                }}>
                  {notification.message}
                </p>
                
                {/* Timer d'annulation automatique pour les réservations */}
                {notification.type === 'success' && notification.workshopId && timeRemaining[notification.workshopId] && (
                  <div style={{
                    background: 'rgba(255,255,255,0.2)',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    marginTop: '12px',
                    border: '1px solid rgba(255,255,255,0.3)'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '8px'
                    }}>
                      <span style={{ fontSize: '1.2em' }}>⏰</span>
                      <span style={{ fontWeight: 600, fontSize: '1em' }}>
                        Annulation automatique dans :
                      </span>
                    </div>
                    <div style={{
                      fontSize: '1.4em',
                      fontWeight: 700,
                      textAlign: 'center',
                      background: 'rgba(255,255,255,0.1)',
                      padding: '8px',
                      borderRadius: '8px',
                      fontFamily: 'monospace'
                    }}>
                      {Math.floor(timeRemaining[notification.workshopId] / 60)}:{(timeRemaining[notification.workshopId] % 60).toString().padStart(2, '0')}
                    </div>
                    <p style={{
                      margin: '8px 0 0 0',
                      fontSize: '0.9em',
                      opacity: 0.8,
                      textAlign: 'center'
                    }}>
                      Effectuez le paiement pour confirmer votre réservation
                    </p>
                  </div>
                )}

                {/* Section spéciale pour les favoris */}
                {notification.type === 'success' && notification.itemType && notification.itemType !== 'cart' && !notification.workshopId && (
                  <div style={{
                    background: 'rgba(255,255,255,0.2)',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    marginTop: '12px',
                    border: '1px solid rgba(255,255,255,0.3)'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '8px'
                    }}>
                      <span style={{ fontSize: '1.2em' }}>
                        {notification.itemType === 'product' ? '🛍️' : '🎨'}
                      </span>
                      <span style={{ fontWeight: 600, fontSize: '1em' }}>
                        {notification.itemType === 'product' ? 'Produit' : 'Atelier'} ajouté aux favoris
                      </span>
                    </div>
                    <div style={{
                      fontSize: '1.1em',
                      fontWeight: 600,
                      textAlign: 'center',
                      background: 'rgba(255,255,255,0.1)',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      marginBottom: '8px'
                    }}>
                      "{notification.itemName}"
                    </div>
                    <p style={{
                      margin: '0',
                      fontSize: '0.9em',
                      opacity: 0.8,
                      textAlign: 'center'
                    }}>
                      {notification.itemType === 'product' 
                        ? 'Retrouvez-le dans votre liste de favoris' 
                        : 'Retrouvez-le dans vos ateliers favoris'}
                    </p>
                  </div>
                )}

                {/* Section spéciale pour le panier */}
                {notification.type === 'success' && notification.itemType === 'cart' && (
                  <div style={{
                    background: 'rgba(255,255,255,0.2)',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    marginTop: '12px',
                    border: '1px solid rgba(255,255,255,0.3)'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '8px'
                    }}>
                      <span style={{ fontSize: '1.2em' }}>🛒</span>
                      <span style={{ fontWeight: 600, fontSize: '1em' }}>
                        Produit ajouté au panier
                      </span>
                    </div>
                    <div style={{
                      fontSize: '1.1em',
                      fontWeight: 600,
                      textAlign: 'center',
                      background: 'rgba(255,255,255,0.1)',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      marginBottom: '8px'
                    }}>
                      "{notification.itemName}"
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px',
                      fontSize: '0.9em'
                    }}>
                      <span>Quantité: <strong>{notification.quantity}</strong></span>
                      <span>Prix: <strong>{notification.productPrice} €</strong></span>
                    </div>
                    <p style={{
                      margin: '0',
                      fontSize: '0.9em',
                      opacity: 0.8,
                      textAlign: 'center'
                    }}>
                      Retrouvez-le dans votre panier pour finaliser votre commande
                    </p>
                  </div>
                )}
              </div>
              <button
                onClick={() => setNotification({ show: false, message: '', type: 'success' })}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  color: '#fff',
                  fontSize: '1.5em',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.3)'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.3)';
                  e.target.style.transform = 'scale(1.1)';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.2)';
                  e.target.style.transform = 'scale(1)';
                }}
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS pour l'animation */}
      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
}

export default PublicBrowse;
