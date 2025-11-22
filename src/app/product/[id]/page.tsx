"use client"

import React, { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ShoppingBag, Star, Heart, ChevronLeft, Minus, Plus, Instagram, Facebook, Twitter } from "lucide-react"
import { useAuth } from '../../providers'
import { useRouter } from 'next/navigation'

// Mock products data
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
      "https://i.pinimg.com/1200x/76/5d/08/765d086b73962f060c160a355e6638bb.jpg",
      "https://i.pinimg.com/736x/5a/ef/80/5aef8061935325efd82260504aa63f03.jpg"
    ],
    description: "Brightens your skin and gives a healthy glow.",
    fullDescription: "Experience the magic of our bestselling Rose Glow Serum. This luxurious formula combines natural rose extracts with advanced skincare technology to deliver unparalleled hydration and a radiant glow.",
    features: [
      "Natural rose extracts for antioxidant benefits",
      "Hyaluronic acid for intense hydration",
      "Buildable color for custom intensity",
      "Non-sticky formula",
      "Long-lasting wear up to 8 hours",
      "Cruelty-free and vegan"
    ],
    category: "serum",
    ingredients: "Rose Extract, Hyaluronic Acid, Jojoba Oil, Vitamin E, Shea Butter, Natural Pigments"
  },
  {
    id: 2,
    name: "Velvet Matte Lipstick",
    price: 15.5,
    rating: 4.2,
    reviews: 88,
    stock: 8,
    images: [
      "https://i.pinimg.com/1200x/76/5d/08/765d086b73962f060c160a355e6638bb.jpg",
      "https://i.pinimg.com/736x/5a/ef/80/5aef8061935325efd82260504aa63f03.jpg",
      "https://i.pinimg.com/736x/88/25/61/882561f70402ca621e1e0e9f8e30a761.jpg"
    ],
    description: "Smooth matte finish with long-lasting color.",
    fullDescription: "Our Velvet Matte Lipstick delivers rich, vibrant color with a comfortable matte finish that lasts all day. The creamy formula glides on smoothly without drying your lips.",
    features: [
      "Velvet matte finish",
      "Long-lasting formula",
      "Creamy application",
      "Transfer-resistant",
      "Available in 12 shades",
      "Vegan formula"
    ],
    category: "matte",
    ingredients: "Jojoba Oil, Vitamin E, Natural Waxes, Mineral Pigments"
  },
  // Add more products as needed...
]

function Footer() {
  return (
    <footer className="py-8 text-black" style={{ backgroundColor: 'rgb(249, 210, 229)' }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <div className="mb-6">
            <h3 className="text-3xl font-bold mb-4" style={{ fontFamily: "'Segoe Script', cursive" }}>
              Alora Lipgloss
            </h3>
            <p className="text-black/80 max-w-md mx-auto">
              Discover the perfect lip gloss that enhances your natural beauty.
            </p>
          </div>
          <div className="flex gap-4 mb-6">
            <a href="#" className="p-2 bg-white/80 rounded-full hover:bg-white transition-colors shadow-sm">
              <Instagram size={20} className="text-black" />
            </a>
            <a href="#" className="p-2 bg-white/80 rounded-full hover:bg-white transition-colors shadow-sm">
              <Facebook size={20} className="text-black" />
            </a>
            <a href="#" className="p-2 bg-white/80 rounded-full hover:bg-white transition-colors shadow-sm">
              <Twitter size={20} className="text-black" />
            </a>
          </div>
          <div className="border-t border-black/30 w-full pt-6">
            <p className="text-black/80">© 2025 Alora Lipgloss. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isFavorite, setIsFavorite] = useState(false)
  
  // Authentication and routing
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  // Use React.use() to unwrap the Promise
  const unwrappedParams = React.use(params)
  const productId = parseInt(unwrappedParams.id)
  const product = products.find((p) => p.id === productId)

  const increaseQuantity = () => {
    setQuantity(prev => prev + 1)
  }

  const decreaseQuantity = () => {
    setQuantity(prev => prev > 1 ? prev - 1 : 1)
  }

  const addToCart = () => {
    if (!isAuthenticated) {
      // Redirect to login page if not authenticated
      router.push('/login')
      return
    }
    
    // If authenticated, add to cart
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existingItem = cart.find((item: any) => item.id === product?.id)
    
    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      cart.push({
        id: product?.id,
        name: product?.name,
        price: product?.price,
        image: product?.images[0],
        quantity: quantity
      })
    }
    
    localStorage.setItem('cart', JSON.stringify(cart))
    alert(`Added ${quantity} ${product?.name}(s) to cart!`)
  }

  // If product not found
  if (!product) {
    return (
      <div className="min-h-screen bg-[rgb(249,210,229)] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-8">The product you're looking for doesn't exist.</p>
          <Link href="/shop" className="bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors">
            Back to Shop
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[rgb(249,210,229)]">
      {/* Navigation */}
      <div className="container-custom py-6">
        <Link href="/shop" className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors">
          <ChevronLeft size={20} />
          <span className="ml-1">Back to Shop</span>
        </Link>
      </div>

      {/* Product Section */}
      <div className="container-custom py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative bg-white rounded-2xl overflow-hidden shadow-xl h-96 lg:h-[500px]">
              <Image
                src={product.images[selectedImage]}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            </div>
            
            {/* Thumbnail Images */}
            <div className="flex gap-4 overflow-x-auto py-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === index ? 'border-pink-500' : 'border-transparent'
                  }`}
                >
                  <Image
                    src={image}
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
              <h1 className="text-4xl lg:text-5xl font-serif font-bold text-gray-900 mb-4">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-3 mb-4">
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
                {product.stock < 5 && (
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Low Stock
                  </span>
                )}
              </div>

              <div className="text-3xl font-bold text-gray-900 mb-6">
                ${product.price.toFixed(2)}
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
              <p className="text-gray-600 leading-relaxed">{product.fullDescription}</p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Key Features</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-gray-600">
                    <div className="w-2 h-2 bg-pink-500 rounded-full mr-3"></div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Ingredients</h3>
              <p className="text-gray-600">{product.ingredients}</p>
            </div>

            {/* Add to Cart Section */}
            <div className="space-y-6 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-6">
                <span className="text-lg font-semibold text-gray-900">Quantity:</span>
                <div className="flex items-center gap-4">
                  <button
                    onClick={decreaseQuantity}
                    className="w-10 h-10 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="text-xl font-semibold w-8 text-center">{quantity}</span>
                  <button
                    onClick={increaseQuantity}
                    className="w-10 h-10 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={addToCart}
                  className="flex-1 bg-pink-500 text-white py-4 px-8 rounded-lg font-semibold hover:bg-pink-600 transition-colors duration-200 flex items-center justify-center gap-3"
                >
                  <ShoppingBag size={20} />
                  Add to Cart - ${(product.price * quantity).toFixed(2)}
                </button>
                
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`p-4 rounded-lg border-2 transition-colors duration-200 ${
                    isFavorite 
                      ? 'bg-red-50 border-red-200 text-red-500' 
                      : 'bg-white border-gray-200 text-gray-600 hover:border-pink-300'
                  }`}
                >
                  <Heart 
                    size={20} 
                    className={isFavorite ? 'fill-red-500' : ''} 
                  />
                </button>
              </div>

              <div className="text-center">
                <p className="text-gray-600">
                  {product.stock > 0 
                    ? `Only ${product.stock} left in stock - order soon!` 
                    : 'Out of Stock'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}