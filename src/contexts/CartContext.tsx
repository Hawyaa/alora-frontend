'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from './AuthContext'

interface CartItem {
  _id: string
  product: any
  quantity: number
  shade?: any
  price: number
}

interface CartContextType {
  cartItems: CartItem[]
  cartCount: number
  addToCart: (productId: string, quantity?: number, shade?: any) => Promise<{ success: boolean; data?: any; error?: string }>
  removeFromCart: (itemId: string) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  fetchCart: () => Promise<void>
  isLoading: boolean
  error: string | null
}

const CartContext = createContext<CartContextType | undefined>(undefined)

interface CartProviderProps {
  children: ReactNode
}

export function CartProvider({ children }: CartProviderProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [cartCount, setCartCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { token, isAuthenticated, user } = useAuth()

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchCart()
    } else {
      setCartItems([])
      setCartCount(0)
      setError(isAuthenticated ? 'Authentication token missing' : null)
    }
  }, [isAuthenticated, token])

  const fetchCart = async () => {
    if (!isAuthenticated || !token) {
      console.error('Cannot fetch cart: not authenticated or token missing')
      setError('Please login to view cart')
      return
    }
    
    setIsLoading(true)
    setError(null)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
      const response = await fetch(`${apiUrl}/cart`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (response.status === 401) {
        throw new Error('Authentication failed - please login again')
      }
      
      if (!response.ok) {
        throw new Error(`Failed to fetch cart: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        setCartItems(data.cart?.items || [])
        setCartCount(data.cart?.items?.length || 0)
      } else {
        throw new Error(data.message || 'Failed to fetch cart data')
      }
    } catch (error: any) {
      console.error('Error fetching cart:', error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const addToCart = async (productId: string, quantity: number = 1, shade: any = null) => {
    if (!isAuthenticated || !token) {
      return { success: false, error: 'Please login to add items to cart' }
    }

    setError(null)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
      const response = await fetch(`${apiUrl}/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId,
          quantity,
          shade,
        }),
      })

      if (response.status === 401) {
        throw new Error('Authentication failed - please login again')
      }

      if (!response.ok) {
        throw new Error(`Failed to add item: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setCartItems(data.cart?.items || [])
        setCartCount(data.cart?.items?.length || 0)
        return { success: true, data }
      } else {
        throw new Error(data.message || 'Failed to add item to cart')
      }
    } catch (error: any) {
      console.error('Error adding to cart:', error)
      setError(error.message)
      return { success: false, error: error.message }
    }
  }

  const removeFromCart = async (itemId: string) => {
    if (!isAuthenticated || !token) {
      setError('Please login to modify cart')
      return
    }

    setError(null)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
      const response = await fetch(`${apiUrl}/cart/remove`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ itemId }),
      })

      if (!response.ok) {
        throw new Error('Failed to remove item from cart')
      }

      const data = await response.json()

      if (data.success) {
        setCartItems(data.cart?.items || [])
        setCartCount(data.cart?.items?.length || 0)
      }
    } catch (error: any) {
      console.error('Error removing from cart:', error)
      setError(error.message)
    }
  }

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (!isAuthenticated || !token) {
      setError('Please login to modify cart')
      return
    }

    if (quantity < 1) {
      await removeFromCart(itemId)
      return
    }

    setError(null)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
      const response = await fetch(`${apiUrl}/cart/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ itemId, quantity }),
      })

      if (!response.ok) {
        throw new Error('Failed to update cart')
      }

      const data = await response.json()

      if (data.success) {
        setCartItems(data.cart?.items || [])
        setCartCount(data.cart?.items?.length || 0)
      }
    } catch (error: any) {
      console.error('Error updating quantity:', error)
      setError(error.message)
    }
  }

  const clearCart = async () => {
    if (!isAuthenticated || !token) return

    setError(null)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
      const response = await fetch(`${apiUrl}/cart/clear`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to clear cart')
      }

      const data = await response.json()

      if (data.success) {
        setCartItems([])
        setCartCount(0)
      }
    } catch (error: any) {
      console.error('Error clearing cart:', error)
      setError(error.message)
    }
  }

  const value: CartContextType = {
    cartItems,
    cartCount,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    fetchCart,
    isLoading,
    error,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}