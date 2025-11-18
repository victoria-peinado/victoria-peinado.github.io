// src/pages/LandingPage.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/Button';
import { useAudio } from '../hooks/useAudio';
// 2. No more WelcomeModal or useState

export default function LandingPage() {
  const { t } = useTranslation();
  const { setMusic } = useAudio();
  const navigate = useNavigate();

  // 3. This function is for the main "Enter" button
  const handleEnter = () => {
    // --- THIS IS THE FIX ---
    // Change navigation from '/play' to our new '/join' route
    navigate('/join');
    // --- END FIX ---
  };

  // 4. New useEffect to set music for this page
  useEffect(() => {
    // This will only play if audio is already unlocked
    setMusic('music_ambient.mp3');
  }, [setMusic]);

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 font-body flex flex-col items-center p-4">
      {/* 5. WelcomeModal is removed from here */}

      <main className="flex-grow flex flex-col items-center justify-center w-full max-w-5xl text-center px-4">
        <div className="bg-neutral-800 p-8 md:p-12 rounded-2xl shadow-2xl border-2 border-neutral-700 w-full max-w-3xl">
          <h2 className="text-4xl md:text-6xl font-display font-bold mb-4 text-primary-light">
            {t('landing.hero.title')}
          </h2>
          <p className="text-lg md:text-xl text-neutral-200 mb-8 max-w-2xl mx-auto">
            {t('landing.hero.subtitle')}
          </p>

          <Button
            onClick={handleEnter}
            variant="primary"
            className="text-2xl px-10 py-4"
            // 6. No longer needs to be disabled!
          >
            {t('landing.hero.cta')}
          </Button>
        </div>
      </main>

      <footer className="w-full max-w-5xl py-8 mt-16 text-center text-neutral-700">
        <p>{t('landing.footer.copyright')}</p>
      </footer>
    </div>
  );
}