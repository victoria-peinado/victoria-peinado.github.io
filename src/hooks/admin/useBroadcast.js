// src/hooks/admin/useBroadcast.js
import { useState } from 'react';
import { sendBroadcast } from '../../services/game/gameMessaging';

export function useBroadcast({ gameId, handleMessage }) {
  const [broadcastInput, setBroadcastInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastInput.trim()) return;

    setIsSending(true);
    try {
      await sendBroadcast(gameId, broadcastInput.trim());
      handleMessage('Broadcast sent to all players!', 'success');
      setBroadcastInput(''); // Clear input on success
    } catch (error) {
      handleMessage(error.message, 'error');
    } finally {
      setIsSending(false);
    }
  };

  return {
    broadcastInput,
    setBroadcastInput,
    isSending,
    handleSendBroadcast,
  };
}