import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface ResetPasswordFormProps {
    onReset: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    onBack: () => void;
    onSuccess: () => void;
}

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
    onReset,
    onBack,
    onSuccess,
}) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const result = await onReset(email, password);

        if (result.success) {
            onSuccess();
        } else {
            setError(result.error || 'Reset failed');
        }
        setIsLoading(false);
    };

    return (
        <div className="w-full max-w-md mx-auto p-8 arcade-border bg-card">
            <div className="space-y-6">
                <div className="text-center">
                    <h2 className="text-xl font-pixel text-primary mb-2">RESET PASSWORD</h2>
                    <p className="text-sm text-muted-foreground font-mono">
                        Enter your email and new password
                    </p>
                </div>

                {error && (
                    <div className="bg-destructive/10 border border-destructive/20 p-3 rounded-md flex items-center gap-2 text-destructive text-sm font-mono">
                        <AlertCircle className="h-4 w-4" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="reset-email" className="font-pixel text-xs">EMAIL</Label>
                        <Input
                            id="reset-email"
                            type="email"
                            placeholder="player@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="bg-background/50 font-mono"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="reset-password" className="font-pixel text-xs">NEW PASSWORD</Label>
                        <Input
                            id="reset-password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            className="bg-background/50 font-mono"
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full font-pixel"
                        disabled={isLoading}
                    >
                        {isLoading ? 'UPDATING...' : 'UPDATE PASSWORD'}
                    </Button>

                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onBack}
                        className="w-full font-pixel text-xs text-muted-foreground hover:text-primary"
                    >
                        <ArrowLeft className="h-3 w-3 mr-2" />
                        BACK TO LOGIN
                    </Button>
                </form>
            </div>
        </div>
    );
};
