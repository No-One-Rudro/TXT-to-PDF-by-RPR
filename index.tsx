import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// 1. Mount the Application
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// 2. Register Service Worker for Vercel/Offline Support
// This ensures the app saves itself to the phone/PC storage
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('Citadel Offline Engine: Registered', registration.scope);
      })
      .catch((error) => {
        console.error('Citadel Offline Engine: Failed', error);
      });
  });
}