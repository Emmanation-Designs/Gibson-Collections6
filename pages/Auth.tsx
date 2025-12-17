import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Loader2, Eye, EyeOff, Mail, Lock, ArrowLeft } from 'lucide-react';

// Helper to safely extract error messages
const extractErrorMessage = (err: any): string => {
  if (!err) return 'An unknown error occurred.';
  if (typeof err === 'string') return err;
  if (err instanceof Error) return err.message;
  
  // Handle Supabase/API error objects
  if (typeof err === 'object') {
    if (err.error_description) return err.error_description;
    if (err.message) return err.message;
    // Check for nested error objects common in some responses
    if (err.error && typeof err.error === 'object' && err.error.message) return err.error.message;
    
    try {
      const json = JSON.stringify(err);
      if (json !== '{}' && !json.includes('[object Object]')) return `Error: ${json}`;
    } catch { /* ignore */ }
  }
  
  return 'Authentication failed. Please check your connection and try again.';
};

export const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { setUser } = useStore();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        if (data.user && data.user.email) {
          setUser({ id: data.user.id, email: data.user.email });
          navigate('/');
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        if (data.user && data.user.email) {
            setUser({ id: data.user.id, email: data.user.email });
            alert("Account created! Welcome to Gibson Collections.");
            navigate('/');
        }
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 relative">
      <div className="absolute top-0 left-4 md:left-10 md:top-10">
        <Link to="/" className="flex items-center gap-2 text-gray-500 hover:text-primary transition p-2 bg-white/80 rounded-full">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back to Home</span>
        </Link>
      </div>

      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100 mt-12 md:mt-0">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-gray-500 mt-2 text-sm">
            {isLogin ? 'Login to continue shopping' : 'Join Gibson Collections today'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6 flex items-start animate-pulse">
             <span className="font-semibold mr-1">Error:</span> {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-400"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-400"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3.5 rounded-xl font-bold hover:bg-blue-800 transition disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center shadow-lg shadow-blue-900/10 mt-2"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center text-sm">
          <span className="text-gray-500">
            {isLogin ? "New to Gibson Collections? " : "Already have an account? "}
          </span>
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary font-bold hover:underline ml-1"
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </div>
      </div>
    </div>
  );
};