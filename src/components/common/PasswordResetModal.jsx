// src/components/common/PasswordResetModal.jsx
import React, { useState } from 'react';
import { sendPasswordReset } from '../../services/authService';
// Import our new UI kit components
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';

export default function PasswordResetModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await sendPasswordReset(email);
      setMessage('Check your email for a reset link!');
      setLoading(false);
    } catch (err) {
      setError('Failed to send reset email. Please check the address.');
      console.error(err);
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setEmail('');
      setMessage('');
      setError('');
      setLoading(false);
    }, 300);
  };

  // The 'isOpen' logic is now handled by the Modal component
  
  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Reset Password">
      {/* Use our theme colors for messages */}
      {message && <p className="bg-primary-dark text-white p-3 rounded-lg text-center mb-4">{message}</p>}
      {error && <p className="bg-secondary text-white p-3 rounded-lg text-center mb-4">{error}</p>}

      {!message && (
        <form onSubmit={handleSubmit}>
          <p className="text-neutral-200 text-center mb-4">
            Enter your email address and we'll send you a link.
          </p>
          <div className="mb-4">
            {/* Use the new <Label> component */}
            <Label htmlFor="reset-email">Email</Label>
            {/* Use the new <Input> component */}
            <Input
              type="email"
              id="reset-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {/* Use the new <Button> component */}
          <Button
            type="submit"
            disabled={loading}
            variant="primary"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </form>
      )}

      {/* Use the new <Button> component for the close button */}
      <Button
        onClick={handleClose}
        variant="neutral"
        className="mt-4"
      >
        Close
      </Button>
    </Modal>
  );
}