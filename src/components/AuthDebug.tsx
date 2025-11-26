'use client'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'

export default function AuthDebug() {
  const { user, token, isAuthenticated, loading, checkAuth } = useAuth()
  const { cartItems, cartCount, isLoading, error, fetchCart } = useCart()

  const testCart = async () => {
    console.log('=== Testing Cart ===')
    console.log('isAuthenticated:', isAuthenticated)
    console.log('token:', token)
    console.log('user:', user)
    await fetchCart()
  }

  const testLocalStorage = () => {
    console.log('=== Local Storage ===')
    console.log('auth_token:', localStorage.getItem('auth_token'))
    console.log('user:', localStorage.getItem('user'))
  }

  return (
    <div className="p-4 border rounded-lg bg-yellow-50">
      <h3 className="font-bold mb-2">Auth Debug:</h3>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>Loading:</div><div>{loading ? 'Yes' : 'No'}</div>
        <div>Authenticated:</div><div>{isAuthenticated ? 'Yes' : 'No'}</div>
        <div>User Email:</div><div>{user?.email || 'None'}</div>
        <div>Token:</div><div>{token ? `Present (${token.substring(0, 20)}...)` : 'Missing'}</div>
        <div>Cart Error:</div><div>{error || 'None'}</div>
        <div>Cart Count:</div><div>{cartCount}</div>
      </div>
      <div className="mt-2 space-x-2">
        <button 
          onClick={testCart}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
        >
          Test Cart
        </button>
        <button 
          onClick={testLocalStorage}
          className="px-3 py-1 bg-green-500 text-white rounded text-sm"
        >
          Check Storage
        </button>
        <button 
          onClick={() => {
            localStorage.removeItem('auth_token')
            localStorage.removeItem('user')
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