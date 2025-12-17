
import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Auth } from './pages/Auth';
import { Upload } from './pages/Upload';
import { Cart } from './pages/Cart';
import { Profile } from './pages/Profile';
import { Wishlist } from './pages/Wishlist';
import { Categories } from './pages/Categories';
import { Settings } from './pages/Settings';
import { AdminFab } from './components/AdminFab';
import { useStore } from './store/useStore';
import { supabase } from './lib/supabase';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const { setUser, setAuthReady, isAuthReady } = useStore();

  useEffect(() => {
    // 1. Initial Session Check
    const initSession = async () => {
      try {
        // Check for local session first
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // CRITICAL FIX: Explicitly fetch the latest user data from the server.
          // getSession() can sometimes return stale metadata from localStorage.
          const { data: { user: freshUser }, error: userError } = await supabase.auth.getUser();
          
          // Use fresh user data if available, otherwise fall back to session user
          const currentUser = (freshUser && !userError) ? freshUser : session.user;

          setUser({ 
            id: currentUser.id, 
            email: currentUser.email!,
            full_name: currentUser.user_metadata?.full_name,
            avatar_url: currentUser.user_metadata?.avatar_url
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Session check failed", error);
        setUser(null);
      } finally {
        setAuthReady(true);
      }
    };

    initSession();

    // 2. Auth State Listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser({ 
          id: session.user.id, 
          email: session.user.email!,
          full_name: session.user.user_metadata?.full_name,
          avatar_url: session.user.user_metadata?.avatar_url
        });
      } else {
        setUser(null);
      }
      setAuthReady(true);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, setAuthReady]);

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-[#1e40af] animate-spin" />
          <p className="text-gray-500 font-medium animate-pulse">Loading Gibson Collections...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/admin/upload" element={<Upload />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <AdminFab />
      </Layout>
    </Router>
  );
};

export default App;
