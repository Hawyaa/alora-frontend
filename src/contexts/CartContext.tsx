'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartItem {
  id: string;           // Frontend ID (MongoDB product _id)
  productId: string;    // MongoDB Product ID (same as id for consistency)
  name: string;
  price: number;
  quantity: number;
  image: string;
  category?: string;
  shade?: string;
  uniqueId?: string;    // Unique ID for React keys
}

interface CartContextType {
  cartItems: CartItem[];
  cartTotal: number;
  addToCart: (item: Omit<CartItem, 'quantity' | 'uniqueId'>) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  syncCartWithBackend: () => Promise<boolean>;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

// Generate unique ID for cart items
const generateUniqueId = (item: Omit<CartItem, 'quantity' | 'uniqueId'>): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  const shade = item.shade || 'default';
  return `${item.id}-${shade}-${timestamp}-${random}`;
};

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem('alora-cart');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        // Ensure each item has uniqueId, productId, and proper structure
        const validatedItems = parsed.map((item: any) => ({
          ...item,
          productId: item.productId || item.id,
          uniqueId: item.uniqueId || generateUniqueId({
            id: item.id || item.productId,
            productId: item.productId || item.id,
            name: item.name,
            price: item.price,
            image: item.image,
            category: item.category,
            shade: item.shade
          })
        }));
        setCartItems(validatedItems);
      } catch (error) {
        console.error('Error parsing cart from localStorage:', error);
        localStorage.removeItem('alora-cart');
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('alora-cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Calculate total
  const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  // Check token validity
  const checkTokenValidity = async (token: string): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/verify', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      return data.success === true;
    } catch (error) {
      console.error('Token verification failed:', error);
      return false;
    }
  };

  // Sync cart with backend
  const syncCartWithBackend = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('alora-token');
      
      if (!token) {
        console.log('⚠️ No auth token, skipping backend sync');
        return false;
      }

      // Verify token first
      const isValid = await checkTokenValidity(token);
      if (!isValid) {
        console.error('❌ Invalid token, cannot sync cart');
        return false;
      }

      if (cartItems.length === 0) {
        console.log('🛒 Cart is empty, skipping sync');
        return true;
      }

      console.log(`🔄 Syncing ${cartItems.length} items with backend`);
      
      // Prepare items for backend
      const backendItems = cartItems.map(item => ({
        productId: item.productId || item.id,
        quantity: item.quantity,
        price: item.price,
        name: item.name,
        shade: item.shade || 'default'
      }));

      console.log('📤 Sending to backend:', backendItems);

      // Send cart items to backend
      const response = await fetch('http://localhost:5000/api/cart/sync', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ items: backendItems })
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('❌ Backend sync failed:', data);
        return false;
      }

      console.log('✅ Cart synced successfully');
      return true;

    } catch (error: any) {
      console.error('❌ Cart sync error:', error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = (item: Omit<CartItem, 'quantity' | 'uniqueId'>) => {
    // Generate unique ID for this cart item
    const uniqueId = generateUniqueId(item);
    
    // Ensure productId is set
    const itemWithIds = {
      ...item,
      productId: item.productId || item.id,
      uniqueId
    };

    setCartItems(prevItems => {
      // Check if same product with same shade already exists
      const existingItem = prevItems.find(i => 
        i.productId === itemWithIds.productId && 
        i.shade === itemWithIds.shade
      );
      
      if (existingItem) {
        // Update quantity of existing item
        return prevItems.map(i =>
          i.uniqueId === existingItem.uniqueId 
            ? { ...i, quantity: i.quantity + 1 } 
            : i
        );
      } else {
        // Add new item
        return [...prevItems, { ...itemWithIds, quantity: 1 }];
      }
    });

    // Sync with backend if user is logged in
    const token = localStorage.getItem('alora-token');
    if (token) {
      setTimeout(() => {
        syncCartWithBackend().then(success => {
          if (!success) {
            console.warn('Sync failed but cart updated locally');
          }
        });
      }, 500);
    }
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId 
          ? { ...item, quantity: Math.max(0, quantity) } 
          : item
      ).filter(item => item.quantity > 0)
    );

    // Sync with backend
    const token = localStorage.getItem('alora-token');
    if (token) {
      setTimeout(() => syncCartWithBackend(), 500);
    }
  };

  // FIXED: Use item.id instead of itemUniqueId
  const removeFromCart = (itemId: string) => {
    console.log('🗑️ Removing item with ID:', itemId);
    console.log('Current cart items before removal:', cartItems);
    
    setCartItems(prevItems => {
      const newItems = prevItems.filter(item => item.id !== itemId);
      console.log('New cart after removal:', newItems);
      return newItems;
    });

    // Sync with backend
    const token = localStorage.getItem('alora-token');
    if (token) {
      setTimeout(() => syncCartWithBackend(), 500);
    }
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('alora-cart');

    // Sync with backend
    const token = localStorage.getItem('alora-token');
    if (token) {
      setTimeout(() => syncCartWithBackend(), 500);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartTotal,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        syncCartWithBackend,
        isLoading
      }}
    >
      {children}
    </CartContext.Provider>
  );
};