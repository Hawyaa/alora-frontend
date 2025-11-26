'use client'
import { createContext, useContext, useState, ReactNode } from 'react'
import { useAuth } from './AuthContext'

interface PaymentContextType {
  initializePayment: (amount: number, email: string, userData?: any) => Promise<{ success: boolean; data?: any; error?: string }>
  checkPaymentStatus: (txRef: string) => Promise<{ success: boolean; order?: any; error?: string }>
  completePayment: (txRef: string) => Promise<{ success: boolean; order?: any; error?: string }>
  isLoading: boolean
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined)

interface PaymentProviderProps {
  children: ReactNode
}

export function PaymentProvider({ children }: PaymentProviderProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { token, user } = useAuth()

  const initializePayment = async (amount: number, email: string, userData?: any) => {
    if (!token) {
      return { success: false, error: 'Please login to make payment' }
    }

    setIsLoading(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
      
      const response = await fetch(`${apiUrl}/payment/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: amount,
          email: email,
          firstName: userData?.firstName || user?.name?.split(' ')[0] || 'Customer',
          lastName: userData?.lastName || user?.name?.split(' ')[1] || '',
          phone: userData?.phone || user?.phone || '',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to initialize payment')
      }

      const data = await response.json()

      if (data.success) {
        return { success: true, data }
      } else {
        throw new Error(data.error || 'Failed to initialize payment')
      }
    } catch (error: any) {
      console.error('Payment error:', error)
      return { success: false, error: error.message }
    } finally {
      setIsLoading(false)
    }
  }

  const checkPaymentStatus = async (txRef: string) => {
    if (!token) {
      return { success: false, error: 'Please login to check payment status' }
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
      const response = await fetch(`${apiUrl}/payment/status/${txRef}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to check payment status')
      }

      const data = await response.json()

      if (data.success) {
        return { success: true, order: data.order }
      } else {
        throw new Error(data.error || 'Failed to check payment status')
      }
    } catch (error: any) {
      console.error('Status check error:', error)
      return { success: false, error: error.message }
    }
  }

  const completePayment = async (txRef: string) => {
    if (!token) {
      return { success: false, error: 'Please login to complete payment' }
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
      const response = await fetch(`${apiUrl}/payment/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ tx_ref: txRef })
      })

      if (!response.ok) {
        throw new Error('Failed to complete payment')
      }

      const data = await response.json()

      if (data.success) {
        return { success: true, order: data.order }
      } else {
        throw new Error(data.error || 'Failed to complete payment')
      }
    } catch (error: any) {
      console.error('Complete payment error:', error)
      return { success: false, error: error.message }
    }
  }

  const value: PaymentContextType = {
    initializePayment,
    checkPaymentStatus,
    completePayment,
    isLoading,
  }

  return <PaymentContext.Provider value={value}>{children}</PaymentContext.Provider>
}

export function usePayment() {
  const context = useContext(PaymentContext)
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentProvider')
  }
  return context
}