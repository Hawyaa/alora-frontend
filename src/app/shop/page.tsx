'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ShoppingBag, Star, ChevronDown, LogIn, Package, Filter, Grid, List, ChevronLeft } from "lucide-react"
import { useCart } from "@/contexts/CartContext"
import { useAuth } from "@/contexts/AuthContext"

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://alora-backend.onrender.com'

// Define Product Type
interface Product {
  _id: string;
  name: string;
  description: string;
  price: number; // This is in USD from backend
  category: string;
  images: string[];
  inStock: boolean;
  stockQuantity: number;
  shades?: Array<{ name: string; hexCode: string }>;
  createdAt?: string;
  updatedAt?: string;
}

// USD to ETB conversion rate
const USD_TO_ETB_RATE = 55; // 1 USD = 55 ETB (approximate)

export default function Shop() {
  const [sortBy, setSortBy] = useState("best-selling")
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [addedProduct, setAddedProduct] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  
  const { addToCart } = useCart()
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  // Fetch products from API
  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🛒 Fetching products from:', `${API_URL}/api/products`)
      
      const response = await fetch(`${API_URL}/api/products`, {
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-cache'
      })
      
      console.log('Response status:', response.status)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Products data received:', data)
      
      if (data.success) {
        console.log(`✅ Found ${data.products?.length || 0} products`)
        setProducts(data.products || [])
      } else {
        throw new Error(data.error || 'Failed to fetch products')
      }
    } catch (err: any) {
      console.error('Error fetching products:', err)
      setError(err.message || 'Could not load products')
      // Fallback to empty array
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  // Convert USD price to ETB
  const convertToETB = (usdPrice: number): number => {
    return Math.round(usdPrice * USD_TO_ETB_RATE)
  }

  // Format ETB price with currency symbol
  const formatETB = (amount: number): string => {
    return `ETB ${amount.toLocaleString('en-ET')}`
  }

  // Sort products based on selection (now using ETB prices)
  const sortedProducts = [...products].sort((a, b) => {
    const priceA = convertToETB(a.price)
    const priceB = convertToETB(b.price)
    
    switch (sortBy) {
      case "best-selling":
        return (b.stockQuantity || 0) - (a.stockQuantity || 0) // Higher stock = more popular
      case "price-low-high":
        return priceA - priceB
      case "price-high-low":
        return priceB - priceA
      case "rating":
        // For now, use stock as rating proxy
        return (b.stockQuantity || 0) - (a.stockQuantity || 0)
      default:
        return 0
    }
  })

  const handleAddToCart = (product: Product) => {
    // Check if user is authenticated FIRST
    if (!isAuthenticated) {
      // Show login modal instead of redirecting immediately
      setSelectedProduct(product)
      setShowLoginModal(true)
      return
    }
    
    // If authenticated, add to cart WITH productId
    // Note: Cart stores price in USD but shows ETB in UI
    addToCart({
      id: product._id, // Use MongoDB _id
      productId: product._id,
      name: product.name,
      price: product.price, // Store USD price for calculations
      image: product.images?.[0] || '/placeholder.svg',
      category: product.category,
    })
    
    // Show success message
    setAddedProduct(product.name)
    setShowSuccess(true)
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setShowSuccess(false)
      setAddedProduct(null)
    }, 3000)
  }

  const handleLoginAndAdd = () => {
    // Save product to localStorage before redirecting to login
    if (selectedProduct) {
      localStorage.setItem('pending-cart-item', JSON.stringify({
        id: selectedProduct._id,
        productId: selectedProduct._id,
        name: selectedProduct.name,
        price: selectedProduct.price, // Store USD price
        image: selectedProduct.images?.[0] || '/placeholder.svg',
        category: selectedProduct.category,
        description: selectedProduct.description
      }))
    }
    
    // Redirect to login page
    router.push('/login')
    setShowLoginModal(false)
  }

  const handleContinueWithoutLogin = () => {
    // Add to cart without login (guest mode)
    if (selectedProduct) {
      addToCart({
        id: selectedProduct._id,
        productId: selectedProduct._id,
        name: selectedProduct.name,
        price: selectedProduct.price, // Store USD price
        image: selectedProduct.images?.[0] || '/placeholder.svg',
        category: selectedProduct.category,
      })
      
      // Show success message
      setAddedProduct(selectedProduct.name)
      setShowSuccess(true)
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false)
        setAddedProduct(null)
      }, 3000)
    }
    setShowLoginModal(false)
  }

  const handleCloseModal = () => {
    setShowLoginModal(false)
    setSelectedProduct(null)
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[rgb(249,210,229)] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[rgb(249,210,229)] flex items-center justify-center px-4">
        <div className="text-center bg-white p-6 md:p-8 rounded-xl shadow-lg max-w-md w-full">
          <Package size={48} className="mx-auto text-red-400 mb-4" />
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Unable to Load Products</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchProducts}
            className="bg-gradient-to-r from-rose-400 to-pink-500 text-white px-6 py-3 rounded-full font-semibold hover:from-rose-500 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm md:text-base"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[rgb(249,210,229)] relative">
      {/* Success Notification */}
      

      {/* Mobile Back Button */}
      <div className="lg:hidden bg-white border-b">
        <div className="px-4 py-3">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 text-sm"
          >
            <ChevronLeft size={18} className="mr-2" />
            Back
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-b from-[rgb(249,210,229)] to-[rgb(249,210,229)] py-6 md:py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-gray-900 mb-3 md:mb-4">
            Shop Our Collection
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our premium beauty products designed for radiant, luminous lips
          </p>
        </div>
      </div>

      {/* Mobile Filters Header */}
      <div className="lg:hidden border-t border-b bg-white">
        <div className="px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {sortedProducts.length} {sortedProducts.length === 1 ? 'product' : 'products'}
            </div>
            <button
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="flex items-center gap-2 text-sm text-gray-700"
            >
              <Filter size={16} />
              Sort & Filter
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Filters Dropdown */}
      {mobileFiltersOpen && (
        <div className="lg:hidden bg-white border-b px-4 py-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent"
              >
                <option value="best-selling">Best selling</option>
                <option value="price-low-high">Price: Low to High</option>
                <option value="price-high-low">Price: High to Low</option>
                <option value="rating">Most Popular</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">View mode:</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex-1 px-4 py-2 rounded-lg flex items-center justify-center gap-2 ${
                    viewMode === 'grid' 
                      ? 'bg-gradient-to-r from-rose-400 to-pink-500 text-white' 
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  <Grid size={16} />
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex-1 px-4 py-2 rounded-lg flex items-center justify-center gap-2 ${
                    viewMode === 'list' 
                      ? 'bg-gradient-to-r from-rose-400 to-pink-500 text-white' 
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  <List size={16} />
                  List
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Controls */}
      <div className="hidden lg:block max-w-7xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Showing {sortedProducts.length} {sortedProducts.length === 1 ? 'product' : 'products'}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-gray-700">View:</span>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gradient-to-r from-rose-400 to-pink-500 text-white shadow' : ''}`}
                >
                  <Grid size={18} className={viewMode === 'grid' ? 'text-white' : 'text-gray-500'} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-gradient-to-r from-rose-400 to-pink-500 text-white shadow' : ''}`}
                >
                  <List size={18} className={viewMode === 'list' ? 'text-white' : 'text-gray-500'} />
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-gray-700">Sort by:</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent cursor-pointer text-sm"
                >
                  <option value="best-selling">Best selling</option>
                  <option value="price-low-high">Price: Low to High</option>
                  <option value="price-high-low">Price: High to Low</option>
                  <option value="rating">Most Popular</option>
                </select>
                <ChevronDown size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-8">
        {sortedProducts.length === 0 ? (
          <div className="text-center py-12 md:py-16 bg-white rounded-xl px-4">
            <Package size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">No Products Available</h3>
            <p className="text-gray-600 mb-4">Add products through the admin dashboard to get started</p>
            <button
              onClick={fetchProducts}
              className="bg-gradient-to-r from-rose-400 to-pink-500 text-white px-6 py-3 rounded-full font-semibold hover:from-rose-500 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm md:text-base"
            >
              Refresh Products
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          // Grid View - 2 columns on mobile, 3 on tablet, 4 on desktop
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            {sortedProducts.map((product) => {
              const etbPrice = convertToETB(product.price)
              
              return (
                <div key={product._id} className="group">
                  {/* Product Card Container */}
                  <div className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
                    <Link href={`/product/${product._id}`} className="flex-shrink-0">
                      <div className="relative overflow-hidden bg-gray-100 h-40 sm:h-48 md:h-56">
                        {product.images && product.images[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw"
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                            unoptimized={true}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-50">
                            <Package size={32} className="text-pink-300" />
                          </div>
                        )}
                        {!product.inStock && (
                          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                            Out of Stock
                          </div>
                        )}
                        {product.stockQuantity < 5 && product.inStock && (
                          <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                            Low Stock
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Product Info Section */}
                    <div className="p-3 md:p-4 space-y-2 flex-grow bg-[rgb(249,210,229)]">
                      <div className="flex justify-between items-start">
                        <h3 className="text-sm md:text-base font-serif font-semibold text-gray-900 group-hover:text-pink-600 transition-colors line-clamp-1">
                          {product.name}
                        </h3>
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-white bg-opacity-80 text-pink-600 capitalize hidden sm:inline">
                          {product.category}
                        </span>
                      </div>

                      {/* Description */}
                      <div className="bg-[rgb(249,210,229)]">
                        <p className="text-xs md:text-sm text-gray-600 line-clamp-2 bg-transparent">
                          {product.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex flex-col">
                          <span className="text-base md:text-lg font-semibold text-gray-900">
                            {formatETB(etbPrice)}
                          </span>
                          <span className="text-xs text-gray-500">
                            ≈ ${product.price.toFixed(2)}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            handleAddToCart(product)
                          }}
                          disabled={!product.inStock}
                          className="px-3 py-1.5 md:px-4 md:py-2 bg-gradient-to-r from-rose-400 to-pink-500 text-white rounded-full hover:from-rose-500 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-xs md:text-sm font-medium flex items-center gap-1 md:gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          title={!product.inStock ? "Out of stock" : !isAuthenticated ? "Login to add to cart" : "Add to cart"}
                        >
                          <ShoppingBag size={14} className="md:w-4 md:h-4" />
                          <span className="hidden sm:inline">{product.inStock ? 'Add to Cart' : 'Out of Stock'}</span>
                          <span className="sm:hidden">{product.inStock ? 'Add' : 'Sold'}</span>
                        </button>
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        <span className="font-medium">Stock:</span> {product.stockQuantity} available
                      </div>
                      
                      {!isAuthenticated && product.inStock && (
                        <p className="text-xs text-gray-500 text-center hidden sm:block">
                          Login to save cart items
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          // List View
          <div className="space-y-4">
            {sortedProducts.map((product) => {
              const etbPrice = convertToETB(product.price)
              
              return (
                <div key={product._id} className="group">
                  <div className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <div className="flex flex-col sm:flex-row">
                      <Link href={`/product/${product._id}`} className="sm:w-1/3 flex-shrink-0">
                        <div className="relative overflow-hidden bg-gray-100 h-48 sm:h-full">
                          {product.images && product.images[0] ? (
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              fill
                              sizes="(max-width: 640px) 100vw, 33vw"
                              className="object-cover group-hover:scale-110 transition-transform duration-500"
                              unoptimized={true}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-50">
                              <Package size={48} className="text-pink-300" />
                            </div>
                          )}
                        </div>
                      </Link>

                      <div className="flex-1 p-4 bg-[rgb(249,210,229)]">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-lg md:text-xl font-serif font-semibold text-gray-900 group-hover:text-pink-600 transition-colors">
                              {product.name}
                            </h3>
                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-white bg-opacity-80 text-pink-600 capitalize mt-1 inline-block">
                              {product.category}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="flex flex-col">
                              <span className="text-xl md:text-2xl font-semibold text-gray-900">
                                {formatETB(etbPrice)}
                              </span>
                              <span className="text-sm text-gray-500">
                                ≈ ${product.price.toFixed(2)}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Stock: {product.stockQuantity}
                            </div>
                          </div>
                        </div>

                        <p className="text-sm md:text-base text-gray-600 mb-4 line-clamp-3">
                          {product.description}
                        </p>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex gap-2">
                            {!product.inStock && (
                              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                                Out of Stock
                              </span>
                            )}
                            {product.stockQuantity < 5 && product.inStock && (
                              <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
                                Low Stock
                              </span>
                            )}
                          </div>
                          
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              handleAddToCart(product)
                            }}
                            disabled={!product.inStock}
                            className="px-6 py-2 bg-gradient-to-r from-rose-400 to-pink-500 text-white rounded-full hover:from-rose-500 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                          >
                            <ShoppingBag size={16} />
                            {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                          </button>
                          
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Login Modal - Update price display here too */}
      {showLoginModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-4 md:p-6">
            <div className="flex justify-between items-center mb-4 md:mb-6">
              <h3 className="text-xl md:text-2xl font-serif font-bold text-gray-900">
                Login Required
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-4 md:mb-6">
              <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-pink-50 rounded-lg mb-3 md:mb-4">
                <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {selectedProduct?.images?.[0] ? (
                    <Image
                      src={selectedProduct.images[0]}
                      alt={selectedProduct.name}
                      fill
                      className="object-cover"
                      unoptimized={true}
                    />
                  ) : (
                    <Package className="text-pink-300 absolute inset-0 m-auto" size={20} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 text-sm md:text-base truncate">{selectedProduct?.name}</h4>
                  <div className="flex flex-col">
                    <p className="text-base md:text-lg font-bold text-pink-600">
                      {formatETB(convertToETB(selectedProduct.price))}
                    </p>
                    <p className="text-sm text-gray-500">
                      ≈ ${selectedProduct?.price?.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
              
              <p className="text-sm md:text-base text-gray-600">
                You need to login to save items to your cart. Login now to add 
                <span className="font-semibold text-gray-900"> "{selectedProduct?.name}"</span> 
                to your cart and continue shopping.
              </p>
            </div>
            
            <div className="flex flex-col gap-2 md:gap-3">
              <button
                onClick={handleLoginAndAdd}
                className="w-full bg-gradient-to-r from-rose-400 to-pink-500 text-white py-2 md:py-3 rounded-full font-semibold hover:from-rose-500 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-sm md:text-base"
              >
                <LogIn size={16} />
                Login & Add to Cart
              </button>
              
              <button
                onClick={handleContinueWithoutLogin}
                className="w-full border border-gray-300 text-gray-700 py-2 md:py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm md:text-base"
              >
                Continue as Guest
              </button>
              
              <button
                onClick={handleCloseModal}
                className="w-full text-gray-500 py-2 md:py-3 rounded-lg font-medium hover:text-gray-700 transition-colors text-sm md:text-base"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
