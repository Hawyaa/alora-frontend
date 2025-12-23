// app/cart/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingBag, Trash2, Plus, Minus, ArrowLeft, CreditCard } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import Image from 'next/image'
import Link from 'next/link'

export default function CartPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { cartItems, clearCart, updateQuantity, removeFromCart, cartTotal, refreshCart } = useCart()
  const { isAuthenticated, user } = useAuth()
  
  // Initial load on component mount
  useEffect(() => {
    console.log('🔄 CartPage mounted, refreshing cart...');
    refreshCart();
  }, []); // Only run once on mount

  // Listen for storage changes (login/logout in other tabs)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'alora-user' || e.key === 'alora-token') {
        console.log('🔄 Auth changed, refreshing cart...');
        setTimeout(refreshCart, 100);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [refreshCart]);

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(itemId)
    } else {
      updateQuantity(itemId, newQuantity)
    }
  }

  const handleRemoveItem = (itemId: string) => {
    if (confirm('Are you sure you want to remove this item?')) {
      removeFromCart(itemId)
    }
  }

  const handleCheckout = async () => {
    setIsLoading(true)
    try {
      // Check if user is logged in for checkout
      if (!isAuthenticated) {
        // Save cart items before redirecting to login
        if (typeof window !== 'undefined' && cartItems.length > 0) {
          localStorage.setItem('pending-cart-items', JSON.stringify(cartItems));
        }
        
        router.push('/login')
        return
      }
      
      // Check if cart is empty
      if (cartItems.length === 0) {
        alert('Your cart is empty')
        return
      }
      
      // Redirect to checkout page
      router.push('/checkout')
      
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Checkout failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate order summary
  const shipping = 5
  const tax = cartTotal * 0.08
  const total = cartTotal + shipping + tax

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
            <div className="flex items-center gap-2">
              <ShoppingBag size={20} />
              <span className="bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartItems.length}
              </span>
            </div>
          </div>
          {/* User info display */}
          {isAuthenticated && (
            <div className="text-sm text-gray-600 pb-2">
              Shopping as: {user?.name || user?.email}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {cartItems.length === 0 ? (
          // Empty cart state
          <div className="text-center py-12">
            <ShoppingBag size={64} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add some products to get started!</p>
            <Link
              href="/shop"
              className="bg-gradient-to-r from-rose-400 to-pink-500 text-white px-6 py-3 rounded-lg hover:from-rose-500 hover:to-pink-600 transition-all duration-300 inline-block"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          // Cart with items
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                  <h2 className="text-lg font-semibold">
                    Cart Items ({cartItems.length})
                  </h2>
                  {isAuthenticated && (
                    <p className="text-sm text-gray-500 mt-1">
                      These items are saved to your account
                    </p>
                  )}
                </div>
                
                <div className="divide-y">
                  {cartItems.map((item, index) => (
                    <div 
                      key={`${item.id}-${index}`} 
                      className="p-6 flex items-center space-x-4"
                    >
                      {/* Product image */}
                      <div className="relative flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>

                      {/* Product details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {item.name}
                        </h3>
                        <p className="text-gray-600">${item.price.toFixed(2)} each</p>
                        {item.category && (
                          <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded mt-1">
                            {item.category}
                          </span>
                        )}
                      </div>

                      {/* Quantity controls */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      {/* Price and remove */}
                      <div className="text-right">
                        <p className="text-lg font-semibold">
                          ETB {(item.price * item.quantity).toFixed(2)}
                        </p>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-red-500 hover:text-red-700 mt-2 flex items-center gap-1"
                          title="Remove item"
                        >
                          <Trash2 size={16} />
                          <span className="text-sm">Remove</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Clear cart button */}
                <div className="p-6 border-t">
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to clear your cart?')) {
                        clearCart()
                      }
                    }}
                    className="text-red-500 hover:text-red-700 flex items-center"
                  >
                    <Trash2 size={16} className="mr-2" />
                    Clear Cart
                  </button>
                  <button
                    onClick={refreshCart}
                    className="text-blue-500 hover:text-blue-700 flex items-center mt-2"
                  >
                    <span className="mr-2">🔄</span>
                    Refresh Cart
                  </button>
                </div>
              </div>
            </div>

            {/* Order summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-4">
                <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>ETB {cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>ETB 5.00</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax (8%)</span>
                    <span>ETB {(cartTotal * 0.08).toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between text-lg font-semibold text-gray-900">
                    <span>Total</span>
                    <span>ETB {total.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={isLoading || cartItems.length === 0}
                  className="w-full bg-gradient-to-r from-rose-400 to-pink-500 text-white py-3 px-4 rounded-lg font-semibold hover:from-rose-500 hover:to-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard size={20} className="mr-2" />
                      {isAuthenticated ? 'Proceed to Checkout' : 'Login to Checkout'}
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  {!isAuthenticated 
                    ? "Login required for checkout" 
                    : "Secure payment processing"}
                </p>

                <Link
                  href="/shop"
                  className="block text-center mt-4 text-pink-500 hover:text-pink-600 font-medium"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}