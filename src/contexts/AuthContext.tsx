// contexts/AuthContext.tsx
'use client'

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id?: string
  name?: string
  email?: string
  phone?: string
  role?: string
}

interface AuthContextType {
  isAuthenticated: boolean
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{success: boolean; user?: any; error?: string}>
  logout: () => void
  register: (userData: any) => Promise<{success: boolean; user?: any; error?: string}>
  clearUserCart: () => void
  refreshAuth: () => void
}

// const AuthContext = createContext<AuthContextType | undefined>(undefined)
export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Use environment variable for API URL
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://alora-backend.onrender.com'

  const refreshAuth = () => {
    if (typeof window === 'undefined') return;
    
    try {
      const savedToken = localStorage.getItem('alora-token')
      const savedUser = localStorage.getItem('alora-user')
      
      if (savedToken && savedUser) {
        setToken(savedToken)
        setUser(JSON.parse(savedUser))
        setIsAuthenticated(true)
        console.log('🔄 Auth refreshed for:', JSON.parse(savedUser).email)
      } else {
        setToken(null)
        setUser(null)
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error('Error refreshing auth:', error)
      setToken(null)
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refreshAuth()
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'alora-token' || e.key === 'alora-user') {
        console.log('🔄 Auth storage changed:', e.key)
        refreshAuth()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const clearUserCart = () => {
    if (typeof window !== 'undefined') {
      // Get current user ID before clearing
      const currentUser = localStorage.getItem('alora-user');
      let currentUserId = 'guest';
      
      if (currentUser) {
        try {
          const userData = JSON.parse(currentUser);
          currentUserId = userData.id || userData.email || 'user';
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
      
      const currentCartKey = `alora-cart-${currentUserId}`;
      
      // Remove ALL cart keys except current user's
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('alora-cart-')) {
          // Only remove if it's NOT the current user's cart
          if (key !== currentCartKey) {
            localStorage.removeItem(key);
            console.log('🗑️ Cleared old user cart:', key);
          }
        }
      }
      
      // Clear legacy cart
      localStorage.removeItem('alora-cart');
      
      // Clear any pending items
      localStorage.removeItem('pending-cart-item');
      localStorage.removeItem('pending-cart-items');
    }
  }

  const login = async (email: string, password: string) => {
    try {
      console.log('🔐 Attempting login for:', email);
      console.log('📡 API URL:', `${API_URL}/api/auth/login`);
      
      // Clean up ALL old carts before login
      clearUserCart();
      
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      console.log('Login response:', { status: response.status, data });
      
      if (!response.ok || !data.success) {
        return { 
          success: false, 
          error: data.error || data.message || 'Invalid email or password' 
        };
      }
      
      // Set new auth state
      setToken(data.token);
      setUser(data.user);
      setIsAuthenticated(true);
      localStorage.setItem('alora-token', data.token);
      localStorage.setItem('alora-user', JSON.stringify(data.user));
      
      console.log('✅ Login successful for:', email);
      
      // Load user's cart from backend
      await loadUserCart(data.token);
      
      // Dispatch storage event
      window.dispatchEvent(new Event('storage'));
      
      return { 
        success: true, 
        user: data.user,
        token: data.token 
      };
      
    } catch (error: any) {
      console.error('💥 Login error:', error);
      return { 
        success: false, 
        error: error.message || 'Network error. Please check your connection.' 
      };
    }
  };

  const register = async (userData: any) => {
    try {
      console.log('📝 Registering user:', userData.email);
      console.log('📡 API URL:', `${API_URL}/api/auth/register`);
      
      // Clean up old carts before registration
      clearUserCart();
      
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      console.log('Register response:', { status: response.status, data });
      
      if (!response.ok || !data.success) {
        return { 
          success: false, 
          error: data.error || 'Registration failed' 
        };
      }
      
      // Set new auth state
      setToken(data.token);
      setUser(data.user);
      setIsAuthenticated(true);
      localStorage.setItem('alora-token', data.token);
      localStorage.setItem('alora-user', JSON.stringify(data.user));
      
      console.log('✅ Registration successful for:', userData.email);
      
      // Load user's cart from backend
      await loadUserCart(data.token);
      
      // Dispatch storage event
      window.dispatchEvent(new Event('storage'));
      
      return { 
        success: true, 
        user: data.user,
        token: data.token 
      };
      
    } catch (error: any) {
      console.error('💥 Registration error:', error);
      return { 
        success: false, 
        error: 'Network error. Please check your connection.' 
      };
    }
  };

  // contexts/AuthContext.tsx - UPDATE logout function
  const logout = () => {
    console.log('🚪 Logging out user:', user?.email);
    
    // Get current user info before clearing
    const currentUserEmail = user?.email || 'unknown';
    
    // Clear ALL cart storage for the current user
    if (typeof window !== 'undefined') {
      // Clear current user's specific cart
      if (user?.email) {
        const userCartKey = `alora-cart-${user.email}`;
        localStorage.removeItem(userCartKey);
        console.log(`🗑️ Removed cart for user: ${user.email}`);
      }
      
      // Clear all possible cart storage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('alora-cart-')) {
          localStorage.removeItem(key);
        }
      }
      
      // Clear legacy cart
      localStorage.removeItem('alora-cart');
      
      // Clear auth storage
      localStorage.removeItem('alora-token');
      localStorage.removeItem('alora-user');
      
      // Clear any pending items
      localStorage.removeItem('pending-cart-item');
      localStorage.removeItem('pending-cart-items');
    }
    
    // Clear auth state
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    
    console.log('✅ User logged out successfully:', currentUserEmail);
    
    // Dispatch storage event to trigger CartContext update
    window.dispatchEvent(new Event('storage'));
    
    // Redirect to home
    router.push('/');
  };

  const loadUserCart = async (userToken: string) => {
    try {
      console.log('🔄 Loading user cart from backend...');
      console.log('📡 API URL:', `${API_URL}/api/cart`);
      
      const response = await fetch(`${API_URL}/api/cart`, {
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      });
      
      console.log('Cart response status:', response.status);
      
      if (response.ok) {
        const cartData = await response.json();
        console.log('Cart data received:', cartData);
        
        if (cartData.items && cartData.items.length > 0) {
          const user = localStorage.getItem('alora-user');
          if (user) {
            try {
              const userData = JSON.parse(user);
              const userCartKey = `alora-cart-${userData.id || userData.email || 'user'}`;
              localStorage.setItem(userCartKey, JSON.stringify(cartData.items));
              console.log(`✅ Loaded ${cartData.items.length} items to ${userCartKey}`);
            } catch (error) {
              console.error('Error saving user cart:', error);
            }
          }
        } else {
          console.log('🛒 User has no cart items on backend');
        }
      } else {
        console.log('⚠️ Could not load user cart from backend, status:', response.status);
      }
    } catch (error) {
      console.error('Error loading user cart:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      user,
      token,
      isLoading,
      login,
      logout,
      register,
      clearUserCart,
      refreshAuth
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
