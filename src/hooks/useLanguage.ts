import { useContext } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        // console.error('useLanguage must be used within a LanguageProvider');
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    // console.log('Current language context:', context); // 检查 context 是否正常
    return context;
};