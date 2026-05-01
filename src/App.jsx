import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google'; // Import Google Provider
import { AuthProvider } from './contexts/AuthContext';    // Import Auth Context
import { CartProvider } from './contexts/CartContext';
import Home from './pages/Home';
import Products from './pages/Products';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import OrderHistory from './pages/OrderHistory';
import Admin from './pages/Admin';
import About from './pages/About';
import News from './pages/News';
import Contact from './pages/Contact';
import ForgotPassword from './pages/ForgotPassword';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import MainLayout from './layouts/MainLayout';

function App() {
  // Initialize AOS animations on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && window.AOS) {
      window.AOS.init({
        duration: 800,
        once: false,
        offset: 100,
        mirror: false
      });
      // Initial refresh to ensure elements are picked up
      setTimeout(() => window.AOS.refresh(), 100);
    }
  }, []);

  return (
    <GoogleOAuthProvider clientId="172614655965-h3qbbdjf38csiae26dol1k5d7j8a9n5q.apps.googleusercontent.com"> {/* Thay bằng Client ID của bạn */}
      <AuthProvider>
        <CartProvider>
          <Router>
            <MainLayout useContainer={false}>
              <Routes>
                <Route path="/" element={<div className="container mx-auto px-4 py-8"><Home /></div>} />
                <Route path="/products" element={<div className="container mx-auto px-4 py-8"><Products /></div>} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/cart" element={<div className="container mx-auto px-4 py-8"><Cart /></div>} />
                <Route path="/checkout" element={<div className="container mx-auto px-4 py-8"><Checkout /></div>} />
                <Route path="/orders" element={<div className="container mx-auto px-4 py-8"><OrderHistory /></div>} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/about" element={<About />} />
                <Route path="/news" element={<News />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/profile" element={<div className="container mx-auto px-4 py-8"><Profile /></div>} />
                <Route path="*" element={<div className="container mx-auto px-4 py-8"><NotFound /></div>} />
              </Routes>
            </MainLayout>
          </Router>
        </CartProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
