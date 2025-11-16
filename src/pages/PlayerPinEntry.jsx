// src/pages/PlayerPinEntry.jsx
import React from 'react';
import { useTranslation } from 'react-i18next'; // 1. Import
import { usePinEntry } from '../hooks/usePinEntry';

// 2. Import our new UI Kit
import FullScreenCenter from '../components/layout/FullScreenCenter';
import { Card, CardContent, CardTitle } from '../components/ui/Card';
import { Label } from '../components/ui/Label';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import PlayerNavbar from '../components/layout/PlayerNavbar'; // We can keep this for the 'Exit' button

export default function PlayerPinEntry() {
  const { t } = useTranslation(); // 3. Initialize
  const { pin, setPin, error, isJoining, handleSubmit } = usePinEntry();

  return (
    // 4. Use FullScreenCenter layout
    <FullScreenCenter>
      {/* <PlayerNavbar />  We can actually remove this to make it cleaner */}
      
      {/* 5. Use Card component */}
      <Card>
        <CardContent className="p-8">
          <CardTitle className="text-center mb-2">
            {t('pinEntry.title')}
          </CardTitle>
          <p className="text-center text-neutral-200 mb-6">
            {t('pinEntry.subtitle')}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              {/* 6. Use new Label and Input */}
              <Label htmlFor="pin" className="sr-only">{t('pinEntry.label')}</Label>
              <Input
                type="text"
                id="pin"
                value={pin}
                onChange={(e) => setPin(e.target.value.toUpperCase())}
                placeholder={t('pinEntry.placeholder')}
                maxLength={5}
                // Use theme fonts and styles
                className="text-2xl text-center uppercase font-display tracking-widest"
                disabled={isJoining}
              />
            </div>

            {/* 7. Use themed error message */}
            {error && (
              <div className="bg-secondary text-white px-4 py-3 rounded text-center">
                {error}
              </div>
            )}

            {/* 8. Use new Button component */}
            <Button
              type="submit"
              variant="primary"
              disabled={isJoining || pin.trim().length === 0}
              className="w-full"
            >
              {isJoining ? t('pinEntry.buttonLoading') : t('pinEntry.button')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </FullScreenCenter>
  );
}