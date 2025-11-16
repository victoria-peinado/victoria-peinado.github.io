// src/pages/SignupPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // 1. Import
import { signup } from '../services/authService';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useAuthForm } from '../hooks/useAuthForm';

// 2. Import UI Kit
import FullScreenCenter from '../components/layout/FullScreenCenter';
import { Card, CardContent, CardTitle } from '../components/ui/Card';
import { Label } from '../components/ui/Label';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export default function SignupPage() {
  const { t } = useTranslation(); // 3. Initialize
  const {
    email, setEmail, password, setPassword,
    confirmPassword, setConfirmPassword, error, setError,
    loading, setLoading, navigate
  } = useAuthForm();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError(t('signup.errorMatch')); // i18n key
    }
    setError('');
    setLoading(true);
    try {
      const userCredential = await signup(email, password);
      const user = userCredential.user;
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        email: user.email,
        isAdmin: false,
        createdAt: new Date(),
      });
      navigate('/');
    } catch (err) {
      setError(t('signup.errorFailed')); // i18n key
      console.error(err);
    }
    setLoading(false);
  };

  return (
    // 4. Use new Layout and Components
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