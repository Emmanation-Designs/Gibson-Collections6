
import React from 'react';
import { Link } from 'react-router-dom';
import { CATEGORIES } from '../types';
import { ArrowLeft } from 'lucide-react';

// Map categories to high-quality representative images
const CATEGORY_IMAGES: Record<string, string> = {
  'Diapers': 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=500&auto=format&fit=crop&q=60',
  'Wipes': 'https://plus.unsplash.com/premium_photo-1679064283838-4b77ce80313a?w=500&auto=format&fit=crop&q=60',
  'Baby Lotions & Creams': 'https://images.unsplash.com/photo-1616750949216-7d122e570395?w=500&auto=format&fit=crop&q=60',
  'Baby Soaps & Wash': 'https://images.unsplash.com/photo-1559244749-0d1275d49110?w=500&auto=format&fit=crop&q=60',
  'Feeding Essentials': 'https://images.unsplash.com/photo-1566838381861-b84497e2017e?w=500&auto=format&fit=crop&q=60',
  'Baby Clothing': 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=500&auto=format&fit=crop&q=60',
  'Diaper Bags': 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=60',
  'Handbags': 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=500&auto=format&fit=crop&q=60',
  'School Bags': 'https://images.unsplash.com/photo-1588072432836-e10032774350?w=500&auto=format&fit=crop&q=60',
  'Lunch Bags': 'https://images.unsplash.com/photo-1590736704728-f4730bb30770?w=500&auto=format&fit=crop&q=60',
  'Backpacks': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=60',
  'Wallets & Purses': 'https://images.unsplash.com/photo-1627123424574-18bd75f3194c?w=500&auto=format&fit=crop&q=60',
  'Ladies Shoes': 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500&auto=format&fit=crop&q=60',
  'Kids Shoes': 'https://images.unsplash.com/photo-1515347619252-60a6bf4fffce?w=500&auto=format&fit=crop&q=60',
  'Sneakers': 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=500&auto=format&fit=crop&q=60',
  'Sandals & Slippers': 'https://images.unsplash.com/photo-1603487742131-4160d6986ba3?w=500&auto=format&fit=crop&q=60',
  'Jewelry': 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500&auto=format&fit=crop&q=60',
  'Watches': 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500&auto=format&fit=crop&q=60',
  'Sunglasses': 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&auto=format&fit=crop&q=60',
  'Hair Accessories': 'https://images.unsplash.com/photo-1532329683184-a8133f960484?w=500&auto=format&fit=crop&q=60',
  'Belts': 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=500&auto=format&fit=crop&q=60',
  'Perfumes': 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=500&auto=format&fit=crop&q=60',
};

export const Categories: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="flex items-center gap-2 mb-6">
        <Link 
          to="/" 
          className="p-2 hover:bg-gray-100 rounded-full transition"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">All Categories</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {CATEGORIES.map((category) => (
          <Link
            key={category}
            to={`/?category=${encodeURIComponent(category)}`}
            className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-300 group overflow-hidden flex flex-col"
          >
            <div className="aspect-[4/3] w-full overflow-hidden bg-gray-50 relative">
              <img 
                src={CATEGORY_IMAGES[category] || `https://source.unsplash.com/featured/?${encodeURIComponent(category)}`} 
                alt={category}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
            </div>
            
            <div className="p-4 flex items-center justify-between">
              <span className="font-semibold text-gray-800 group-hover:text-primary transition">{category}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
