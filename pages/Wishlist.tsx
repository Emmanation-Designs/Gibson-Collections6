import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { supabase } from '../lib/supabase';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import { Loader2, Heart, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const Wishlist: React.FC = () => {
  const { wishlist } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      if (wishlist.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .in('id', wishlist);

        if (error) throw error;
        setProducts(data || []);
      } catch (err) {
        console.error('Error fetching wishlist:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlistProducts();
  }, [wishlist]);

  // Filter out any products that might have been deleted from DB but are still in local storage wishlist
  const validProducts = products.filter(p => wishlist.includes(p.id));

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="flex items-center gap-2 mb-6">
        <button 
          onClick={() => navigate('/')} 
          className="p-2 hover:bg-gray-100 rounded-full transition"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">My Wishlist</h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : validProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="bg-red-50 p-6 rounded-full mb-6">
            <Heart className="w-12 h-12 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-500 mb-6">Save items you love here to buy them later.</p>
          <Link to="/" className="bg-primary text-white px-8 py-3 rounded-full font-medium hover:bg-blue-800 transition">
            Explore Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {validProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};