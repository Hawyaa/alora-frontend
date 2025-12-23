'use client';

import { useState, useEffect } from 'react';
import { 
  Home, Package, Star, Grid, List, Plus, 
  X, ArrowUp, ArrowDown, Check, Eye, EyeOff,
  RefreshCw, Search
} from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  inStock: boolean;
  stockQuantity: number;
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

export default function HomepageManagement() {
  const [homepageProducts, setHomepageProducts] = useState<HomepageProduct[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchHomepageProducts();
    fetchAllProducts();
  }, []);

  const fetchHomepageProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('alora-token');
      
      const response = await fetch(`${API_URL}/homepage-products/admin/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to fetch homepage products');
      
      const data = await response.json();
      if (data.success) {
        setHomepageProducts(data.homepageProducts || []);
      }
    } catch (error) {
      console.error('Error fetching homepage products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/products`);
      const data = await response.json();
      if (data.success) {
        setAllProducts(data.products || []);
      }
    } catch (error) {
      console.error('Error fetching all products:', error);
    }
  };

  const handleAddToHomepage = async (productId: string) => {
    try {
      const token = localStorage.getItem('alora-token');
      
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
        setShowAddModal(false);
        fetchHomepageProducts();
      } else {
        alert(data.error || 'Failed to add product');
      }
    } catch (error) {
      console.error('Error adding product to homepage:', error);
      alert('Failed to add product to homepage');
    }
  };

  const handleRemoveFromHomepage = async (homepageProductId: string) => {
    if (!confirm('Remove this product from homepage?')) return;
    
    try {
      const token = localStorage.getItem('alora-token');
      
      const response = await fetch(`${API_URL}/homepage-products/${homepageProductId}`, {
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

  const handleToggleActive = async (homepageProductId: string, currentStatus: boolean) => {
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

  const handleMovePosition = async (homepageProductId: string, direction: 'up' | 'down') => {
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

  // Filter products that are not already on homepage
  const availableProducts = allProducts.filter(product => 
    !homepageProducts.some(hp => hp.productId._id === product._id)
  );

  // Filter based on search term
  const filteredAvailableProducts = availableProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort homepage products by position
  const sortedHomepageProducts = [...homepageProducts].sort((a, b) => a.position - b.position);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
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
              onClick={fetchHomepageProducts}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
            <button
              onClick={() => setShowAddModal(true)}
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
              onClick={() => setShowAddModal(true)}
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
                        onClick={() => handleToggleActive(hp._id, hp.isActive)}
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
                        ETB {Math.round(hp.productId.price * 55)}
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
                          onClick={() => handleMovePosition(hp._id, 'up')}
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
                          onClick={() => handleMovePosition(hp._id, 'down')}
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
                        <X size={16} />
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
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  Add Products to Homepage
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
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
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
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
                          ETB {Math.round(product.price * 55)}
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
                    {searchTerm 
                      ? 'No products match your search'
                      : 'All products are already on the homepage'}
                  </p>
                </div>
              )}

              <div className="flex justify-end pt-6 mt-6 border-t">
                <button
                  onClick={() => setShowAddModal(false)}
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
}