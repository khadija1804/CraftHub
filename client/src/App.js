import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate
} from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PublicBrowse from './pages/PublicBrowse';
import Home from './pages/Home';
import ArtisanHome from './pages/ArtisanHome';
import EditProduct from './pages/EditProduct';
import EditWorkshop from './pages/EditWorkshop';
import AddProduct from './pages/AddProduct';
import AddWorkshop from './pages/AddWorkshop';
import FavoritesCart from './pages/FavoritesCart';
import WorkshopBooking from './pages/WorkshopBooking';
import WorkshopDetail from './pages/WorkshopDetail';
import ProductDetail from './pages/ProductDetail';
import ArtisanProfile from './pages/ArtisanProfile';
import EditProfile from './pages/EditProfile';
import Settings from './pages/Settings';
import Favorites from './pages/Favorites';
import ClientProfile from './pages/ClientProfile';
import ClientArtisanProfile from './pages/ClientArtisanProfile';
import ArtisanProfile2 from './pages/ArtisanProfile2';
import ArtisanOrders from './pages/ArtisanOrders';
import SubscriptionPaymentWrapper from './pages/SubscriptionPaymentForm';
import AdminHome from './pages/AdminHome';
import AdminSubscriptionTracking from './pages/AdminSubscriptionTracking';
import AdminStatistics from './pages/AdminStatistics';
import ArtisanStatistics from './pages/ArtisanStatistics';
import RecommendationPanel from './pages/RecommendationPanel';
import AdminRegister from './pages/AdminRegister';
import About from './pages/About';
import VisitorExplore from './pages/VisitorExplore';
import ProtectedRoute from './utils/ProtectedRoute'
import WorkshopDetail2 from './pages/WorkshopDetail2';
import ProductDetail2 from './pages/ProductDetail2';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import WorkshopDetail3 from './pages/workshopDetail3';
import ProductDetail3 from './pages/ProductDetail3';
import CategoriesInfo from './pages/CategoriesInfo';
import ClientCategoriesInfo from './pages/ClientCategoriesInfo';
import AdminCategoriesInfo from './pages/AdminCategoriesInfo';
import AdminCategoryStatistics from './pages/AdminCategoryStatistics';
import AdminArtisanProfile from './pages/AdminArtisanProfile';

function App() {
  const ROLE_CLIENT = 'client';
  const ROLE_ARTISAN = 'artisan';
  const ROLE_ADMIN = 'admin';
  return (

    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/visitor-explore" element={<VisitorExplore />} />
        <Route path="/admin-registration" element={<AdminRegister />}/>   
        <Route path="/forgot-password" element={<ForgotPassword />}/>  
        <Route path="/reset-password/:token" element={<ResetPassword/>} />
        <Route path="/categories-info" element={<CategoriesInfo />} />
        <Route path="/" element={<Navigate to="/home" />} />
        
<Route element={<ProtectedRoute allowedRoles={[ROLE_ARTISAN]} />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/artisan-home" element={<ArtisanHome />} />
        <Route path="/add-product" element={<AddProduct />} />
        <Route path="/edit-product/:id" element={<EditProduct />} />
        <Route path="/add-workshop" element={<AddWorkshop />} />
        <Route path="/edit-workshop/:id" element={<EditWorkshop />} />
        <Route path="/settings" element={<Settings />} /> 
        <Route path="/profile" element={<ArtisanProfile />} /> {/* Fixed: Use JSX element */}
        <Route path="/artisan-orders" element={<ArtisanOrders />} />
        <Route path="/subscription-payment" element={<SubscriptionPaymentWrapper />} />
        <Route path="/artisan-statistics" element={<ArtisanStatistics />} />
        <Route path="/profile/edit" element={<EditProfile />} /> 
        <Route path="/artisan-workshop-details/:id" element={<WorkshopDetail3 />} />
         <Route path="/artisan-product-details/:id" element={<ProductDetail3/>} />
</Route>

<Route element={<ProtectedRoute allowedRoles={[ROLE_CLIENT]} />}>
        <Route path="/client-home" element={<PublicBrowse />} />
        <Route path="/panier" element={<FavoritesCart />} />
        <Route path="/favorites-cart" element={<Favorites />} />
        <Route path="/workshop-booking" element={<WorkshopBooking />} />
        <Route path='/client-profile' element={<ClientProfile/>} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/workshop/:id" element={<WorkshopDetail />} />
        <Route path="/recommendations" element={<RecommendationPanel />}/>
        <Route path="/client-categories-info" element={<ClientCategoriesInfo />} />
        <Route path="/client-artisan-profile/:artisanId" element={<ClientArtisanProfile />} />
</Route>


<Route
          element={<ProtectedRoute allowedRoles={[ROLE_CLIENT, ROLE_ADMIN]} />}
        >
          <Route path="/artisan-profile/:artisanId" element={<ArtisanProfile2 />} />
        </Route>

<Route element={<ProtectedRoute allowedRoles={[ROLE_ADMIN]} />}>
        <Route path="/admin-home" element={<AdminHome />} />
        <Route path="/admin/subscriptions" element={<AdminSubscriptionTracking />} />
        <Route path="/admin-statistics" element={<AdminStatistics />} />
        <Route path="/admin-workshop-details/:id" element={<WorkshopDetail2 />} />
         <Route path="/admin-product-details/:id" element={<ProductDetail2 />} />
        <Route path="/admin-categories-info" element={<AdminCategoriesInfo />} />
        <Route path="/admin-category-statistics" element={<AdminCategoryStatistics />} />
        <Route path="/admin-artisan-profile/:artisanId" element={<AdminArtisanProfile />} />

</Route>

      </Routes>
    </Router>
  );
}

export default App;