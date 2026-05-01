import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { GoogleOAuthProvider } from '@react-oauth/google'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '172614655965-h3qbbdjf38csiae26dol1k5d7j8a9n5q.apps.googleusercontent.com';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
