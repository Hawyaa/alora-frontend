'use client'
import { ReactNode } from 'react'
import { AuthProvider } from '@/contexts/AuthContext'
import { CartProvider } from '@/contexts/CartContext'
import { ProductProvider } from '@/contexts/ProductContext'
import { PaymentProvider } from '@/contexts/PaymentContext'

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ProductProvider>
        <CartProvider>
          <PaymentProvider>
            {children}
          </PaymentProvider>
        </CartProvider>
      </ProductProvider>
    </AuthProvider>
  )
}