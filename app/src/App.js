// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import Nav from './components/common/Nav';
import Footer from './components/common/Footer';
import MainLayout from './components/layout/MainLayout';
import Home from './components/pages/Home';
import Profile from './components/pages/Profile';
import AuthCallback from './components/pages/AuthCallback';
import PaymentSuccess from './components/pages/PaymentSuccess';
import PaymentCanceled from './components/pages/PaymentCanceled';
import AboutUs from './components/pages/AboutUs';
import ContactUs from './components/pages/ContactUs';
import Recipes from './components/pages/Recipes';
import MoodFoodChat from './components/bot/MoodFoodChat';
import Unsubscribe from './components/pages/Unsubscribe';
import PrivacyPolicy from './components/pages/PrivacyPolicy';

const App = () => {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <CssBaseline />
          <Nav />
          <MainLayout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/success" element={<PaymentSuccess />} />
              <Route path="/canceled" element={<PaymentCanceled />} />
              <Route path="/about-us" element={<AboutUs />} />
              <Route path="/contact-us" element={<ContactUs />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/recipes" element={<Recipes />} />
              <Route path="/chat" element={<SocketProvider><MoodFoodChat /></SocketProvider>} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/unsubscribe" element={<Unsubscribe />} />
            </Routes>
          </MainLayout>
          <Footer />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
};

export default App;
