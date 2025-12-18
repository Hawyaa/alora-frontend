// frontend/src/components/navigation.tsx - FIXED

"use client";

import Link from "next/link";
import { useState } from "react";
import { ShoppingBag, Menu, X, Shield } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { cartItems, isLoading } = useCart(); // Changed from cartCount to cartItems
  const { isAuthenticated, user, logout } = useAuth();

  // Check if current user is admin
  const isAdmin = user?.role === 'admin';

  // Calculate cart count from cartItems
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <nav
      className="sticky top-0 z-50 backdrop-blur-md border-b border-gray-200"
      style={{ backgroundColor: "rgb(249, 210, 229)" }}
    >
      <div className="container-custom flex items-center justify-between h-20">
        {/* Logo - Moved to the left */}
        <div className="flex items-center">
          <Link
            href="/"
            className="text-3xl font-bold hover:scale-105 transition-transform duration-300 ml-[-10px] md:ml-0"
            style={{
              fontFamily: "'Segoe Script', cursive",
              color: "rgb(255, 112, 183)",
            }}
          >
            Alora Lipgloss
          </Link>
        </div>

        {/* Desktop Navigation Links - Center aligned */}
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
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 hover:bg-black/10 rounded-lg transition-colors"
            style={{ fontFamily: "'Georgia', sans-serif" }}
          >
            {isOpen ? (
              <X size={20} className="text-black" />
            ) : (
              <Menu size={20} className="text-black" />
            )}
          </button>

          {/* Mobile Cart */}
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

        {/* Desktop Right Section (Auth + Cart + Admin) */}
        <div className="hidden md:flex items-center gap-4">
          {/* User Auth Status */}
          <div className="flex items-center gap-4" style={{ fontFamily: "'Georgia', sans-serif" }}>
          {isAdmin && (
            <Link
              href="/admin"
              className="text-sm font-medium text-black hover:text-gray-700 transition-colors"
              style={{ fontFamily: "'Georgia', sans-serif" }}
            >
              {/* <Shield size={16} /> */}
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
         
          {/* Admin Dashboard Button - GRAY COLOR */}
          {/* Cart Icon */}
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
              style={{ fontFamily: "'Georgia', sans-serif" }}
            >
              Home
            </Link>
            <Link
              href="/shop"
              className="text-sm font-medium text-black hover:text-gray-700 py-2 transition-colors px-4 rounded-lg hover:bg-black/10"
              onClick={() => setIsOpen(false)}
              style={{ fontFamily: "'Georgia', sans-serif" }}
            >
              Shop
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium text-black hover:text-gray-700 py-2 transition-colors px-4 rounded-lg hover:bg-black/10"
              onClick={() => setIsOpen(false)}
              style={{ fontFamily: "'Georgia', sans-serif" }}
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-sm font-medium text-black hover:text-gray-700 py-2 transition-colors px-4 rounded-lg hover:bg-black/10"
              onClick={() => setIsOpen(false)}
              style={{ fontFamily: "'Georgia', sans-serif" }}
            >
              Contact
            </Link>
            {/* Admin Link in Mobile Menu - GRAY COLOR */}
            {isAdmin && (
              <Link
                href="/admin"
                className="text-sm font-medium text-black hover:text-gray-700 transition-colors"
                onClick={() => setIsOpen(false)}
                style={{ fontFamily: "'Georgia', sans-serif" }}
              >
                <Shield size={16} />
                Admin Dashboard
              </Link>
            )}

            {/* Mobile Auth Links */}
            <div className="border-t border-gray-300 pt-4">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <div className="px-4 text-sm text-gray-600" style={{ fontFamily: "'Bahnschrift', sans-serif" }}>
                    Logged in as: {user?.name}
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                    }}
                    className="text-sm font-medium text-black hover:text-gray-700 py-2 transition-colors px-4 rounded-lg hover:bg-black/10 w-full text-left"
                    style={{ fontFamily: "'Georgia', sans-serif" }}
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
                    style={{ fontFamily: "'Georgia', sans-serif" }}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="text-sm font-medium text-black hover:text-gray-700 py-2 transition-colors px-4 "
                    onClick={() => setIsOpen(false)}
                    style={{ fontFamily: "'Georgia', sans-serif" }}
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