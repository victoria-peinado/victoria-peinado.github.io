// src/pages/LandingPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/Button';

export default function LandingPage() {
  const { t } = useTranslation();

  return (
    // Apply base theme colors
    <div className="min-h-screen bg-neutral-900 text-neutral-100 font-body flex flex-col items-center p-4">
      
      {/* --- THIS HEADER SECTION HAS BEEN REMOVED --- */}
      {/* <header className="w-full max-w-6xl py-6 flex justify-between items-center">
        ...
      </header> */}

      {/* Main Hero Section */}
      {/* We add 'flex-grow' to make this div fill the space */}
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

      {/* Themed Footer */}
      <footer className="w-full max-w-5xl py-8 mt-16 text-center text-neutral-700">
        <p>{t('landing.footer.copyright')}</p>
      </footer>
    </div>
  );
}