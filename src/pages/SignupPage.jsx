// src/pages/SignupPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { signup } from '../services/authService';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useAuthForm } from '../hooks/useAuthForm';

import FullScreenCenter from '../components/layout/FullScreenCenter';
import { Card, CardContent, CardTitle } from '../components/ui/Card';
import { Label } from '../components/ui/Label';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export default function SignupPage() {
  const { t } = useTranslation();
  const {
    email, setEmail, password, setPassword,
    confirmPassword, setConfirmPassword, error, setError,
    loading, setLoading, 
    // 1. Destructure the migration handler
    handlePostSignup 
  } = useAuthForm();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError(t('signup.errorMatch'));
    }
    setError('');
    setLoading(true);
    try {
      // 2. Create User
      const userCredential = await signup(email, password);
      const user = userCredential.user;

      // 3. Create 'users' document (Role/Admin data)
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        email: user.email,
        isAdmin: false,
        createdAt: new Date(),
      });
      
      // 4. FIX: Call the migration handler instead of navigating manually
      // This function checks the URL for 'anonId' and moves the stats over.
      await handlePostSignup(user);

    } catch (err) {
      setError(t('signup.errorFailed'));
      console.error(err);
      setLoading(false); // Only stop loading on error (success navigates away)
    }
  };

  return (
    <FullScreenCenter>
      <Card>
        <CardContent className="p-8">
          <CardTitle className="text-center mb-6">
            {t('signup.title')}
          </CardTitle>
          
          {error && <p className="bg-secondary text-white p-3 rounded-lg text-center mb-4">{error}</p>}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <Label htmlFor="email">{t('signup.emailLabel')}</Label>
              <Input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="password">{t('signup.passwordLabel')}</Label>
              <Input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="mb-6">
              <Label htmlFor="confirm-password">{t('signup.confirmPasswordLabel')}</Label>
              <Input
                type="password"
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="w-full"
            >
              {loading ? t('signup.submitButtonLoading') : t('signup.submitButton')}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-neutral-200">
              {t('signup.loginPrompt')} {' '}
              <Link to="/login" className="font-bold text-primary-light hover:text-primary">
                {t('signup.loginLink')}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </FullScreenCenter>
  );
}