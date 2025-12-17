import React from 'react';
import { useStore } from '../store/useStore';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Home, User, LayoutGrid, Search, LogIn } from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { cart, user, setSearchQuery, searchQuery } = useStore();
  const location = useLocation();

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const isActive = (path: string) => location.pathname === path ? 'text-primary' : 'text-gray-400';

  // Define paths where search should be hidden
  const hideSearchPaths = ['/auth', '/admin/upload', '/profile', '/wishlist', '/categories', '/settings'];
  const showSearch = !hideSearchPaths.includes(location.pathname);

  return (
    <div className="min-h-screen pb-20 md:pb-0 bg-surface">
      {/* Desktop/Mobile Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className={`flex items-center justify-between ${showSearch ? 'mb-3 md:mb-0' : ''}`}>
            <Link to="/" className="flex items-center gap-3">
              <img 
                src="/logo.png" 
                alt="Gibson Collections" 
                className="h-12 w-12 object-contain rounded-full bg-white border border-gray-100" 
              />
              <h1 className="text-xl font-bold text-primary hidden md:block">Gibson Collections</h1>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/" className="hover:text-primary font-medium">Home</Link>
              <Link to="/categories" className="hover:text-primary font-medium">Categories</Link>
              <Link to="/wishlist" className="hover:text-primary font-medium">Wishlist</Link>
              
              {user ? (
                <Link to="/profile" className="flex items-center gap-2 hover:text-primary font-medium">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt="User" className="w-6 h-6 rounded-full object-cover border border-gray-200" />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                  <span>Account</span>
                </Link>
              ) : (
                <Link to="/auth" className="flex items-center gap-2 text-primary font-bold border border-primary px-4 py-1.5 rounded-full hover:bg-blue-50 transition">
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </Link>
              )}

              <Link to="/cart" className="relative p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition">
                <ShoppingCart className="w-5 h-5 text-gray-700" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                    {cartCount}
                  </span>
                )}
              </Link>
            </nav>
          </div>

          {/* Search Bar (Conditional) */}
          {showSearch && (
            <div className="relative w-full md:max-w-md mx-auto">
              <input
                type="text"
                placeholder="Search diapers, bags, shoes..."
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-gray-100 border-none focus:ring-2 focus:ring-primary focus:bg-white transition text-sm text-gray-900 placeholder-gray-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3.5 top-2.5 w-5 h-5 text-gray-400" />
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-6 flex justify-between items-center md:hidden z-50">
        <Link to="/" className={`flex flex-col items-center gap-1 ${isActive('/')}`}>
          <Home className="w-6 h-6" />
          <span className="text-[10px] font-medium">Home</span>
        </Link>
        <Link to="/categories" className={`flex flex-col items-center gap-1 ${isActive('/categories')}`}>
          <LayoutGrid className="w-6 h-6" />
          <span className="text-[10px] font-medium">Categories</span>
        </Link>
        <Link to="/cart" className={`flex flex-col items-center gap-1 ${isActive('/cart')} relative`}>
          <div className="relative">
            <ShoppingCart className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium">Cart</span>
        </Link>
        <Link to={user ? "/profile" : "/auth"} className={`flex flex-col items-center gap-1 ${isActive('/profile') || isActive('/auth') || isActive('/settings')}`}>
          {user && user.avatar_url ? (
            <img src={user.avatar_url} alt="Me" className={`w-6 h-6 rounded-full object-cover border ${isActive('/profile') ? 'border-primary' : 'border-transparent'}`} />
          ) : (
            <User className="w-6 h-6" />
          )}
          <span className="text-[10px] font-medium">{user ? 'Me' : 'Login'}</span>
        </Link>
      </div>
    </div>
  );
};