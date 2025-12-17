
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product, UserProfile } from '../types';

interface AppState {
  user: UserProfile | null;
  isAuthReady: boolean;
  cart: CartItem[];
  wishlist: string[];
  searchQuery: string;
  
  setUser: (user: UserProfile | null) => void;
  setAuthReady: (ready: boolean) => void;
  addToCart: (product: Product, selectedColor?: string) => void;
  removeFromCart: (productId: string, selectedColor?: string) => void;
  updateQuantity: (productId: string, delta: number, selectedColor?: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  setSearchQuery: (query: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      isAuthReady: false,
      cart: [],
      wishlist: [],
      searchQuery: '',

      setUser: (user) => set({ user }),
      setAuthReady: (ready) => set({ isAuthReady: ready }),

      addToCart: (product, selectedColor) => set((state) => {
        // Find item matching both ID and Color
        const existingIndex = state.cart.findIndex(
          (item) => item.id === product.id && item.selectedColor === selectedColor
        );

        if (existingIndex !== -1) {
          const newCart = [...state.cart];
          newCart[existingIndex].quantity += 1;
          return { cart: newCart };
        }
        
        return { cart: [...state.cart, { ...product, quantity: 1, selectedColor }] };
      }),

      removeFromCart: (productId, selectedColor) => set((state) => ({
        cart: state.cart.filter((item) => !(item.id === productId && item.selectedColor === selectedColor)),
      })),

      updateQuantity: (productId, delta, selectedColor) => set((state) => ({
        cart: state.cart.map((item) => {
          if (item.id === productId && item.selectedColor === selectedColor) {
            const newQty = Math.max(1, item.quantity + delta);
            return { ...item, quantity: newQty };
          }
          return item;
        }),
      })),

      clearCart: () => set({ cart: [] }),

      toggleWishlist: (productId) => set((state) => {
        const inWishlist = state.wishlist.includes(productId);
        return {
          wishlist: inWishlist
            ? state.wishlist.filter((id) => id !== productId)
            : [...state.wishlist, productId],
        };
      }),

      setSearchQuery: (query) => set({ searchQuery: query }),
    }),
    {
      name: 'gibson-collections-storage',
      partialize: (state) => ({ cart: state.cart, wishlist: state.wishlist }),
    }
  )
);
