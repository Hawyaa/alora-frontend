'use client'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'

export default function AuthDebug() {
  // Use only properties that definitely exist in your contexts
  const { user, token, isAuthenticated } = useAuth() // Removed checkAuth
  const { cartItems } = useCart() // Removed cartCount, isLoading, error, fetchCart

  // Calculate cart count from cartItems
  const cartCount = cartItems?.reduce((total, item) => total + item.quantity, 0) || 0

  const testLocalStorage = () => {
    console.log('=== Local Storage ===')
    console.log('alora-token:', localStorage.getItem('alora-token'))
    console.log('alora-user:', localStorage.getItem('alora-user'))
    console.log('Cart items:', cartItems)
  }

  return (
    <div className="p-4 border rounded-lg bg-yellow-50">
      <h3 className="font-bold mb-2">Auth Debug:</h3>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>Authenticated:</div><div>{isAuthenticated ? 'Yes' : 'No'}</div>
        <div>User Email:</div><div>{user?.email || 'None'}</div>
        <div>Token:</div><div>{token ? `Present (${token.substring(0, 20)}...)` : 'Missing'}</div>
        <div>Cart Count:</div><div>{cartCount}</div>
      </div>
      <div className="mt-2 space-x-2">
        <button 
          onClick={testLocalStorage}
          className="px-3 py-1 bg-green-500 text-white rounded text-sm"
        >
          Check Storage
        </button>
        <button 
          onClick={() => {
            localStorage.removeItem('alora-token')
            localStorage.removeItem('alora-user')
            window.location.reload()
          }}
          className="px-3 py-1 bg-red-500 text-white rounded text-sm"
        >
          Clear Storage
        </button>
      </div>
    </div>
  )
}