import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { PrivacyPolicy } from './components/views/PrivacyPolicy';
import { TermsOfUsage } from './components/views/TermsOfUsage';
import { ContactUs } from './components/views/ContactUs';
import { ToastProvider } from './contexts/ToastContext.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import { matchRoute } from './routes';
import { applyRouteMeta } from './hooks/useRoute';
import { STORAGE_KEYS, readEnum } from './utils/storage';

// The saved theme has to land on <body> before the first paint, otherwise the
// standalone pages below (which never mount App) always render light.
if (readEnum(STORAGE_KEYS.theme, ['light', 'dark'] as const, 'light') === 'dark') {
  document.body.classList.add('dark-theme');
}

const STANDALONE_VIEWS = {
  privacy: PrivacyPolicy,
  terms: TermsOfUsage,
  contact: ContactUs,
} as const;

const route = matchRoute(window.location.pathname);
const StandaloneView = STANDALONE_VIEWS[route.view as keyof typeof STANDALONE_VIEWS];

// Prerendered HTML already carries the right metadata; this keeps it correct
// after client-side navigation and for routes served by the SPA fallback.
applyRouteMeta(route);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      {StandaloneView ? (
        <StandaloneView />
      ) : (
        <ToastProvider>
          <App />
        </ToastProvider>
      )}
    </ErrorBoundary>
  </React.StrictMode>
);

// Registered only for real builds — in dev it would sit in front of Vite's HMR.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(error => {
      console.warn('Service worker registration failed:', error);
    });
  });
}
