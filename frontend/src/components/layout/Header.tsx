import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { User } from '@/types/game';
import { Gamepad2, Trophy, Eye, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'PLAY', icon: Gamepad2 },
    { path: '/leaderboard', label: 'RANKS', icon: Trophy },
    { path: '/spectate', label: 'WATCH', icon: Eye },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center box-glow">
            <span className="text-primary-foreground font-pixel text-xs">S</span>
          </div>
          <span className="font-pixel text-sm text-glow hidden sm:inline">SNAKE</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link key={path} to={path}>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "gap-2",
                  location.pathname === path && "bg-muted text-primary"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </Button>
            </Link>
          ))}
        </nav>

        {/* Auth */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded bg-muted">
                <UserIcon className="h-4 w-4 text-primary" />
                <span className="font-mono text-sm">{user.username}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={onLogout}>
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">LOGOUT</span>
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button variant="outline" size="sm">
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">LOGIN</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
