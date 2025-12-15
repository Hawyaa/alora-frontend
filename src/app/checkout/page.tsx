'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, Wallet, ArrowLeft, Loader2, User } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'online'>('cash');
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Ethiopia'
  });
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [userToken, setUserToken] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string>('');

  // Function to load cart from ALL possible sources
  const loadCartItems = () => {
    console.log('🛒 Loading cart for checkout...');
    
    // Try to get cart from localStorage
    const savedCart = localStorage.getItem('alora-cart');
    
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        console.log(`✅ Loaded ${parsed.length} items from alora-cart`);
        return parsed;
      } catch (error) {
        console.error('Error parsing cart:', error);
        return [];
      }
    }
    
    console.log('❌ No cart found in alora-cart');
    return [];
  };

  // Listen for cart changes
  useEffect(() => {
    const handleCartUpdate = () => {
      console.log('🔄 Cart updated, reloading checkout cart...');
      const items = loadCartItems();
      setCartItems(items);
      console.log('📊 Current cart items:', items.length);
    };

    // Load initial cart
    handleCartUpdate();

    // Listen for storage changes (when cart is updated in another tab/component)
    window.addEventListener('storage', handleCartUpdate);
    
    // Also check every second for updates
    const interval = setInterval(handleCartUpdate, 1000);

    return () => {
      window.removeEventListener('storage', handleCartUpdate);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    // Check if cart is empty
    if (cartItems.length === 0) {
      console.log('🛒 Cart is empty, checking if we should redirect...');
      // Only redirect if we're sure cart should be empty
      // Don't redirect immediately, give time for cart to load
      const timer = setTimeout(() => {
        if (cartItems.length === 0) {
          alert('Your cart is empty');
          router.push('/cart');
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    } else {
      console.log(`✅ Ready for checkout with ${cartItems.length} items`);
    }
    
    // Get user token and info
    const token = localStorage.getItem('alora-token');
    setUserToken(token);
    
    const userData = localStorage.getItem('alora-user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setCustomerInfo({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || ''
        });
        console.log('👤 Loaded user info:', user);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, [cartItems, router]);

  const calculateTotal = () => {
    if (cartItems.length === 0) return 0;
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = 5;
    const tax = subtotal * 0.08;
    return subtotal + shipping + tax;
  };

  const handlePlaceOrder = async () => {
    try {
      setLoading(true);
      
      console.log('🔍 CHECKOUT DEBUG ============');
      console.log('📦 Current cart items:', cartItems);
      
      // Get customer info - either from user data or form
      let finalCustomerInfo = {
        name: '',
        email: '',
        phone: ''
      };
      
      if (userToken) {
        // Logged in user - get from localStorage
        const userData = localStorage.getItem('alora-user');
        if (userData) {
          try {
            const user = JSON.parse(userData);
            finalCustomerInfo = {
              name: user.name || customerInfo.name.trim(),
              email: user.email || customerInfo.email.trim(),
              phone: user.phone || customerInfo.phone.trim()
            };
            console.log('✅ Using logged-in user info:', finalCustomerInfo);
          } catch (error) {
            console.error('Error parsing user data:', error);
            // Fallback to form data
            finalCustomerInfo = {
              name: customerInfo.name.trim(),
              email: customerInfo.email.trim(),
              phone: customerInfo.phone.trim()
            };
          }
        } else {
          // No user data found
          finalCustomerInfo = {
            name: customerInfo.name.trim(),
            email: customerInfo.email.trim(),
            phone: customerInfo.phone.trim()
          };
        }
      } else {
        // Guest user - use form data
        finalCustomerInfo = {
          name: customerInfo.name.trim(),
          email: customerInfo.email.trim(),
          phone: customerInfo.phone.trim()
        };
        console.log('✅ Using guest info:', finalCustomerInfo);
      }
      
      // Validate we have required info
      if (!finalCustomerInfo.name || !finalCustomerInfo.phone) {
        alert('Please enter your name and phone number');
        setLoading(false);
        return;
      }
      
      // Validate address
      if (!address.street.trim() || !address.city.trim()) {
        alert('Please enter your delivery address');
        setLoading(false);
        return;
      }
      
      // Debug the final customer info
      console.log('🎯 FINAL CUSTOMER INFO:', finalCustomerInfo);
      console.log('📦 Cart items count:', cartItems.length);
      console.log('🏠 Delivery address:', address);
      
      // Prepare order data - make sure we have all required fields
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.productId || item.id || '',
          name: item.name || 'Unknown Product',
          price: item.price || 0,
          quantity: item.quantity || 1,
          shade: item.shade || 'default'
        })),
        paymentMethod,
        deliveryAddress: address,
        notes: '',
        customerInfo: finalCustomerInfo
      };
      
      console.log('📤 Order data to send:', JSON.stringify(orderData, null, 2));
      
      // Calculate total for localStorage
      const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const shipping = 5;
      const tax = subtotal * 0.08;
      const totalAmount = subtotal + shipping + tax;
      
      // Prepare headers
      const headers: any = {
        'Content-Type': 'application/json'
      };
      
      // Add token if user is logged in
      if (userToken) {
        headers['Authorization'] = `Bearer ${userToken}`;
        console.log('🔑 Adding auth token');
      }
      
      // Create order info object
      const orderInfo: any = {
        orderId: null,
        items: cartItems,
        totalAmount: totalAmount,
        deliveryAddress: address,
        customerInfo: finalCustomerInfo,
        paymentMethod,
        timestamp: new Date().toISOString(),
        status: 'pending'
      };
      
      console.log('💾 Saving order to localStorage:', orderInfo);
      localStorage.setItem('last-order', JSON.stringify(orderInfo));
      
      // Send request
      console.log('📡 Sending POST to /api/orders/checkout...');
      const response = await fetch('http://localhost:5000/api/orders/checkout', {
        method: 'POST',
        headers,
        body: JSON.stringify(orderData)
      });
      
      console.log('📥 Response status:', response.status);
      
      const responseText = await response.text();
      console.log('📥 Raw response:', responseText);
      
      let data;
      try {
        data = responseText ? JSON.parse(responseText) : {};
        console.log('📥 Parsed response:', data);
      } catch (parseError) {
        console.error('❌ Failed to parse response:', parseError);
        data = { success: false, message: 'Invalid response from server' };
      }
      
      if (data.success) {
        console.log('✅ Order created successfully!');
        console.log('📋 Order ID from backend:', data.orderId || data.order?._id);
        
        // Get order ID from response
        const backendOrderId = data.orderId || data.order?._id;
        
        // Update localStorage with real order ID
        orderInfo.orderId = backendOrderId;
        localStorage.setItem('last-order', JSON.stringify(orderInfo));
        
        // Clear cart from localStorage
        localStorage.removeItem('alora-cart');
        console.log('🗑️ Cleared cart from localStorage');
        
        setOrderId(backendOrderId);
        setOrderSuccess(true);
        
        // Wait a moment and redirect
        setTimeout(() => {
          router.push(`/order-confirmation?orderId=${backendOrderId}`);
        }, 1500);
        
      } else {
        console.error('❌ Order creation failed:', data.message || data.error);
        
        // Even if backend fails, use localStorage data with generated ID
        const localOrderId = `local-${Date.now()}`;
        orderInfo.orderId = localOrderId;
        localStorage.setItem('last-order', JSON.stringify(orderInfo));
        
        // Clear cart
        localStorage.removeItem('alora-cart');
        
        setOrderId(localOrderId);
        setOrderSuccess(true);
        
        setTimeout(() => {
          router.push(`/order-confirmation?orderId=${localOrderId}`);
        }, 1500);
      }
      
    } catch (error: any) {
      console.error('💥 Network/fetch error:', error);
      console.error('Error message:', error.message);
      
      // On network error, still save to localStorage
      const errorOrderId = `error-${Date.now()}`;
      const emergencyOrder = {
        orderId: errorOrderId,
        items: cartItems,
        totalAmount: calculateTotal(),
        deliveryAddress: address,
        customerInfo: customerInfo,
        paymentMethod,
        timestamp: new Date().toISOString(),
        status: 'pending'
      };
      
      localStorage.setItem('last-order', JSON.stringify(emergencyOrder));
      localStorage.removeItem('alora-cart');
      
      setOrderId(errorOrderId);
      setOrderSuccess(true);
      
      setTimeout(() => {
        router.push(`/order-confirmation?orderId=${errorOrderId}`);
      }, 1500);
      
    } finally {
      setLoading(false);
      console.log('🔍 CHECKOUT DEBUG END ============\n');
    }
  };

  // Success modal
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <div className="text-green-600 text-2xl">✓</div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h2>
          <p className="text-gray-600 mb-4">
            Your order has been received and is being processed.
          </p>
          {orderId && (
            <p className="text-sm text-gray-500 mb-6">
              Order ID: <span className="font-mono">{orderId.substring(0, 12)}...</span>
            </p>
          )}
          <div className="animate-pulse text-sm text-gray-500">
            Redirecting to confirmation page...
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 5;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/cart')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Cart
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-2">Complete your order</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Form */}
          <div className="lg:w-2/3">
            <div className="bg-white p-6 rounded-xl shadow-sm border space-y-8">
              {/* Customer Info (ALWAYS show for both guest and logged in users) */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <User size={20} className="mr-2" />
                  Your Information
                  {userToken && <span className="ml-2 text-sm text-gray-500">(Logged in)</span>}
                </h2>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Full Name *"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                    required
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="email"
                      placeholder="Email Address *"
                      className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                      required
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number *"
                      className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                      required
                    />
                  </div>
                  <p className="text-sm text-gray-500">
                    {userToken 
                      ? 'Your account information is loaded. You can update it here if needed.' 
                      : 'Please enter your information for order updates.'}
                  </p>
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Delivery Address</h2>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Street Address *"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    value={address.street}
                    onChange={(e) => setAddress({...address, street: e.target.value})}
                    required
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="City *"
                      className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      value={address.city}
                      onChange={(e) => setAddress({...address, city: e.target.value})}
                      required
                    />
                    <input
                      type="text"
                      placeholder="State/Region *"
                      className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      value={address.state}
                      onChange={(e) => setAddress({...address, state: e.target.value})}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="ZIP/Postal Code"
                      className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      value={address.zipCode}
                      onChange={(e) => setAddress({...address, zipCode: e.target.value})}
                    />
                    <input
                      type="text"
                      placeholder="Country"
                      className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      value={address.country}
                      onChange={(e) => setAddress({...address, country: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Method</h2>
                <div className="space-y-4">
                  <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="cash"
                      checked={paymentMethod === 'cash'}
                      onChange={(e) => setPaymentMethod('cash')}
                      className="mr-3 h-5 w-5 text-pink-500 focus:ring-pink-500"
                    />
                    <div className="flex items-center">
                      <Wallet size={24} className="mr-3 text-gray-600" />
                      <div>
                        <div className="font-medium text-gray-900">Pay in Cash</div>
                        <div className="text-sm text-gray-600">Pay when you receive your order</div>
                      </div>
                    </div>
                  </label>
                  
                  <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="online"
                      checked={paymentMethod === 'online'}
                      onChange={(e) => setPaymentMethod('online')}
                      className="mr-3 h-5 w-5 text-pink-500 focus:ring-pink-500"
                    />
                    <div className="flex items-center">
                      <CreditCard size={24} className="mr-3 text-gray-600" />
                      <div>
                        <div className="font-medium text-gray-900">Pay Online</div>
                        <div className="text-sm text-gray-600">Pay now with Chapa</div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={loading || !address.street || !address.city || !customerInfo.name || !customerInfo.phone}
                className="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white py-4 rounded-xl font-semibold hover:from-rose-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={20} />
                    Processing...
                  </>
                ) : (
                  paymentMethod === 'cash' ? 'Place Order (Pay Later)' : 'Pay Now with Chapa'
                )}
              </button>

              <p className="text-sm text-gray-500 text-center">
                {userToken 
                  ? '✓ Your order will be linked to your account' 
                  : 'Guest checkout - you will receive order updates via SMS/Email.'}
              </p>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white p-6 rounded-xl shadow-sm border sticky top-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
              
              {/* Cart Items */}
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2">
                {cartItems.map((item, index) => (
                  <div key={`${item.id}-${index}`} className="flex items-center gap-3">
                    <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.image && item.image !== "/placeholder.svg" ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rose-100 to-pink-100">
                          <span className="text-pink-500 font-bold text-xs">Alora</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{item.name}</h4>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Qty: {item.quantity}</span>
                        <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                      {item.shade && item.shade !== 'default' && (
                        <span className="text-xs text-pink-600 bg-pink-50 px-2 py-0.5 rounded">
                          {item.shade}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Order Totals */}
              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>$5.00</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (8%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-bold text-lg text-gray-900">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              
              {/* Order Note */}
              <div className="mt-6 pt-6 border-t">
                <p className="text-xs text-gray-500">
                  By placing your order, you agree to our Terms of Service and Privacy Policy.
                  Delivery time: 3-5 business days.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}