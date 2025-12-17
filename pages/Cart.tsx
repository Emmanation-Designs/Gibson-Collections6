
import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Minus, Plus, Trash2, MessageCircle, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { WHATSAPP_NUMBER } from '../types';

export const Cart: React.FC = () => {
  const { cart, removeFromCart, updateQuantity } = useStore();
  const [address, setAddress] = useState('');
  const navigate = useNavigate();
  
  const calculateItemPrice = (item: any) => {
    if (item.discount && item.discount > 0) {
      return item.price * (1 - item.discount / 100);
    }
    return item.price;
  };

  const subtotal = cart.reduce((sum, item) => sum + (calculateItemPrice(item) * item.quantity), 0);
  
  const handleWhatsAppCheckout = () => {
    if (!address.trim()) {
      alert("Please enter your delivery address and phone number.");
      return;
    }

    let message = `*New Order from Gibson Collections Website*\n\n`;
    message += `*Customer Details:*\n${address}\n\n`;
    message += `*Order Items:*\n`;
    
    cart.forEach(item => {
      const price = calculateItemPrice(item);
      const colorInfo = item.selectedColor ? ` (Color: ${item.selectedColor})` : '';
      message += `- ${item.name}${colorInfo} x${item.quantity} - ₦${(price * item.quantity).toLocaleString()}\n`;
    });
    
    message += `\n*Total Amount: ₦${subtotal.toLocaleString()}*`;

    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    
    window.open(url, '_blank');
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="bg-gray-100 p-6 rounded-full mb-6">
          <Trash2 className="w-12 h-12 text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Looks like you haven't added anything yet.</p>
        <Link to="/" className="bg-primary text-white px-8 py-3 rounded-full font-medium hover:bg-blue-800 transition">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="flex items-center gap-2 mb-6">
        <button 
          onClick={() => navigate('/')} 
          className="p-2 hover:bg-gray-100 rounded-full transition"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Shopping Cart ({cart.length})</h1>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Cart Items List */}
        <div className="md:col-span-2 space-y-4">
          {cart.map((item) => {
             const finalPrice = calculateItemPrice(item);
             return (
              <div key={`${item.id}-${item.selectedColor || 'default'}`} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
                <div className="w-24 h-24 bg-gray-50 rounded-lg flex-shrink-0 overflow-hidden relative">
                  <img 
                    src={item.image_urls?.[0] || `https://picsum.photos/seed/${item.id}/200`} 
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  {item.discount && item.discount > 0 && (
                    <div className="absolute top-0 left-0 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-br">
                      -{item.discount}%
                    </div>
                  )}
                </div>
                
                <div className="flex-grow flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-800 line-clamp-1">{item.name}</h3>
                      <div className="flex flex-col gap-1">
                        <p className="text-sm text-gray-500">{item.category}</p>
                        {item.selectedColor && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 w-fit">
                            Color: {item.selectedColor}
                          </span>
                        )}
                      </div>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id, item.selectedColor)}
                      className="text-gray-400 hover:text-red-500 transition"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex justify-between items-end mt-2">
                    <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1">
                      <button 
                        onClick={() => updateQuantity(item.id, -1, item.selectedColor)}
                        className="p-1 hover:bg-white rounded-md transition shadow-sm"
                      >
                        <Minus className="w-4 h-4 text-gray-600" />
                      </button>
                      <span className="font-medium text-gray-700 w-6 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, 1, item.selectedColor)}
                        className="p-1 hover:bg-white rounded-md transition shadow-sm"
                      >
                        <Plus className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary text-lg">
                        ₦{(finalPrice * item.quantity).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </p>
                      {item.discount && item.discount > 0 && (
                        <p className="text-xs text-gray-400 line-through">
                          ₦{(item.price * item.quantity).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Checkout Summary */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
            <h3 className="font-bold text-lg mb-4">Order Summary</h3>
            
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-bold">₦{subtotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
            <div className="flex justify-between py-3 mb-6">
              <span className="text-gray-600 font-bold">Total</span>
              <span className="font-bold text-xl text-primary">₦{subtotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Address & Phone Number
              </label>
              <textarea
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm text-gray-900 bg-white placeholder-gray-400"
                rows={3}
                placeholder="e.g. 123 Lagos Street, Ikeja. 08012345678"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <button
              onClick={handleWhatsAppCheckout}
              className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-4 rounded-xl font-bold shadow-lg transition flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              Send Order on WhatsApp
            </button>
            
            <p className="text-xs text-center text-gray-500 mt-4">
              Clicking this will open WhatsApp with your pre-filled order details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
