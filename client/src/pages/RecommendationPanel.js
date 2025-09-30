import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { getPublicProductImage } from '../services/api'; // Ajuste le chemin selon la structure de ton projet

const RecommendationPanel = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMounted = useRef(true);

  // Fonction pour convertir un blob en URL
  const blobToUrl = useCallback((blob) => {
    return blob ? URL.createObjectURL(blob) : '/placeholder-image.jpg';
  }, []);

  useEffect(() => {
    isMounted.current = true;
    const fetchData = async () => {
      const checkConnectivity = async () => {
        try {
          await axios.post('http://localhost:5001/test', { test: 'ping' }, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 5000,
          });
          return true;
        } catch (err) {
          console.error('Backend connectivity error:', err.message);
          return false;
        }
      };

      const token = localStorage.getItem('token');
      console.log('Token from localStorage:', token ? 'Found' : 'Not found');
      let userId = null;

      if (!token) {
        if (isMounted.current) setError('No authentication token found. Please log in.');
        setLoading(false);
        return;
      }

      try {
        const decodedToken = jwtDecode(token);
        console.log('Decoded token payload:', decodedToken);
        userId = decodedToken.userId || decodedToken.id || decodedToken.sub || decodedToken.user_id;
        if (!userId) {
          if (isMounted.current) setError('No userId found in token. Contact support.');
          setLoading(false);
          return;
        }
        console.log('Extracted userId:', userId);
      } catch (err) {
        if (isMounted.current) setError('Invalid authentication token');
        console.error('Token decode error:', err);
        setLoading(false);
        return;
      }

      const isConnected = await checkConnectivity();
      if (!isConnected) {
        if (isMounted.current) setError('Unable to connect to the recommendation service.');
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching recommendations for userId:', userId);
        const response = await axios.post('http://localhost:5001/recommend', { userId }, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000,
        });
        console.log('Raw response data:', response.data);
        const recs = response.data.recommendations || [];
        if (!Array.isArray(recs)) {
          throw new Error('Invalid recommendations data format: ' + JSON.stringify(response.data));
        }
        if (isMounted.current) setRecommendations(recs);
      } catch (error) {
        const errorMessage = error.response?.data?.error || 'Failed to fetch recommendations';
        if (isMounted.current) setError(errorMessage);
        console.error('Fetch error:', error.message, error.response?.data);
      } finally {
        if (isMounted.current) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted.current = false;
    };
  }, []);

  // Précharger les images pour éviter les glitches
  const preloadedImages = useMemo(() => {
    return recommendations.map((item) => ({
      ...item,
      imageUrl: item.images && item.images[0] ? blobToUrl(new Blob([new Uint8Array()], { type: 'image/jpeg' })) : '/placeholder-image.jpg',
    }));
  }, [recommendations, blobToUrl]);

  useEffect(() => {
    const loadImages = async () => {
      const updatedRecs = await Promise.all(
        preloadedImages.map(async (item) => {
          if (item.images && item.images[0]) {
            try {
              const response = await getPublicProductImage(item._id, 0);
              const imageUrl = blobToUrl(response.data);
              console.log(`Image loaded for product ${item._id}:`, imageUrl);
              return { ...item, imageUrl };
            } catch (err) {
              console.error(`Failed to load image for product ${item._id}:`, err);
              return { ...item, imageUrl: '/placeholder-image.jpg' };
            }
          }
          return item;
        })
      );
      if (isMounted.current) setRecommendations(updatedRecs);
    };
    if (preloadedImages.length > 0) loadImages();
  }, [preloadedImages, blobToUrl, getPublicProductImage]);

  if (loading) {
    return (
      <div className="recommendation-panel">
        <h2 className="recommendation-title">Recommendations for You</h2>
        <p className="recommendation-message">Loading recommendations...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="recommendation-panel">
        <h2 className="recommendation-title">Recommendations for You</h2>
        <p className="recommendation-message error">{error}</p>
      </div>
    );
  }
  if (!recommendations.length) {
    return (
      <div className="recommendation-panel">
        <h2 className="recommendation-title">Recommendations for You</h2>
        <p className="recommendation-message">Explore our products to get personalized recommendations!</p>
      </div>
    );
  }

  return (
    <div className="recommendation-panel">
      <h2 className="recommendation-title">Recommendations for You</h2>
      <div className="recommendation-list">
        {recommendations.map((item) => (
          <div key={item._id} className="recommendation-item">
            <img
              src={item.imageUrl || '/placeholder-image.jpg'}
              alt={item.name || 'Product Image'}
              className="recommendation-image"
              onError={(e) => { e.target.src = '/placeholder-image.jpg'; e.target.style.opacity = '0.5'; }}
            />
            <div className="recommendation-details">
              <h3 className="recommendation-name">{item.name || 'Unnamed Product'}</h3>
              <p className="recommendation-price">Price: {item.price !== undefined ? item.price : 'N/A'} €</p>
              <p className="recommendation-category">Category: {item.category || 'Uncategorized'}</p>
              <Link to={`/product/${item._id}`} className="recommendation-link">View Details</Link>
              <button className="recommendation-button" onClick={() => addToCart(item._id)}>Add to Cart</button>
            </div>
          </div>
        ))}
      </div>

      <style>
        {`
          .recommendation-panel {
            padding: 20px;
            background-color: #f5f0e7;
            border-radius: 12px;
            margin: 20px auto;
            max-width: 1200px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            font-family: 'Georgia', serif;
            transition: opacity 0.3s ease;
          }
          .recommendation-title {
            text-align: center;
            margin-bottom: 20px;
            color: #5a4032;
            font-size: 1.5em;
            font-weight: 600;
          }
          .recommendation-list {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 20px;
            justify-content: center;
          }
          .recommendation-item {
            background: #ffffff;
            border: 1px solid #e0d4c4;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            overflow: hidden;
          }
          .recommendation-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
          }
          .recommendation-image {
            width: 100%;
            height: 180px;
            object-fit: cover;
            border-radius: 4px;
            margin-bottom: 10px;
            border: 2px solid #f5e8d1;
            transition: opacity 0.3s ease;
          }
          .recommendation-details {
            padding: 10px;
          }
          .recommendation-name {
            margin: 10px 0 5px;
            font-size: 1.1em;
            color: #5a4032;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .recommendation-price,
          .recommendation-category {
            margin: 5px 0;
            color: #7a6a53;
            font-size: 0.95em;
          }
          .recommendation-link,
          .recommendation-button {
            display: block;
            margin: 10px 0;
            padding: 8px;
            background-color: #d4a373;
            color: #ffffff;
            border: none;
            border-radius: 4px;
            text-decoration: none;
            cursor: pointer;
            font-size: 0.9em;
            transition: background-color 0.3s ease;
          }
          .recommendation-link:hover,
          .recommendation-button:hover {
            background-color: #c78c5d;
          }
          .recommendation-message {
            padding: 20px;
            text-align: center;
            color: #7a6a53;
            font-size: 1em;
          }
          .recommendation-message.error {
            color: #d32f2f;
          }
        `}
      </style>
    </div>
  );

  function addToCart(productId) {
    console.log(`Added ${productId} to cart`);
  }
};

export default RecommendationPanel;