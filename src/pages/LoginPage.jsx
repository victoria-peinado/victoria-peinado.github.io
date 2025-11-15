// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/authService';

// NEW: Import the modal
import PasswordResetModal from '../components/common/PasswordResetModal';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // NEW: State for controlling the modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      // FIX: Redirect to the Landing Page, not the admin page.
      // The Navbar will update to show admin links if they are an admin.
      navigate('/'); 
    } catch (err) {
      setError('Failed to log in. Please check your email and password.');
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <>
      {/* NEW: Render the modal */}
      <PasswordResetModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />

      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700">
          <h2 className="text-4xl font-extrabold text-center mb-6 text-white">Log In</h2>
          {error && <p className="bg-red-600 text-white p-3 rounded-lg text-center mb-4">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-300 mb-2" htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-4 rounded-lg bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-300 mb-2" htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-4 rounded-lg bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="text-right mb-6">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold p-4 rounded-lg shadow-lg transition-transform duration-150 ease-in-out hover:scale-105"
            >
              {loading ? 'Logging In...' : 'Log In'}
            </button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Need an account? <Link to="/signup" className="text-blue-400 hover:text-blue-300">Sign Up</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}