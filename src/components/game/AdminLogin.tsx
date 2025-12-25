import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Lock } from 'lucide-react';
import { toast } from 'sonner';

interface AdminLoginProps {
  onSuccess: () => void;
  onBack: () => void;
}

const ADMIN_PASSWORD = 'rony54321#';

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onBack }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password === ADMIN_PASSWORD) {
      toast.success('Admin access granted!');
      onSuccess();
    } else {
      setError('Wrong password');
      setPassword('');
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-gradient-to-b from-sky-top to-sky-bottom">
      <div className="bg-card/90 backdrop-blur-sm rounded-2xl p-6 w-full max-w-sm shadow-xl border border-primary/20">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Lock className="w-6 h-6 text-primary" />
          <h1 className="font-game text-2xl text-foreground">Admin Login</h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-background/50"
          />
          
          {error && (
            <p className="text-destructive text-sm text-center">{error}</p>
          )}

          <Button type="submit" className="w-full">
            Login
          </Button>
        </form>

        <Button
          onClick={onBack}
          variant="ghost"
          className="w-full mt-4 flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Game
        </Button>
      </div>
    </div>
  );
};
