
import React, { useState, useRef, useEffect } from 'react';
import { Product, ADMIN_EMAILS } from '../types';
import { useStore } from '../store/useStore';
import { ShoppingCart, Heart, Trash2, Loader2, MoreVertical, Edit, Eye } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
  onDelete?: (id: string) => void;
  onClick?: (product: Product) => void;
}

const extractErrorMessage = (err: any): string => {
  if (!err) return 'An unknown error occurred.';
  if (typeof err === 'string') return err;
  if (err instanceof Error) return err.message;
  if (typeof err === 'object') {
    if (err.message) return err.message;
    if (err.error_description) return err.error_description;
    try {
      const json = JSON.stringify(err);
      if (json !== '{}' && !json.includes('[object Object]')) return json;
    } catch { /* ignore */ }
  }
  return 'Failed to perform action.';
};

export const ProductCard: React.FC<ProductCardProps> = ({ product, onDelete, onClick }) => {
  const { addToCart, toggleWishlist, wishlist, user } = useStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const isWishlisted = wishlist.includes(product.id);
  const isAdmin = user?.email && ADMIN_EMAILS.some(email => email.toLowerCase() === user.email?.toLowerCase());

  const imageUrl = product.image_urls && product.image_urls.length > 0 
    ? product.image_urls[0] 
    : `https://picsum.photos/seed/${product.id}/300/300`;

  const hasDiscount = product.discount && product.discount > 0;
  const finalPrice = hasDiscount 
    ? product.price * (1 - product.discount! / 100) 
    : product.price;

  const hasColors = product.colors && product.colors.length > 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDelete = async () => {
    // Close menu immediately
    setShowMenu(false);

    if (!window.confirm('Are you sure you want to delete this product? This cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id);

      if (error) throw error;
      
      if (onDelete) {
        onDelete(product.id);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert(`Delete failed: ${extractErrorMessage(error)}`);
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    navigate(`/admin/upload?id=${product.id}`);
    setShowMenu(false);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    // Prevent navigation if clicking buttons or menu items
    if (target.closest('button') || target.closest('[role="menuitem"]')) return;
    
    if (onClick) {
      onClick(product);
    }
  };

  return (
    <div 
      className={`group bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative cursor-pointer ${showMenu ? 'z-50' : 'z-0'}`}
      onClick={handleCardClick}
    >
      {/* Loading Overlay for Deletion */}
      {isDeleting && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-[60] flex flex-col items-center justify-center rounded-2xl animate-in fade-in">
          <Loader2 className="w-8 h-8 text-red-500 animate-spin mb-2" />
          <span className="text-xs font-medium text-red-500">Deleting...</span>
        </div>
      )}

      {/* Admin Menu */}
      {isAdmin && (
        <div className="absolute top-3 left-3 z-30" ref={menuRef}>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-2 rounded-full bg-white/90 hover:bg-white text-gray-700 transition shadow-sm backdrop-blur-sm"
            title="Admin Options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          
          {showMenu && (
            <div className="absolute top-full left-0 mt-1 w-36 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden py-1 animate-in fade-in zoom-in duration-200 z-40" role="menu">
              <button 
                onClick={(e) => { e.stopPropagation(); handleEdit(); }}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                role="menuitem"
              >
                <Edit className="w-3 h-3" /> Edit
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                disabled={isDeleting}
                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                role="menuitem"
              >
                <Trash2 className="w-3 h-3" />
                Delete
              </button>
            </div>
          )}
        </div>
      )}

      {/* Image Area - Added rounded-t-2xl because parent doesn't have overflow-hidden anymore */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden rounded-t-2xl">
        <img 
          src={imageUrl} 
          alt={product.name} 
          className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />

        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md z-10 animate-pulse pointer-events-none">
            -{product.discount}% OFF
          </div>
        )}
        
        {/* Wishlist Button */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            toggleWishlist(product.id);
          }}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition text-gray-400 hover:text-red-500 hover:shadow-sm z-10"
        >
          <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
        </button>
      </div>
      
      {/* Content Area */}
      <div className="p-4 flex flex-col flex-grow relative z-0">
        <div className="flex justify-between items-start mb-1">
          <p className="text-[10px] md:text-xs text-gray-500 font-semibold uppercase tracking-wider">{product.category}</p>
        </div>
        
        <h3 className="font-medium text-gray-900 text-sm md:text-[15px] leading-snug line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        
        {/* Colors Preview */}
        {hasColors && (
          <div className="flex items-center gap-2 mb-3">
             <span className="text-[10px] text-gray-400 font-medium">Colors:</span>
             <div className="flex gap-1.5">
              {product.colors!.slice(0, 4).map((c, i) => (
                <div 
                  key={i} 
                  className="w-3 h-3 rounded-full border border-gray-300 shadow-sm" 
                  style={{ backgroundColor: c.toLowerCase().replace(' ', '') }} 
                  title={c} 
                />
              ))}
              {product.colors!.length > 4 && <span className="text-[10px] text-gray-400">+{product.colors!.length - 4}</span>}
             </div>
          </div>
        )}

        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex flex-col">
            <span className={`text-lg font-bold ${hasDiscount ? 'text-red-600' : 'text-gray-900'}`}>
              ₦{finalPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
            {hasDiscount && (
              <span className="text-xs text-gray-400 line-through font-medium">₦{product.price.toLocaleString()}</span>
            )}
          </div>

          <button 
            onClick={(e) => {
              e.stopPropagation();
              if (hasColors && onClick) {
                onClick(product);
              } else {
                addToCart(product);
              }
            }}
            className="w-10 h-10 rounded-full bg-blue-50 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300 shadow-sm hover:shadow-md active:scale-95 group-hover:bg-primary group-hover:text-white"
            aria-label={hasColors ? "View Options" : "Add to cart"}
          >
            {hasColors ? <Eye className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
