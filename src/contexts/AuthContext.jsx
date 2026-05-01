import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
      } catch (e) {
        console.error('Invalid user data in local storage', e);
        localStorage.removeItem('currentUser');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    // Backend returns: { message, user: {...}, token: "..." } directly (no nested .data)
    if (response.data && response.data.token) {
      const userData = {
        token: response.data.token,
        user: response.data.user,
      };
      localStorage.setItem('currentUser', JSON.stringify(userData));
      setCurrentUser(userData);
      return userData;
    }
    throw new Error('Invalid login response');
  };

  const register = async (fullname, email, password, phone, address) => {
    const response = await api.post('/auth/register', {
      fullname,
      email,
      password,
      phone,
      address,
    });
    return response.data;
  };

  const googleLogin = async (idToken) => {
    const response = await api.post('/auth/google-login', { IdToken: idToken });
    // Backend returns same shape as login: { message, user, token }
    if (response.data && response.data.token) {
      const userData = {
        token: response.data.token,
        user: response.data.user,
      };
      localStorage.setItem('currentUser', JSON.stringify(userData));
      setCurrentUser(userData);
      return userData;
    }
    throw new Error('Đăng nhập Google thất bại');
  };

  const logout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
  };

  const updateUser = (newUserData) => {
    const updated = { ...currentUser, user: { ...currentUser.user, ...newUserData } };
    localStorage.setItem('currentUser', JSON.stringify(updated));
    setCurrentUser(updated);
  };

  const value = {
    currentUser,
    loading,
    login,
    register,
    googleLogin,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};
