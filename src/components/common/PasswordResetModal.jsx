// src/components/common/PasswordResetModal.jsx
import React, { useState } from 'react';
import { sendPasswordReset } from '../../services/authService';

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
      // Firebase security model: always returns success
      // to prevent user enumeration.
      await sendPasswordReset(email);
      setMessage('Check your email for a reset link!');
      setLoading(false);
      // Don't clear email here, user might want to see what they typed
    } catch (err) {
      // This will rarely be hit, only for malformed email
      setError('Failed to send reset email. Please check the address.');
      console.error(err);
      setLoading(false);
    }
  };

  // FIX: Create a handleClose function to reset state
  const handleClose = () => {
    onClose();
    
    // Reset state after a short delay to allow fade-out
    setTimeout(() => {
      setEmail('');
      setMessage('');
      setError('');
      setLoading(false);
    }, 300); // 300ms
  };

  if (!isOpen) return null;

  return (
    // Modal Overlay
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 z-40 flex items-center justify-center p-4"
      onClick={handleClose} // Use handleClose
    >
      {/* Modal Content */}
      <div
        className="bg-gray-800 text-white w-full max-w-md p-6 rounded-2xl shadow-2xl border border-gray-700 z-50"
        onClick={(e) => e.stopPropagation()} // Prevent closing on content click
      >
        <h2 className="text-3xl font-bold text-center mb-4">Reset Password</h2>
        
        {message && <p className="bg-green-600 text-white p-3 rounded-lg text-center mb-4">{message}</p>}
        {error && <p className="bg-red-600 text-white p-3 rounded-lg text-center mb-4">{error}</p>}

        {!message && ( // Only show form if no success message
          <form onSubmit={handleSubmit}>
            <p className="text-gray-300 text-center mb-4">
              Enter your email address and we'll send you a link.
            </p>
            <div className="mb-4">
              <label className="block text-gray-300 mb-2" htmlFor="reset-email">Email</label>
              <input
                type="email"
                id="reset-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-4 rounded-lg bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold p-4 rounded-lg shadow-lg transition duration-150"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <button
          onClick={handleClose} // Use handleClose
          className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold p-3 rounded-lg mt-4"
        >
          Close
        </button>
      </div>
    </div>
  );
}