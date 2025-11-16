// src/components/stream/StreamWaitingView.jsx
import React from 'react';
import { useTranslation } from 'react-i18next'; // 1. Import

function StreamWaitingView() {
  const { t } = useTranslation(); // 2. Initialize

  return (
    // This component is centered by StreamPage,
    // so we just need to style the text
    <div className="text-center">
      {/* 3. Apply display font and theme colors */}
      <h1 className="text-7xl font-display font-bold text-primary-light mb-6">
        {t('stream.waiting.title')}
      </h1>
      <p className="text-3xl text-neutral-200 font-body">
        {t('stream.waiting.subtitle')}
      </p>
    </div>
  );
}

export default StreamWaitingView;