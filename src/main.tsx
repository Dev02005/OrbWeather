import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { PrivacyPolicy } from './components/views/PrivacyPolicy';
import { TermsOfUsage } from './components/views/TermsOfUsage';
import { ContactUs } from './components/views/ContactUs';
import { ToastProvider } from './contexts/ToastContext.tsx';

const path = window.location.pathname;

if (path === '/privacy') {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <PrivacyPolicy />
    </React.StrictMode>,
  )
} else if (path === '/terms') {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <TermsOfUsage />
    </React.StrictMode>,
  )
} else if (path === '/contact') {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <ContactUs />
    </React.StrictMode>,
  )
} else {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <ToastProvider>
        <App />
      </ToastProvider>
    </React.StrictMode>,
  )
}
