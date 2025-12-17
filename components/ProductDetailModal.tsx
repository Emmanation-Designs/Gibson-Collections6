
import React, { useState } from 'react';
import { Product } from '../types';
import { useStore } from '../store/useStore';
import { X, ShoppingBag, Check, Heart, ShieldCheck, Truck } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  const { addToCart, toggleWishlist, wishlist } = useStore();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    product.colors && product.colors.length > 0 ? product.colors[0] : undefined
  );

  const images = product.image_urls && product.image_urls.length > 0 
    ? product.image_urls 
    : [`https://picsum.photos/seed/${product.id}/500/500`];

  const hasDiscount = product.discount && product.discount > 0;
  const finalPrice = hasDiscount 
    ? product.price * (1 - product.discount! / 100) 
    : product.price;

  const isWishlisted = wishlist.includes(product.id);

  const handleAddToCart = () => {
    addToCart(product, selectedColor);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="bg-white w-full md:w-full max-w-5xl max-h-[90vh] md:h-auto md:max-h-[85vh] rounded-2xl shadow-2xl relative flex flex-col md:flex-row z-10 animate-in zoom-in-95 duration-200 overflow-y-auto md:overflow-hidden">
        
        {/* Close Button */}
        <div className="absolute top-4 right-4 z-20">
          <button 
            onClick={onClose}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-gray-100 transition shadow-sm border border-gray-100"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Left Side: Images */}
        <div className="w-full md:w-1/2 bg-gray-50 flex flex-col flex-shrink-0">
          {/* Main Image */}
          <div className="relative h-72 sm:h-80 md:h-96 w-full flex-shrink-0 bg-gray-50">
            <img 
              src={images[selectedImageIndex]} 
              alt={product.name} 
              className="w-full h-full object-contain md:object-cover mix-blend-multiply md:mix-blend-normal"
            />
            {hasDiscount && (
              <div className="absolute top-4 left-4 bg-red-600 text-white font-bold px-3 py-1 rounded-full shadow-lg">
                -{product.discount}% OFF
              </div>
            )}
          </div>
          
          {/* Thumbnails */}
          <div className="p-4 flex gap-2 overflow-x-auto no-scrollbar justify-center bg-white border-t border-gray-100 min-h-[100px]">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImageIndex(idx)}
                className={`w-16 h-16 rounded-lg border-2 overflow-hidden flex-shrink-0 transition ${
                  selectedImageIndex === idx ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-gray-200'
                }`}
              >
                <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Info */}
        <div className="w-full md:w-1/2 flex flex-col bg-white md:h-full md:overflow-y-auto">
          <div className="p-6 md:p-8 flex flex-col h-full relative">
            {/* Header */}
            <div className="mb-4 pr-8">
              <span className="text-sm font-medium text-primary bg-blue-50 px-2 py-1 rounded-md mb-2 inline-block">
                {product.category}
              </span>
              <h2 className="text-2xl font-bold text-gray-900 leading-tight mb-2">
                {product.name}
              </h2>
              
              {/* Price Block */}
              <div className="flex items-baseline gap-3 mt-3">
                <span className={`text-3xl font-bold ${hasDiscount ? 'text-red-600' : 'text-gray-900'}`}>
                  ₦{finalPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
                {hasDiscount && (
                  <span className="text-lg text-gray-400 line-through decoration-gray-400">
                    ₦{product.price.toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            <hr className="border-gray-100 mb-6" />

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center justify-between">
                  Select Color
                  <span className="text-primary font-normal">{selectedColor}</span>
                </h3>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 rounded-full border transition flex items-center gap-2 ${
                        selectedColor === color 
                          ? 'border-primary bg-blue-50 text-primary font-medium ring-1 ring-primary' 
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {selectedColor === color && <Check className="w-3 h-3" />}
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
                <Truck className="w-4 h-4 text-green-600" />
                <span>Fast Delivery</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Quality Guarantee</span>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8 flex-grow">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                {product.description}
              </p>
            </div>

            {/* Action Buttons - Sticky on mobile */}
            <div className="mt-auto pt-4 border-t border-gray-100 grid grid-cols-[auto_1fr] gap-4 sticky bottom-0 bg-white pb-2 md:static md:pb-0 z-10">
              <button 
                onClick={() => toggleWishlist(product.id)}
                className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-1 transition w-20 ${
                  isWishlisted 
                    ? 'border-red-200 bg-red-50 text-red-500' 
                    : 'border-gray-200 text-gray-400 hover:bg-gray-50'
                }`}
              >
                <Heart className={`w-6 h-6 ${isWishlisted ? 'fill-current' : ''}`} />
                <span className="text-[10px] font-medium">Save</span>
              </button>
              
              <button 
                onClick={handleAddToCart}
                disabled={product.colors && product.colors.length > 0 && !selectedColor}
                className="bg-primary hover:bg-blue-800 text-white rounded-xl font-bold text-lg shadow-xl shadow-blue-900/20 transition transform active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="w-5 h-5" />
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
