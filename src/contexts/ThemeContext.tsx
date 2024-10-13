import { createContext } from 'react';

interface ThemeContextProps {
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
}

export const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

