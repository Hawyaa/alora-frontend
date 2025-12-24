 "use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { 
  ShoppingBag, 
  Star, 
  ChevronLeft, 
  Heart, 
  Share2,
  Truck,
  Shield,
  RotateCcw
} from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'

// Mock product data - in real app, fetch from API
const products = [
  {
    id: 1,
    name: "Rose Glow Serum",
    price: 25.99,
    rating: 4.5,
    reviews: 120,
    stock: 10,
    images: [
      "https://i.pinimg.com/1200x/00/71/9b/00719b42a85d16ed14fd1f10ce865392.jpg",
      "https://i.pinimg.com/736x/5a/ef/80/5aef8061935325efd82260504aa63f03.jpg"
    ],
    description: "Brightens your skin and gives a healthy glow with our exclusive rose extract formula.",
    longDescription: "Experience the power of natural rose extracts with our premium serum. Formulated with hyaluronic acid and vitamin C, this serum deeply hydrates while brightening your complexion. Perfect for all skin types.",
    category: "serum",
    ingredients: ["Rose Extract", "Hyaluronic Acid", "Vitamin C", "Jojoba Oil"],
    benefits: ["Brightening", "Hydration", "Anti-aging", "Glowing Skin"],
    shade: "Pink Rose"
  },
  // Add more products as needed...
]

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { addToCart } = useCart()
  const { isAuthenticated } = useAuth()
  
  const [product, setProduct] = useState<any>(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [showLoginModal, setShowLoginModal] = useState(false)

  useEffect(() => {
    const productId = params.id
    
    // In real app, fetch from API: `${process.env.NEXT_PUBLIC_API_URL}/products/${productId}`
    // For now, use mock data
    const foundProduct = products.find(p => p.id.toString() === productId)
    
    if (foundProduct) {
      setProduct(foundProduct)
    } else {
      // Product not found, redirect to shop
      router.push('/shop')
    }
    
    setIsLoading(false)
  }, [params.id, router])

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true)
      return
    }
    
    if (product) {
      addToCart({
        id: product.id,
        productId: product.id, // Add this - it's required!
        name: product.name,
        price: product.price,
        image: product.images[0],
        category: product.category,
        // No quantity here!
      })
      
      alert(`✅ ${quantity}x ${product.name} added to cart!`)
    }
  }

  const handleBuyNow = () => {
    handleAddToCart()
    router.push('/cart')
  }

  const handleLoginAndAdd = () => {
    if (product) {
      localStorage.setItem('pending-cart-item', JSON.stringify({
        ...product,
        quantity: quantity
      }))
    }
    router.push('/login')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[rgb(249,210,229)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return null
  }

  return (
    <div className="min-h-screen bg-[rgb(249,210,229)]">
      {/* Back button */}
      <div className="container-custom py-4">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft size={20} className="mr-2" />
          Back to Shop
        </button>
      </div>

      {/* Product Details */}
      <div className="container-custom py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative h-96 lg:h-[500px] rounded-2xl overflow-hidden bg-white shadow-lg">
              <Image
                src={product.images[selectedImage] || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            
            {/* Thumbnail Images */}
            <div className="flex gap-4 overflow-x-auto py-2">
              {product.images.map((img: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden ${
                    selectedImage === index ? 'ring-2 ring-pink-500' : ''
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} view ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <span className="text-sm font-medium text-pink-600 bg-pink-100 px-3 py-1 rounded-full">
                {product.category}
              </span>
              <h1 className="text-4xl lg:text-5xl font-serif font-bold text-gray-900 mt-4">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={20}
                        className={i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                      />
                    ))}
                  </div>
                  <span className="text-gray-600">({product.reviews} reviews)</span>
                </div>
                
                {product.stock > 0 ? (
                  <span className="text-green-600 font-medium">
                    In Stock ({product.stock} left)
                  </span>
                ) : (
                  <span className="text-red-600 font-medium">Out of Stock</span>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="text-4xl font-bold text-gray-900">
              ${product.price.toFixed(2)}
            </div>

            {/* Description */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900">Description</h3>
              <p className="text-gray-600">{product.longDescription || product.description}</p>
              
              {product.ingredients && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Key Ingredients:</h4>
                  <div className="flex flex-wrap gap-2">
                    {product.ingredients.map((ing: string, idx: number) => (
                      <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Quantity</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 hover:bg-gray-50"
                  >
                    -
                  </button>
                  <span className="px-6 py-2 border-x border-gray-300">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-4 py-2 hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
                <span className="text-gray-600">Max: {product.stock} items</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="flex-1 bg-pink-500 text-white py-4 rounded-xl font-semibold hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                <ShoppingBag size={24} />
                Add to Cart
              </button>
              
              <button
                onClick={handleBuyNow}
                disabled={product.stock <= 0 || !isAuthenticated}
                className="flex-1 bg-gray-900 text-white py-4 rounded-xl font-semibold hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Buy Now
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8">
              <div className="text-center p-4 bg-white rounded-lg">
                <Truck className="mx-auto text-pink-500 mb-2" size={24} />
                <p className="text-sm font-medium">Free Shipping</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <RotateCcw className="mx-auto text-pink-500 mb-2" size={24} />
                <p className="text-sm font-medium">30-Day Returns</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <Shield className="mx-auto text-pink-500 mb-2" size={24} />
                <p className="text-sm font-medium">1-Year Warranty</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <Heart className="mx-auto text-pink-500 mb-2" size={24} />
                <p className="text-sm font-medium">Cruelty Free</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Login Required
            </h3>
            <p className="text-gray-600 mb-6">
              Please login to add items to your cart and proceed with checkout.
            </p>
            
            <div className="flex flex-col gap-3">
              <button
                onClick={handleLoginAndAdd}
                className="w-full bg-pink-500 text-white py-3 rounded-lg font-medium hover:bg-pink-600 transition-colors"
              >
                Login & Add to Cart
              </button>
              
              <Link
                href="/register"
                className="w-full border border-pink-300 text-pink-600 py-3 rounded-lg font-medium hover:bg-pink-50 transition-colors text-center"
              >
                Create Account
              </Link>
              
              <button
                onClick={() => setShowLoginModal(false)}
                className="w-full text-gray-500 py-3 rounded-lg font-medium hover:text-gray-700 transition-colors"
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