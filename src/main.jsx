// src/main.jsx
import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './i18n.js';
import App from './App.jsx';
import { AuthProvider } from './contexts/AuthContext';
import { AudioProvider } from './contexts/AudioContext';
import { Toaster } from 'react-hot-toast'; // 1. Import Toaster

const loadingMarkup = (
  <div style={{ padding: '20px', textAlign: 'center' }}>
    Loading...
  </div>
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Suspense fallback={loadingMarkup}>
      <AudioProvider>
        <AuthProvider>
          <App />
          <Toaster // 2. Add Toaster component here
            position="top-right"
            toastOptions={{
              // Set default styles for a dark theme
              style: {
                background: '#333',
                color: '#fff',
              },
              success: {
                iconTheme: {
                  primary: '#619A5A', // Your primary green
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#D32F2F', // Your secondary red
                  secondary: '#fff',
                },
              },
            }}
          />
        </AuthProvider>
      </AudioProvider>
    </Suspense>
  </StrictMode>
);