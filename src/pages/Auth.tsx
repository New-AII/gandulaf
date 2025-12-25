import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const Auth: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate('/');
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success('Logged in successfully!');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`
          }
        });
        if (error) throw error;
        toast.success('Account created! You can now play.');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-top to-sky-bottom flex items-center justify-center p-4">
      <div className="bg-card/90 backdrop-blur-sm rounded-2xl p-6 w-full max-w-sm shadow-xl border border-primary/20">
        <h1 className="font-bengali text-3xl font-bold text-center text-foreground mb-2">
          গান্ডু খেলা
        </h1>
        <h2 className="font-game text-xl text-center text-primary mb-6">
          {isLogin ? 'Admin Login' : 'Create Account'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-background/50"
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="bg-background/50"
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Loading...' : isLogin ? 'Login' : 'Sign Up'}
          </Button>
        </form>

        <p className="text-center text-muted-foreground mt-4 text-sm">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary ml-1 hover:underline"
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>

        <Button
          variant="ghost"
          className="w-full mt-4"
          onClick={() => navigate('/')}
        >
          Back to Game
        </Button>
      </div>
    </div>
  );
};

export default Auth;
