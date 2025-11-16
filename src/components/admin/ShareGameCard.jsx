// src/components/admin/ShareGameCard.jsx
import React, { useState } from 'react';
import { Card, CardContent, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export default function ShareGameCard({ gamePin, gameId }) {
  const [copied, setCopied] = useState(false);

  // Define the share URL using the game pin
  const shareUrl = `https://magictrivia.org/?pin=${gamePin}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

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