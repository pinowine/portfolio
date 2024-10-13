import React, {useEffect, useState} from "react";
import { ThemeContext } from "./ThemeContext";

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    useEffect(() => {
        const prefersDarkMode =
        window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(prefersDarkMode ? 'dark' : 'light');
    }, []);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};