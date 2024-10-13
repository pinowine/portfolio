import React, { useState, useEffect } from 'react';
import i18n from '../utils/i18n';
import { LanguageContext } from './LanguageContext';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState(i18n.language);

    useEffect(() => {
        // console.log('Language changed to:', language);
        i18n.changeLanguage(language);
    }, [language]);

    return (
        <LanguageContext.Provider value={{ language, setLanguage }}>
        {children}
        </LanguageContext.Provider>
    );
};
