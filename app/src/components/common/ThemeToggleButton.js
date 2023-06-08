// ThemeToggleButton.js
import React from 'react';
import { Fab } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';

const ThemeToggleButton = ({ darkMode, onToggle }) => {
  const handleClick = () => {
    onToggle(!darkMode);
  };

  return (
    <Fab
      color="primary"
      aria-label="Toggle theme"
      onClick={handleClick}
      sx={{
        position: 'fixed',
        bottom: 16,
        left: 16,
        zIndex: 2000,
      }}
    >
      {darkMode ? <Brightness7 /> : <Brightness4 />}
    </Fab>
  );
};

export default ThemeToggleButton;
