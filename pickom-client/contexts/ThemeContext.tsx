'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeMode } from '../theme/colors';

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useThemeMode = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within ThemeModeProvider');
  }
  return context;
};

interface ThemeModeProviderProps {
  children: ReactNode;
  defaultMode?: ThemeMode;
}

export const ThemeModeProvider: React.FC<ThemeModeProviderProps> = ({
  children,
  defaultMode = 'light',
}) => {
  const [mode, setMode] = useState<ThemeMode>(defaultMode);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('pickom-theme') as ThemeMode | null;
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      setMode(savedTheme);
    }
  }, []);

  // Save theme to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('pickom-theme', mode);
  }, [mode]);

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const setTheme = (newMode: ThemeMode) => {
    setMode(newMode);
  };

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
