// src/components/admin/ShareGameCard.jsx
import React from 'react';
// We no longer import useState here
import { Card, CardContent, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export default function ShareGameCard({
  gamePin,
  copied,
  shareUrl,
  handleCopyLink,
}) {
  // All logic (useState, shareUrl, handleCopyLink) has been moved to useShareLink.js
  return (
    <Card>
      <CardContent className="p-6">
        <CardTitle className="mb-4">Share Game (PIN: {gamePin})</CardTitle>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            type="text"
            value={shareUrl}
            readOnly
            className="flex-grow"
          />
          <Button
            onClick={handleCopyLink}
            variant={copied ? 'primary' : 'secondary'}
            className="sm:w-auto whitespace-nowrap"
          >
            {copied ? '✓ Copied!' : 'Copy Link'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}