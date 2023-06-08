import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import axios from 'axios';

const AuthCallback = () => {
  const { setUserStateAndRedirect } = useAuthContext();
  const location = useLocation();

  const fetchUser = async (token) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status !== 200) {
        console.error('Error fetching user data:', response.status, response.statusText);
        return;
      }
      return response.data;
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const tokenRegex = /token=([^&]+)/;
      const tokenMatch = location.hash.match(tokenRegex);
      const token = tokenMatch ? tokenMatch[1] : null;
  
      if (token) {
        const user = await fetchUser(token);
        setUserStateAndRedirect(user, token);
      }
    };
  
    fetchData();
  }, [location, setUserStateAndRedirect]);

  return <div>Loading...</div>;
};

export default AuthCallback;
