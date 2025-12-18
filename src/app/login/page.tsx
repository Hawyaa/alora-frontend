'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  // Check for pending cart items after login
  useEffect(() => {
    if (isAuthenticated) {
      const pendingItem = localStorage.getItem('pending-cart-item');
      
      if (pendingItem) {
        try {
          const product = JSON.parse(pendingItem);
          // Create cart item in the correct format
          const cartItem = {
            productId: product.id || product._id || String(Date.now()),
            name: product.name || 'Product',
            price: product.price || 0,
            image: product.image || '',
            quantity: 1, // Hardcoded to 1 for pending items
            shade: product.shade || 'default'
          };
          
          console.log('Would add to cart:', cartItem);
          // Temporarily disabled - fix CartContext signature first
          // addToCart(cartItem);
          
          alert(`✅ ${product.name || 'Item'} would be added to your cart!`);
          localStorage.removeItem('pending-cart-item');
        } catch (error) {
          console.error('Error restoring cart item:', error);
        }
      }
      
      // Redirect to shop or previous page
      router.push('/shop');
    }
  }, [isAuthenticated, addToCart, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
  
    try {
      // Call login and get result
      const result = await login(email, password);
      
      console.log('Login result:', result);
      
      if (result.success) {
        // Login successful - useEffect will handle redirect
        console.log('✅ Login successful for:', email);
      } else {
        // Login failed - show error
        setError(result.error || 'Login failed. Please check your credentials.');
      }
    } catch (err: any) {
      // This catches network errors only
      setError(err.message || 'Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[rgb(249,210,229)] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-transparent"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-transparent"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-pink-500 text-white py-3 rounded-lg font-medium hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link href="/register" className="text-pink-500 hover:text-pink-600 font-medium">
              Sign up
            </Link>
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}