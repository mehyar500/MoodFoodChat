import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material';
import createMyTheme from '../theme';

const ThemeContext = createContext();

export const useThemeContext = () => {
  return useContext(ThemeContext);
};

export const ThemeProvider = ({ children }) => {
  const [moodmanDarkMode, setMoodmanDarkMode] = useState(false);
  const theme = useMemo(() => createMyTheme(moodmanDarkMode), [moodmanDarkMode]);

  const toggleMoodmanDarkMode = () => {
    setMoodmanDarkMode(!moodmanDarkMode);
  };

  useEffect(() => {
    const storedMoodmanDarkMode = localStorage.getItem('moodmanDarkMode');
    if (storedMoodmanDarkMode) {
      setMoodmanDarkMode(JSON.parse(storedMoodmanDarkMode));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('moodmanDarkMode', moodmanDarkMode);
  }, [moodmanDarkMode]);

  const value = {
    moodmanDarkMode,
    theme,
    toggleMoodmanDarkMode,
  };

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
};