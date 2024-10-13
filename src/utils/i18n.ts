import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

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
    .use(initReactI18next) // 绑定 react-i18next 到 i18next
    .init({
        resources,
        lng: navigator.language,
        fallbackLng: (code) => {
            // 使用 Locale Chain 进行回退加载
            const locales = code.split('-');
            const chains = [];
            for (let i = locales.length; i > 0; i--) {
                chains.push(locales.slice(0, i).join('-'));
            }
            if (chains[1] === 'zh') {
                chains.push('zh-Hans')
            }
            chains.push('en-US'); // 默认回退到英文
            return chains;
        },
        interpolation: {
            escapeValue: false, // react 已经安全地处理 xss
        },
    });

export default i18n;