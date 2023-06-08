// AuthContext.js
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';

const AuthContext = createContext();

export const useAuthContext = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = Cookies.get('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserFromCookies = async () => {
        setLoading(true);
        const storedUser = Cookies.get('user');
        const token = Cookies.get('token');
      
        if (!storedUser || !token) {
          setLoading(false);
          return;
        }
      
        try {
          const response = await axios.get(`${process.env.REACT_APP_API_URL}/user/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
      
          const fetchedUser = response.data;
      
          if (fetchedUser) {
            setUser(fetchedUser);
          }

          setLoading(false);
        } catch (error) {
          if (error.response && error.response.status === 401) {
            // Clear cookies and navigate to home page if token is expired or invalid
            Cookies.remove('user');
            Cookies.remove('token');
            navigate('/');
          }
          setLoading(false);
        }
      };
      
    fetchUserFromCookies();
  }, [navigate]);

  const setUserStateAndRedirect = useCallback((userData, token) => {
    setUser(userData);
    Cookies.set('user', JSON.stringify(userData), { expires: 1 });
    Cookies.set('token', token, { expires: 1 });
    navigate('/chat');
  }, [navigate]);

  const logout = () => {
    Cookies.remove('user');
    Cookies.remove('token');
    setUser(null);
    navigate('/');
  };

  const value = {
    user,
    setUser,
    setUserStateAndRedirect,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
