"use client"

import React, { createContext, useContext, ReactNode } from 'react'

interface PaymentContextType {
  initializePayment: (
    amount: number,
    email: string,
    userInfo: {
      firstName: string
      lastName: string
      phone: string
    }
  ) => Promise<{ success: boolean; data?: any; error?: string }>
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined)

export function PaymentProvider({ children }: { children: ReactNode }) {
  const initializePayment = async (
    amount: number,
    email: string,
    userInfo: {
      firstName: string
      lastName: string
      phone: string
    }
  ) => {
    try {
      // This is a mock payment function - replace with actual Chapa integration
      console.log('Payment initialized:', { amount, email, userInfo })
      
      return {
        success: true,
        data: {
          checkout_url: '#',
          message: 'Payment initialized successfully'
        }
      }
    } catch (error) {
      console.error('Payment initialization error:', error)
      return {
        success: false,
        error: 'Payment initialization failed'
      }
    }
  }

  return (
    <PaymentContext.Provider value={{ initializePayment }}>
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