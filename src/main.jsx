// src/main.jsx
import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './i18n.js';
import App from './App.jsx';
import { AuthProvider } from './contexts/AuthContext';
import { AudioProvider } from './contexts/AudioContext'; // 1. Import AudioProvider

const loadingMarkup = (
  <div style={{ padding: '20px', textAlign: 'center' }}>
    Loading...
  </div>
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Suspense fallback={loadingMarkup}>
      <AudioProvider> {/* 2. Add AudioProvider here */}
        <AuthProvider>
          <App />
        </AuthProvider>
      </AudioProvider> {/* 3. Close AudioProvider here */}
    </Suspense>
  </StrictMode>
);