// components/DebugCart.tsx
'use client'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'

export default function DebugCart() {
  const { cartItems, cartTotal, clearCart, isLoading } = useCart()
  const { user, isAuthenticated, logout } = useAuth()

  const showAllCarts = () => {
    if (typeof window === 'undefined') return;
    
    console.log('🔍 CART DEBUG INFORMATION:');
    console.log('Current User:', user);
    console.log('Authenticated:', isAuthenticated);
    console.log('Cart Items:', cartItems.length);
    console.log('Cart Total:', cartTotal);
    
    console.log('\n📦 LOCAL STORAGE:');
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes('cart')) {
        try {
          const value = localStorage.getItem(key);
          const parsed = value ? JSON.parse(value) : null;
          console.log(`  ${key}:`, parsed ? `${parsed.length} items` : 'empty');
        } catch (e) {
          console.log(`  ${key}: Error parsing`);
        }
      }
    }
    
    console.log('\n🔑 AUTH STORAGE:');
    console.log('alora-token:', localStorage.getItem('alora-token'));
    console.log('alora-user:', localStorage.getItem('alora-user'));
    
    alert('Debug info logged to console! Check console for details.');
  }

  const clearAllCartStorage = () => {
    if (typeof window !== 'undefined') {
      // Clear all cart-related storage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes('cart')) {
          localStorage.removeItem(key);
          console.log(`Removed: ${key}`);
        }
      }
      
      // Also clear legacy key
      localStorage.removeItem('alora-cart');
      
      alert('All cart storage cleared!');
      window.location.reload(); // Refresh page
    }
  }

  const cleanupOldCarts = () => {
    if (typeof window === 'undefined') return;
    
    const currentUser = user?.id || user?.email || 'guest';
    const currentCartKey = `alora-cart-${currentUser}`;
    
    console.log('🧹 Manually cleaning up old carts...');
    console.log('Keeping:', currentCartKey);
    
    let removedCount = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('alora-cart-') && key !== currentCartKey) {
        localStorage.removeItem(key);
        console.log('🗑️ Removed:', key);
        removedCount++;
      }
    }
    
    alert(`Removed ${removedCount} old carts. Only current user's cart remains.`);
    window.location.reload(); // Refresh page
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white p-4 rounded-lg shadow-lg border max-w-xs">
      <h3 className="font-bold mb-2 text-sm flex items-center gap-2">
        <span>🛒</span> 
        <span>Cart Debug</span>
        {isLoading && <span className="text-xs text-blue-500">(Loading...)</span>}
      </h3>
      
      <div className="space-y-1 text-xs mb-3">
        <div className="flex justify-between">
          <span className="text-gray-600">User:</span>
          <span className="font-medium">{user?.email || 'Guest'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Items:</span>
          <span className="font-medium">{cartItems.length}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Total:</span>
          <span className="font-medium">${cartTotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Auth:</span>
          <span className={`font-medium ${isAuthenticated ? 'text-green-600' : 'text-red-600'}`}>
            {isAuthenticated ? '✓' : '✗'}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-1 mt-2">
        <button 
          onClick={() => window.location.reload()}
          className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
          title="Refresh page"
        >
          Refresh Page
        </button>
        <button 
          onClick={clearCart}
          className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
          title="Clear current cart"
        >
          Clear Cart
        </button>
        <button 
          onClick={showAllCarts}
          className="px-2 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600 col-span-2"
          title="Show all cart storage in console"
        >
          Show Storage
        </button>
        <button 
          onClick={cleanupOldCarts}
          className="px-2 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600"
          title="Remove old user carts"
        >
          Clean Old Carts
        </button>
        <button 
          onClick={clearAllCartStorage}
          className="px-2 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600"
          title="Clear ALL cart storage"
        >
          Clear All
        </button>
        {isAuthenticated && (
          <button 
            onClick={logout}
            className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
            title="Logout current user"
          >
            Logout
          </button>
        )}
      </div>
      
      {cartItems.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-200">
          <p className="text-[10px] text-gray-500">
            Items: {cartItems.map(item => `${item.name} (${item.quantity})`).join(', ')}
          </p>
        </div>
      )}
    </div>
  )
}