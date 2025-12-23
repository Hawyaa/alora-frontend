// frontend/src/contexts/PaymentContext.tsx
'use client'

import React, { createContext, useContext, ReactNode, useState } from 'react'

interface PaymentContextType {
  initializePayment: (
    amount: number,
    email: string,
    userInfo: {
      firstName: string
      lastName: string
      phone: string
    },
    orderId?: string
  ) => Promise<{ 
    success: boolean; 
    checkout_url?: string; 
    tx_ref?: string;
    error?: string 
  }>
  checkPaymentStatus: (tx_ref: string) => Promise<{ 
    success: boolean; 
    order?: any; 
    error?: string 
  }>
  completePayment: (tx_ref: string) => Promise<{ 
    success: boolean; 
    order?: any; 
    error?: string 
  }>
  storeCart: (cartItems: any[]) => Promise<{ success: boolean; error?: string }>
  isLoading: boolean
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined)

export function PaymentProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)

  const getAuthToken = () => {
    return localStorage.getItem('alora-token')
  }

  const storeCart = async (cartItems: any[]) => {
    try {
      const token = getAuthToken()
      if (!token) return { success: false, error: 'Not authenticated' }

      const response = await fetch('http://localhost:5000/api/payment/store-cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ cartItems })
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Store cart error:', error)
      return { success: false, error: 'Failed to store cart' }
    }
  }

  const initializePayment = async (
    amount: number,
    email: string,
    userInfo: {
      firstName: string
      lastName: string
      phone: string
    },
    orderId?: string
  ) => {
    try {
      setIsLoading(true)
      const token = getAuthToken()
      if (!token) {
        return { success: false, error: 'Please login to make payments' }
      }

      const response = await fetch('http://localhost:5000/api/payment/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount,
          email,
          firstName: userInfo.firstName,
          lastName: userInfo.lastName,
          phone: userInfo.phone
        })
      })

      const data = await response.json()
      
      if (data.success && data.checkout_url) {
        return { 
          success: true, 
          checkout_url: data.checkout_url,
          tx_ref: data.tx_ref 
        }
      } else {
        return { success: false, error: data.error || 'Payment initialization failed' }
      }
    } catch (error: any) {
      console.error('Payment initialization error:', error)
      return { success: false, error: error.message || 'Payment initialization failed' }
    } finally {
      setIsLoading(false)
    }
  }

  const checkPaymentStatus = async (tx_ref: string) => {
    try {
      const token = getAuthToken()
      if (!token) return { success: false, error: 'Not authenticated' }

      const response = await fetch(`http://localhost:5000/api/payment/status/${tx_ref}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      return data
    } catch (error: any) {
      console.error('Check payment status error:', error)
      return { success: false, error: error.message }
    }
  }

  const completePayment = async (tx_ref: string) => {
    try {
      const token = getAuthToken()
      if (!token) return { success: false, error: 'Not authenticated' }

      const response = await fetch('http://localhost:5000/api/payment/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ tx_ref })
      })

      const data = await response.json()
      return data
    } catch (error: any) {
      console.error('Complete payment error:', error)
      return { success: false, error: error.message }
    }
  }

  return (
    <PaymentContext.Provider value={{ 
      initializePayment, 
      checkPaymentStatus, 
      completePayment,
      storeCart,
      isLoading 
    }}>
      {children}
    </PaymentContext.Provider>
  )
}

export function usePayment() {
  const context = useContext(PaymentContext)
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentProvider')
  }
  return context
}