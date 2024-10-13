import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';

import App from './App.tsx'

import { ThemeProvider } from './contexts/ThemeProvider.tsx';
import { LanguageProvider } from './contexts/LanguageProvider.tsx';

import './styles/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </LanguageProvider>
    </BrowserRouter>
  </StrictMode>,
)
