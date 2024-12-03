import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Buffer } from "buffer";
window.Buffer = Buffer;

import App from "./App.tsx";

import { ThemeProvider } from "./contexts/ThemeProvider.tsx";
import { LanguageProvider } from "./contexts/LanguageProvider.tsx";
import { TransitionDirectionProvider } from "./contexts/TransitionDirectionProvider";

import "./styles/variables.css";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LanguageProvider>
      <ThemeProvider>
        <TransitionDirectionProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </TransitionDirectionProvider>
      </ThemeProvider>
    </LanguageProvider>
  </StrictMode>
);
