import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, AuthState } from '@/types/game';
import { api } from '@/services/api';

interface AuthContextType extends AuthState {
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    signup: (username: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    resetPassword: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    deleteAccount: () => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        isAuthenticated: false,
        isLoading: true,
    });

    // Check for existing session on mount
    useEffect(() => {
        const user = api.auth.getSession();
        setAuthState({
            user,
            isAuthenticated: !!user,
            isLoading: false,
        });
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        setAuthState(prev => ({ ...prev, isLoading: true }));
        try {
            const { user } = await api.auth.login(email, password);
            api.auth.persistSession(user);
            setAuthState({
                user,
                isAuthenticated: true,
                isLoading: false,
            });
            return { success: true };
        } catch (error) {
            setAuthState(prev => ({ ...prev, isLoading: false }));
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Login failed'
            };
        }
    }, []);

    const signup = useCallback(async (username: string, email: string, password: string) => {
        setAuthState(prev => ({ ...prev, isLoading: true }));
        try {
            const { user } = await api.auth.signup(username, email, password);
            api.auth.persistSession(user);
            setAuthState({
                user,
                isAuthenticated: true,
                isLoading: false,
            });
            return { success: true };
        } catch (error) {
            setAuthState(prev => ({ ...prev, isLoading: false }));
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Signup failed'
            };
        }
    }, []);

    const logout = useCallback(async () => {
        await api.auth.logout();
        api.auth.persistSession(null);
        setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
        });
    }, []);

    const resetPassword = useCallback(async (email: string, password: string) => {
        setAuthState(prev => ({ ...prev, isLoading: true }));
        try {
            await api.auth.resetPassword(email, password);
            setAuthState(prev => ({ ...prev, isLoading: false }));
            return { success: true };
        } catch (error) {
            setAuthState(prev => ({ ...prev, isLoading: false }));
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Reset failed'
            };
        }
    }, []);

    const deleteAccount = useCallback(async () => {
        setAuthState(prev => ({ ...prev, isLoading: true }));
        try {
            await api.auth.deleteAccount();
            setAuthState({
                user: null,
                isAuthenticated: false,
                isLoading: false,
            });
            return { success: true };
        } catch (error) {
            setAuthState(prev => ({ ...prev, isLoading: false }));
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Delete failed'
            };
        }
    }, []);

    return (
        <AuthContext.Provider value={{
            ...authState,
            login,
            signup,
            logout,
            resetPassword,
            deleteAccount,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
};
