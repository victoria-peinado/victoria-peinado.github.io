// src/components/admin/BroadcastCard.jsx
import React from 'react';
// We no longer import services or use state here
import { Card, CardContent, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export default function BroadcastCard({
  broadcastInput,
  setBroadcastInput,
  isSending,
  handleSendBroadcast,
}) {
  // All logic (useState, handleSendBroadcast) has been moved to useBroadcast.js
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