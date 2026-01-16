import React from 'react';
import { Header } from './Header';
import { User } from '@/types/game';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background grid effect */}
      <div className="fixed inset-0 grid-pattern opacity-20 pointer-events-none" />
      
      {/* Ambient glow effects */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />
      
      <Header user={user} onLogout={onLogout} />
      
      <main className="container py-8 relative z-10">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="border-t border-border py-6 mt-auto">
        <div className="container text-center text-xs text-muted-foreground font-mono">
          <p>SNAKE ARCADE © 2024 • Built with Lovable</p>
        </div>
      </footer>
    </div>
  );
};
