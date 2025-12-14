"use client"

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { useAuth } from './AuthContext' // Import AuthContext

interface CartItem {
  id: number | string
  name: string
  price: number
  image: string
  quantity: number
  category?: string
  description?: string
  rating?: number
  reviews?: number
  stock?: number
}

interface CartContextType {
  cartItems: CartItem[]
  cartCount: number
  cartTotal: number
  addToCart: (item: CartItem) => void
  removeFromCart: (id: number | string) => void
  updateQuantity: (id: number | string, quantity: number) => void
  clearCart: () => void
  isLoading: boolean
  saveCartToBackend: () => Promise<void> // Save to backend
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { isAuthenticated, user, token, clearUserCart } = useAuth()

  // Generate unique cart key based on user ID or guest session
  const getCartKey = () => {
    if (typeof window === 'undefined') return 'alora-cart-guest'
    
    if (isAuthenticated && user?.id) {
      return `alora-cart-user-${user.id}`
    }
    
    // For guests, use session storage or create guest ID
    let guestId = localStorage.getItem('alora-guest-id')
    if (!guestId) {
      guestId = `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('alora-guest-id', guestId)
    }
    return `alora-cart-${guestId}`
  }

  // Initialize cart - check for user-specific cart
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const cartKey = getCartKey()
        const savedCart = localStorage.getItem(cartKey)
        
        if (savedCart) {
          setCartItems(JSON.parse(savedCart))
        } else {
          // If no saved cart for this user, clear any old cart data
          localStorage.removeItem('alora-cart') // Remove old global cart
          setCartItems([])
        }
      } catch (error) {
        console.error('Error loading cart:', error)
        setCartItems([])
      } finally {
        setIsLoading(false)
      }
    }
  }, [isAuthenticated, user?.id]) // Re-run when auth state changes

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && !isLoading) {
      try {
        const cartKey = getCartKey()
        localStorage.setItem(cartKey, JSON.stringify(cartItems))
        
        // Also save to backend if user is authenticated
        if (isAuthenticated && token) {
          saveCartToBackend()
        }
      } catch (error) {
        console.error('Error saving cart:', error)
      }
    }
  }, [cartItems, isLoading, isAuthenticated])

  // Save cart to backend API
  const saveCartToBackend = async () => {
    if (!isAuthenticated || !token) return
    
    try {
      await fetch('http://localhost:5000/api/cart/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ items: cartItems })
      })
    } catch (error) {
      console.error('Error saving cart to backend:', error)
    }
  }

  // Load cart from backend when user logs in
  useEffect(() => {
    const loadFromBackend = async () => {
      if (isAuthenticated && token && !isLoading) {
        try {
          const response = await fetch('http://localhost:5000/api/cart', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          
          if (response.ok) {
            const data = await response.json()
            if (data.items && data.items.length > 0) {
              // Merge backend cart with local cart
              setCartItems(prev => {
                const merged = [...prev]
                data.items.forEach((backendItem: CartItem) => {
                  const existingIndex = merged.findIndex(item => item.id === backendItem.id)
                  if (existingIndex >= 0) {
                    // Item exists, update quantity
                    merged[existingIndex].quantity += backendItem.quantity
                  } else {
                    // New item, add it
                    merged.push(backendItem)
                  }
                })
                return merged
              })
            }
          }
        } catch (error) {
          console.error('Error loading cart from backend:', error)
        }
      }
    }
    
    loadFromBackend()
  }, [isAuthenticated, token, isLoading])

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  const addToCart = (item: CartItem) => {
    setCartItems(prev => {
      const existingItem = prev.find(i => i.id === item.id)
      if (existingItem) {
        return prev.map(i => 
          i.id === item.id 
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      } else {
        return [...prev, { ...item, quantity: 1 }]
      }
    })
  }

  const removeFromCart = (id: number | string) => {
    setCartItems(prev => prev.filter(item => item.id !== id))
  }

  const updateQuantity = (id: number | string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id)
    } else {
      setCartItems(prev => 
        prev.map(item => 
          item.id === id ? { ...item, quantity } : item
        )
      )
    }
  }

  const clearCart = () => {
    setCartItems([])
    if (typeof window !== 'undefined') {
      const cartKey = getCartKey()
      localStorage.removeItem(cartKey)
    }
  }

  return (
    <CartContext.Provider value={{
      cartItems,
      cartCount,
      cartTotal,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      isLoading,
      saveCartToBackend
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}