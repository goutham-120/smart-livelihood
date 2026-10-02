/* main.jsx: App entry point for SIH26097 PM-AJAY Livelihood Assistant */
import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import './lang.js';
import App from './App.jsx';
import { AuthProvider } from './AuthContext.jsx';
import { ToastProvider } from './ToastContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </AuthProvider>
  </StrictMode>
);

/* Register service worker for PWA offline support in production */
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  navigator.serviceWorker.register('/sw.js').catch(() => {});
}
