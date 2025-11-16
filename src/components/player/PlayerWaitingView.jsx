// src/components/player/PlayerWaitingView.jsx
import React from 'react';
import { useTranslation } from 'react-i18next'; // 1. Import

// We get the nickname from PlayerPage as a prop
function PlayerWaitingView({ nickname }) {
  const { t } = useTranslation(); // 2. Initialize
  const displayName = nickname || t('player.waiting.defaultName');

  return (
    // 3. Remove background. This is now centered by PlayerPage.
    <div className="text-center">
      {/* 4. Apply display font and theme colors */}
      <h1 className="text-5xl font-display font-bold text-primary-light mb-4">
        {t('player.waiting.title', { name: displayName })}
      </h1>
      <p className="text-2xl text-neutral-200">
        {t('player.waiting.subtitle')}
      </p>
    </div>
  );
}

export default PlayerWaitingView;