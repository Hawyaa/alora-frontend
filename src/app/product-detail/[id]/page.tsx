'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Star, ShoppingBag, ChevronLeft, Heart, Share2, Truck, Shield, RotateCcw, ChevronRight, ChevronLeft as LeftIcon } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'

// USD to ETB conversion rate
const USD_TO_ETB_RATE = 55;

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
  const [loadingRelated, setLoadingRelated] = useState(true)

  const productId = params.id as string

  // Convert USD price to ETB
  const convertToETB = (usdPrice: number): number => {
    return Math.round(usdPrice * USD_TO_ETB_RATE)
  }

  // Format ETB price
  const formatETB = (amount: number): string => {
    return `ETB ${amount.toLocaleString('en-ET')}`
  }

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        
        console.log(`Fetching product ${productId} from API...`)
        
        // Try to fetch from API
        const data = await api.get(`/products/${productId}`)
        console.log('Product API response:', data)
        
        if (data.success && data.product) {
          const productData = data.product
          console.log('Product data received:', productData)
          
          setProduct(productData)
          
          // After loading product, fetch related products
          await fetchRelatedProducts(productData.category, productData._id)
        } else {
          console.log('Product not found in API, checking all products...')
          
          // Try to get all products and find this one
          const allProductsResponse = await api.get('/products')
          if (allProductsResponse.success && allProductsResponse.products) {
            const foundProduct = allProductsResponse.products.find((p: any) => p._id === productId)
            if (foundProduct) {
              console.log('Found product in all products:', foundProduct)
              setProduct(foundProduct)
              await fetchRelatedProducts(foundProduct.category, foundProduct._id)
            } else {
              // Show error state
              console.log('Product not found at all')
            }
          }
        }
        
      } catch (error) {
        console.error('Error fetching product:', error)
      } finally {
        setLoading(false)
      }
    }

    if (productId) {
      fetchProduct()
    }
  }, [productId])

  // Fetch related products based on category
  const fetchRelatedProducts = async (category: string, excludeId: string) => {
    try {
      setLoadingRelated(true)
      console.log(`Fetching related products for category: ${category}`)
      
      // Fetch all products
      const data = await api.get('/products')
      
      if (data.success && data.products) {
        // Filter products by same category, exclude current product, limit to 4
        const filteredProducts = data.products
          .filter((p: any) => p._id !== excludeId && p.category === category)
          .slice(0, 4)
        
        console.log(`Found ${filteredProducts.length} related products`)
        setRelatedProducts(filteredProducts)
      } else {
        console.log('No products found for related products')
      }
    } catch (error) {
      console.error('Error fetching related products:', error)
    } finally {
      setLoadingRelated(false)
    }
  }

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    setAddingToCart(true)
    
    try {
      const cartItem = {
        id: product._id,
        productId: product._id,
        name: product.name,
        price: product.price, // Store USD price
        image: product.images?.[0] || product.image,
        quantity: quantity,
        description: product.description,
        category: product.category,
        shade: selectedShade !== 'default' ? selectedShade : undefined
      }
      
      // Use the CartContext to add to cart
      addToCart(cartItem)
      
      alert(`✅ ${product.name} added to cart!`)
      
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
            className={star <= Math.floor(rating || 4.5) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
          />
        ))}
        <span className="text-sm text-gray-500 ml-1">({rating || 4.5})</span>
      </div>
    )
  }

  const handleQuickAddToCart = (relatedProduct: any, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    const cartItem = {
      id: relatedProduct._id,
      productId: relatedProduct._id,
      name: relatedProduct.name,
      price: relatedProduct.price,
      image: relatedProduct.images?.[0] || relatedProduct.image,
      quantity: 1,
      description: relatedProduct.description,
      category: relatedProduct.category
    }
    
    // Use the CartContext to add to cart
    addToCart(cartItem)
    
    alert(`✅ ${relatedProduct.name} added to cart!`)
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
          <Link
            href="/shop"
            className="inline-block bg-pink-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-pink-600 transition-colors"
          >
            Browse Products
          </Link>
        </div>
      </div>
    )
  }

  const productImages = product.images && product.images.length > 0 
    ? product.images 
    : product.image 
      ? [product.image] 
      : ['https://i.pinimg.com/736x/cc/15/82/cc1582277c527faefb9d51f97e40b9af.jpg']

  const productPriceETB = convertToETB(product.price || 0)

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
            <div className="relative h-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-xl mb-4 bg-gray-100">
              {productImages[selectedImage] ? (
                <Image
                  src={productImages[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                  unoptimized={true}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-gray-400">No image available</div>
                </div>
              )}
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
                    className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all bg-gray-100 ${
                      selectedImage === index ? 'border-pink-500' : 'border-transparent'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} view ${index + 1}`}
                      fill
                      className="object-cover"
                      unoptimized={true}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Product Info */}
          <div className="space-y-6">
            <div>
              <div className="inline-block px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-medium mb-3 capitalize">
                {product.category || 'Lip Gloss'}
              </div>
              <h1 className="text-3xl lg:text-4xl font-serif font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              <div className="flex items-center justify-between mb-4">
                <StarRating rating={product.rating} />
                <span className="text-sm text-gray-500">
                  {product.stockQuantity || product.stock || '50'} in stock
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
                    {formatETB(productPriceETB)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    ≈ ${(product.price || 0).toFixed(2)} USD
                  </p>
                  <p className="text-sm text-pink-600 mt-1">
                    Free shipping on orders over ETB 1000
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
            {product.shades && product.shades.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Select Shade</h3>
                <div className="flex flex-wrap gap-2">
                  {product.shades.map((shade: any, index: number) => (
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
                        style={{ backgroundColor: shade.hexCode || '#FFB6C1' }}
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
                  Only {product.stockQuantity || product.stock || 50} items left
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
                <p className="text-xs text-gray-500">On orders ETB 1000+</p>
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
          </div>
        </div>

        {/* Related Products Section */}
        <div className="mt-16 pt-8 border-t">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-serif font-bold text-gray-900">
                Related Products
              </h2>
              <p className="text-gray-600 mt-1">
                Explore more products from our collection
              </p>
            </div>
            <Link
              href="/shop"
              className="text-pink-600 hover:text-pink-700 font-medium flex items-center gap-1"
            >
              View all products
              <ChevronRight size={16} />
            </Link>
          </div>

          {loadingRelated ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
            </div>
          ) : relatedProducts.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <p className="text-gray-600 mb-4">No related products found</p>
              <Link
                href="/shop"
                className="inline-block bg-pink-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-pink-600 transition-colors"
              >
                Browse All Products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => {
                const relatedPriceETB = convertToETB(relatedProduct.price || 0)
                
                return (
                  <div key={relatedProduct._id} className="group">
                    <Link href={`/product-detail/${relatedProduct._id}`}>
                      <div className="relative h-64 rounded-xl overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300 mb-4 bg-gray-100">
                        {relatedProduct.images?.[0] ? (
                          <Image
                            src={relatedProduct.images[0]}
                            alt={relatedProduct.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            unoptimized={true}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="text-gray-400">No image</div>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="font-serif font-semibold text-gray-900 group-hover:text-pink-600 transition-colors line-clamp-1">
                          {relatedProduct.name}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {relatedProduct.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-gray-900">
                            {formatETB(relatedPriceETB)}
                          </p>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={12}
                                className={star <= Math.floor(relatedProduct.rating || 4.5) 
                                  ? "fill-yellow-400 text-yellow-400" 
                                  : "text-gray-300"
                                }
                              />
                            ))}
                          </div>
                        </div>
                        <button
                          onClick={(e) => handleQuickAddToCart(relatedProduct, e)}
                          disabled={!relatedProduct.inStock}
                          className="w-full mt-2 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm flex items-center justify-center gap-2"
                        >
                          <ShoppingBag size={14} />
                          Quick Add
                        </button>
                      </div>
                    </Link>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}