import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { login } from '../services/authService'; // <-- ADD THIS LINE
import { useAuthForm } from '../hooks/useAuthForm';

// 2. Import our new UI Kit
import FullScreenCenter from '../components/layout/FullScreenCenter';
import { Card, CardContent, CardTitle } from '../components/ui/Card';
import { Label } from '../components/ui/Label';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import PasswordResetModal from '../components/common/PasswordResetModal';

export default function LoginPage() {
  const { t } = useTranslation(); // 3. Initialize translation
  const {
    email, setEmail, password, setPassword,
    error, setError, loading, setLoading, navigate
  } = useAuthForm();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/'); 
    } catch (err) {
      setError(t('login.error')); // Use i18n key
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <>
      <PasswordResetModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />

      {/* 4. Use the new FullScreenCenter layout */}
      <FullScreenCenter>
        {/* 5. Use the new Card component */}
        <Card>
          <CardContent className="p-8">
            <CardTitle className="text-center mb-6">
              {t('login.title')} {/* i18n key */}
            </CardTitle>
            
            {error && <p className="bg-secondary text-white p-3 rounded-lg text-center mb-4">{error}</p>}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                {/* 6. Use new Label and Input */}
                <Label htmlFor="email">{t('login.emailLabel')}</Label>
                <Input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mb-6">
                <Label htmlFor="password">{t('login.passwordLabel')}</Label>
                <Input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="text-right mb-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="text-sm text-primary-light hover:text-primary"
                >
                  {t('login.forgotPassword')}
                </button>
              </div>

              {/* 7. Use new Button */}
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                className="w-full"
              >
                {loading ? t('login.submitButtonLoading') : t('login.submitButton')}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-neutral-200">
                {t('login.signupPrompt')} {' '}
                <Link to="/signup" className="font-bold text-primary-light hover:text-primary">
                  {t('login.signupLink')}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </FullScreenCenter>
    </>
  );
}