// app/checkout/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, Wallet, ArrowLeft, Loader2, User } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

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
  const [debugInfo, setDebugInfo] = useState<string>('');
  
  const { clearCart, cartItems: contextCartItems } = useCart();
  const { user, isAuthenticated } = useAuth();
  const getCartKey = () => {
    if (typeof window === 'undefined') return 'alora-cart-guest';
    
    const user = localStorage.getItem('alora-user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        return `alora-cart-${userData.id || userData.email || 'user'}`;
      } catch {
        return 'alora-cart-guest';
      }
    }
    
    return 'alora-cart-guest';
  };
  
  // Add this cleanup function:
  const cleanupOldCarts = () => {
    if (typeof window === 'undefined') return;
    
    const currentKey = getCartKey();
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('alora-cart-') && key !== currentKey) {
        localStorage.removeItem(key);
      }
    }
    localStorage.removeItem('alora-cart');
  };

  // Function to clear ALL cart storage
  const clearAllCartStorage = () => {
    if (typeof window !== 'undefined') {
      // Clear using CartContext's getCartKey
      const currentCartKey = getCartKey();
      localStorage.removeItem(currentCartKey);
      
      // Clear all possible cart keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes('cart')) {
          localStorage.removeItem(key);
        }
      }
      
      // Also clear legacy key
      localStorage.removeItem('alora-cart');
      
      // Clear cart state
      clearCart();
      
      console.log('🧹 Cleared all cart storage:', currentCartKey);
      setDebugInfo(`Cleared cart storage: ${currentCartKey}`);
    }
  };

  // Function to load cart from ALL possible sources
  const loadCartItems = () => {
    if (typeof window === 'undefined') return [];
    
    // Try current user's cart key
    const currentCartKey = getCartKey();
    const savedCart = localStorage.getItem(currentCartKey);
    
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        console.log(`✅ Loaded ${parsed.length} items from ${currentCartKey}`);
        setDebugInfo(`Loaded ${parsed.length} items from ${currentCartKey}`);
        return parsed;
      } catch (error) {
        console.error('Error parsing cart:', error);
        setDebugInfo(`Error parsing cart from ${currentCartKey}: ${error}`);
      }
    }
    
    // Fallback to legacy key
    const legacyCart = localStorage.getItem('alora-cart');
    if (legacyCart) {
      try {
        const parsed = JSON.parse(legacyCart);
        console.log(`✅ Loaded ${parsed.length} items from alora-cart (legacy)`);
        setDebugInfo(`Loaded ${parsed.length} items from legacy storage`);
        return parsed;
      } catch (error) {
        console.error('Error parsing legacy cart:', error);
        setDebugInfo(`Error parsing legacy cart: ${error}`);
      }
    }
    
    // Fallback to context
    if (contextCartItems && contextCartItems.length > 0) {
      console.log(`✅ Loaded ${contextCartItems.length} items from context`);
      setDebugInfo(`Loaded ${contextCartItems.length} items from context`);
      return contextCartItems;
    }
    
    console.log('❌ No cart found');
    setDebugInfo('No cart items found');
    return [];
  };

  // Listen for cart changes
  useEffect(() => {
    const handleCartUpdate = () => {
      console.log('🔄 Cart updated, reloading checkout cart...');
      const items = loadCartItems();
      setCartItems(items);
      console.log('📊 Current cart items for checkout:', items.length);
    };

    handleCartUpdate();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.includes('cart') || e.key === 'alora-user' || e.key === 'alora-token') {
        console.log('📦 Storage changed:', e.key);
        handleCartUpdate();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    const interval = setInterval(handleCartUpdate, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (cartItems.length === 0) {
      console.log('🛒 Cart is empty, checking if we should redirect...');
      setDebugInfo('Cart is empty');
      const timer = setTimeout(() => {
        if (cartItems.length === 0) {
          alert('Your cart is empty');
          router.push('/cart');
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    } else {
      console.log(`✅ Ready for checkout with ${cartItems.length} items`);
      setDebugInfo(`Ready with ${cartItems.length} items`);
    }
    
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

  // Function to store cart items for payment
  const storeCartForPayment = async () => {
    if (!userToken) return { success: false, error: 'Not authenticated' };

    try {
      const response = await fetch('http://localhost:5000/api/payment/store-cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({ cartItems })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Store cart error:', error);
      return { success: false, error: 'Failed to store cart' };
    }
  };

  // Function to initialize Chapa payment
  const initializeChapaPayment = async (amount: number, orderId: string) => {
    if (!userToken) {
      return { success: false, error: 'Please login to use online payment' };
    }

    try {
      console.log('💰 Initializing Chapa payment for order:', orderId);
      
      // Store cart items first
      await storeCartForPayment();

      // Prepare user info
      const nameParts = customerInfo.name.trim().split(' ');
      const firstName = nameParts[0] || 'Customer';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Convert USD to ETB (Chapa uses ETB) - 1 USD ≈ 55 ETB
      const amountInETB = Math.round(amount * 55);
      
      console.log('💳 Payment details:', {
        amount: amountInETB,
        email: customerInfo.email,
        firstName,
        lastName,
        phone: customerInfo.phone
      });

      // Initialize payment with Chapa
      const response = await fetch('http://localhost:5000/api/payment/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
          amount: amountInETB,
          email: customerInfo.email,
          firstName,
          lastName,
          phone: customerInfo.phone,
          orderId: orderId,
          return_url: `${window.location.origin}/payment/success`,
          cancel_url: `${window.location.origin}/payment/cancel`
        })
      });

      const data = await response.json();
      
      if (data.success && data.checkout_url) {
        console.log('✅ Payment initialized successfully!');
        console.log('🔗 Chapa checkout URL:', data.checkout_url);
        return { 
          success: true, 
          checkout_url: data.checkout_url,
          tx_ref: data.tx_ref 
        };
      } else {
        console.error('❌ Payment initialization failed:', data.error);
        return { success: false, error: data.error || 'Payment initialization failed' };
      }
    } catch (error: any) {
      console.error('💥 Payment initialization error:', error);
      return { success: false, error: error.message || 'Payment initialization failed' };
    }
  };

  const handlePlaceOrder = async () => {
    try {
      setLoading(true);
      setDebugInfo('Processing order...');
      
      console.log('🔍 CHECKOUT DEBUG ============');
      console.log('📦 Current cart items:', cartItems);
      
      let finalCustomerInfo = {
        name: '',
        email: '',
        phone: ''
      };
      
      if (userToken) {
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
            setDebugInfo(`Using user: ${finalCustomerInfo.name}`);
          } catch (error) {
            finalCustomerInfo = {
              name: customerInfo.name.trim(),
              email: customerInfo.email.trim(),
              phone: customerInfo.phone.trim()
            };
            setDebugInfo('Using form data (parse error)');
          }
        } else {
          finalCustomerInfo = {
            name: customerInfo.name.trim(),
            email: customerInfo.email.trim(),
            phone: customerInfo.phone.trim()
          };
          setDebugInfo('Using form data (no user data)');
        }
      } else {
        finalCustomerInfo = {
          name: customerInfo.name.trim(),
          email: customerInfo.email.trim(),
          phone: customerInfo.phone.trim()
        };
        console.log('✅ Using guest info:', finalCustomerInfo);
        setDebugInfo('Guest checkout');
      }
      
      // Validate required fields
      if (!finalCustomerInfo.name || !finalCustomerInfo.phone) {
        alert('Please enter your name and phone number');
        setDebugInfo('Missing name or phone');
        setLoading(false);
        return;
      }

      if (paymentMethod === 'online' && !finalCustomerInfo.email) {
        alert('Please enter your email for online payment');
        setDebugInfo('Missing email for online payment');
        setLoading(false);
        return;
      }
      
      if (paymentMethod === 'online' && !userToken) {
        alert('Please login to use online payment');
        setDebugInfo('Login required for online payment');
        setLoading(false);
        return;
      }
      
      if (!address.street.trim() || !address.city.trim()) {
        alert('Please enter your delivery address');
        setDebugInfo('Missing address');
        setLoading(false);
        return;
      }
      
      console.log('🎯 FINAL CUSTOMER INFO:', finalCustomerInfo);
      console.log('📦 Cart items count:', cartItems.length);
      
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
      
      const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const shipping = 5;
      const tax = subtotal * 0.08;
      const totalAmount = subtotal + shipping + tax;
      
      const headers: any = {
        'Content-Type': 'application/json'
      };
      
      if (userToken) {
        headers['Authorization'] = `Bearer ${userToken}`;
        console.log('🔑 Adding auth token');
      }
      
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
      
      console.log('💾 Saving order to localStorage');
      localStorage.setItem('last-order', JSON.stringify(orderInfo));
      
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
        const backendOrderId = data.orderId || data.order?._id;
        
        orderInfo.orderId = backendOrderId;
        localStorage.setItem('last-order', JSON.stringify(orderInfo));
        
        // 🎯 CRITICAL FIX: Clear ALL cart storage
        clearAllCartStorage();
        
        setOrderId(backendOrderId);
        
        // Handle payment based on method
        if (paymentMethod === 'cash') {
          // Cash payment - show success and redirect
          console.log('💰 Cash payment selected');
          setOrderSuccess(true);
          setDebugInfo(`Order successful! ID: ${backendOrderId}`);
          
          setTimeout(() => {
            router.push(`/order-confirmation?orderId=${backendOrderId}`);
          }, 1500);
          
        } else if (paymentMethod === 'online') {
          // Online payment - initialize Chapa
          console.log('💳 Online payment selected - initializing Chapa...');
          
          const paymentResult = await initializeChapaPayment(totalAmount, backendOrderId);
          
          if (paymentResult.success && paymentResult.checkout_url) {
            // Store payment reference
            orderInfo.paymentReference = paymentResult.tx_ref;
            orderInfo.paymentStatus = 'pending';
            localStorage.setItem('last-order', JSON.stringify(orderInfo));
            
            console.log('🔗 Redirecting to Chapa payment page...');
            
            // ✅ CRITICAL: ACTUALLY REDIRECT TO CHAPA PAYMENT PAGE
            window.location.href = paymentResult.checkout_url;
            
            // Don't continue execution after redirect
            return;
            
          } else {
            console.error('❌ Chapa payment failed:', paymentResult.error);
            alert(`Online payment failed: ${paymentResult.error}. Please try cash payment instead.`);
            setLoading(false);
          }
        }
        
      } else {
        console.error('❌ Order creation failed:', data.message || data.error);
        
        const localOrderId = `local-${Date.now()}`;
        orderInfo.orderId = localOrderId;
        localStorage.setItem('last-order', JSON.stringify(orderInfo));
        
        // Clear cart even if backend fails
        clearAllCartStorage();
        
        setOrderId(localOrderId);
        setOrderSuccess(true);
        setDebugInfo(`Order saved locally! ID: ${localOrderId}`);
        
        setTimeout(() => {
          router.push(`/order-confirmation?orderId=${localOrderId}`);
        }, 1500);
      }
      
    } catch (error: any) {
      console.error('💥 Network/fetch error:', error);
      setDebugInfo(`Network error: ${error.message}`);
      
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
      
      // Clear cart on error too
      clearAllCartStorage();
      
      setOrderId(errorOrderId);
      setOrderSuccess(true);
      setDebugInfo(`Order saved after error! ID: ${errorOrderId}`);
      
      setTimeout(() => {
        router.push(`/order-confirmation?orderId=${errorOrderId}`);
      }, 1500);
      
    } finally {
      setLoading(false);
      console.log('🔍 CHECKOUT DEBUG END ============\n');
    }
  };

  // Success modal (for cash payments only)
  if (orderSuccess && paymentMethod === 'cash') {
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
          <div className="mt-4 text-xs text-gray-400">
            {debugInfo}
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
          <p className="text-sm text-gray-400 mt-2">{debugInfo}</p>
          <button 
            onClick={() => router.push('/cart')}
            className="mt-4 px-4 py-2 bg-pink-500 text-white rounded-lg"
          >
            Back to Cart
          </button>
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
        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-sm font-medium">Debug: {debugInfo}</span>
                <span className="text-xs text-gray-500 ml-2">({getCartKey()})</span>
              </div>
              <button 
                onClick={clearAllCartStorage}
                className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded"
              >
                Clear Cart
              </button>
            </div>
          </div>
        )}

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
          <div className="mt-1 text-sm text-gray-500">
            {isAuthenticated ? `Logged in as: ${user?.name}` : 'Guest checkout'}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Form */}
          <div className="lg:w-2/3">
            <div className="bg-white p-6 rounded-xl shadow-sm border space-y-8">
              {/* Customer Info */}
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
                    {paymentMethod === 'online' && ' Email is required for online payment.'}
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
                        <div className="text-xs text-green-600 mt-1">Available for everyone</div>
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
                      disabled={!userToken}
                    />
                    <div className="flex items-center">
                      <CreditCard size={24} className="mr-3 text-gray-600" />
                      <div>
                        <div className="font-medium text-gray-900">Pay Online</div>
                        <div className="text-sm text-gray-600">Pay now with Chapa</div>
                        {!userToken ? (
                          <div className="text-xs text-amber-600 mt-1">Please login to use online payment</div>
                        ) : (
                          <div className="text-xs text-green-600 mt-1">Secure payment with Chapa</div>
                        )}
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={
                  loading || 
                  !address.street || 
                  !address.city || 
                  !customerInfo.name || 
                  !customerInfo.phone ||
                  (paymentMethod === 'online' && !customerInfo.email) ||
                  (paymentMethod === 'online' && !userToken)
                }
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
                {paymentMethod === 'online' && ' You will be redirected to Chapa for payment.'}
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
                        <span className="font-medium">ETB{(item.price * item.quantity).toFixed(2)}</span>
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
                  <span>ETB{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>ETB5.00</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (8%)</span>
                  <span>ETB{tax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-bold text-lg text-gray-900">
                  <span>Total</span>
                  <span>ETB{total.toFixed(2)}</span>
                </div>
                {paymentMethod === 'online' && (
                  <div className="pt-2">
                    <p className="text-sm text-amber-600">
                      ≈ {Math.round(total * 55)} ETB (for Chapa payment)
                    </p>
                    <p className="text-xs text-blue-500 mt-1">
                      You will be redirected to Chapa's secure payment page
                    </p>
                  </div>
                )}
              </div>
              
              {/* Order Note */}
              <div className="mt-6 pt-6 border-t">
                <p className="text-xs text-gray-500">
                  By placing your order, you agree to our Terms of Service and Privacy Policy.
                  Delivery time: 3-5 business days.
                </p>
                {paymentMethod === 'online' && (
                  <p className="text-xs text-blue-500 mt-2">
                    Online payments are processed securely by Chapa.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}