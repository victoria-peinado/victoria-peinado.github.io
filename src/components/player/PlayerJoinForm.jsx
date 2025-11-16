// src/components/player/PlayerJoinForm.jsx
import React from 'react';
import { useTranslation } from 'react-i18next'; // 1. Import

// 2. Import UI Kit
import { Card, CardContent, CardTitle } from '../ui/Card';
import { Label } from '../ui/Label';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

function PlayerJoinForm({ 
  nickname, 
  onNicknameChange,
  onJoinGame,
  isJoining 
}) {
  const { t } = useTranslation(); // 3. Initialize

  return (
    // 4. Use Card component
    <Card>
      <CardContent className="p-8">
        <CardTitle className="text-center mb-6">
          {t('joinForm.title')}
        </CardTitle>
        
        <form onSubmit={onJoinGame} className="space-y-4">
          <div>
            {/* 5. Use new Label and Input */}
            <Label htmlFor="nickname" className="sr-only">{t('joinForm.label')}</Label>
            <Input
              type="text"
              id="nickname"
              value={nickname}
              onChange={(e) => onNicknameChange(e.target.value)}
              placeholder={t('joinForm.placeholder')}
              className="text-lg"
              disabled={isJoining}
              maxLength={20}
              autoFocus
            />
          </div>
          
          {/* 6. Use new Button component */}
          <Button
            type="submit"
            variant="primary"
            disabled={isJoining || !nickname.trim()}
            className="w-full"
          >
            {isJoining ? t('joinForm.buttonLoading') : t('joinForm.button')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default PlayerJoinForm;