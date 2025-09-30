import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Interceptor for token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }
    console.log('Request config:', config);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('Response:', response.data);
    return response;
  },
  (error) => {
    console.error('Response error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const updatePayment = (data) => api.put('/auth/update-payment', data);
export const getProducts = () => api.get('/products');
export const addProduct = (data) => api.post('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const getProduct = (id) => api.get(`/products/${id}`);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteProduct = (id) => api.delete(`/products/${id}`);
export const getWorkshops = () => api.get('/workshops');
export const addWorkshop = (data) => api.post('/workshops', data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const getWorkshop = (id) => api.get(`/workshops/${id}`);
export const updateWorkshop = (id, data) => api.put(`/workshops/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteWorkshop = (id) => api.delete(`/workshops/${id}`);
export const getPublicProducts = () => api.get('/products/public');
export const getPublicWorkshops = () => api.get('/workshops/public');
// Ajout des nouvelles exportations pour les détails publics
export const getPublicProduct = (id) => api.get(`/products/public/${id}`);
export const getPublicWorkshop = (id) => api.get(`/workshops/public/${id}`);

export const getWorkshopsByArtisan = (artisanId) => api.get(`/workshops/by-artisan/${artisanId}`); // Nouvelle méthode
export const getProductsByArtisan = (artisanId) => api.get(`/products/by-artisan/${artisanId}`); // Nouvelle méthode
// Public image routes
export const getPublicProductImage = (productId, index) => api.get(`/products/public/images/${productId}/${index}`, { responseType: 'blob' });
export const getPublicWorkshopImage = (workshopId, index) => api.get(`/workshops/public/images/${workshopId}/${index}`, { responseType: 'blob' });
// Protected image routes for artisans
export const getProductImage = (productId, index) => api.get(`/products/${productId}/images/${index}`, { responseType: 'blob' });
export const getWorkshopImage = (workshopId, index) => api.get(`/workshops/${workshopId}/images/${index}`, { responseType: 'blob' });
export const addComment = (data) => api.post(`/products/${data.productId || data.workshopId}/comments`, { text: data.text });
export const addComment2 = (data) => api.post(`/workshops/${data.productId || data.workshopId}/comments`, { text: data.text });
// Nouvelle route pour récupérer les commentaires
export const getComments = (id, type) => api.get(`/${type}/${id}/comments`);


export const getProfile = () => api.get('/profile');
export const createProfile = () => api.post('/profile');

// Nouvelle fonction pour mettre à jour le profil
export const updateProfile = (data) => api.put('/profile', data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateProfile2 = (data) => api.put('/auth/profile', data, { headers: { 'Content-Type': 'multipart/form-data' } });

export const getProfileById = (artisanId) => api.get(`/profile/${artisanId}`); // Profil d'un artisan spécifique
export const getPublicProfiles = () => api.get('/profile/public');

export const createPaymentIntent = (data) => api.post('/payments/create-payment-intent', data);
export const confirmPayment = (payload) => api.post('/payments/confirm-payment', payload);
export const confirmPaymentRes = (payload) => api.post('/payments/confirm-payment-res', payload);

export const getPendingOrders = () => api.get('/payments/pending-orders');

export const confirmShipment = (data) => api.post('/payments/confirm-shipment', data);

export const subscribe = (data) => api.post('/subscription/subscribe', data);
export const confirmSubscription = (data) => api.post('/subscription/confirm-subscription', data);
export const getSubscriptionStatus = () => api.get('/subscription/status');

export const getArtisansSubscriptions = () => api.get('/admin/artisans-subscriptions');
export const deleteArtisan = (artisanId) => api.delete(`/admin/artisans/${artisanId}`);
// Nouvelle exportation pour les statistiques
export const getArtisansStatistics = () => api.get('/admin/artisans-statistics');
export const getArtisanStatistics = () => api.get('/artisan/my-statistics');
export const getWorkshopStatistics = (artisanId) =>
  api.get(`/workshops/artisans/${artisanId}/workshops-stats`);
export const updateWorkshopPlaces = (id, places) => api.put(`/workshops/update-places/${id}`, { places });
export const addToCart = (data) => api.post('/cart/add', data);
export const getCart = () => api.get('/cart');
export const clearCart = () => api.post('/cart/clear');
export const removeFromCart = (productId) => api.delete(`/cart/remove/${productId}`);
export const addBooking = (data) => api.post('/bookings/add', data);
export const getBookings = () => api.get('/bookings');
export const removeBooking = (bookingId) => api.delete(`/bookings/remove/${bookingId}`);
export const confirmBooking = (data) => api.post('/bookings/confirm', data);
// Nouvelles fonctions pour les favoris
export const addFavorite = (data) => api.post("/favorites/add", data);
export const removeFavorite = (data) => api.delete("/favorites/remove", { data });
export const getFavorites = () => api.get("/favorites");

// Nouvelles API pour gérer les commentaires
export const deleteComment = (productId, commentId) => api.delete(`/products/${productId}/comments/${commentId}`);
export const updateComment = (productId, commentId, data) => api.put(`/products/${productId}/comments/${commentId}`, data);

// Nouvelles API pour gérer les commentaires des ateliers
export const deleteComment2 = (workshopId, commentId) => api.delete(`/workshops/${workshopId}/comments/${commentId}`);
export const updateComment2 = (workshopId, commentId, data) => api.put(`/workshops/${workshopId}/comments/${commentId}`, data);
// Nouvelles API pour la réinitialisation du mot de passe
export const forgotPassword = (data) => api.post('/auth/forgot-password', data);
export const resetPassword = (token, data) => api.post(`/auth/reset-password/${token}`, data);

// API pour les statistiques des catégories (Admin)
export const getCategoryStatistics = () => api.get('/admin/category-statistics');

// API pour récupérer les détails d'un artisan (Admin)
export const getArtisanDetails = (artisanId) => api.get(`/admin/artisan/${artisanId}`);

// API pour vérifier le statut d'abonnement d'un artisan
export const checkSubscriptionStatus = () => api.get('/subscription/check-subscription-status');

export default api;