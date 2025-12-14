'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Star, ShoppingBag } from "lucide-react"
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api' // Import your API client

const circleImages = [
  {
    id: 1,
    src: "https://i.pinimg.com/1200x/8b/eb/2b/8beb2b9f52c0d5cc849dac9c85b6adb2.jpg",
    alt: "Pink Lip Gloss",
    name: "Crystal Pink",
    desc: "Shimmering pink gloss",
    price: "$24.99",
    rating: 4.5
  },
  {
    id: 2,
    src: "https://i.pinimg.com/1200x/04/68/c9/0468c9f3f4ee6efe49591632a21cbac1.jpg",
    alt: "Berry Lip Gloss",
    name: "Berry Kiss",
    desc: "Rich berry tone",
    price: "$22.99",
    rating: 4.8
  },
  {
    id: 3,
    src: "https://i.pinimg.com/1200x/54/54/ce/5454cea9aa5fa470cbaaf5e461ec26cd.jpg",
    alt: "Nude Lip Gloss",
    name: "Nude Glow",
    desc: "Natural nude shade",
    price: "$26.99",
    rating: 4.3
  },
  {
    id: 4,
    src: "https://i.pinimg.com/736x/fe/ef/21/feef21d1f20b200362a51ad1c6926349.jpg",
    alt: "Ruby Lip Gloss",
    name: "Ruby Shine",
    desc: "Bold red gloss",
    price: "$23.99",
    rating: 4.7
  },
  {
    id: 5,
    src: "https://i.pinimg.com/736x/b3/78/3f/b3783fc4889c66292e5c20f53342e34d.jpg",
    alt: "Magenta Lip Gloss",
    name: "Magenta Dream",
    desc: "Vibrant magenta",
    price: "$25.99",
    rating: 4.6
  },
  {
    id: 6,
    src: "https://i.pinimg.com/1200x/54/54/ce/5454cea9aa5fa470cbaaf5e461ec26cd.jpg",
    alt: "Coral Lip Gloss",
    name: "Coral Bliss",
    desc: "Fresh coral tone",
    price: "$21.99",
    rating: 4.4
  }
]

// Hero carousel images
const heroImages = [
  {
    id: 1,
    src: "https://i.pinimg.com/736x/cc/15/82/cc1582277c527faefb9d51f97e40b9af.jpg",
    alt: "Luxurious Pink Lip Gloss"
  },
  {
    id: 2,
    src: "https://i.pinimg.com/1200x/17/cf/6c/17cf6cd5bf8eb592b01391ade1e6faae.jpg",
    alt: "Elegant Lip Gloss Collection"
  }
]

function CircleCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [itemsToShow, setItemsToShow] = useState(6)

  useEffect(() => {
    const updateItemsToShow = () => {
      if (window.innerWidth < 640) {
        setItemsToShow(2)
      } else if (window.innerWidth < 1024) {
        setItemsToShow(4)
      } else {
        setItemsToShow(6)
      }
    }

    updateItemsToShow()
    window.addEventListener('resize', updateItemsToShow)
    return () => window.removeEventListener('resize', updateItemsToShow)
  }, [])

  const next = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex + 1 >= circleImages.length - itemsToShow + 1 ? 0 : prevIndex + 1
    )
  }

  const prev = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex - 1 < 0 ? circleImages.length - itemsToShow : prevIndex - 1
    )
  }

  const itemWidth = 100 / itemsToShow

  return (
    <section className="py-20" style={{ backgroundColor: 'rgb(249, 210, 229)' }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-black mb-4">
            Our Collection
          </h2>
          <p className="text-xl text-black/80 max-w-2xl mx-auto">
            Explore our stunning range of lip gloss shades and formulas
          </p>
        </div>

        {itemsToShow < circleImages.length && (
          <div className="relative">
            <button
              onClick={prev}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 -ml-2 md:-ml-4 p-2 md:p-3 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all duration-300 hover:scale-110"
            >
              <ChevronLeft size={20} className="text-gray-700 md:w-6 md:h-6" />
            </button>

            <button
              onClick={next}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 -mr-2 md:-mr-4 p-2 md:p-3 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all duration-300 hover:scale-110"
            >
              <ChevronRight size={20} className="text-gray-700 md:w-6 md:h-6" />
            </button>
          </div>
        )}

        <div className="overflow-hidden px-8 md:px-0">
          <div 
            className="flex transition-transform duration-500 ease-in-out gap-4 md:gap-8"
            style={{ transform: itemsToShow < circleImages.length ? `translateX(-${currentIndex * itemWidth}%)` : 'translateX(0)' }}
          >
            {circleImages.map((item) => (
              <div 
                key={item.id}
                className="flex-shrink-0"
                style={{ width: `${itemWidth}%` }}
              >
                <div className="text-center group px-2">
                  <div className="relative w-24 h-24 md:w-32 md:h-32 mx-auto mb-4 rounded-full overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-500 transform group-hover:scale-110 border-4 border-white">
                    <Image
                      src={item.src}
                      alt={item.alt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 96px, 128px"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 rounded-full" />
                  </div>
                  
                  <h3 className="font-serif font-semibold text-black mb-2 text-base md:text-lg">
                    {item.name}
                  </h3>
                  <p className="text-xs md:text-sm text-black/80 leading-tight">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {itemsToShow < circleImages.length && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: Math.max(1, circleImages.length - itemsToShow + 1) }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex ? "bg-black scale-125" : "bg-white/50 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

// Hero Carousel Component
function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length)
    }, 5000) // Change slide every 5 seconds

    return () => clearInterval(interval)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroImages.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length)
  }

  return (
    <section className="relative h-screen">
      <div className="absolute inset-0">
        {heroImages.map((image, index) => (
          <div
            key={image.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              className="object-cover"
              priority={index === 0}
            />
            <div className="absolute inset-0 bg-black/20" />
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all duration-300 hover:scale-110"
      >
        <ChevronLeft size={24} className="text-gray-700" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all duration-300 hover:scale-110"
      >
        <ChevronRight size={24} className="text-gray-700" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide ? "bg-white scale-125" : "bg-white/50 hover:bg-white/70"
            }`}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-end">
            <div className="max-w-md text-right">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
                <span className="font-[Segoe_Script]">Alora</span>
                <br />
                <span className="font-serif">Lipgloss</span>
              </h1>
              
              <p className="text-xl text-white/90 mb-8 leading-relaxed font-light">
                Discover our collection of luxury lip glosses crafted for the modern woman. 
                Shine bright with Alora.
              </p>
              
              <div className="flex gap-4 justify-end">
                <Link 
                  href="/shop"
                  className="bg-gradient-to-r from-rose-400 to-pink-500 text-white px-8 py-4 rounded-full font-semibold hover:from-rose-500 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Shop Now
                </Link>
                
                <Link 
                  href="/about"
                  className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-gray-900 transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  const { addToCart } = useCart()
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const [addingProductId, setAddingProductId] = useState<string | null>(null)
  const [realProducts, setRealProducts] = useState<any[]>([])
  const [productsLoading, setProductsLoading] = useState(true)

  // Fetch real products from backend - USING YOUR API CLIENT
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log('Fetching products from API...')
        
        // Use your API client instead of direct fetch
        const data = await api.get('/products')
        console.log('Products API response:', data)
        
        if (data.success && data.products && data.products.length > 0) {
          setRealProducts(data.products)
        } else {
          // If no products, use the circleImages as fallback
          console.log('No products from API, using fallback data')
          const fallbackProducts = circleImages.map(img => ({
            _id: img.id.toString(),
            name: img.name,
            description: img.desc,
            price: parseFloat(img.price.replace('$', '')),
            rating: img.rating,
            image: img.src
          }))
          setRealProducts(fallbackProducts)
        }
      } catch (error) {
        console.error('Error fetching products:', error)
        // Use fallback data on error
        const fallbackProducts = circleImages.map(img => ({
          _id: img.id.toString(),
          name: img.name,
          description: img.desc,
          price: parseFloat(img.price.replace('$', '')),
          rating: img.rating,
          image: img.src
        }))
        setRealProducts(fallbackProducts)
      } finally {
        setProductsLoading(false)
      }
    }
    
    fetchProducts()
  }, [])

  const handleAddToCart = (product: any) => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    setAddingProductId(product._id)
    
    try {
      // Use the addToCart function from your CartContext
      addToCart({
        id: product._id || product.id,
        name: product.name,
        price: product.price,
        image: product.image || product.src,
        quantity: 1,
        description: product.description || product.desc,
        rating: product.rating
      })
      
      alert(`✅ ${product.name} added to cart!`)
    } catch (error: any) {
      console.error('Add to cart error:', error)
      alert('Error: ' + error.message)
    } finally {
      setAddingProductId(null)
    }
  }

  const StarRating = ({ rating }: { rating: number }) => {
    return (
      <div className="flex justify-center gap-1 mb-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            className={star <= Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
          />
        ))}
        <span className="text-xs text-gray-500 ml-1">({rating})</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'rgb(249, 210, 229)' }}>
      {/* Hero Carousel Section */}
      <HeroCarousel />

      {/* Circle Carousel Section */}
      <CircleCarousel />

      {/* Product Grid Section */}
      <section className="py-20" style={{ backgroundColor: 'rgb(249, 210, 229)' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            <div className="text-center lg:text-left flex flex-col justify-center h-full">
              <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl group">
                <Image
                  src="https://i.pinimg.com/1200x/ea/e4/e3/eae4e3a62290e3af48a09276968a6a76.jpg"
                  alt="Premium Lip Gloss Collection"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-all duration-300" />
              </div>
            </div>

            <div className="lg:col-span-2">
              <h3 className="text-2xl md:text-3xl font-serif font-bold text-black mb-8 text-center lg:text-left">
                Premium Lip Gloss Collection for Every Occasion
              </h3>
              
              {productsLoading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
                  <span className="ml-3 text-gray-600">Loading products...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {realProducts.map((product, index) => (
                    <div key={product._id || product.id} className="text-center group">
                      <div className="relative h-48 rounded-lg overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300 mb-3">
                        <Image
                          src={product.image || circleImages[index % circleImages.length]?.src}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                      
                      <div className="space-y-2 p-2">
                        <h4 className="font-serif font-semibold text-black text-base">
                          {product.name}
                        </h4>
                        
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {product.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <p className="text-lg font-bold text-black">
                            ${product.price?.toFixed(2) || '24.99'}
                          </p>
                          <StarRating rating={product.rating || 4.5} />
                        </div>
                        
                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={addingProductId === product._id}
                          className="w-full bg-gradient-to-r from-rose-400 to-pink-500 text-white py-2 px-4 rounded-full font-semibold hover:from-rose-500 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ShoppingBag size={16} />
                          {addingProductId === product._id ? 'Adding...' : 'Add to Cart'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20" style={{ backgroundColor: 'rgb(249, 210, 229)' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-black mb-6">
            Ready to Shine?
          </h2>
          <p className="text-xl text-black/80 mb-8 max-w-2xl mx-auto">
            Discover your perfect shade and experience the Alora difference.
          </p>
          <div className="flex gap-4 justify-center">
            <Link 
              href="/shop"
              className="bg-gradient-to-r from-rose-400 to-pink-500 text-white px-8 py-4 rounded-full font-semibold hover:from-rose-500 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Shop Collection
            </Link>
            <Link 
              href="/about"
              className="border-2 border-black text-black px-8 py-4 rounded-full font-semibold hover:bg-black hover:text-white transition-all duration-300 transform hover:scale-105"
            >
              Our Story
            </Link>
          </div>
        </div>
      </section>

      {/* YouTube Video Section */}
      <section className="py-20" style={{ backgroundColor: 'rgb(249, 210, 229)' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-black mb-4">
              Daily Beauty Vlog
            </h2>
            <p className="text-xl text-black/80 max-w-2xl mx-auto">
              Watch our daily vlog to see our products in action and get beauty tips from our experts
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/5qEPH8Kt2uM?si=apOZbrOERKC5vgKi"
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}