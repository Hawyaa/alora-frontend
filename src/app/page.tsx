'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Star, ShoppingBag } from "lucide-react"
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

const circleImages = [
  {
    id: 1,
    src: "https://i.pinimg.com/1200x/8d/0c/22/8d0c22b4522ae0cade6e495c0ebf6767.jpg",
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
    src: "https://i.pinimg.com/1200x/17/cf/6c/17cf6cd5bf8eb592b01391ade1e6faae.jpg",
    alt: "Luxurious Pink Lip Gloss"
  },
  {
    id: 2,
    src: "https://i.pinimg.com/736x/cc/15/82/cc1582277c527faefb9d51f97e40b9af.jpg",
    alt: "Elegant Lip Gloss Collection"
  }
]

function CircleCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [itemsToShow, setItemsToShow] = useState(3)

  useEffect(() => {
    const updateItemsToShow = () => {
      if (window.innerWidth < 640) {
        setItemsToShow(2)
      } else if (window.innerWidth < 768) {
        setItemsToShow(3)
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
    <section className="py-12 md:py-20 px-4 sm:px-6" style={{ backgroundColor: 'rgb(249, 210, 229)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 md:mb-16 px-2">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-black mb-3 md:mb-4">
            Our Collection
          </h2>
          <p className="text-base md:text-xl text-black/80 max-w-2xl mx-auto">
            Explore our stunning range of lip gloss shades and formulas
          </p>
        </div>

        {itemsToShow < circleImages.length && (
          <div className="relative mb-4">
            <button
              onClick={prev}
              className="absolute left-2 md:left-0 top-1/2 -translate-y-1/2 z-10 -ml-2 md:-ml-4 p-2 md:p-3 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all duration-300 hover:scale-110"
              aria-label="Previous products"
            >
              <ChevronLeft size={18} className="text-gray-700 md:w-6 md:h-6" />
            </button>

            <button
              onClick={next}
              className="absolute right-2 md:right-0 top-1/2 -translate-y-1/2 z-10 -mr-2 md:-mr-4 p-2 md:p-3 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all duration-300 hover:scale-110"
              aria-label="Next products"
            >
              <ChevronRight size={18} className="text-gray-700 md:w-6 md:h-6" />
            </button>
          </div>
        )}

        <div className="overflow-hidden px-6 md:px-0">
          <div 
            className="flex transition-transform duration-500 ease-in-out gap-3 md:gap-6 lg:gap-8"
            style={{ transform: itemsToShow < circleImages.length ? `translateX(-${currentIndex * itemWidth}%)` : 'translateX(0)' }}
          >
            {circleImages.map((item) => (
              <div 
                key={item.id}
                className="flex-shrink-0"
                style={{ width: `${itemWidth}%` }}
              >
                <div className="text-center group px-1 md:px-2">
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 mx-auto mb-3 md:mb-4 rounded-full overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-500 transform group-hover:scale-105 md:group-hover:scale-110 border-4 border-white">
                    <Image
                      src={item.src}
                      alt={item.alt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 80px, (max-width: 768px) 96px, (max-width: 1024px) 112px, 128px"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 rounded-full" />
                  </div>
                  
                  <h3 className="font-serif font-semibold text-black mb-1 md:mb-2 text-sm md:text-base lg:text-lg line-clamp-1">
                    {item.name}
                  </h3>
                  <p className="text-xs md:text-sm text-black/80 leading-tight line-clamp-2 px-1">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {itemsToShow < circleImages.length && (
          <div className="flex justify-center gap-2 mt-6 md:mt-8">
            {Array.from({ length: Math.max(1, circleImages.length - itemsToShow + 1) }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex ? "bg-black scale-125" : "bg-white/50 hover:bg-white/70"
                }`}
                aria-label={`Go to slide ${index + 1}`}
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
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroImages.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length)
  }

  return (
    <section className="relative h-[70vh] md:h-screen">
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
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-black/20" />
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={prevSlide}
        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10 p-2 md:p-3 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all duration-300 hover:scale-110"
        aria-label="Previous slide"
      >
        <ChevronLeft size={18} className="text-gray-700 md:w-6 md:h-6" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-10 p-2 md:p-3 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all duration-300 hover:scale-110"
        aria-label="Next slide"
      >
        <ChevronRight size={18} className="text-gray-700 md:w-6 md:h-6" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
              index === currentSlide ? "bg-white scale-125" : "bg-white/50 hover:bg-white/70"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center px-4 md:px-0">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-end">
            <div className="max-w-full md:max-w-md text-center md:text-right">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 md:mb-6">
                <span className="font-[Segoe_Script]">Alora</span>
                <br />
                <span className="font-serif">Lipgloss</span>
              </h1>
              
              <p className="text-base md:text-xl text-white/90 mb-6 md:mb-8 leading-relaxed font-light px-2 md:px-0">
                Discover our collection of luxury lip glosses crafted for the modern woman. 
                Shine bright with Alora.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center md:justify-end">
                <Link 
                  href="/shop"
                  className="bg-gradient-to-r from-rose-400 to-pink-500 text-white px-6 py-3 md:px-8 md:py-4 rounded-full font-semibold hover:from-rose-500 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm md:text-base"
                >
                  Shop Now
                </Link>
                
                <Link 
                  href="/about"
                  className="border-2 border-white text-white px-6 py-3 md:px-8 md:py-4 rounded-full font-semibold hover:bg-white hover:text-gray-900 transition-all duration-300 transform hover:scale-105 backdrop-blur-sm text-sm md:text-base"
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

 
  // Fetch homepage products from API
  useEffect(() => {
    const fetchHomepageProducts = async () => {
      try {
        console.log('Fetching homepage products from API...')
        
        // Use the new endpoint for homepage products
        const data = await api.get('/homepage-products');
        console.log('Homepage products API response:', data);
        
        if (data.success && data.products && data.products.length > 0) {
          
          // We need to check the structure and extract the product data properly
          const formattedProducts = data.products.map((productData: any) => {
            // Check if the product data has a nested productId structure
            if (productData.productId && typeof productData.productId === 'object') {
              // This is the structure from /homepage-products/admin/all
              return {
                _id: productData.productId._id,
                name: productData.productId.name,
                description: productData.productId.description,
                price: productData.productId.price,
                category: productData.productId.category,
                images: productData.productId.images || [],
                inStock: productData.productId.inStock,
                stockQuantity: productData.productId.stockQuantity,
                shades: productData.productId.shades || [],
                createdAt: productData.productId.createdAt,
                rating: 4.5 // Default rating
              };
            } else {
             
              // or it's already a product object
              return {
                _id: productData._id,
                name: productData.name,
                description: productData.description,
                price: productData.price,
                category: productData.category,
                images: productData.images || [],
                inStock: productData.inStock,
                stockQuantity: productData.stockQuantity,
                shades: productData.shades || [],
                createdAt: productData.createdAt,
                rating: 4.5 // Default rating
              };
            }
          });
          
          console.log('✅ Formatted homepage products:', formattedProducts);
          setRealProducts(formattedProducts);
        } else {
          // Fallback to circleImages if no homepage products
          console.log('No homepage products found, using fallback images');
          const fallbackProducts = circleImages.map(img => ({
            _id: img.id.toString(),
            name: img.name,
            description: img.desc,
            price: parseFloat(img.price.replace('$', '')),
            rating: img.rating,
            image: img.src,
            images: [img.src]
          }));
          setRealProducts(fallbackProducts);
        }
      } catch (error) {
        console.error('Error fetching homepage products:', error);
        // Fallback to circleImages on error
        const fallbackProducts = circleImages.map(img => ({
          _id: img.id.toString(),
          name: img.name,
          description: img.desc,
          price: parseFloat(img.price.replace('$', '')),
          rating: img.rating,
          image: img.src,
          images: [img.src]
        }));
        setRealProducts(fallbackProducts);
      } finally {
        setProductsLoading(false);
      }
    }
    
    fetchHomepageProducts();
  }, []);

  const handleAddToCart = async (product: any, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    setAddingProductId(product._id)
    
    try {
      const cartItem = {
        productId: product._id || product.id,
        name: product.name,
        price: product.price,
        image: product.image || product.src,
        quantity: 1,
        description: product.description || product.desc,
        rating: product.rating
      }
      
      const existingCart = localStorage.getItem('alora-cart')
      let cart = existingCart ? JSON.parse(existingCart) : []
      
      const existingIndex = cart.findIndex((item: any) => item.productId === cartItem.productId)
      
      if (existingIndex >= 0) {
        cart[existingIndex].quantity += 1
      } else {
        cart.push(cartItem)
      }
      
      localStorage.setItem('alora-cart', JSON.stringify(cart))
      console.log('🛒 Cart updated:', cart)
      alert(`✅ ${product.name} added to cart!`)
      window.dispatchEvent(new Event('storage'))
      
    } catch (error: any) {
      console.error('Add to cart error:', error)
      alert('Error: ' + (error.message || 'Failed to add to cart'))
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
            size={12}
            className={star <= Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
          />
        ))}
        <span className="text-xs text-gray-500 ml-1">({rating})</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen overflow-hidden" style={{ backgroundColor: 'rgb(249, 210, 229)' }}>
      {/* Hero Carousel Section */}
      <HeroCarousel />

      {/* Circle Carousel Section */}
      <CircleCarousel />

      
      {/* Product Grid Section - UPDATED FOR 2 COLUMNS ON MOBILE */}
<section className="py-12 md:py-20 px-4 sm:px-6" style={{ backgroundColor: 'rgb(249, 210, 229)' }}>
  <div className="max-w-7xl mx-auto">
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 items-start">
      {/* Left Image - Hidden on mobile, shown on desktop */}
      <div className="hidden lg:block text-center lg:text-left flex flex-col justify-center h-full order-2 lg:order-1 lg:pt-20">
        <div className="relative h-[300px] sm:h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-2xl group mb-6 lg:mb-0">
          <Image
            src="https://i.pinimg.com/1200x/ea/e4/e3/eae4e3a62290e3af48a09276968a6a76.jpg"
            alt="Premium Lip Gloss Collection"
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-all duration-300" />
        </div>
      </div>

      {/* Products Grid - Full width on mobile, 2/3 on desktop */}
      <div className="lg:col-span-2 order-1 lg:order-2">
        <h3 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-black mb-6 md:mb-8 text-center lg:text-left">
          Premium Lip Gloss Collection
        </h3>
        
        {productsLoading ? (
          <div className="flex flex-col items-center justify-center h-40">
            <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-2 border-pink-500"></div>
            <span className="mt-3 text-gray-600 text-sm md:text-base">Loading products...</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {realProducts.map((product, index) => {
              // Convert USD price to ETB
              const productPriceETB = product.price ? Math.round(product.price * 55) : 0;
              
              return (
                <Link 
                  key={product._id || product.id} 
                  href={`/product-detail/${product._id || product.id}`}
                  className="text-center group block"
                >
                  <div className="relative h-32 sm:h-40 md:h-48 rounded-lg overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300 mb-2 md:mb-3">
                    <Image
                      src={product.images?.[0] || product.image || circleImages[index % circleImages.length]?.src}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw"
                    />
                  </div>
                  
                  <div className="space-y-1 md:space-y-2 p-1 md:p-2">
                    <h4 className="font-serif font-semibold text-black text-sm md:text-base group-hover:text-pink-600 transition-colors line-clamp-1">
                      {product.name}
                    </h4>
                    
                    <p className="text-gray-600 text-xs md:text-sm line-clamp-2">
                      {product.description}
                    </p>
                    {/* <div className="space-y-1 md:space-y-2 p-1 md:p-2">
                      <StarRating rating={product.rating || 4.5} />
                    </div> */}
                    <div className="space-y-1 md:space-y-2 p-1 md:p-2">
                      <p className="font-serif font-semibold text-black text-sm md:text-base group-hover:text-pink-600 transition-colors line-clamp-1">
                        ETB {productPriceETB.toFixed(2)}
                      </p>
                      
                    </div>
                    
                    {/* Optional: Show stock status */}
                    {product.inStock !== undefined && (
                      <div className="text-xs text-gray-500">
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  </div>
</section>

      {/* CTA Section */}
      <section className="py-12 md:py-20 relative px-4 sm:px-6">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://i.pinimg.com/1200x/b1/59/ce/b159ce7699845ac09865853ae5d1eca6.jpg"
            alt="Background"
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/10"></div>
        </div>
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-white mb-4 md:mb-6">
            Ready to Shine?
          </h2>
          <p className="text-base md:text-xl text-white/90 mb-6 md:mb-8 max-w-2xl mx-auto px-2">
            Discover your perfect shade and experience the Alora difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
            <Link 
              href="/shop"
              className="bg-gradient-to-r from-rose-400 to-pink-500 text-white px-6 py-3 md:px-8 md:py-4 rounded-full font-semibold hover:from-rose-500 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm md:text-base"
            >
              Shop Collection
            </Link>
            <Link 
              href="/about"
              className="border-2 border-white text-white px-6 py-3 md:px-8 md:py-4 rounded-full font-semibold hover:bg-white hover:text-gray-900 transition-all duration-300 transform hover:scale-105 backdrop-blur-sm text-sm md:text-base"
            >
              Our Story
            </Link>
          </div>
        </div>
      </section>

      {/* YouTube Video Section */}
      <section className="py-12 md:py-20 px-4 sm:px-6" style={{ backgroundColor: 'rgb(249, 210, 229)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-black mb-3 md:mb-4">
              Daily Beauty Vlog
            </h2>
            <p className="text-base md:text-xl text-black/80 max-w-2xl mx-auto px-2">
              Watch our daily vlog to see our products in action and get beauty tips from our experts
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="relative aspect-video rounded-xl md:rounded-2xl overflow-hidden shadow-xl md:shadow-2xl">
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
