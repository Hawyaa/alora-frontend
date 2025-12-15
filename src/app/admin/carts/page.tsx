// frontend/src/app/admin/carts/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  User, 
  Package, 
  Mail, 
  Calendar, 
  DollarSign, 
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CartItem {
  product: {
    name: string;
    price: number;
    images?: string[];
  };
  quantity: number;
  price: number;
}

interface Cart {
  _id: string;
  user: {
    name: string;
    email: string;
    phone?: string;
  };
  items: CartItem[];
  updatedAt: string;
  createdAt: string;
}

export default function CustomerCartsPage() {
  const [carts, setCarts] = useState<Cart[]>([]);
  const [filteredCarts, setFilteredCarts] = useState<Cart[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchCarts();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCarts(carts);
    } else {
      const filtered = carts.filter(cart => 
        cart.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cart.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cart.items.some(item => 
          item.product?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setFilteredCarts(filtered);
    }
  }, [searchTerm, carts]);

  const fetchCarts = async () => {
    try {
      const token = localStorage.getItem('alora-token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('http://localhost:5000/api/admin/carts', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('alora-token');
        localStorage.removeItem('alora-user');
        router.push('/login');
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setCarts(data.carts || []);
        setFilteredCarts(data.carts || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateCartTotal = (items: CartItem[]) => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getTotalItems = (carts: Cart[]) => {
    return carts.reduce((total, cart) => total + cart.items.length, 0);
  };

  const getTotalValue = (carts: Cart[]) => {
    return carts.reduce((total, cart) => total + calculateCartTotal(cart.items), 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Shopping Carts</h1>
          <p className="text-gray-600 mt-2">
            View what customers have added to their carts. {carts.length} total carts.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search customers or products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg w-full md:w-64"
            />
          </div>
          <button
            onClick={fetchCarts}
            className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 flex items-center"
          >
            <RefreshCw size={16} className="mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Carts</p>
              <p className="text-3xl font-bold mt-2">{carts.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <ShoppingCart className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Items</p>
              <p className="text-3xl font-bold mt-2">{getTotalItems(carts)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Package className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-3xl font-bold mt-2">
                {formatCurrency(getTotalValue(carts))}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <DollarSign className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {filteredCarts.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center">
          <ShoppingCart size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchTerm ? 'No matching carts' : 'No Carts Yet'}
          </h3>
          <p className="text-gray-600">
            {searchTerm 
              ? 'Try a different search term' 
              : 'Customers haven\'t added items to their carts yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredCarts.map((cart) => {
            const cartTotal = calculateCartTotal(cart.items);
            
            return (
              <div key={cart._id} className="bg-white rounded-xl border overflow-hidden">
                {/* Cart Header */}
                <div className="p-6 border-b bg-gray-50">
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div className="flex items-center space-x-4 mb-4 md:mb-0">
                      <div className="bg-pink-100 p-3 rounded-lg">
                        <User className="text-pink-600" size={24} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">
                          {cart.user?.name || 'Guest Customer'}
                        </h3>
                        <div className="flex items-center text-gray-600 mt-1">
                          <Mail size={16} className="mr-2" />
                          {cart.user?.email || 'No email'}
                        </div>
                        {cart.user?.phone && (
                          <div className="text-sm text-gray-600 mt-1">
                            📱 {cart.user.phone}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="flex items-center text-gray-600 mb-2">
                        <Calendar size={16} className="mr-2" />
                        <span className="text-sm">
                          Last updated: {new Date(cart.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-pink-600">
                        {formatCurrency(cartTotal)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cart Items */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="font-semibold text-gray-900 flex items-center">
                      <Package className="mr-2" size={20} />
                      Cart Items ({cart.items.length})
                    </h4>
                    <div className="text-sm text-gray-600">
                      Created: {new Date(cart.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {cart.items.length > 0 ? (
                    <div className="space-y-4">
                      {cart.items.map((item, index) => (
                        <div 
                          key={index} 
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Package className="text-gray-400" size={20} />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {item.product?.name || 'Product'}
                              </p>
                              <p className="text-sm text-gray-600">
                                {formatCurrency(item.price)} each
                              </p>
                              {item.product?.images?.[0] && (
                                <div className="mt-1">
                                  <img
                                    src={item.product.images[0]}
                                    alt={item.product.name}
                                    className="w-8 h-8 object-cover rounded border"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-semibold text-gray-900">
                              {formatCurrency(item.price * item.quantity)}
                            </div>
                            <div className="text-sm text-gray-600">
                              Quantity: {item.quantity}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* Cart Summary */}
                      <div className="border-t pt-4 mt-6">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-900">Cart Summary</p>
                            <p className="text-sm text-gray-600">
                              {cart.items.length} items, {cart.items.reduce((sum, item) => sum + item.quantity, 0)} total units
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-pink-600">
                              {formatCurrency(cartTotal)}
                            </div>
                            <p className="text-sm text-gray-600">Total cart value</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      This cart is empty
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}