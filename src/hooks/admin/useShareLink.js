// src/hooks/admin/useShareLink.js
import { useState } from 'react';

export function useShareLink(gamePin) {
  const [copied, setCopied] = useState(false);

  // --- SPRINT 16 FIX: Use window.location.origin ---
  const baseUri = window.location.origin;
  const shareUrl = `${baseUri}/#/join/${gamePin}`;
  // --- END SPRINT 16 FIX ---

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
      })
      .catch((err) => {
        console.error('Failed to copy: ', err);
      });
  };

  return { copied, shareUrl, handleCopyLink };
}