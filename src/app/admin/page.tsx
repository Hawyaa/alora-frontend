'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Package, Users, DollarSign, ShoppingBag, 
  CheckCircle, XCircle, Clock, Truck,
  Eye, Mail, Phone, MapPin, Filter,
  TrendingUp, CreditCard, Calendar,
  AlertCircle, User, Copy, MessageSquare,
  Home, ShoppingCart, Settings, LogOut,
  Plus, Edit, Trash2, Search, Upload,
  BarChart3, Layers, Tag, Image as ImageIcon,
  Star, Grid, List, ArrowUp, ArrowDown,
  EyeOff, RefreshCw, X
} from 'lucide-react';
import Link from 'next/link';

interface OrderItem {
  name: string;
  quantity: number;
  price: number; // This is in USD from backend
  shade?: string;
  total?: number;
}

interface Order {
  _id: string;
  orderNumber?: string;
  totalAmount?: number; // This is in USD from backend
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

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number; // This is in USD from backend
  category: string;
  images: string[];
  inStock: boolean;
  stockQuantity: number;
  shades: Array<{ name: string; hexCode: string }>;
  createdAt: string;
  updatedAt: string;
}

interface HomepageProduct {
  _id: string;
  productId: Product;
  position: number;
  isActive: boolean;
  addedBy?: {
    name: string;
    email: string;
  };
  createdAt: string;
}

interface Stats {
  totalOrders: number;
  totalRevenue: number; // This is in USD from backend
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  recentOrders: number;
  totalCustomers: number;
  totalProducts: number;
  lowStockProducts: number;
  ordersWithCustomers?: number;
  chartData?: {
    labels: string[];
    data: number[];
  };
}

interface AdminTab {
  id: 'dashboard' | 'orders' | 'products' | 'homepage' | 'customers';
  label: string;
  icon: React.ReactNode;
}

