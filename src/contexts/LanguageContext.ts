import { createContext } from 'react';

interface LanguageContextProps {
    language: string;
    setLanguage: (language: string) => void;
}

export const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);
