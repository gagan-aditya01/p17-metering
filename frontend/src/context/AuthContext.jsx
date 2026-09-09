import React, { createContext, useState, useEffect, useContext } from 'react';
import { getMe, loginUser as apiLogin } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('p17_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await getMe();
          setUser(res.data.data);
        } catch (error) {
          console.error('Failed to load user profile', error);
          logout();
        }
      }
      setLoading(false);
    };
    loadUser();
  }, [token]);

  const login = async (credentials) => {
    const res = await apiLogin(credentials);
    const { token: jwtToken, data: userData } = res.data;
    localStorage.setItem('p17_token', jwtToken);
    setToken(jwtToken);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('p17_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
