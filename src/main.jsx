// src/main.jsx
import { StrictMode, Suspense } from 'react'; // 1. Import Suspense
import { createRoot } from 'react-dom/client';
import './index.css';
import './i18n.js';
import App from './App.jsx';
import { AuthProvider } from './contexts/AuthContext';

// 2. Add a simple loading message
const loadingMarkup = (
  <div style={{ padding: '20px', textAlign: 'center' }}>
    Loading...
  </div>
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* 3. Wrap your app in Suspense */}
    <Suspense fallback={loadingMarkup}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </Suspense>
  </StrictMode>
);