// MainLayout.js
import React from 'react';
import { Box } from '@mui/material';
import ThemeToggleButton from '../common/ThemeToggleButton';
import FeedbackButton from '../common/FeedbackButton';
import { useThemeContext } from '../../contexts/ThemeContext';
import { Helmet } from 'react-helmet';

const MainLayout = ({ children }) => {
  const { moodmanDarkMode, toggleMoodmanDarkMode } = useThemeContext();

  return (
    <>
      <Helmet>
        <title>MoodFood - What to Eat? AI-Driven Food Recommendations for Your Mood</title>
        <meta
          name="description"
          content="MoodFood helps you decide what to eat with AI-driven food recommendations based on your mood. Discover the perfect meal to match your feelings and join our community today."
        />
      </Helmet>
      <Box
        component="main"
        sx={{
          minHeight: { xs: 'calc(100vh - 300px)', md: 'calc(100vh - 128px)' },
          padding: { xs: 0, md: 0 },
          margin: { xs: 0, md: 0 },
          paddingBottom: { xs: '80px', md: '80px' },
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        {children}
      </Box>
      <ThemeToggleButton moodmanDarkMode={moodmanDarkMode} onToggle={toggleMoodmanDarkMode} />
      <FeedbackButton />
    </>
  );
};

export default MainLayout;
