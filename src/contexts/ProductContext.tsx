'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface Product {
  _id: string
  name: string
  description: string
  price: number
  images: string[]
  category: string
  inStock: boolean
  stockQuantity: number
  shades: Array<{
    name: string
    hexCode: string
  }>
}

interface ProductContextType {
  products: Product[]
  isLoading: boolean
  error: string | null
  fetchProducts: () => Promise<void>
}

const ProductContext = createContext<ProductContextType | undefined>(undefined)

interface ProductProviderProps {
  children: ReactNode
}

export function ProductProvider({ children }: ProductProviderProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://alora-backend.onrender.com/api'
      const response = await fetch(`${apiUrl}/products`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch products')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setProducts(data.products || [])
      } else {
        throw new Error(data.error || 'Failed to fetch products')
      }
    } catch (error: any) {
      console.error('Error fetching products:', error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const value: ProductContextType = {
    products,
    isLoading,
    error,
    fetchProducts,
  }

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
}

export function useProducts() {
  const context = useContext(ProductContext)
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider')
  }
  return context
}
