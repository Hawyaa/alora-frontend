"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ShoppingBag, Star, ChevronDown, LogIn, Package } from "lucide-react"
import { useCart } from "@/contexts/CartContext"
import { useAuth } from "@/contexts/AuthContext"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

// Define Product Type
interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  inStock: boolean;
  stockQuantity: number;
  shades?: Array<{ name: string; hexCode: string }>;
  createdAt?: string;
  updatedAt?: string;
}

export default function Shop() {
  const [sortBy, setSortBy] = useState("best-selling")
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [addedProduct, setAddedProduct] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
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

  // Sort products based on selection
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case "best-selling":
        return (b.stockQuantity || 0) - (a.stockQuantity || 0) // Higher stock = more popular
      case "price-low-high":
        return a.price - b.price
      case "price-high-low":
        return b.price - a.price
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
    addToCart({
      id: product._id, // Use MongoDB _id
      productId: product._id,
      name: product.name,
      price: product.price,
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
        price: selectedProduct.price,
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
        price: selectedProduct.price,
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
      <div className="min-h-screen bg-[rgb(249,210,229)] flex items-center justify-center">
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
      <div className="min-h-screen bg-[rgb(249,210,229)] flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md">
          <Package size={48} className="mx-auto text-red-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Products</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchProducts}
            className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[rgb(249,210,229)] relative">
      {/* Success Toast */}
      {showSuccess && addedProduct && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
            <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <ShoppingBag size={12} />
            </div>
            <div>
              <p className="font-medium">Added to cart!</p>
              <p className="text-sm opacity-90">{addedProduct}</p>
            </div>
            <button 
              onClick={() => setShowSuccess(false)}
              className="ml-4 text-white opacity-70 hover:opacity-100"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-b from-[rgb(249,210,229)] to-[rgb(249,210,229)] py-8">
        <div className="container-custom text-center">
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 mb-4">Shop Our Collection</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our premium beauty products designed for radiant, luminous lips
          </p>
        </div>
      </div>

      {/* Sort and Product Count */}
      <div className="container-custom py-4">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Showing {sortedProducts.length} {sortedProducts.length === 1 ? 'product' : 'products'}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-700">Sort by:</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent cursor-pointer"
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

      {/* Products Grid */}
      <div className="container-custom py-8">
        {sortedProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl">
            <Package size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Products Available</h3>
            <p className="text-gray-600 mb-4">Add products through the admin dashboard to get started</p>
            <button
              onClick={fetchProducts}
              className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600"
            >
              Refresh Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {sortedProducts.map((product) => (
              <div key={product._id} className="group">
                {/* Product Card Container */}
                <div className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
                  <Link href={`/product/${product._id}`} className="flex-shrink-0">
                    <div className="relative overflow-hidden bg-gray-100 h-64">
                      {product.images && product.images[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          unoptimized={true}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-50">
                          <Package size={48} className="text-pink-300" />
                        </div>
                      )}
                      {!product.inStock && (
                        <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                          Out of Stock
                        </div>
                      )}
                      {product.stockQuantity < 5 && product.inStock && (
                        <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                          Low Stock
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Product Info Section - Updated with transparent/background color */}
                  <div className="p-4 space-y-2 flex-grow bg-[rgb(249,210,229)]">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-serif font-semibold text-gray-900 group-hover:text-pink-600 transition-colors">
                        {product.name}
                      </h3>
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-white bg-opacity-80 text-pink-600 capitalize">
                        {product.category}
                      </span>
                    </div>

                    {/* Description with same background as page */}
                    <div className="bg-[rgb(249,210,229)]">
                      <p className="text-sm text-gray-600 line-clamp-2 bg-transparent">
                        {product.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xl font-semibold text-gray-900">${product.price.toFixed(2)}</span>
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          handleAddToCart(product)
                        }}
                        disabled={!product.inStock}
                        className="px-4 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        title={!product.inStock ? "Out of stock" : !isAuthenticated ? "Login to add to cart" : "Add to cart"}
                      >
                        <ShoppingBag size={16} />
                        {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                      </button>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      <span className="font-medium">Stock:</span> {product.stockQuantity} available
                    </div>
                    
                    {!isAuthenticated && product.inStock && (
                      <p className="text-xs text-gray-500 text-center">
                        Login to save cart items
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-scale-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-serif font-bold text-gray-900">
                Login Required
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center gap-4 p-4 bg-pink-50 rounded-lg mb-4">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                  {selectedProduct?.images?.[0] ? (
                    <Image
                      src={selectedProduct.images[0]}
                      alt={selectedProduct.name}
                      fill
                      className="object-cover"
                      unoptimized={true}
                    />
                  ) : (
                    <Package className="text-pink-300 absolute inset-0 m-auto" size={24} />
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{selectedProduct?.name}</h4>
                  <p className="text-lg font-bold text-pink-600">${selectedProduct?.price?.toFixed(2)}</p>
                </div>
              </div>
              
              <p className="text-gray-600">
                You need to login to save items to your cart. Login now to add 
                <span className="font-semibold text-gray-900"> "{selectedProduct?.name}"</span> 
                to your cart and continue shopping.
              </p>
            </div>
            
            <div className="flex flex-col gap-3">
              <button
                onClick={handleLoginAndAdd}
                className="w-full bg-pink-500 text-white py-3 rounded-lg font-medium hover:bg-pink-600 transition-colors flex items-center justify-center gap-2"
              >
                <LogIn size={18} />
                Login & Add to Cart
              </button>
              
              <button
                onClick={handleContinueWithoutLogin}
                className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Continue as Guest
              </button>
              
              <button
                onClick={handleCloseModal}
                className="w-full text-gray-500 py-3 rounded-lg font-medium hover:text-gray-700 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          
          </div>
        </div>
      )}

      {/* Add some custom animations to globals.css */}
      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes scale-in {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  )
}