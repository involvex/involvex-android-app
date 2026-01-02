
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Appearance } from 'react-native';
import { darkTheme } from '../theme/darkTheme';
import { lightTheme } from '../theme/lightTheme';

const defaultIsDark = Appearance.getColorScheme() === 'dark';

const ThemeContext = createContext({
  isDark: defaultIsDark,
  theme: defaultIsDark ? darkTheme : lightTheme,
  setTheme: (_theme: 'dark' | 'light') => {},
});

export const useTheme = () => useContext(ThemeContext);

type ThemeProviderProps = {
  children: ReactNode;
};

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [isDark, setIsDark] = useState(defaultIsDark);

  const setTheme = (theme: 'dark' | 'light') => {
    setIsDark(theme === 'dark');
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ isDark, theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
