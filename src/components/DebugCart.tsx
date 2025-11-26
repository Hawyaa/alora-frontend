'use client'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'

export default function DebugCart() {
  const { cartItems, cartCount, isLoading, error, fetchCart } = useCart()
  const { user, token, isAuthenticated } = useAuth()

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="font-bold mb-2">Debug Cart Info:</h3>
      <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
      <p>User: {user?.email}</p>
      <p>Token: {token ? 'Present' : 'Missing'}</p>
      <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
      <p>Error: {error || 'None'}</p>
      <p>Cart Count: {cartCount}</p>
      <p>Items: {cartItems.length}</p>
      <button 
        onClick={fetchCart}
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Refresh Cart
      </button>
    </div>
  )
}