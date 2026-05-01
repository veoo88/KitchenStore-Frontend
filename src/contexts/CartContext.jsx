import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [cart, setCart] = useState([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Load cart initially
  useEffect(() => {
    const loadCart = async () => {
      if (currentUser) {
        try {
          const res = await api.get('/cart');
          // Backend returns: [{ id, productId, quantity, product: { ... } }]
          const formattedCart = res.data.map(item => ({
            id: item.productId,
            name: item.product.name,
            price: item.product.price,
            image: item.product.image,
            quantity: item.quantity
          }));
          setCart(formattedCart);
        } catch (error) {
          console.error('Failed to fetch cart from API', error);
        }
      } else {
        const saved = localStorage.getItem('cart');
        if (saved) {
          try {
            setCart(JSON.parse(saved));
          } catch (e) {
            console.error('Failed to parse local cart', e);
            setCart([]);
          }
        }
      }
      setIsInitialLoad(false);
    };

    loadCart();
  }, [currentUser]);

  // Save to localStorage whenever cart changes (for guest or as backup)
  useEffect(() => {
    if (!isInitialLoad) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart, isInitialLoad]);

  const addToCart = async (product, quantity = 1) => {
    if (currentUser) {
      try {
        await api.post('/cart', { productId: product.id, quantity });
        // After successful API call, update local state to reflect UI immediately
        const res = await api.get('/cart');
        const formattedCart = res.data.map(item => ({
          id: item.productId,
          name: item.product.name,
          price: item.product.price,
          image: item.product.image,
          quantity: item.quantity
        }));
        setCart(formattedCart);
      } catch (error) {
        console.error('API Error adding to cart', error);
      }
    } else {
      setCart((prevCart) => {
        const existingItem = prevCart.find((item) => String(item.id) === String(product.id));
        if (existingItem) {
          return prevCart.map((item) =>
            String(item.id) === String(product.id)
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          return [
            ...prevCart,
            {
              id: product.id,
              name: product.name,
              price: product.price,
              image: product.image,
              quantity: quantity,
            },
          ];
        }
      });
    }
  };

  const removeFromCart = async (productId) => {
    if (currentUser) {
      try {
        await api.delete(`/cart/${productId}`);
        setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
      } catch (error) {
        console.error('API Error removing from cart', error);
      }
    } else {
      setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    if (currentUser) {
      try {
        await api.put('/cart', { productId, quantity });
        setCart((prevCart) =>
          prevCart.map((item) =>
            item.id === productId ? { ...item, quantity } : item
          )
        );
      } catch (error) {
        console.error('API Error updating quantity', error);
      }
    } else {
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const syncCart = async (localItems) => {
    if (!currentUser || !localItems || localItems.length === 0) return;
    try {
      const dtoItems = localItems.map(item => ({
        productId: item.id,
        quantity: item.quantity
      }));
      await api.post('/cart/sync', dtoItems);
      // Reload cart from server to get merged state
      const res = await api.get('/cart');
      const formattedCart = res.data.map(item => ({
        id: item.productId,
        name: item.product.name,
        price: item.product.price,
        image: item.product.image,
        quantity: item.quantity
      }));
      setCart(formattedCart);
      localStorage.removeItem('cart');
    } catch (error) {
      console.error('Failed to sync cart', error);
    }
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    syncCart,
    cartCount,
    cartTotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
