import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthForm } from '@/components/auth/AuthForm';
import { useAuth } from '@/hooks/useAuth';

interface AuthPageProps {
  onAuthSuccess?: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const navigate = useNavigate();
  const { login, signup } = useAuth();

  const handleSuccess = () => {
    onAuthSuccess?.();
    navigate('/');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-pixel text-glow">
          JOIN THE ARCADE
        </h1>
        <p className="text-sm text-muted-foreground font-mono">
          Create an account to save your scores and compete
        </p>
      </div>

      <AuthForm
        onLogin={login}
        onSignup={signup}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default AuthPage;
