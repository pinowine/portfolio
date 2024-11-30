import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

type ResourceType = {
    [lang: string]: {
        translation: Record<string, unknown>;
    };
};

const translations = import.meta.glob('../locales/**/*.json', { eager: true }) as Record<string, { default: unknown }>;

const resources: ResourceType = {};

for (const path in translations) {
    // console.log(`Loading file: ${path}`);
    const match = path.match(/\.\/locales\/(.*)\/.*\.json$/);
    // console.log('Match:', match);
    if (match && match[1]) {
        const lang = match[1];
        resources[lang] = {
            translation: translations[path].default as Record<string, unknown>,
        };
        // console.log(`Loaded language: ${lang}`); // 确认语言是否加载
    }
}

i18n
    .use(LanguageDetector)
    .use(initReactI18next) // 绑定 react-i18next 到 i18next
    .init({
        resources,
        fallbackLng: {
            'zh-TW': ['zh-TW', 'zh-Hant', 'zh-CN'],  // 中文语言链
            'en-US': ['en-US', 'zh-CN'],  // 英文语言链
        },
        detection: {
            order: ['querystring', 'cookie', 'localStorage', 'navigator'],
            caches: ['cookie'], // 缓存语言信息
        },
        interpolation: {
            escapeValue: false, // react 已经安全地处理 xss
        },
        saveMissing: true
    });

export default i18n;