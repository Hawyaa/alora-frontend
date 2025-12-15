// frontend/src/app/admin/orders/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  Package, 
  CheckCircle, 
  Clock, 
  XCircle, 
  DollarSign, 
  User, 
  Mail, 
  Calendar,
  Filter,
  Search,
  Download,
  RefreshCw,
  Eye,
  Printer
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface OrderItem {
  product: {
    _id: string;
    name: string;
    price: number;
    images?: string[];
  };
  quantity: number;
  price: number;
  shade?: string;
}

interface Order {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'paid' | 'failed' | 'cancelled';
  transactionRef?: string;
  paymentMethod?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const router = useRouter();

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    let filtered = orders;
    
    // Apply search filter
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(order => 
        order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.transactionRef?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items.some(item => 
          item.product?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }
    
    setFilteredOrders(filtered);
  }, [searchTerm, statusFilter, orders]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('alora-token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('http://localhost:5000/api/admin/orders', {
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
        setOrders(data.orders || []);
        setFilteredOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      alert('Failed to fetch orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, status: string) => {
    if (!confirm(`Are you sure you want to mark this order as ${status}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('alora-token');
      const response = await fetch(`http://localhost:5000/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          alert(`Order status updated to ${status}`);
          fetchOrders(); // Refresh orders
        }
      } else {
        throw new Error('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status. Please try again.');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'pending':
        return <Clock className="text-yellow-600" size={20} />;
      case 'failed':
        return <XCircle className="text-red-600" size={20} />;
      case 'cancelled':
        return <XCircle className="text-gray-600" size={20} />;
      default:
        return <Clock className="text-gray-600" size={20} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getTotalRevenue = () => {
    return orders
      .filter(order => order.status === 'paid')
      .reduce((sum, order) => sum + order.totalAmount, 0);
  };

  const getOrderCountByStatus = (status: string) => {
    return orders.filter(order => order.status === status).length;
  };

  const printOrderReceipt = (order: Order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const receiptContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Order Receipt - ${order._id.slice(-8)}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .order-info { margin-bottom: 20px; }
          .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .total { text-align: right; font-size: 1.2em; font-weight: bold; margin-top: 20px; }
          .status { display: inline-block; padding: 4px 8px; border-radius: 4px; }
          .paid { background: #d1fae5; color: #065f46; }
          .pending { background: #fef3c7; color: #92400e; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Alora Lipgloss</h1>
          <h2>Order Receipt</h2>
        </div>
        
        <div class="order-info">
          <p><strong>Order ID:</strong> ${order._id.slice(-8).toUpperCase()}</p>
          <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
          <p><strong>Customer:</strong> ${order.user?.name || 'Customer'}</p>
          <p><strong>Email:</strong> ${order.user?.email || 'No email'}</p>
          <p><strong>Status:</strong> 
            <span class="status ${order.status}">${order.status.toUpperCase()}</span>
          </p>
        </div>
        
        <table class="items-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(item => `
              <tr>
                <td>${item.product?.name || 'Product'}</td>
                <td>${item.quantity}</td>
                <td>${formatCurrency(item.price)}</td>
                <td>${formatCurrency(item.price * item.quantity)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="total">
          <p><strong>Total Amount:</strong> ${formatCurrency(order.totalAmount)}</p>
        </div>
        
        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `;
    
    printWindow.document.write(receiptContent);
    printWindow.document.close();
  };

  const viewOrderDetails = (orderId: string) => {
    router.push(`/admin/orders/${orderId}`);
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Orders</h1>
          <p className="text-gray-600 mt-2">
            Manage and track customer orders. {orders.length} total orders.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={fetchOrders}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center"
          >
            <RefreshCw size={16} className="mr-2" />
            Refresh
          </button>
          <button
            onClick={() => {
              const dataStr = JSON.stringify(orders, null, 2);
              const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
              const exportFileDefaultName = `orders-${new Date().toISOString().split('T')[0]}.json`;
              
              const linkElement = document.createElement('a');
              linkElement.setAttribute('href', dataUri);
              linkElement.setAttribute('download', exportFileDefaultName);
              linkElement.click();
            }}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center"
          >
            <Download size={16} className="mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-3xl font-bold mt-2">{orders.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Package className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Paid Orders</p>
              <p className="text-3xl font-bold mt-2">
                {getOrderCountByStatus('paid')}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Orders</p>
              <p className="text-3xl font-bold mt-2">
                {getOrderCountByStatus('pending')}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="text-yellow-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold mt-2">
                {formatCurrency(getTotalRevenue())}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <DollarSign className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search orders by customer, email, or product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg w-full"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Filter size={16} className="mr-2 text-gray-600" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border rounded-lg px-4 py-2"
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center">
          <Package size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchTerm || statusFilter !== 'all' ? 'No matching orders' : 'No Orders Yet'}
          </h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try different search terms or clear filters' 
              : 'Customers will appear here after they complete purchases.'}
          </p>
          {orders.length === 0 && (
            <div className="mt-6">
              <button
                onClick={() => {
                  // Create test orders
                  if (confirm('Create test orders for demonstration?')) {
                    createTestOrders();
                  }
                }}
                className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
              >
                Create Test Orders
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <div key={order._id} className="bg-white rounded-xl border overflow-hidden">
              {/* Order Header */}
              <div className="p-6 border-b bg-gray-50">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div className="flex items-center space-x-4 mb-4 md:mb-0">
                    <div className={`p-3 rounded-lg ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg text-gray-900">
                          Order #{order._id.slice(-8).toUpperCase()}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600 mt-1">
                        <User size={16} className="mr-2" />
                        {order.user?.name || 'Customer'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    <div className="flex items-center text-gray-600 mb-2">
                      <Calendar size={16} className="mr-2" />
                      <span className="text-sm">
                        {new Date(order.createdAt).toLocaleDateString()}
                        {order.paidAt && ` • Paid: ${new Date(order.paidAt).toLocaleDateString()}`}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-pink-600">
                      {formatCurrency(order.totalAmount)}
                    </div>
                  </div>
                </div>
                
                {/* Order Details Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-gray-600">Customer</p>
                    <p className="font-medium">{order.user?.name}</p>
                    <p className="text-sm text-gray-600 flex items-center">
                      <Mail size={12} className="mr-1" />
                      {order.user?.email}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Payment</p>
                    <p className="font-medium">
                      {order.paymentMethod || 'Not specified'}
                    </p>
                    {order.transactionRef && (
                      <p className="text-sm text-gray-600">
                        Ref: {order.transactionRef}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Items</p>
                    <p className="font-medium">
                      {order.items.length} items
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.items.reduce((sum, item) => sum + item.quantity, 0)} total units
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Order Items</h4>
                
                {order.items.length > 0 ? (
                  <div className="space-y-4">
                    {order.items.map((item, index) => (
                      <div 
                        key={index} 
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            {item.product?.images?.[0] ? (
                              <img
                                src={item.product.images[0]}
                                alt={item.product.name}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <Package className="text-gray-400" size={20} />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {item.product?.name || 'Product'}
                            </p>
                            <p className="text-sm text-gray-600">
                              {formatCurrency(item.price)} each
                            </p>
                            {item.shade && (
                              <p className="text-xs text-gray-500 mt-1">
                                Shade: {item.shade}
                              </p>
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
                          <div className="text-sm text-gray-500">
                            Total: {formatCurrency(item.price * item.quantity)}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Order Summary */}
                    <div className="border-t pt-6 mt-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-900">Order Summary</p>
                          <p className="text-sm text-gray-600">
                            {order.items.length} items • 
                            {order.items.reduce((sum, item) => sum + item.quantity, 0)} units
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-pink-600">
                            {formatCurrency(order.totalAmount)}
                          </div>
                          <p className="text-sm text-gray-600">Total amount</p>
                          {order.paymentMethod && (
                            <p className="text-xs text-gray-500">
                              Paid via {order.paymentMethod}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Admin Actions */}
                    <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
                      <button
                        onClick={() => viewOrderDetails(order._id)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center"
                      >
                        <Eye size={16} className="mr-2" />
                        View Details
                      </button>
                      
                      <button
                        onClick={() => printOrderReceipt(order)}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center"
                      >
                        <Printer size={16} className="mr-2" />
                        Print
                      </button>
                      
                      {order.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(order._id, 'paid')}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                          >
                            Mark as Paid
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(order._id, 'cancelled')}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No items in this order
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Helper function to create test orders
async function createTestOrders() {
  try {
    const token = localStorage.getItem('alora-token');
    if (!token) {
      alert('Please login first');
      return;
    }

    // Fetch some users and products first
    const [usersRes, productsRes] = await Promise.all([
      fetch('http://localhost:5000/api/auth/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      }),
      fetch('http://localhost:5000/api/products')
    ]);

    const usersData = await usersRes.json();
    const productsData = await productsRes.json();

    const users = usersData.users || [];
    const products = productsData.products || [];

    if (users.length === 0 || products.length === 0) {
      alert('Need users and products first to create test orders');
      return;
    }

    // Create test orders
    const testOrders = [
      {
        user: users[0]._id,
        items: [
          {
            product: products[0]._id,
            quantity: 2,
            price: products[0].price,
            shade: 'Rose Pink'
          }
        ],
        totalAmount: products[0].price * 2,
        status: 'paid',
        transactionRef: 'TEST_' + Date.now(),
        paymentMethod: 'Chapa',
        paidAt: new Date().toISOString()
      },
      {
        user: users[1]?._id || users[0]._id,
        items: [
          {
            product: products[1]?._id || products[0]._id,
            quantity: 1,
            price: products[1]?.price || products[0].price
          }
        ],
        totalAmount: (products[1]?.price || products[0].price) * 1,
        status: 'pending',
        transactionRef: 'TEST_' + (Date.now() + 1),
        paymentMethod: 'Chapa'
      }
    ];

    // Create orders
    for (const orderData of testOrders) {
      await fetch('http://localhost:5000/api/admin/orders/create-test', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });
    }

    alert('Test orders created successfully! Refresh to see them.');
    window.location.reload();
  } catch (error) {
    console.error('Error creating test orders:', error);
    alert('Failed to create test orders');
  }
}