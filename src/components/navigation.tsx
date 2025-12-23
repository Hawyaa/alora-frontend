// components/navigation.tsx - ADD DEBUG MODE
"use client";

import Link from "next/link";
import { useState } from "react";
import { ShoppingBag, Menu, X, Shield } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { cartItems, isLoading } = useCart();
  const { isAuthenticated, user, logout } = useAuth();

  const isAdmin = user?.role === 'admin';
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Debug function to see cart storage
  const debugCartStorage = () => {
    if (typeof window !== 'undefined') {
      console.log('🔍 CART STORAGE DEBUG:');
      console.log('Cart Items from Context:', cartItems);
      console.log('Cart Count:', cartCount);
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes('cart')) {
          try {
            const value = localStorage.getItem(key);
            console.log(`📦 ${key}:`, value ? JSON.parse(value) : 'empty');
          } catch (e) {
            console.log(`📦 ${key}:`, localStorage.getItem(key));
          }
        }
      }
      
      console.log('alora-token:', localStorage.getItem('alora-token'));
      console.log('alora-user:', localStorage.getItem('alora-user'));
    }
  };

  return (
    <nav
      className="sticky top-0 z-50 backdrop-blur-md border-b border-gray-200"
      style={{ backgroundColor: "rgb(249, 210, 229)" }}
    >
      <div className="container-custom flex items-center justify-between h-20">
        {/* Logo */}
        <div className="flex items-center">
          <Link
            href="/"
            className="text-3xl font-bold hover:scale-105 transition-transform duration-300 ml-[-10px] md:ml-0"
            style={{
              fontFamily: "'Segoe Script', cursive",
              color: "rgb(255, 112, 183)",
            }}
            onClick={() => setIsOpen(false)}
          >
            Alora Lipgloss
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center justify-center gap-8 flex-1">
          <Link
            href="/"
            className="text-sm font-medium text-black hover:text-gray-700 transition-colors"
            style={{ fontFamily: "'Georgia', sans-serif" }}
          >
            Home
          </Link>
          <Link
            href="/shop"
            className="text-sm font-medium text-black hover:text-gray-700 transition-colors"
            style={{ fontFamily: "'Georgia', sans-serif" }}
          >
            Shop
          </Link>
          <Link
            href="/about"
            className="text-sm font-medium text-black hover:text-gray-700 transition-colors"
            style={{ fontFamily: "'Georgia', sans-serif" }}
          >
            About
          </Link>
          <Link
            href="/contact"
            className="text-sm font-medium text-black hover:text-gray-700 transition-colors"
            style={{ fontFamily: "'Georgia', sans-serif" }}
          >
            Contact
          </Link>
         
        </div>

        {/* Mobile Header */}
        <div className="flex md:hidden items-center justify-between w-full">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 hover:bg-black/10 rounded-lg transition-colors"
          >
            {isOpen ? (
              <X size={20} className="text-black" />
            ) : (
              <Menu size={20} className="text-black" />
            )}
          </button>

          <Link
            href="/cart"
            className="relative p-2 hover:bg-black/10 rounded-lg transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <ShoppingBag size={20} className="text-black" />
            {!isLoading && cartCount > 0 && (
              <span
                className="absolute top-1 right-1 w-4 h-4 text-white text-xs rounded-full flex items-center justify-center"
                style={{ backgroundColor: "rgb(255, 112, 183)" }}
              >
                {cartCount}
              </span>
            )}
          </Link>
        </div>

        {/* Desktop Right Section */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-4" style={{ fontFamily: "'Georgia', sans-serif" }}>
          {isAdmin && (
            <Link
              href="/admin"
              className="text-sm font-medium text-black hover:text-gray-700 transition-colors"
            >
              Admin Dashboard
            </Link>
          )}
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-600">
                  Hi, {user?.name?.split(' ')[0] || 'User'}!
                </span>
                <button
                  onClick={logout}
                  className="text-sm font-medium text-black hover:text-gray-700 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-black hover:text-gray-700 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-medium text-black hover:text-gray-700 transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>
          
          <Link
            href="/cart"
            className="relative p-2 hover:bg-black/10 rounded-lg transition-colors"
          >
            <ShoppingBag size={20} className="text-black" />
            {!isLoading && cartCount > 0 && (
              <span
                className="absolute top-1 right-1 w-4 h-4 text-white text-xs rounded-full flex items-center justify-center"
                style={{ backgroundColor: "rgb(255, 112, 183)" }}
              >
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div
          className="md:hidden border-t border-gray-300"
          style={{ backgroundColor: "rgb(249, 210, 229)" }}
        >
          <div className="container-custom py-4 flex flex-col gap-4">
            <Link
              href="/"
              className="text-sm font-medium text-black hover:text-gray-700 py-2 transition-colors px-4 rounded-lg hover:bg-black/10"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/shop"
              className="text-sm font-medium text-black hover:text-gray-700 py-2 transition-colors px-4 rounded-lg hover:bg-black/10"
              onClick={() => setIsOpen(false)}
            >
              Shop
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium text-black hover:text-gray-700 py-2 transition-colors px-4 rounded-lg hover:bg-black/10"
              onClick={() => setIsOpen(false)}
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-sm font-medium text-black hover:text-gray-700 py-2 transition-colors px-4 rounded-lg hover:bg-black/10"
              onClick={() => setIsOpen(false)}
            >
              Contact
            </Link>
            
            {isAdmin && (
              <Link
                href="/admin"
                className="text-sm font-medium text-black hover:text-gray-700 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Shield size={16} className="inline mr-2" />
                Admin Dashboard
              </Link>
            )}

            <div className="border-t border-gray-300 pt-4">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <div className="px-4 text-sm text-gray-600">
                    Logged in as: {user?.name}
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                    }}
                    className="text-sm font-medium text-black hover:text-gray-700 py-2 transition-colors px-4 rounded-lg hover:bg-black/10 w-full text-left"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-sm font-medium text-black hover:text-gray-700 py-2 transition-colors px-4 rounded-lg hover:bg-black/10 block"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="text-sm font-medium text-black hover:text-gray-700 py-2 transition-colors px-4 "
                    onClick={() => setIsOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}