// USD to ETB conversion rate (same as shop page)
const USD_TO_ETB_RATE = 55;

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'products' | 'homepage' | 'customers'>('dashboard');
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [homepageProducts, setHomepageProducts] = useState<HomepageProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    recentOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    lowStockProducts: 0
  });
  const [filter, setFilter] = useState<'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'>('all');
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  
  // Product Management States
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '', // This is in ETB in the form
    category: 'lipgloss',
    images: [''],
    inStock: true,
    stockQuantity: '10',
    shades: [] as Array<{ name: string; hexCode: string }>
  });
  const [newShade, setNewShade] = useState({ name: '', hexCode: '#ff69b4' });

  // Homepage Management States
  const [showAddHomepageModal, setShowAddHomepageModal] = useState(false);
  const [homepageSearchTerm, setHomepageSearchTerm] = useState('');
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  // Conversion functions
  const convertToETB = (usdPrice: number): number => {
    return Math.round(usdPrice * USD_TO_ETB_RATE);
  };

  const convertToUSD = (etbPrice: number): number => {
    return etbPrice / USD_TO_ETB_RATE;
  };

  const formatETB = (amount: number): string => {
    return `ETB ${amount.toLocaleString('en-ET')}`;
  };

  const formatCurrency = (amount: number, inETB: boolean = true): string => {
    if (inETB) {
      const etbAmount = convertToETB(amount);
      return formatETB(etbAmount);
    }
    return `$${amount.toFixed(2)}`;
  };

  const adminTabs: AdminTab[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 size={20} /> },
    { id: 'orders', label: 'Orders', icon: <ShoppingBag size={20} /> },
    { id: 'products', label: 'Products', icon: <Package size={20} /> },
    { id: 'homepage', label: 'Homepage', icon: <Home size={20} /> },
    { id: 'customers', label: 'Customers', icon: <Users size={20} /> },
  ];

  useEffect(() => {
    checkAdminAccess();
    if (activeTab === 'orders') {
      fetchOrders();
      fetchStats();
    } else if (activeTab === 'products') {
      fetchProducts();
      fetchProductStats();
    } else if (activeTab === 'homepage') {
      fetchHomepageProducts();
    } else if (activeTab === 'dashboard') {
      fetchStats();
      fetchOrders();
      fetchProducts();
    }
  }, [activeTab]);

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
      
      const response = await fetch(`${API_URL}/admin/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
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

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('alora-token');
      
      if (!token) {
        router.push('/login');
        return;
      }
      
      const response = await fetch(`${API_URL}/admin/products`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
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
      console.log('📦 Products data received:', data);
      
      if (data && data.success) {
        setProducts(data.products || []);
      } else {
        console.error('Failed to fetch products:', data?.message || 'No data returned');
        setProducts([]);
      }
    } catch (error: any) {
      console.error('Error fetching products:', error.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchHomepageProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('alora-token');
      
      if (!token) {
        router.push('/login');
        return;
      }
      
      // First fetch all products to calculate available ones
      const productsResponse = await fetch(`${API_URL}/admin/products`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        if (productsData.success) {
          setProducts(productsData.products || []);
        }
      }
      
      // Then fetch homepage products
      const response = await fetch(`${API_URL}/homepage-products/admin/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        console.error('HTTP error fetching homepage products:', response.status);
        setHomepageProducts([]);
        return;
      }
      
      const data = await response.json();
      console.log('🏠 Homepage products data received:', data);
      
      if (data && data.success) {
        setHomepageProducts(data.homepageProducts || []);
      } else {
        console.error('Failed to fetch homepage products:', data?.message || 'No data returned');
        setHomepageProducts([]);
      }
    } catch (error: any) {
      console.error('Error fetching homepage products:', error.message);
      setHomepageProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('alora-token');
      
      if (!token) return;
      
      const response = await fetch(`${API_URL}/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        console.error('Stats fetch failed:', response.status);
        return;
      }
      
      const data = await response.json();
      
      if (data && data.success) {
        setStats(prev => ({
          ...prev,
          ...(data.stats || {})
        }));
      } else {
        console.error('Stats data error:', data?.message);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchProductStats = async () => {
    try {
      const token = localStorage.getItem('alora-token');
      
      if (!token) return;
      
      const response = await fetch(`${API_URL}/admin/products`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) return;
      
      const data = await response.json();
      
      if (data && data.success) {
        const products = data.products || [];
        const lowStockProducts = products.filter((p: Product) => p.stockQuantity < 5).length;
        
        setStats(prev => ({
          ...prev,
          totalProducts: products.length,
          lowStockProducts: lowStockProducts
        }));
      }
    } catch (error) {
      console.error('Error fetching product stats:', error);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const token = localStorage.getItem('alora-token');
      
      if (!token) {
        console.error('No token found');
        return;
      }
      
      const response = await fetch(`${API_URL}/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchOrders();
        await fetchStats();
      } else {
        console.error('Update failed:', data.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const handleAddProduct = async () => {
    try {
      const token = localStorage.getItem('alora-token');
      
      if (!token) {
        alert('Please login first');
        return;
      }

      // Validate required fields
      if (!newProduct.name || !newProduct.description || !newProduct.price) {
        alert('Please fill in all required fields');
        return;
      }

      // Convert ETB price to USD for storage
      const etbPrice = parseFloat(newProduct.price);
      const usdPrice = convertToUSD(etbPrice);

      const productData = {
        ...newProduct,
        price: usdPrice, // Store as USD in database
        stockQuantity: parseInt(newProduct.stockQuantity) || 0,
        images: newProduct.images.filter(img => img.trim() !== '')
      };

      const response = await fetch(`${API_URL}/admin/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Product added successfully!');
        setShowProductModal(false);
        resetProductForm();
        await fetchProducts();
        await fetchProductStats();
      } else {
        alert(`Failed to add product: ${data.message}`);
      }
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Error adding product. Please try again.');
    }
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;
    
    try {
      const token = localStorage.getItem('alora-token');
      
      if (!token) {
        alert('Please login first');
        return;
      }

      // Convert ETB price to USD for storage
      const etbPrice = parseFloat(newProduct.price);
      const usdPrice = convertToUSD(etbPrice);

      const productData = {
        ...newProduct,
        price: usdPrice, // Store as USD in database
        stockQuantity: parseInt(newProduct.stockQuantity) || 0,
        images: newProduct.images.filter(img => img.trim() !== '')
      };

      const response = await fetch(`${API_URL}/admin/products/${editingProduct._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Product updated successfully!');
        setShowProductModal(false);
        setEditingProduct(null);
        resetProductForm();
        await fetchProducts();
      } else {
        alert(`Failed to update product: ${data.message}`);
      }
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Error updating product. Please try again.');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('alora-token');
      
      if (!token) {
        alert('Please login first');
        return;
      }

      const response = await fetch(`${API_URL}/admin/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Product deleted successfully!');
        await fetchProducts();
        await fetchProductStats();
      } else {
        alert(`Failed to delete product: ${data.message}`);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product. Please try again.');
    }
  };

  const handleAddToHomepage = async (productId: string) => {
    try {
      const token = localStorage.getItem('alora-token');
      
      if (!token) {
        alert('Please login first');
        return;
      }

      const response = await fetch(`${API_URL}/homepage-products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          productId,
          position: homepageProducts.length
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Product added to homepage!');
        fetchHomepageProducts();
      } else {
        alert(data.error || 'Failed to add product');
      }
    } catch (error) {
      console.error('Error adding product to homepage:', error);
      alert('Failed to add product to homepage');
    }
  };

  const handleRemoveFromHomepage = async (productId: string) => {
    if (!confirm('Remove this product from homepage?')) return;
    
    try {
      const token = localStorage.getItem('alora-token');
      
      const response = await fetch(`${API_URL}/homepage-products/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Product removed from homepage!');
        fetchHomepageProducts();
      } else {
        alert(data.error || 'Failed to remove product');
      }
    } catch (error) {
      console.error('Error removing product from homepage:', error);
      alert('Failed to remove product from homepage');
    }
  };

  const handleToggleHomepageActive = async (homepageProductId: string) => {
    try {
      const token = localStorage.getItem('alora-token');
      
      const response = await fetch(`${API_URL}/homepage-products/${homepageProductId}/toggle`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        fetchHomepageProducts();
      }
    } catch (error) {
      console.error('Error toggling product status:', error);
    }
  };

  const handleMoveHomepagePosition = async (homepageProductId: string, direction: 'up' | 'down') => {
    const product = homepageProducts.find(hp => hp._id === homepageProductId);
    if (!product) return;
    
    const newPosition = direction === 'up' ? product.position - 1 : product.position + 1;
    
    try {
      const token = localStorage.getItem('alora-token');
      
      const response = await fetch(`${API_URL}/homepage-products/${homepageProductId}/position`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ position: newPosition })
      });
      
      const data = await response.json();
      
      if (data.success) {
        fetchHomepageProducts();
      }
    } catch (error) {
      console.error('Error moving product position:', error);
    }
  };

  const editProduct = (product: Product) => {
    setEditingProduct(product);
    // Convert USD price from database to ETB for the form
    const etbPrice = convertToETB(product.price);
    
    setNewProduct({
      name: product.name,
      description: product.description,
      price: etbPrice.toString(), // Show ETB in form
      category: product.category,
      images: [...product.images],
      inStock: product.inStock,
      stockQuantity: product.stockQuantity.toString(),
      shades: [...product.shades]
    });
    setShowProductModal(true);
  };

  const resetProductForm = () => {
    setNewProduct({
      name: '',
      description: '',
      price: '',
      category: 'lipgloss',
      images: [''],
      inStock: true,
      stockQuantity: '10',
      shades: []
    });
    setNewShade({ name: '', hexCode: '#ff69b4' });
  };

  const addShade = () => {
    if (newShade.name.trim() && newShade.hexCode) {
      setNewProduct({
        ...newProduct,
        shades: [...newProduct.shades, { ...newShade }]
      });
      setNewShade({ name: '', hexCode: '#ff69b4' });
    }
  };

  const removeShade = (index: number) => {
    const updatedShades = [...newProduct.shades];
    updatedShades.splice(index, 1);
    setNewProduct({ ...newProduct, shades: updatedShades });
  };

  const addImageField = () => {
    setNewProduct({
      ...newProduct,
      images: [...newProduct.images, '']
    });
  };

  const removeImageField = (index: number) => {
    const updatedImages = [...newProduct.images];
    updatedImages.splice(index, 1);
    setNewProduct({ ...newProduct, images: updatedImages });
  };

  const updateImage = (index: number, value: string) => {
    const updatedImages = [...newProduct.images];
    updatedImages[index] = value;
    setNewProduct({ ...newProduct, images: updatedImages });
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        alert(`${type} copied to clipboard!`);
      })
      .catch(err => {
        console.error('Failed to copy:', err);
      });
  };

  const openWhatsApp = (phone: string) => {
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

  const renderDashboard = () => {
    // Convert revenue to ETB
    const totalRevenueETB = convertToETB(stats.totalRevenue);
    
    return (
      <>
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
                <p className="text-3xl font-bold text-gray-900">{formatETB(totalRevenueETB)}</p>
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
                <p className="text-sm text-gray-600 mb-1">Total Products</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
                <p className="text-xs text-gray-500 mt-1">{stats.lowStockProducts} low stock</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <Package className="text-purple-600" size={24} />
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
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => setActiveTab('products')}
            className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-center gap-4">
              <div className="bg-pink-50 p-3 rounded-lg">
                <Plus className="text-pink-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Add New Product</h3>
                <p className="text-sm text-gray-600">Add products to your store</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <ShoppingBag className="text-blue-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Manage Orders</h3>
                <p className="text-sm text-gray-600">View and update customer orders</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('homepage')}
            className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-center gap-4">
              <div className="bg-purple-50 p-3 rounded-lg">
                <Home className="text-purple-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Manage Homepage</h3>
                <p className="text-sm text-gray-600">Setup featured products</p>
              </div>
            </div>
          </button>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
            <button
              onClick={() => setActiveTab('orders')}
              className="text-pink-600 hover:text-pink-700 text-sm font-medium"
            >
              View All Orders →
            </button>
          </div>
          <div className="space-y-4">
            {orders.slice(0, 5).map((order) => {
              const orderTotalETB = convertToETB(order.totalAmount || 0);
              
              return (
                <div key={order._id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{order.orderNumber}</p>
                    <p className="text-sm text-gray-600">
                      {order.customerInfo?.name || 'Guest Customer'} • {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    <span className="font-semibold">{formatETB(orderTotalETB)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </>
    );
  };

  const renderOrders = () => (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
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
            const orderTotalETB = convertToETB(order.totalAmount || 0);
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
                        {formatETB(orderTotalETB)}
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
                          {orderItems.map((item, index) => {
                            const itemPriceETB = convertToETB(item.price || 0);
                            const itemTotalETB = itemPriceETB * (item.quantity || 1);
                            
                            return (
                              <div key={index} className="flex justify-between text-sm">
                                <div>
                                  <p className="font-medium">{item.name || 'Unnamed Product'}</p>
                                  <p className="text-gray-600 text-xs">
                                    {item.quantity || 1} × {formatETB(itemPriceETB)}
                                    {item.shade && ` • Shade: ${item.shade}`}
                                  </p>
                                </div>
                                <p className="font-semibold">
                                  {formatETB(itemTotalETB)}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                        
                        <div className="mt-4 flex gap-2">
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
  );

  const renderProducts = () => (
    <div className="space-y-6">
      {/* Products Header */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Product Management</h2>
            <p className="text-gray-600 mt-1">Manage your store products</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => {
                setEditingProduct(null);
                resetProductForm();
                setShowProductModal(true);
              }}
              className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 flex items-center gap-2"
            >
              <Plus size={20} />
              Add Product
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => {
          const productPriceETB = convertToETB(product.price);
          
          return (
            <div key={product._id} className="bg-white rounded-xl shadow-sm border overflow-hidden group">
              
              <div className="relative h-48 bg-gray-100">
                {product.images && product.images[0] ? (
                  <div 
                    className="w-full h-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${product.images[0]})` }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-50">
                    <Package className="text-pink-300" size={48} />
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    product.inStock 
                      ? product.stockQuantity < 5 
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.inStock 
                      ? product.stockQuantity < 5 
                        ? 'Low Stock'
                        : 'In Stock'
                      : 'Out of Stock'
                    }
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900 line-clamp-1">{product.name}</h3>
                  <span className="text-pink-600 font-bold">{formatETB(productPriceETB)}</span>
                </div>
                
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Tag size={14} />
                    <span className="capitalize">{product.category}</span>
                  </div>
                  <span>Stock: {product.stockQuantity}</span>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => editProduct(product)}
                    className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 flex items-center justify-center gap-2"
                  >
                    <Edit size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product._id)}
                    className="px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl">
          <Package size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Products Yet</h3>
          <p className="text-gray-600 mb-6">Add your first product to start selling</p>
          <button
            onClick={() => {
              setEditingProduct(null);
              resetProductForm();
              setShowProductModal(true);
            }}
            className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 flex items-center gap-2 mx-auto"
          >
            <Plus size={20} />
            Add First Product
          </button>
        </div>
      )}
    </div>
  );

  const renderHomepage = () => {
    // Sort homepage products by position
    const sortedHomepageProducts = [...homepageProducts].sort((a, b) => a.position - b.position);
    
    // Calculate available products (products not already on homepage)
    const homepageProductIds = new Set(homepageProducts.map(hp => hp.productId._id));
    const filteredAvailableProducts = products.filter(product => 
      !homepageProductIds.has(product._id) &&
      (homepageSearchTerm === '' || 
       product.name.toLowerCase().includes(homepageSearchTerm.toLowerCase()) ||
       product.description.toLowerCase().includes(homepageSearchTerm.toLowerCase()))
    );

    return (
      <div className="space-y-6">
        {/* Homepage Header */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Homepage Product Management</h2>
              <p className="text-gray-600 mt-1">
                Manage which products appear on the homepage's "Premium Lip Gloss Collection" section
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setActiveTab('dashboard')}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Back to Dashboard
              </button>
              <button
                onClick={() => setShowAddHomepageModal(true)}
                className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 flex items-center gap-2"
              >
                <Plus size={20} />
                Add Products
              </button>
            </div>
          </div>
        </div>

        {/* Current Homepage Products */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Home size={20} />
              Current Homepage Products ({sortedHomepageProducts.length})
            </h3>
            <p className="text-gray-600 text-sm mt-1">
              These products appear on the homepage. Drag or use arrows to reorder.
            </p>
          </div>

          {sortedHomepageProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package size={64} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Homepage Products</h3>
              <p className="text-gray-600 mb-6">Add products to display on the homepage</p>
              <button
                onClick={() => setShowAddHomepageModal(true)}
                className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 flex items-center gap-2 mx-auto"
              >
                <Plus size={20} />
                Add Products
              </button>
            </div>
          ) : (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedHomepageProducts.map((hp, index) => (
                  <div key={hp._id} className="border rounded-lg overflow-hidden group">
                    <div className="relative">
                      <div className="h-48 bg-gray-100 overflow-hidden">
                        {hp.productId.images?.[0] ? (
                          <img
                            src={hp.productId.images[0]}
                            alt={hp.productId.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package size={48} className="text-gray-300" />
                          </div>
                        )}
                      </div>
                      
                      {/* Position Badge */}
                      <div className="absolute top-2 left-2 bg-pink-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        #{index + 1}
                      </div>
                      
                      {/* Status Badge */}
                      <div className="absolute top-2 right-2">
                        <button
                          onClick={() => handleToggleHomepageActive(hp._id)}
                          className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                            hp.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {hp.isActive ? <Eye size={12} /> : <EyeOff size={12} />}
                          {hp.isActive ? 'Active' : 'Hidden'}
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-900 line-clamp-1">
                          {hp.productId.name}
                        </h4>
                        <span className="text-pink-600 font-bold">
                          {formatETB(convertToETB(hp.productId.price))}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {hp.productId.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span className="capitalize">{hp.productId.category}</span>
                        <span>Stock: {hp.productId.stockQuantity}</span>
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        <div className="flex-1 flex gap-1">
                          <button
                            onClick={() => handleMoveHomepagePosition(hp._id, 'up')}
                            disabled={index === 0}
                            className={`flex-1 px-2 py-1 rounded ${
                              index === 0
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            <ArrowUp size={16} />
                          </button>
                          <button
                            onClick={() => handleMoveHomepagePosition(hp._id, 'down')}
                            disabled={index === sortedHomepageProducts.length - 1}
                            className={`flex-1 px-2 py-1 rounded ${
                              index === sortedHomepageProducts.length - 1
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            <ArrowDown size={16} />
                          </button>
                        </div>
                        <button
                          onClick={() => handleRemoveFromHomepage(hp.productId._id)}
                          className="px-3 py-1 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 text-sm"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      
                      <div className="text-xs text-gray-500 mt-2">
                        Added: {new Date(hp.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Add Products Modal */}
        {showAddHomepageModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">
                    Add Products to Homepage
                  </h3>
                  <button
                    onClick={() => setShowAddHomepageModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={homepageSearchTerm}
                      onChange={(e) => setHomepageSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAvailableProducts.map((product) => (
                    <div key={product._id} className="border rounded-lg overflow-hidden group">
                      <div className="h-40 bg-gray-100 overflow-hidden">
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package size={32} className="text-gray-300" />
                          </div>
                        )}
                      </div>
                      
                      <div className="p-3">
                        <h4 className="font-semibold text-gray-900 text-sm line-clamp-1 mb-1">
                          {product.name}
                        </h4>
                        <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                          {product.description}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-pink-600 font-bold text-sm">
                            {formatETB(convertToETB(product.price))}
                          </span>
                          <button
                            onClick={() => handleAddToHomepage(product._id)}
                            className="px-3 py-1 bg-pink-500 text-white rounded-lg hover:bg-pink-600 text-sm flex items-center gap-1"
                          >
                            <Plus size={12} />
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredAvailableProducts.length === 0 && (
                  <div className="text-center py-8">
                    <Package size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-600">
                      {homepageSearchTerm 
                        ? 'No products match your search'
                        : 'All products are already on the homepage'}
                    </p>
                  </div>
                )}

                <div className="flex justify-end pt-6 mt-6 border-t">
                  <button
                    onClick={() => setShowAddHomepageModal(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCustomers = () => {
    // Calculate customer value in ETB
    const customerValueETB = stats.totalCustomers > 0 
      ? convertToETB(stats.totalRevenue / stats.totalCustomers)
      : 0;
    
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Customer Management</h2>
        <p className="text-gray-600 mb-6">View and manage your customers</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="bg-white p-3 rounded-lg">
                <Users className="text-blue-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Total Customers</h3>
                <p className="text-3xl font-bold text-gray-900">{stats.totalCustomers}</p>
              </div>
            </div>
          </div>
          
          <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="bg-white p-3 rounded-lg">
                <ShoppingBag className="text-green-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Average Orders</h3>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalCustomers > 0 ? (stats.totalOrders / stats.totalCustomers).toFixed(1) : '0.0'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="bg-white p-3 rounded-lg">
                <DollarSign className="text-purple-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Customer Value</h3>
                <p className="text-3xl font-bold text-gray-900">
                  {formatETB(customerValueETB)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading && activeTab === 'orders' && orders.length === 0) {
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
     

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden mb-8">
          <div className="flex overflow-x-auto">
            {adminTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-pink-50 text-pink-600 border-b-2 border-pink-500'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'orders' && renderOrders()}
        {activeTab === 'products' && renderProducts()}
        {activeTab === 'homepage' && renderHomepage()}
        {activeTab === 'customers' && renderCustomers()}
      </div>

      {/* Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
                <button
                  onClick={() => setShowProductModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="e.g., Glossy Lip Gloss"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    >
                      <option value="lipgloss">Lip Gloss</option>
                      <option value="lipstick">Lipstick</option>
                      <option value="lipbalm">Lip Balm</option>
                      <option value="accessories">Accessories</option>
                    </select>
                  </div>
                </div>

                {/* Price & Stock - UPDATED FOR ETB */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price (ETB) *
                      <span className="text-xs text-gray-500 ml-1">
                        ≈ ${convertToUSD(parseFloat(newProduct.price) || 0).toFixed(2)} USD
                      </span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stock Quantity
                    </label>
                    <input
                      type="number"
                      value={newProduct.stockQuantity}
                      onChange={(e) => setNewProduct({...newProduct, stockQuantity: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="10"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Describe your product..."
                  />
                </div>

                {/* Images */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URLs (one per line)
                  </label>
                  <div className="space-y-2">
                    {newProduct.images.map((image, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={image}
                          onChange={(e) => updateImage(index, e.target.value)}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                          placeholder="https://example.com/image.jpg"
                        />
                        {newProduct.images.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeImageField(index)}
                            className="px-3 py-2 text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addImageField}
                      className="text-sm text-pink-600 hover:text-pink-700 flex items-center gap-1"
                    >
                      <Plus size={16} />
                      Add another image URL
                    </button>
                  </div>
                </div>

                {/* Shades */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Shades
                  </label>
                  <div className="space-y-3">
                    {newProduct.shades.map((shade, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div
                          className="w-8 h-8 rounded-full border border-gray-300"
                          style={{ backgroundColor: shade.hexCode }}
                        />
                        <div className="flex-1">
                          <p className="font-medium">{shade.name}</p>
                          <p className="text-sm text-gray-600">{shade.hexCode}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeShade(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                    
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={newShade.name}
                        onChange={(e) => setNewShade({...newShade, name: e.target.value})}
                        placeholder="Shade name"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      />
                      <input
                        type="color"
                        value={newShade.hexCode}
                        onChange={(e) => setNewShade({...newShade, hexCode: e.target.value})}
                        className="w-12 h-12 cursor-pointer"
                      />
                      <button
                        type="button"
                        onClick={addShade}
                        className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
                      >
                        Add Shade
                      </button>
                    </div>
                  </div>
                </div>

                {/* In Stock Toggle */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="inStock"
                    checked={newProduct.inStock}
                    onChange={(e) => setNewProduct({...newProduct, inStock: e.target.checked})}
                    className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500"
                  />
                  <label htmlFor="inStock" className="text-sm font-medium text-gray-700">
                    Product is in stock and available for purchase
                  </label>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-6 border-t">
                  <button
                    onClick={() => setShowProductModal(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={editingProduct ? handleUpdateProduct : handleAddProduct}
                    className="flex-1 px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
                  >
                    {editingProduct ? 'Update Product' : 'Add Product'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}