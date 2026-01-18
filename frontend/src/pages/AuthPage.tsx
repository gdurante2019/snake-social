import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthForm } from '@/components/auth/AuthForm';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { useAuth } from '@/hooks/useAuth';

interface AuthPageProps {
  onAuthSuccess?: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const navigate = useNavigate();
  const { login, signup, resetPassword } = useAuth();
  const [view, setView] = React.useState<'auth' | 'reset'>('auth');

  const handleSuccess = () => {
    onAuthSuccess?.();
    navigate('/');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-pixel text-glow">
          {view === 'auth' ? 'JOIN THE ARCADE' : 'ACCOUNT RECOVERY'}
        </h1>
        <p className="text-sm text-muted-foreground font-mono">
          {view === 'auth'
            ? 'Create an account to save your scores and compete'
            : 'Recover access to your high scores'}
        </p>
      </div>

      {view === 'auth' ? (
        <AuthForm
          onLogin={login}
          onSignup={signup}
          onSuccess={handleSuccess}
          onForgotPassword={() => setView('reset')}
        />
      ) : (
        <ResetPasswordForm
          onReset={resetPassword}
          onBack={() => setView('auth')}
          onSuccess={() => setView('auth')}
        />
      )}
    </div>
  );
};

export default AuthPage;
