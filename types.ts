
export interface Product {
  id: string;
  created_at: string;
  name: string;
  price: number;
  category: string;
  description: string;
  image_urls: string[];
  discount?: number; // Percentage (0-100)
  colors?: string[]; // Array of available colors
}

export interface CartItem extends Product {
  quantity: number;
  selectedColor?: string; // The specific color user chose
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}

export const ADMIN_EMAILS = [
  'gibsoncollections1@gmail.com',
  'gibsoncollections2@gmail.com'
];

export const CATEGORIES = [
  // Baby Care
  'Diapers',
  'Wipes',
  'Baby Lotions & Creams',
  'Baby Soaps & Wash',
  'Feeding Essentials',
  'Baby Clothing',
  
  // Bags
  'Diaper Bags',
  'Handbags',
  'School Bags',
  'Lunch Bags',
  'Backpacks',
  'Wallets & Purses',

  // Shoes
  'Ladies Shoes',
  'Kids Shoes',
  'Sneakers',
  'Sandals & Slippers',

  // Accessories
  'Jewelry',
  'Watches',
  'Sunglasses',
  'Hair Accessories',
  'Belts',
  'Perfumes'
];

export const WHATSAPP_NUMBER = '2348033464218';
