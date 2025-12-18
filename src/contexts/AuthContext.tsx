"use client"

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedToken = localStorage.getItem('alora-token')
        const savedUser = localStorage.getItem('alora-user')
        
        if (savedToken && savedUser) {
          setToken(savedToken)
          setUser(JSON.parse(savedUser))
          setIsAuthenticated(true)
        }
      } catch (error) {
        console.error('Error loading auth data:', error)
      } finally {
        setIsLoading(false)
      }
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login for:', email);
      
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      console.log('Login response:', data);
      
      // Check for errors - but DON'T throw generic Error
      if (!response.ok || !data.success) {
        // Return error object instead of throwing
        return { 
          success: false, 
          error: data.error || data.message || 'Invalid email or password' 
        };
      }
      
      // Clear any guest cart before setting new user
      clearUserCart();
      
      setToken(data.token);
      setUser(data.user);
      setIsAuthenticated(true);
      localStorage.setItem('alora-token', data.token);
      localStorage.setItem('alora-user', JSON.stringify(data.user));
      
      // Load user's cart from backend if available
      await loadUserCart(data.token);
      
      return { 
        success: true, 
        user: data.user,
        token: data.token 
      };
      
    } catch (error: any) {
      console.error('Login error:', error);
      // For network errors, still throw
      throw error;
    }
  };

  const register = async (userData: any) => {
    try {
      console.log('Registering user data:', userData)
      
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      })
      
      const data = await response.json()
      console.log('Registration response:', data)
      
      // FIXED: Don't throw error, just return it
      if (!response.ok || !data.success) {
        return { 
          success: false, 
          error: data.error || 'Registration failed' 
        }
      }
      
      // If registration successful, also login the user
      setToken(data.token)
      setUser(data.user)
      setIsAuthenticated(true)
      localStorage.setItem('alora-token', data.token)
      localStorage.setItem('alora-user', JSON.stringify(data.user))
      
      return { 
        success: true, 
        user: data.user,
        token: data.token 
      }
      
    } catch (error: any) {
      console.error('Registration error:', error)
      return { 
        success: false, 
        error: 'Network error. Please check your connection.' 
      }
    }
  }

  const logout = () => {
    // Clear cart for this user
    clearUserCart()
    
    setToken(null)
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('alora-token')
    localStorage.removeItem('alora-user')
    localStorage.removeItem('alora-cart')
  }

  // Load user's cart from backend
  const loadUserCart = async (userToken: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/cart', {
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      })
      
      if (response.ok) {
        const cartData = await response.json()
        // Save to localStorage or context
        if (cartData.items && cartData.items.length > 0) {
          localStorage.setItem('alora-cart', JSON.stringify(cartData.items))
        }
      }
    } catch (error) {
      console.error('Error loading user cart:', error)
    }
  }

  // Clear cart data for current user
  const clearUserCart = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('alora-cart')
    }
  }

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      user,
      token,
      isLoading,
      login,
      logout,
      register,
      clearUserCart
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