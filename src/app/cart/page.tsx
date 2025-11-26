'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingBag, Trash2, Plus, Minus, ArrowLeft, CreditCard } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { usePayment } from '@/contexts/PaymentContext'

export default function CartPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { isAuthenticated, user, token } = useAuth()
  const { cartItems, clearCart, updateQuantity, removeFromCart } = useCart()
  const { initializePayment } = usePayment()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    updateQuantity(itemId, newQuantity)
  }

  const handleRemoveItem = (itemId: string) => {
    removeFromCart(itemId)
  }

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const handleCheckout = async () => {
    setIsLoading(true)
    try {
      // Calculate total amount
      const subtotal = calculateTotal()
      const shipping = 5
      const tax = subtotal * 0.08
      const totalAmount = Math.ceil(subtotal + shipping + tax) // Round up
      
      console.log('Starting payment for amount:', totalAmount)

      // Store cart items before payment
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
        await fetch(`${apiUrl}/payment/store-cart`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ cartItems })
        });
      } catch (error) {
        console.log('Cart storage failed, continuing...');
      }

      // Initialize payment with Chapa
      const result = await initializePayment(
        totalAmount,
        user?.email || 'customer@example.com',
        {
          firstName: user?.name?.split(' ')[0] || 'Customer',
          lastName: user?.name?.split(' ')[1] || '',
          phone: user?.phone || ''
        }
      )

      console.log('Payment result:', result)

      if (result.success && result.data?.checkout_url) {
        // Redirect to Chapa payment page
        console.log('Redirecting to Chapa...')
        window.location.href = result.data.checkout_url
      } else {
        alert('Payment failed: ' + (result.error || 'Please try again.'))
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Checkout failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p>Redirecting to login...</p>
        </div>
      </div>
    )
  }

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
            <div className="w-6"></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {cartItems.length === 0 ? (
          // Empty cart state
          <div className="text-center py-12">
            <ShoppingBag size={64} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add some products to get started!</p>
            <button
              onClick={() => router.push('/')}
              className="bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors"
            >
              Continue Shopping
            </button>
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
                </div>
                
                <div className="divide-y">
                  {cartItems.map((item) => (
                    <div key={item._id} className="p-6 flex items-center space-x-4">
                      {/* Product image */}
                      <div className="flex-shrink-0 w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                        <ShoppingBag size={24} className="text-gray-400" />
                      </div>

                      {/* Product details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {item.product?.name || 'Product'}
                        </h3>
                        <p className="text-gray-600">${item.price.toFixed(2)}</p>
                        {item.shade && (
                          <div className="flex items-center mt-1">
                            <span className="text-sm text-gray-500">Shade: </span>
                            <div
                              className="w-4 h-4 rounded-full ml-2 border border-gray-300"
                              style={{ backgroundColor: item.shade.hexCode || '#ccc' }}
                            ></div>
                            <span className="text-sm ml-1">{item.shade.name || 'Default'}</span>
                          </div>
                        )}
                      </div>

                      {/* Quantity controls */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      {/* Price and remove */}
                      <div className="text-right">
                        <p className="text-lg font-semibold">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                        <button
                          onClick={() => handleRemoveItem(item._id)}
                          className="text-red-500 hover:text-red-700 mt-2"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Clear cart button */}
                <div className="p-6 border-t">
                  <button
                    onClick={clearCart}
                    className="text-red-500 hover:text-red-700 flex items-center"
                  >
                    <Trash2 size={16} className="mr-2" />
                    Clear Cart
                  </button>
                </div>
              </div>
            </div>

            {/* Order summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-4">
                <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>$5.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>${(calculateTotal() * 0.08).toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>${(calculateTotal() + 5 + calculateTotal() * 0.08).toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={isLoading}
                  className="w-full bg-pink-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard size={20} className="mr-2" />
                      Proceed to Checkout
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  You will be redirected to Chapa for secure payment
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}