import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { LogIn, UserPlus, Mail, Lock, User } from 'lucide-react';

interface AuthFormProps {
  onLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  onSignup: (username: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  onSuccess?: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onLogin, onSignup, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let result;
      if (mode === 'login') {
        result = await onLogin(email, password);
      } else {
        result = await onSignup(username, email, password);
      }

      if (result.success) {
        toast({
          title: mode === 'login' ? 'Welcome back!' : 'Account created!',
          description: mode === 'login' ? 'Successfully logged in.' : 'You can now play and save scores.',
        });
        onSuccess?.();
      } else {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="arcade-border bg-card p-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-pixel text-glow">
            {mode === 'login' ? 'LOGIN' : 'SIGN UP'}
          </h2>
          <p className="text-sm text-muted-foreground font-mono">
            {mode === 'login' 
              ? 'Enter your credentials to continue' 
              : 'Create an account to save scores'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div className="space-y-2">
              <label className="text-xs font-pixel text-muted-foreground">USERNAME</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="SnakeMaster"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                  required
                  minLength={3}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-pixel text-muted-foreground">EMAIL</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="player@snake.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-pixel text-muted-foreground">PASSWORD</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
                minLength={mode === 'signup' ? 6 : 4}
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="arcade"
            size="lg"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="animate-pulse">LOADING...</span>
            ) : mode === 'login' ? (
              <>
                <LogIn className="h-4 w-4 mr-2" />
                LOGIN
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                CREATE ACCOUNT
              </>
            )}
          </Button>
        </form>

        <div className="text-center">
          <button
            type="button"
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="text-sm font-mono text-muted-foreground hover:text-primary transition-colors"
          >
            {mode === 'login' 
              ? "Don't have an account? Sign up" 
              : 'Already have an account? Login'}
          </button>
        </div>

        {/* Demo credentials hint */}
        {mode === 'login' && (
          <div className="text-center text-xs text-muted-foreground font-mono border-t border-border pt-4">
            <p>Demo: master@snake.io / pass123</p>
          </div>
        )}
      </div>
    </div>
  );
};
