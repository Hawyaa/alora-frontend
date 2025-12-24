'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle, Package, Home, ShoppingBag, Clock, Truck, Shield, CreditCard } from 'lucide-react'
import Link from 'next/link'

interface OrderDetails {
  orderId: string;
  status: string;
  totalAmount: number;
  paymentMethod: string;
  deliveryAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode?: string;
    country: string;
  };
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
    shade?: string;
    image?: string;
  }>;
  createdAt?: string;
  customerInfo?: {
    name: string;
    email: string;
    phone: string;
  };
}
export const dynamic = 'force-dynamic'
export default function OrderConfirmationPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)

  const orderId = searchParams.get('orderId')

  useEffect(() => {
    if (!orderId) {
      router.push('/')
      return
    }

    // Clear cart
    localStorage.removeItem('alora-cart')

    // Load order data from localStorage (from checkout)
    const loadOrderFromLocalStorage = () => {
      console.log('🔍 Loading order from localStorage...')
      
      // Try to get from last-order
      const savedOrder = localStorage.getItem('last-order')
      if (savedOrder) {
        try {
          const parsed = JSON.parse(savedOrder)
          console.log('📦 Found order in localStorage:', parsed)
          
          const orderDetails: OrderDetails = {
            orderId: orderId || parsed.orderId,
            status: 'pending',
            totalAmount: parsed.totalAmount || 0,
            paymentMethod: parsed.paymentMethod || 'cash',
            deliveryAddress: parsed.deliveryAddress || {
              street: 'Your delivery address',
              city: 'Your city',
              state: 'Your state',
              country: 'Ethiopia'
            },
            items: parsed.items?.map((item: any) => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price,
              shade: item.shade,
              image: item.image
            })) || [],
            createdAt: parsed.timestamp || new Date().toISOString(),
            customerInfo: parsed.customerInfo || {
              name: 'Customer',
              email: 'customer@example.com',
              phone: '+251 000 000 000'
            }
          }
          
          setOrder(orderDetails)
          setLoading(false)
          return true
        } catch (error) {
          console.error('Error parsing localStorage order:', error)
        }
      }
      
      return false
    }

    // Try to fetch from backend if token exists
    const fetchOrderFromBackend = async () => {
      const token = localStorage.getItem('alora-token')
      
      if (token && orderId && !orderId.startsWith('local-') && !orderId.startsWith('error-')) {
        try {
          console.log('🔍 Fetching order from backend:', orderId)
          const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          
          if (response.ok) {
            const data = await response.json()
            if (data.order) {
              console.log('✅ Got order from backend:', data.order)
              setOrder({
                orderId: data.order._id || orderId,
                status: data.order.status || 'pending',
                totalAmount: data.order.totalAmount || 0,
                paymentMethod: data.order.paymentMethod || 'cash',
                deliveryAddress: data.order.deliveryAddress,
                items: data.order.items?.map((item: any) => ({
                  name: item.name || item.product?.name,
                  quantity: item.quantity,
                  price: item.price,
                  shade: item.shade
                })),
                createdAt: data.order.createdAt,
                customerInfo: data.order.customerInfo
              })
              setLoading(false)
              return
            }
          }
        } catch (error) {
          console.error('Error fetching from backend:', error)
        }
      }
      
      // Fallback to localStorage
      if (!loadOrderFromLocalStorage()) {
        // Create minimal order data
        const minimalOrder: OrderDetails = {
          orderId: orderId,
          status: 'pending',
          totalAmount: 0,
          paymentMethod: 'cash',
          deliveryAddress: {
            street: 'Your delivery address',
            city: 'Your city',
            state: 'Your state',
            country: 'Ethiopia'
          },
          items: [],
          createdAt: new Date().toISOString(),
          customerInfo: {
            name: 'Customer',
            email: 'customer@example.com',
            phone: '+251 000 000 000'
          }
        }
        
        setOrder(minimalOrder)
      }
      
      setLoading(false)
    }

    fetchOrderFromBackend()
  }, [orderId, router])

  // ... rest of your component remains the same until the return statement ...

  // In your JSX, update the customer info display:
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      {/* Success Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full">
                <CheckCircle size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Order Confirmed!</h1>
                <p className="text-gray-600">Thank you for your purchase, {order?.customerInfo?.name || 'Customer'}!</p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-gray-500">Order ID</p>
              <p className="font-mono font-bold text-lg text-gray-900">
                {order?.orderId?.substring(0, 12) || 'Loading...'}
              </p>
              <div className="mt-2">
                <button
                  onClick={() => router.push('/shop')}
                  className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors"
                >
                  Back to Shop
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Order Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Customer Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Customer Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Contact Details</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium text-gray-900">{order?.customerInfo?.name || 'Customer Name'}</p>
                    <p className="text-gray-600">{order?.customerInfo?.email || 'customer@example.com'}</p>
                    <p className="text-gray-600">{order?.customerInfo?.phone || '+251 000 000 000'}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Payment Method</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                        <CreditCard className="text-pink-600" size={20} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 capitalize">
                          {order?.paymentMethod === 'cash' ? 'Pay in Cash' : 'Online Payment'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {order?.paymentMethod === 'cash' ? 'Pay on delivery' : 'Paid with Chapa'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Items</h2>
              {order?.items && order.items.length > 0 ? (
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-rose-100 to-pink-100 rounded-lg flex items-center justify-center">
                          {item.image ? (
                            <img 
                              src={item.image} 
                              alt={item.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <ShoppingBag className="text-pink-500" size={24} />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{item.name}</h4>
                          {item.shade && (
                            <span className="text-sm text-pink-600 bg-pink-50 px-2 py-1 rounded">
                              Shade: {item.shade}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">${item.price.toFixed(2)} × {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Package size={48} className="mx-auto mb-3 text-gray-300" />
                  <p>No items found in this order</p>
                </div>
              )}
            </div>

            {/* Delivery Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Delivery Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Shipping Address</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-900 font-medium">{order?.deliveryAddress?.street || 'Your address'}</p>
                    <p className="text-gray-600">
                      {order?.deliveryAddress?.city || 'Your city'}, {order?.deliveryAddress?.state || 'Your state'} {order?.deliveryAddress?.zipCode || ''}
                    </p>
                    <p className="text-gray-600">{order?.deliveryAddress?.country || 'Ethiopia'}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Delivery Status</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center">
                          <Clock className="text-pink-600" size={16} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Order Placed</p>
                          <p className="text-sm text-gray-600">Your order has been received</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                          <Truck className="text-gray-400" size={16} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Estimated Delivery</p>
                          <p className="text-sm text-gray-600">3-5 business days</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-8">
            {/* Order Summary */}
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order ID:</span>
                  <span className="font-mono font-semibold">{order?.orderId?.substring(0, 8) || 'N/A'}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                    Pending
                  </span>
                </div>
                
                {order?.createdAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Date:</span>
                    <span className="text-gray-900">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                )}
              </div>

              <div className="border-t my-6 pt-6 space-y-3">
                {order?.items && order.items.length > 0 ? (
                  order.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.name} × {item.quantity}
                      </span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-2">
                    No items in order
                  </div>
                )}
                
                <div className="border-t pt-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>
                      ${order?.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2) || '0.00'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span>$5.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (8%)</span>
                    <span>${((order?.totalAmount || 0) * 0.08).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-3">
                    <span>Total</span>
                    <span className="text-pink-600">${order?.totalAmount?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="text-pink-500" size={20} />
                  <div>
                    <p className="font-medium text-gray-900">Secure Order</p>
                    <p className="text-sm text-gray-600">100% Satisfaction Guarantee</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Link
                    href="/shop"
                    className="block text-center bg-gradient-to-r from-rose-400 to-pink-500 text-white py-3 rounded-lg font-semibold hover:from-rose-500 hover:to-pink-600 transition-all duration-300"
                  >
                    Continue Shopping
                  </Link>
                  
                  <button
                    onClick={() => window.print()}
                    className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Print Receipt
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
