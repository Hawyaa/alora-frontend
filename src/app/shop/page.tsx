"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ShoppingBag, Star, ChevronDown, LogIn } from "lucide-react"
import { useCart } from "@/contexts/CartContext"
import { useAuth } from "@/contexts/AuthContext"
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const products = [
  {
    id: 1,
    name: "Rose Glow Serum",
    price: 25.99,
    rating: 4.5,
    reviews: 120,
    stock: 10,
    image: "https://i.pinimg.com/1200x/00/71/9b/00719b42a85d16ed14fd1f10ce865392.jpg",
    description: "Brightens your skin and gives a healthy glow.",
    category: "serum",
  },
  {
    id: 2,
    name: "Velvet Matte Lipstick",
    price: 15.5,
    rating: 4.2,
    reviews: 88,
    stock: 8,
    image: "https://i.pinimg.com/1200x/76/5d/08/765d086b73962f060c160a355e6638bb.jpg",
    description: "Smooth matte finish with long-lasting color.",
    category: "matte",
  },
  {
    id: 3,
    name: "Hydra Moisturizer",
    price: 19.99,
    rating: 4.7,
    reviews: 142,
    stock: 12,
    image: "https://i.pinimg.com/736x/5a/ef/80/5aef8061935325efd82260504aa63f03.jpg",
    description: "Deeply hydrates your skin for 24 hours.",
    category: "moisturizer",
  },
  {
    id: 4,
    name: "Glossy Pink",
    price: 22.99,
    rating: 4.8,
    reviews: 156,
    stock: 15,
    image: "https://i.pinimg.com/736x/88/25/61/882561f70402ca621e1e0e9f8e30a761.jpg",
    description: "Stunning glossy finish with vibrant pink tone.",
    category: "gloss",
  },
  {
    id: 5,
    name: "Berry Bliss",
    price: 24.99,
    rating: 4.6,
    reviews: 98,
    stock: 9,
    image: "https://i.pinimg.com/736x/46/ec/77/46ec7739839d8cf00d7a3dc0e7a55e0e.jpg",
    description: "Rich berry shade with plumping effect.",
    category: "gloss",
  },
  {
    id: 6,
    name: "Nude Elegance",
    price: 20.99,
    rating: 4.4,
    reviews: 112,
    stock: 14,
    image: "https://i.pinimg.com/1200x/f2/eb/2e/f2eb2e2b45e18b3939fb090ff49725b8.jpg",
    description: "Timeless nude shade for everyday wear.",
    category: "gloss",
  },
  {
    id: 7,
    name: "Coral Shine",
    price: 21.99,
    rating: 4.3,
    reviews: 76,
    stock: 11,
    image: "https://i.pinimg.com/736x/23/d0/0d/23d00dba9008163f43baf57510f5784b.jpg",
    description: "Vibrant coral with shimmering finish.",
    category: "gloss",
  },
  {
    id: 8,
    name: "Plumping Gloss",
    price: 26.99,
    rating: 4.7,
    reviews: 134,
    stock: 7,
    image: "https://i.pinimg.com/736x/8f/28/ed/8f28ed5ba1652b84ee28eecad26852f0.jpg",
    description: "Enhances lip volume with hydrating formula.",
    category: "gloss",
  },
  {
    id: 9,
    name: "Ruby Red",
    price: 23.99,
    rating: 4.9,
    reviews: 189,
    stock: 13,
    image: "https://i.pinimg.com/1200x/6b/12/47/6b12476aa7ea4d3adf477cf40004c7b1.jpg",
    description: "Classic red with satin finish.",
    category: "matte",
  },
  {
    id: 10,
    name: "Mauve Magic",
    price: 18.99,
    rating: 4.5,
    reviews: 95,
    stock: 16,
    image: "https://i.pinimg.com/736x/27/67/ff/2767ff4c91c4c82eb38272d61c708fac.jpg",
    description: "Elegant mauve for sophisticated looks.",
    category: "matte",
  },
  {
    id: 11,
    name: "Peach Glow",
    price: 19.99,
    rating: 4.6,
    reviews: 87,
    stock: 10,
    image: "https://i.pinimg.com/736x/79/c2/64/79c2648d510f330cf2265b8d47bf98be.jpg",
    description: "Soft peach with luminous effect.",
    category: "gloss",
  },
  {
    id: 12,
    name: "Night Serum",
    price: 29.99,
    rating: 4.8,
    reviews: 167,
    stock: 5,
    image: "https://i.pinimg.com/1200x/00/71/9b/00719b42a85d16ed14fd1f10ce865392.jpg",
    description: "Overnight repair for radiant morning lips.",
    category: "serum",
  },
]

