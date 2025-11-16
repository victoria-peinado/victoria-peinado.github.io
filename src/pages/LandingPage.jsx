// src/pages/LandingPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // 1. Import
import { Button } from '../components/ui/Button'; // 2. Import Button

export default function LandingPage() {
  const { t } = useTranslation(); // 3. Initialize

  return (
    // 4. Apply base theme colors
    <div className="min-h-screen bg-neutral-900 text-neutral-100 font-body flex flex-col items-center p-4">
      
      {/* 5. Header with new Button styles */}
      <header className="w-full max-w-6xl py-6 flex justify-between items-center">
        <h1 className="text-3xl font-display font-bold text-primary">
          {t('landing.title')}
        </h1>
        
        <nav className="flex gap-3">
          {/* Use Link wrapping a Button */}
          <Link to="/admin">
            <Button variant="neutral" className="py-2 px-4 text-sm">
              {t('landing.nav.admin')}
            </Button>
          </Link>
          <Link to="/stream">
            <Button variant="neutral" className="py-2 px-4 text-sm">
              {t('landing.nav.stream')}
            </Button>
          </Link>
          <Link to="/play">
            <Button variant="primary" className="py-2 px-6 text-sm">
              {t('landing.nav.play')}
            </Button>
          </Link>
        </nav>
      </header>

      {/* 6. Main Hero Section */}
      <main className="flex-grow flex flex-col items-center justify-center w-full max-w-5xl text-center px-4">
        {/* Use Card styles on a div for the hero box */}
        <div className="bg-neutral-800 p-8 md:p-12 rounded-2xl shadow-2xl border-2 border-neutral-700 w-full max-w-3xl">
          <h2 className="text-4xl md:text-6xl font-display font-bold mb-4 text-primary-light">
            {t('landing.hero.title')}
          </h2>
          <p className="text-lg md:text-xl text-neutral-200 mb-8 max-w-2xl mx-auto">
            {t('landing.hero.subtitle')}
          </p>
          
          <Link to="/play">
            <Button variant="primary" className="text-2xl px-10 py-4">
              {t('landing.hero.cta')}
            </Button>
          </Link>
        </div>
      </main>

      {/* 7. Themed Footer */}
      <footer className="w-full max-w-5xl py-8 mt-16 text-center text-neutral-700">
        <p>{t('landing.footer.copyright')}</p>
      </footer>
    </div>
  );
}