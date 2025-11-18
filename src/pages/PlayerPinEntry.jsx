// src/pages/PlayerPinEntry.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { usePinEntry } from '../hooks/usePinEntry';

import { Card, CardContent, CardTitle } from '../components/ui/Card';
import { Label } from '../components/ui/Label';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export default function PlayerPinEntry() {
  const { t } = useTranslation();
  const { pin, setPin, error, isJoining, handleSubmit } = usePinEntry();
  const navigate = useNavigate();

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    // Use a standard div for centering within MainLayout's content area
    <div className="container mx-auto flex flex-col items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <CardTitle className="text-center mb-2">
            {t('pinEntry.title')}
          </CardTitle>
          <p className="text-center text-neutral-200 mb-6">
            {t('pinEntry.subtitle')}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="pin" className="sr-only">
                {t('pinEntry.label')}
              </Label>
              <Input
                type="text"
                id="pin"
                value={pin}
                onChange={(e) => setPin(e.target.value.toUpperCase())}
                placeholder={t('pinEntry.placeholder')}
                maxLength={5}
                className="text-2xl text-center uppercase font-display tracking-widest"
                disabled={isJoining}
              />
            </div>

            {error && (
              <div className="bg-secondary text-white px-4 py-3 rounded text-center">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              // FIX: Use the 'isJoining' value directly, which already includes the 'loading' state from the hook.
              disabled={isJoining || pin.trim().length === 0} 
              className="w-full"
            >
              {isJoining ? t('pinEntry.buttonLoading') : t('pinEntry.button')}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Button onClick={handleBackToHome} variant="link" className="mt-4">
        {t('pinEntry.backToHome', 'Back to Home')}
      </Button>
    </div>
  );
}