import { useEffect } from 'react';
import { useLanguage } from './useLanguage';

export const useApplyLanguage = () => {
    const { language } = useLanguage();

    useEffect(() => {
        document.documentElement.lang = language
    }, [language]);
};