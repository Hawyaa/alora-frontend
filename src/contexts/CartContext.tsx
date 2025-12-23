// contexts/CartContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category?: string;
  shade?: string;
  uniqueId?: string;
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
  refreshCart: () => void;
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

const generateUniqueId = (item: Omit<CartItem, 'quantity' | 'uniqueId'>): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  const shade = item.shade || 'default';
  return `${item.id}-${shade}-${timestamp}-${random}`;
};

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Helper to get current user ID
  const getCurrentUserId = (): string => {
    if (typeof window === 'undefined') return 'guest';
    
    const userData = localStorage.getItem('alora-user');
    if (!userData) return 'guest';
    
    try {
      const user = JSON.parse(userData);
      return user.id || user.email || 'guest';
    } catch {
      return 'guest';
    }
  };

  // Helper to get cart key for current user
  const getCartKey = (): string => {
    const userId = getCurrentUserId();
    return `alora-cart-${userId}`;
  };

  // Function to load cart for current user
  const loadCartForCurrentUser = (): CartItem[] => {
    if (typeof window === 'undefined') return [];
    
    const userId = getCurrentUserId();
    const cartKey = `alora-cart-${userId}`;
    const savedCart = localStorage.getItem(cartKey);
    
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
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
        console.log(`✅ Loaded ${validatedItems.length} items for user: ${userId}`);
        return validatedItems;
      } catch (error) {
        console.error('Error parsing cart:', error);
        localStorage.removeItem(cartKey);
        return [];
      }
    }
    
    console.log(`📭 No cart found for user: ${userId}`);
    return [];
  };

  // Function to cleanup old user carts (keep only current user's cart)
  const cleanupOldCarts = () => {
    if (typeof window === 'undefined') return;
    
    const currentUserId = getCurrentUserId();
    const currentCartKey = `alora-cart-${currentUserId}`;
    
    // Get all cart keys
    const cartKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('alora-cart-')) {
        cartKeys.push(key);
      }
    }
    
    // Remove all except current user's cart
    cartKeys.forEach(key => {
      if (key !== currentCartKey) {
        localStorage.removeItem(key);
        console.log(`🗑️ Removed old cart: ${key}`);
      }
    });
    
    // Also remove legacy cart key
    localStorage.removeItem('alora-cart');
  };

  // Check for user changes and reload cart
  useEffect(() => {
    const checkUserAndReloadCart = () => {
      const newUserId = getCurrentUserId();
      
      // If user changed, clear current cart and load new one
      if (currentUserId !== newUserId) {
        console.log(`👤 User changed: ${currentUserId} -> ${newUserId}`);
        console.log('🔄 Resetting cart for new user...');
        
        // Clear React state
        setCartItems([]);
        
        // Cleanup old carts
        cleanupOldCarts();
        
        // Load new user's cart
        const newCart = loadCartForCurrentUser();
        setCartItems(newCart);
        
        // Update current user ID
        setCurrentUserId(newUserId);
      }
    };

    // Initial load
    const initialUserId = getCurrentUserId();
    const initialCart = loadCartForCurrentUser();
    setCartItems(initialCart);
    setCurrentUserId(initialUserId);
    cleanupOldCarts();
    
    // Listen for storage changes (login/logout)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'alora-user' || e.key === 'alora-token') {
        console.log('🔄 Auth state changed, checking user...');
        setTimeout(checkUserAndReloadCart, 100);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically (every 2 seconds)
    const interval = setInterval(checkUserAndReloadCart, 2000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [currentUserId]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const cartKey = getCartKey();
    if (cartItems.length === 0) {
      localStorage.removeItem(cartKey);
    } else {
      localStorage.setItem(cartKey, JSON.stringify(cartItems));
    }
  }, [cartItems]);

  // Manual refresh function - FIXED with useCallback
  const refreshCart = useCallback(() => {
    console.log('🔄 Manually refreshing cart...');
    const newCart = loadCartForCurrentUser();
    setCartItems(newCart);
  }, []);

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
        return false;
      }

      const isValid = await checkTokenValidity(token);
      if (!isValid) {
        return false;
      }

      if (cartItems.length === 0) {
        return true;
      }

      const backendItems = cartItems.map(item => ({
        productId: item.productId || item.id,
        quantity: item.quantity,
        price: item.price,
        name: item.name,
        shade: item.shade || 'default'
      }));

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
        console.error('Backend sync failed:', data);
        return false;
      }

      return true;

    } catch (error: any) {
      console.error('Cart sync error:', error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = (item: Omit<CartItem, 'quantity' | 'uniqueId'>) => {
    const uniqueId = generateUniqueId(item);
    const itemWithIds = {
      ...item,
      productId: item.productId || item.id,
      uniqueId
    };

    setCartItems(prevItems => {
      const existingItem = prevItems.find(i => 
        i.productId === itemWithIds.productId && 
        i.shade === itemWithIds.shade
      );
      
      if (existingItem) {
        return prevItems.map(i =>
          i.uniqueId === existingItem.uniqueId 
            ? { ...i, quantity: i.quantity + 1 } 
            : i
        );
      } else {
        return [...prevItems, { ...itemWithIds, quantity: 1 }];
      }
    });

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

    const token = localStorage.getItem('alora-token');
    if (token) {
      setTimeout(() => syncCartWithBackend(), 500);
    }
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));

    const token = localStorage.getItem('alora-token');
    if (token) {
      setTimeout(() => syncCartWithBackend(), 500);
    }
  };

  const clearCart = () => {
    setCartItems([]);
    
    if (typeof window !== 'undefined') {
      const cartKey = getCartKey();
      localStorage.removeItem(cartKey);
      localStorage.removeItem('alora-cart');
    }
    
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
        isLoading,
        refreshCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};