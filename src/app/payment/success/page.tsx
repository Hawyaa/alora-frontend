'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { usePayment } from '@/contexts/PaymentContext'
import { useCart } from '@/contexts/CartContext'

export default function PaymentSuccessPage() {
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending')
  const [order, setOrder] = useState<any>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { checkPaymentStatus, completePayment } = usePayment()
  const { clearCart } = useCart()

  const tx_ref = searchParams.get('tx_ref')

  useEffect(() => {
    const verifyPayment = async () => {
      if (!tx_ref) {
        setPaymentStatus('failed')
        return
      }

      try {
        // First, try to complete the payment (for testing)
        try {
          const completeResult = await completePayment(tx_ref)
          if (completeResult.success) {
            setOrder(completeResult.order)
            setPaymentStatus('success')
            await clearCart()
            return
          }
        } catch (error) {
          console.log('Auto-complete failed, checking status...')
        }

        // Check payment status
        const result = await checkPaymentStatus(tx_ref)
        
        if (result.success && result.order) {
          setOrder(result.order)
          
          if (result.order.status === 'completed') {
            setPaymentStatus('success')
            await clearCart()
          } else {
            // If still pending, wait and check again
            setTimeout(async () => {
              const retryResult = await checkPaymentStatus(tx_ref)
              if (retryResult.success && retryResult.order?.status === 'completed') {
                setOrder(retryResult.order)
                setPaymentStatus('success')
                await clearCart()
              } else {
                setPaymentStatus('failed')
              }
            }, 3000)
          }
        } else {
          setPaymentStatus('failed')
        }
      } catch (error) {
        console.error('Payment verification error:', error)
        setPaymentStatus('failed')
      }
    }

    verifyPayment()
  }, [tx_ref, checkPaymentStatus, clearCart, completePayment])

  if (paymentStatus === 'pending') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={64} className="mx-auto text-pink-500 animate-spin mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Payment</h2>
          <p className="text-gray-600">Please wait while we confirm your payment...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {paymentStatus === 'success' ? (
          <>
            <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-4">
              Thank you for your purchase. Your payment has been processed successfully.
            </p>
            {order && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold mb-2">Order Details:</h3>
                <p><strong>Order ID:</strong> {order.orderId}</p>
                <p><strong>Amount:</strong> {order.amount} {order.currency}</p>
                <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
            )}
            <button
              onClick={() => router.push('/')}
              className="w-full bg-pink-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-pink-600 transition-colors"
            >
              Continue Shopping
            </button>
          </>
        ) : (
          <>
            <XCircle size={64} className="mx-auto text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
            <p className="text-gray-600 mb-4">
              Unfortunately, your payment could not be processed. Please try again.
            </p>
            <button
              onClick={() => router.push('/cart')}
              className="w-full bg-pink-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-pink-600 transition-colors"
            >
              Back to Cart
            </button>
          </>
        )}
      </div>
    </div>
  )
}