export default function Shop() {
  const [sortBy, setSortBy] = useState("best-selling")
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [addedProduct, setAddedProduct] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  
  const { addToCart } = useCart()
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  // Sort products based on selection
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case "best-selling":
        return b.reviews - a.reviews // Most reviews first
      case "price-low-high":
        return a.price - b.price
      case "price-high-low":
        return b.price - a.price
      case "rating":
        return b.rating - a.rating
      default:
        return 0
    }
  })

  const handleAddToCart = (product: any) => {
    // Check if user is authenticated FIRST
    if (!isAuthenticated) {
      // Show login modal instead of redirecting immediately
      setSelectedProduct(product)
      setShowLoginModal(true)
      return
    }
    
    // If authenticated, add to cart
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      description: product.description,
      category: product.category,
      rating: product.rating,
      reviews: product.reviews,
      stock: product.stock
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
      localStorage.setItem('pending-cart-item', JSON.stringify(selectedProduct))
    }
    
    // Redirect to login page
    router.push('/login')
    setShowLoginModal(false)
  }

  const handleContinueWithoutLogin = () => {
    // Add to cart without login (guest mode)
    if (selectedProduct) {
      addToCart({
        id: selectedProduct.id,
        name: selectedProduct.name,
        price: selectedProduct.price,
        image: selectedProduct.image,
        quantity: 1,
        description: selectedProduct.description,
        category: selectedProduct.category,
        rating: selectedProduct.rating,
        reviews: selectedProduct.reviews,
        stock: selectedProduct.stock
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

  const handleGoToLogin = () => {
    router.push('/login')
  }

  const handleGoToRegister = () => {
    router.push('/register')
  }

  const handleCloseModal = () => {
    setShowLoginModal(false)
    setSelectedProduct(null)
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
          {!isAuthenticated && (
            <div className="mt-6 flex justify-center gap-4">
             
            </div>
          )}
        </div>
      </div>

      {/* Sort */}
      <div className="container-custom py-4">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Showing {sortedProducts.length} products
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
                <option value="rating">Rating</option>
              </select>
              <ChevronDown size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container-custom py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {sortedProducts.map((product) => (
            <div key={product.id} className="group bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <Link href={`/product/${product.id}`}>
                <div className="relative overflow-hidden bg-gray-100 h-64">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {product.stock && product.stock < 5 && (
                    <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Low Stock
                    </div>
                  )}
                </div>
              </Link>

              <div className="p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-serif font-semibold text-gray-900 group-hover:text-pink-600 transition-colors">
                    {product.name}
                  </h3>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-pink-100 text-pink-600">
                    {product.category}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={i < Math.floor(product.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">({product.reviews})</span>
                </div>

                <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xl font-semibold text-gray-900">${product.price.toFixed(2)}</span>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      handleAddToCart(product)
                    }}
                    className="px-4 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={!isAuthenticated ? "Login to add to cart" : "Add to cart"}
                  >
                    <ShoppingBag size={16} />
                    Add to Cart
                  </button>
                </div>
                
                {!isAuthenticated && (
                  <p className="text-xs text-gray-500 text-center">
                    Login to save cart items
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
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
                  <Image
                    src={selectedProduct?.image || "/placeholder.svg"}
                    alt={selectedProduct?.name}
                    fill
                    className="object-cover"
                  />
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