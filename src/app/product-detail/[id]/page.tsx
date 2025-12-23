'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Star, ShoppingBag, ChevronLeft, Heart, Share2, Truck, Shield, RotateCcw, ChevronRight, ChevronLeft as LeftIcon } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'

// Related product/shade data
const relatedShades = [
  {
    id: 1,
    name: "Crystal Pink",
    description: "Shimmering pink gloss with golden flecks",
    price: 24.99,
    rating: 4.5,
    image: "https://i.pinimg.com/1200x/8b/eb/2b/8beb2b9f52c0d5cc849dac9c85b6adb2.jpg",
    color: "bg-pink-300"
  },
  {
    id: 2,
    name: "Berry Kiss",
    description: "Rich berry tone with plum undertones",
    price: 22.99,
    rating: 4.8,
    image: "https://i.pinimg.com/1200x/04/68/c9/0468c9f3f4ee6efe49591632a21cbac1.jpg",
    color: "bg-purple-400"
  },
  {
    id: 3,
    name: "Nude Glow",
    description: "Natural nude shade with peach undertones",
    price: 26.99,
    rating: 4.3,
    image: "https://i.pinimg.com/1200x/54/54/ce/5454cea9aa5fa470cbaaf5e461ec26cd.jpg",
    color: "bg-amber-200"
  },
  {
    id: 4,
    name: "Ruby Shine",
    description: "Bold red gloss with cherry finish",
    price: 23.99,
    rating: 4.7,
    image: "https://i.pinimg.com/736x/fe/ef/21/feef21d1f20b200362a51ad1c6926349.jpg",
    color: "bg-red-400"
  }
]

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { addToCart } = useCart()
  const { isAuthenticated } = useAuth()
  
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [addingToCart, setAddingToCart] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [selectedShade, setSelectedShade] = useState('default')
  const [relatedProducts, setRelatedProducts] = useState<any[]>([])

  const productId = params.id as string

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        
        // Try to fetch from API
        const data = await api.get(`/products/${productId}`)
        
        if (data.success && data.product) {
          setProduct(data.product)
        } else {
          // Fallback to mock data
          const mockProduct = relatedShades.find(p => p.id.toString() === productId) || relatedShades[0]
          setProduct({
            _id: mockProduct.id,
            name: mockProduct.name,
            description: mockProduct.description,
            price: mockProduct.price,
            rating: mockProduct.rating,
            image: mockProduct.image,
            images: [
              mockProduct.image,
              "https://i.pinimg.com/736x/cc/15/82/cc1582277c527faefb9d51f97e40b9af.jpg",
              "https://i.pinimg.com/1200x/17/cf/6c/17cf6cd5bf8eb592b01391ade1e6faae.jpg"
            ],
            category: "Lip Gloss",
            inStock: true,
            stock: 50,
            ingredients: ["Jojoba Oil", "Vitamin E", "Aloe Vera", "Natural Pigments"],
            benefits: ["Hydrating", "Long-lasting", "Non-sticky", "Plumping effect"],
            shadeOptions: [
              { name: "Crystal Pink", code: "#FFB6C1" },
              { name: "Berry Kiss", code: "#8B008B" },
              { name: "Nude Glow", code: "#F5DEB3" },
              { name: "Ruby Shine", code: "#DC143C" }
            ]
          })
        }
        
        // Set related products (filter out current product)
        setRelatedProducts(relatedShades.filter(p => p.id.toString() !== productId))
        
      } catch (error) {
        console.error('Error fetching product:', error)
        // Fallback to mock data
        const mockProduct = relatedShades[0]
        setProduct({
          _id: mockProduct.id,
          name: mockProduct.name,
          description: mockProduct.description,
          price: mockProduct.price,
          rating: mockProduct.rating,
          image: mockProduct.image,
          images: [
            mockProduct.image,
            "https://i.pinimg.com/736x/cc/15/82/cc1582277c527faefb9d51f97e40b9af.jpg",
            "https://i.pinimg.com/1200x/17/cf/6c/17cf6cd5bf8eb592b01391ade1e6faae.jpg"
          ]
        })
        setRelatedProducts(relatedShades.slice(1))
      } finally {
        setLoading(false)
      }
    }

    if (productId) {
      fetchProduct()
    }
  }, [productId])

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    setAddingToCart(true)
    
    try {
      const cartItem = {
        productId: product._id,
        name: product.name,
        price: product.price,
        image: product.image || product.images?.[0],
        quantity: quantity,
        description: product.description,
        rating: product.rating,
        shade: selectedShade
      }
      
      // Get existing cart from localStorage (temporary solution)
      const existingCart = localStorage.getItem('alora-cart')
      let cart = existingCart ? JSON.parse(existingCart) : []
      
      // Check if product already exists in cart
      const existingIndex = cart.findIndex((item: any) => 
        item.productId === cartItem.productId && item.shade === cartItem.shade
      )
      
      if (existingIndex >= 0) {
        // Update quantity if exists
        cart[existingIndex].quantity += quantity
      } else {
        // Add new item
        cart.push(cartItem)
      }
      
      // Save back to localStorage
      localStorage.setItem('alora-cart', JSON.stringify(cart))
      
      alert(`✅ ${product.name} added to cart!`)
      
      // Force cart update event
      window.dispatchEvent(new Event('storage'))
      
    } catch (error: any) {
      console.error('Add to cart error:', error)
      alert('Error: ' + (error.message || 'Failed to add to cart'))
    } finally {
      setAddingToCart(false)
    }
  }

  const StarRating = ({ rating }: { rating: number }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={star <= Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
          />
        ))}
        <span className="text-sm text-gray-500 ml-1">({rating})</span>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/')}
            className="bg-pink-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-pink-600 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  const productImages = product.images || [product.image]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft size={20} className="mr-2" />
            Back
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column - Images */}
          <div>
            {/* Main Image */}
            <div className="relative h-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-xl mb-4">
              <Image
                src={productImages[selectedImage]}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute top-4 right-4 flex gap-2">
                <button className="p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
                  <Heart size={20} className="text-gray-700" />
                </button>
                <button className="p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
                  <Share2 size={20} className="text-gray-700" />
                </button>
              </div>
            </div>

            {/* Thumbnail Images */}
            {productImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto py-2">
                {productImages.map((img: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                      selectedImage === index ? 'border-pink-500' : 'border-transparent'
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
            )}
          </div>

          {/* Right Column - Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-serif font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              <div className="flex items-center justify-between mb-4">
                <StarRating rating={product.rating || 4.5} />
                <span className="text-sm text-gray-500">
                  {product.stock || 50} in stock
                </span>
              </div>
              <p className="text-gray-600 text-lg leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Price */}
            <div className="border-t border-b py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-gray-900">
                    ${product.price?.toFixed(2) || '24.99'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Free shipping on orders over $50
                  </p>
                </div>
                <div className="text-right">
                  {product.inStock !== false ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      In Stock
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                      Out of Stock
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Shade Selection */}
            {product.shadeOptions && product.shadeOptions.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Select Shade</h3>
                <div className="flex flex-wrap gap-2">
                  {product.shadeOptions.map((shade: any, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedShade(shade.name)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all ${
                        selectedShade === shade.name
                          ? 'border-pink-500 bg-pink-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: shade.code }}
                      />
                      <span className="text-sm">{shade.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Quantity</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 border-x font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900"
                  >
                    +
                  </button>
                </div>
                <span className="text-gray-500">
                  Only {product.stock || 50} items left
                </span>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={addingToCart || product.inStock === false}
              className="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white py-4 rounded-xl font-semibold hover:from-rose-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <ShoppingBag size={20} />
              {addingToCart ? 'Adding to Cart...' : 'Add to Cart'}
            </button>

            {/* Features */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t">
              <div className="text-center">
                <Truck size={24} className="mx-auto text-gray-600 mb-2" />
                <p className="text-sm font-medium">Free Shipping</p>
                <p className="text-xs text-gray-500">On orders $50+</p>
              </div>
              <div className="text-center">
                <RotateCcw size={24} className="mx-auto text-gray-600 mb-2" />
                <p className="text-sm font-medium">30-Day Returns</p>
                <p className="text-xs text-gray-500">Easy return policy</p>
              </div>
              <div className="text-center">
                <Shield size={24} className="mx-auto text-gray-600 mb-2" />
                <p className="text-sm font-medium">Cruelty-Free</p>
                <p className="text-xs text-gray-500">Vegan & ethical</p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-2">💄</div>
                <p className="text-sm font-medium">Long Lasting</p>
                <p className="text-xs text-gray-500">8+ hours wear</p>
              </div>
            </div>

            {/* Product Details */}
            {product.ingredients && (
              <div className="pt-6 border-t">
                <h3 className="font-semibold text-gray-900 mb-3">Key Ingredients</h3>
                <ul className="grid grid-cols-2 gap-2">
                  {product.ingredients.map((ingredient: string, index: number) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 bg-pink-400 rounded-full mr-2" />
                      {ingredient}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {product.benefits && (
              <div className="pt-6 border-t">
                <h3 className="font-semibold text-gray-900 mb-3">Benefits</h3>
                <ul className="space-y-2">
                  {product.benefits.map((benefit: string, index: number) => (
                    <li key={index} className="flex items-center text-gray-600">
                      <div className="w-6 h-6 flex items-center justify-center mr-2">
                        <div className="w-2 h-2 bg-pink-500 rounded-full" />
                      </div>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Related Products/Shades Section */}
        <div className="mt-16 pt-8 border-t">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-serif font-bold text-gray-900">
                Related Shades
              </h2>
              <p className="text-gray-600 mt-1">
                Explore more shades from our collection
              </p>
            </div>
            <Link
              href="/shop"
              className="text-pink-600 hover:text-pink-700 font-medium flex items-center gap-1"
            >
              View all
              <ChevronRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <div key={relatedProduct.id} className="group">
                <Link href={`/product-detail/${relatedProduct.id}`}>
                  <div className="relative h-64 rounded-xl overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300 mb-4">
                    <Image
                      src={relatedProduct.image}
                      alt={relatedProduct.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-serif font-semibold text-gray-900 group-hover:text-pink-600 transition-colors">
                      {relatedProduct.name}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {relatedProduct.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-gray-900">
                        ${relatedProduct.price.toFixed(2)}
                      </p>
                      <StarRating rating={relatedProduct.rating} />
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        // Handle quick add to cart for related product
                        const cartItem = {
                          productId: relatedProduct.id,
                          name: relatedProduct.name,
                          price: relatedProduct.price,
                          image: relatedProduct.image,
                          quantity: 1,
                          description: relatedProduct.description,
                          rating: relatedProduct.rating
                        }
                        
                        const existingCart = localStorage.getItem('alora-cart')
                        let cart = existingCart ? JSON.parse(existingCart) : []
                        cart.push(cartItem)
                        localStorage.setItem('alora-cart', JSON.stringify(cart))
                        window.dispatchEvent(new Event('storage'))
                        alert(`✅ ${relatedProduct.name} added to cart!`)
                      }}
                      className="w-full mt-2 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm flex items-center justify-center gap-2"
                    >
                      <ShoppingBag size={14} />
                      Quick Add
                    </button>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}