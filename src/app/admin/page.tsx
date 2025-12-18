'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Package, Users, DollarSign, ShoppingBag, 
  CheckCircle, XCircle, Clock, Truck,
  Eye, Mail, Phone, MapPin, Filter,
  TrendingUp, CreditCard, Calendar,
  AlertCircle, User, Copy, MessageSquare
} from 'lucide-react';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  shade?: string;
  total?: number;
}

interface Order {
  _id: string;
  orderNumber?: string;
  totalAmount?: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod?: 'cash' | 'online';
  createdAt: string;
  updatedAt?: string;
  customerInfo?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  items?: OrderItem[];
  deliveryAddress?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
  };
}

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  recentOrders: number;
  totalCustomers: number;
  chartData?: {
    labels: string[];
    data: number[];
  };
}

export default function AdminDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    recentOrders: 0,
    totalCustomers: 0
  });
  const [filter, setFilter] = useState<'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'>('all');
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  useEffect(() => {
    checkAdminAccess();
    fetchOrders();
    fetchStats();
  }, []);

  const checkAdminAccess = () => {
    const token = localStorage.getItem('alora-token');
    const user = localStorage.getItem('alora-user');
    
    if (!token || !user) {
      router.push('/login');
      return false;
    }
    
    try {
      const userData = JSON.parse(user);
      if (userData.role !== 'admin') {
        router.push('/');
        return false;
      }
    } catch (error) {
      router.push('/login');
      return false;
    }
    
    return true;
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('alora-token');
      
      if (!token) {
        router.push('/login');
        return;
      }
      
      const response = await fetch('http://localhost:5000/api/admin/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Check if response is OK
      if (!response.ok) {
        console.error('HTTP error:', response.status);
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('alora-token');
          localStorage.removeItem('alora-user');
          router.push('/login');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📊 Orders data received:', data);
      
      if (data && data.success) {
        // Process orders
        const safeOrders = (data.orders || []).map((order: any) => {
          const customerInfo = order.customerInfo || {};
          
          return {
            _id: order._id || '',
            orderNumber: order.orderNumber || `ORD-${order._id.substring(0, 8).toUpperCase()}`,
            totalAmount: order.totalAmount || 0,
            status: order.status || 'pending',
            paymentMethod: order.paymentMethod || 'cash',
            createdAt: order.createdAt || new Date().toISOString(),
            updatedAt: order.updatedAt,
            customerInfo: {
              name: customerInfo.name || 'Guest Customer',
              email: customerInfo.email || 'No email provided',
              phone: customerInfo.phone || 'No phone provided'
            },
            items: order.items || [],
            deliveryAddress: order.deliveryAddress || {}
          };
        });
        
        console.log('✅ Processed orders:', safeOrders);
        setOrders(safeOrders);
      } else {
        console.error('Failed to fetch orders:', data?.message || 'No data returned');
        setOrders([]);
      }
    } catch (error: any) {
      console.error('Error fetching orders:', error.message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('alora-token');
      
      if (!token) return;
      
      const response = await fetch('http://localhost:5000/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        console.error('Stats fetch failed:', response.status);
        return;
      }
      
      const data = await response.json();
      
      if (data && data.success) {
        setStats(data.stats || {
          totalOrders: 0,
          totalRevenue: 0,
          pendingOrders: 0,
          completedOrders: 0,
          cancelledOrders: 0,
          recentOrders: 0,
          totalCustomers: 0
        });
      } else {
        console.error('Stats data error:', data?.message);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const token = localStorage.getItem('alora-token');
      
      if (!token) {
        console.error('No token found');
        return;
      }
      
      const response = await fetch(`http://localhost:5000/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Refresh data
        await fetchOrders();
        await fetchStats();
      } else {
        console.error('Update failed:', data.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  // Helper to copy text to clipboard
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        alert(`${type} copied to clipboard!`);
      })
      .catch(err => {
        console.error('Failed to copy:', err);
      });
  };

  // Helper to initiate WhatsApp message
  const openWhatsApp = (phone: string) => {
    // Clean phone number (remove non-numeric characters)
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone) {
      window.open(`https://wa.me/${cleanPhone}`, '_blank');
    } else {
      alert('Invalid phone number');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'shipped': return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'delivered': return 'bg-green-100 text-green-800 border border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border border-red-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock size={16} />;
      case 'processing': return <Package size={16} />;
      case 'shipped': return <Truck size={16} />;
      case 'delivered': return <CheckCircle size={16} />;
      case 'cancelled': return <XCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status === filter);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'No date';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return '';
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Manage orders and view customer information</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={fetchOrders}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                Refresh Orders
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('alora-token');
                  localStorage.removeItem('alora-user');
                  router.push('/login');
                }}
                className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl p-6 mb-8 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Customer Orders Dashboard</h2>
              <p className="opacity-90">Manage orders and communicate with customers</p>
            </div>
            <div className="bg-white/20 p-3 rounded-xl">
              <Users size={24} />
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
                <p className="text-xs text-gray-500 mt-1">{stats.recentOrders} new this week</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <ShoppingBag className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">${stats.totalRevenue.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-1">All-time sales</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <DollarSign className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending Orders</p>
                <p className="text-3xl font-bold text-gray-900">{stats.pendingOrders}</p>
                <p className="text-xs text-gray-500 mt-1">Require attention</p>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg">
                <Clock className="text-yellow-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Customers</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalCustomers}</p>
                <p className="text-xs text-gray-500 mt-1">Unique customers</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <User className="text-purple-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Orders Section */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden mb-8">
          <div className="p-6 border-b">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Customer Orders</h2>
                <p className="text-gray-600 text-sm mt-1">
                  Showing {filteredOrders.length} of {orders.length} orders
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter size={16} className="text-gray-500" />
                  <select 
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as any)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="all">All Orders</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-600">
                {filter === 'all' 
                  ? 'No orders have been placed yet.' 
                  : `No ${filter} orders found.`}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredOrders.map((order) => {
                const customer = order.customerInfo || {
                  name: 'Guest Customer',
                  email: 'No email provided',
                  phone: 'No phone provided'
                };
                const orderTotal = order.totalAmount || 0;
                const orderItems = order.items || [];
                
                return (
                  <div key={order._id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Order Info */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {order.orderNumber || `Order ${order._id.substring(0, 8)}`}
                            </p>
                            <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                              <Calendar size={14} />
                              {formatDate(order.createdAt)} at {formatTime(order.createdAt)}
                            </p>
                          </div>
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-sm">
                            <span className="text-gray-600">Payment: </span>
                            <span className="font-medium">
                              {order.paymentMethod === 'cash' ? 'Cash on Delivery' : order.paymentMethod === 'online' ? 'Online' : 'Unknown'}
                            </span>
                          </p>
                          <p className="text-lg font-bold text-gray-900">
                            ${orderTotal.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {/* Customer Info */}
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-medium text-gray-900">Customer Contact</h4>
                          <div className="flex gap-2">
                            {customer?.email && customer.email !== 'No email provided' && (
                              <button
                                onClick={() => copyToClipboard(customer.email || '', 'Email')}
                                className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded flex items-center gap-1 hover:bg-blue-200"
                                title="Copy email"
                              >
                                <Copy size={12} />
                                Copy
                              </button>
                            )}
                            {customer?.phone && customer.phone !== 'No phone provided' && (
                              <button
                                onClick={() => openWhatsApp(customer.phone || '')}
                                className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded flex items-center gap-1 hover:bg-green-200"
                                title="Message on WhatsApp"
                              >
                                <MessageSquare size={12} />
                                WhatsApp
                              </button>
                            )}
                          </div>
                        </div>
                        
                        <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                          {/* Name */}
                          <div className="flex items-center gap-3">
                            <div className="bg-pink-100 p-2 rounded-lg">
                              <User className="text-pink-600" size={16} />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-600">Customer Name</p>
                              <p className="font-medium text-gray-900">{customer?.name || 'Guest Customer'}</p>
                            </div>
                          </div>
                          
                          {/* Email */}
                          <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-lg">
                              <Mail className="text-blue-600" size={16} />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-600">Email Address</p>
                              <div className="flex items-center justify-between">
                                <p className="font-medium text-gray-900 break-all">{customer?.email || 'No email provided'}</p>
                                {customer?.email && customer.email !== 'No email provided' && (
                                  <button
                                    onClick={() => window.location.href = `mailto:${customer.email}`}
                                    className="text-blue-600 hover:text-blue-800 text-sm ml-2"
                                    title="Send email"
                                  >
                                    Email
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Phone */}
                          <div className="flex items-center gap-3">
                            <div className="bg-green-100 p-2 rounded-lg">
                              <Phone className="text-green-600" size={16} />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-600">Phone Number</p>
                              <div className="flex items-center justify-between">
                                <p className="font-medium text-gray-900">{customer?.phone || 'No phone provided'}</p>
                                {customer?.phone && customer.phone !== 'No phone provided' && (
                                  <button
                                    onClick={() => window.location.href = `tel:${customer.phone}`}
                                    className="text-green-600 hover:text-green-800 text-sm ml-2"
                                    title="Call customer"
                                  >
                                    Call
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Delivery Address */}
                          {order.deliveryAddress && (
                            <div className="flex items-start gap-3">
                              <div className="bg-gray-100 p-2 rounded-lg">
                                <MapPin className="text-gray-600" size={16} />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm text-gray-600">Delivery Address</p>
                                <p className="text-sm text-gray-900">
                                  {order.deliveryAddress.street || ''}
                                  {order.deliveryAddress.street && order.deliveryAddress.city && ', '}
                                  {order.deliveryAddress.city || ''}
                                  {order.deliveryAddress.state && `, ${order.deliveryAddress.state}`}
                                  {order.deliveryAddress.country && `, ${order.deliveryAddress.country}`}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Order Items & Actions */}
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-medium text-gray-900">
                            Order Items ({orderItems.length})
                          </h4>
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                            className="text-xs border border-gray-300 rounded-lg px-2 py-1 focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                        
                        {orderItems.length > 0 ? (
                          <>
                            <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                              {orderItems.map((item, index) => (
                                <div key={index} className="flex justify-between text-sm">
                                  <div>
                                    <p className="font-medium">{item.name || 'Unnamed Product'}</p>
                                    <p className="text-gray-600 text-xs">
                                      {item.quantity || 1} × ${(item.price || 0).toFixed(2)}
                                      {item.shade && ` • Shade: ${item.shade}`}
                                    </p>
                                  </div>
                                  <p className="font-semibold">
                                    ${(((item.quantity || 1) * (item.price || 0))).toFixed(2)}
                                  </p>
                                </div>
                              ))}
                            </div>
                            
                            <div className="mt-4 flex gap-2">
                              <button
                                onClick={() => {
                                  console.log('View order:', order._id);
                                }}
                                className="text-pink-600 hover:text-pink-700 text-sm font-medium flex items-center gap-1"
                              >
                                <Eye size={14} />
                                View Details
                              </button>
                              <button
                                onClick={() => copyToClipboard(`${customer.name}\n${customer.email}\n${customer.phone}`, 'Customer Info')}
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                              >
                                <Copy size={14} />
                                Copy Info
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="flex items-center gap-2 text-gray-500 text-sm py-2">
                            <AlertCircle size={14} />
                            No items in this order
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Customer Communication Tools */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={fetchOrders}
                className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-3"
              >
                <div>
                  <p className="font-medium text-gray-900">Refresh Orders</p>
                  <p className="text-sm text-gray-600">Get latest customer orders</p>
                </div>
              </button>
              <button
                onClick={() => {
                  // Export customer emails
                  const emails = orders
                    .map(order => order.customerInfo?.email)
                    .filter(email => email && email !== 'No email provided')
                    .join(', ');
                  copyToClipboard(emails, 'Customer emails');
                }}
                className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-3"
              >
                <Mail size={16} className="text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">Copy All Emails</p>
                  <p className="text-sm text-gray-600">Copy all customer emails</p>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Customer Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Customers</span>
                <span className="font-semibold">{stats.totalCustomers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Orders Today</span>
                <span className="font-semibold">{stats.recentOrders}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Average Order</span>
                <span className="font-semibold">
                  ${stats.totalOrders > 0 ? (stats.totalRevenue / stats.totalOrders).toFixed(2) : '0.00'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Contact Tips</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <p>• Click "Copy" to copy customer email</p>
              <p>• Click "WhatsApp" to message customer</p>
              <p>• Click "Call" to call customer directly</p>
              <p>• Use "Copy Info" for complete details</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}