'use client'
import { useState } from 'react'
import { usePayment } from '@/contexts/PaymentContext'
import { useAuth } from '@/contexts/AuthContext'

export default function TestPaymentPage() {
  const [isLoading, setIsLoading] = useState(false)
  const { initializePayment } = usePayment()
  const { user, isAuthenticated } = useAuth()

  const testPayment = async (amount: number) => {
    if (!isAuthenticated) {
      alert('Please login first')
      return
    }

    setIsLoading(true)
    try {
      const result = await initializePayment(
        amount,
        user?.email || 'test@example.com',
        {
          firstName: 'Test',
          lastName: 'Customer',
          phone: '0912345678'
        }
      )

      if (result.success && result.checkout_url) { // ✅ Fixed line
        // Redirect to Chapa
        window.location.href = result.checkout_url // ✅ Fixed line
      } else {
        alert('Payment failed: ' + (result.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Test payment error:', error)
      alert('Test payment failed')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Please login to test payments</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center mb-6">Test Payment</h2>
        
        <div className="space-y-4">
          <button
            onClick={() => testPayment(10)}
            disabled={isLoading}
            className="w-full bg-green-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-600 disabled:opacity-50"
          >
            Test Small Payment (10 ETB)
          </button>

          <button
            onClick={() => testPayment(50)}
            disabled={isLoading}
            className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-600 disabled:opacity-50"
          >
            Test Medium Payment (50 ETB)
          </button>

          <button
            onClick={() => testPayment(100)}
            disabled={isLoading}
            className="w-full bg-purple-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-purple-600 disabled:opacity-50"
          >
            Test Large Payment (100 ETB)
          </button>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <h3 className="font-semibold mb-2">Testing Instructions:</h3>
          <ul className="text-sm space-y-1">
            <li>• Click any payment button</li>
            <li>• You'll be redirected to Chapa</li>
            <li>• Choose Telebirr or any bank</li>
            <li>• Use test credentials (no real money)</li>
            <li>• You'll be redirected back after payment</li>
          </ul>
        </div>
      </div>
    </div>
  )
}