// src/components/admin/BroadcastCard.jsx
import React, { useState } from 'react';
import { sendBroadcast } from '../../services/game/gameMessaging';
import { Card, CardContent, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export default function BroadcastCard({ gameId, onMessage }) {
  const [broadcastInput, setBroadcastInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastInput.trim()) return;

    setIsSending(true);
    try {
      await sendBroadcast(gameId, broadcastInput.trim());
      onMessage('Broadcast sent to all players!', 'success');
      setBroadcastInput(''); // Clear input on success
    } catch (error) {
      onMessage(error.message, 'error');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <CardTitle className="mb-4">Send Broadcast</CardTitle>
        <form onSubmit={handleSendBroadcast} className="flex flex-col sm:flex-row gap-2">
          <Input
            type="text"
            value={broadcastInput}
            onChange={(e) => setBroadcastInput(e.target.value)}
            placeholder="Type your message here..."
            disabled={isSending}
            className="flex-grow"
          />
          <Button
            type="submit"
            variant="primary"
            disabled={isSending || !broadcastInput.trim()}
            className="sm:w-auto whitespace-nowrap"
          >
            {isSending ? 'Sending...' : 'Send'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}