"use client";

import Link from "next/link";
import { useState } from "react";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { cartCount } = useCart();
  const { isAuthenticated, logout } = useAuth();

  return (
    <nav
      className="sticky top-0 z-50 backdrop-blur-md border-b border-gray-200"
      style={{ backgroundColor: "rgb(249, 210, 229)" }}
    >
      <div className="container-custom flex items-center justify-between h-20">
        {/* Centered Navigation with Luminous first */}
        <div className="hidden md:flex items-center justify-center gap-8 flex-1">
          {/* Luminous Logo */}
          <Link
            href="/"
            className="text-3xl font-bold hover:scale-105 transition-transform duration-300"
            style={{
              fontFamily: "'Segoe Script', cursive",
              color: "rgb(255, 112, 183)",
            }}
          >
            Alora Lipgloss
          </Link>

          {/* Navigation Links */}
          <Link
            href="/"
            className="text-sm font-medium text-black hover:text-gray-700 transition-colors"
          >
            Home
          </Link>
          <Link
            href="/shop"
            className="text-sm font-medium text-black hover:text-gray-700 transition-colors"
          >
            Shop
          </Link>
          <Link
            href="/about"
            className="text-sm font-medium text-black hover:text-gray-700 transition-colors"
          >
            About
          </Link>
          <Link
            href="/contact"
            className="text-sm font-medium text-black hover:text-gray-700 transition-colors"
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
          >
            {isOpen ? (
              <X size={20} className="text-black" />
            ) : (
              <Menu size={20} className="text-black" />
            )}
          </button>

          {/* Mobile Logo */}
          <Link
            href="/"
            className="text-2xl font-bold hover:scale-105 transition-transform duration-300"
            style={{
              fontFamily: "'Segoe Script', cursive",
              color: "rgb(255, 112, 183)",
            }}
          >
            Alora Lipgloss
          </Link>

          {/* Mobile Cart */}
          <Link
            href="/cart"
            className="relative p-2 hover:bg-black/10 rounded-lg transition-colors"
          >
            <ShoppingBag size={20} className="text-black" />
            {cartCount > 0 && (
              <span
                className="absolute top-1 right-1 w-4 h-4 text-white text-xs rounded-full flex items-center justify-center"
                style={{ backgroundColor: "rgb(255, 112, 183)" }}
              >
                {cartCount}
              </span>
            )}
          </Link>
        </div>

        {/* Desktop Right Section (Auth + Cart) */}
        <div className="hidden md:flex items-center gap-4">
          {/* User Auth Status */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <button
                onClick={logout}
                className="text-sm font-medium text-black hover:text-gray-700 transition-colors"
              >
                Logout
              </button>
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

          {/* Cart Icon */}
          <Link
            href="/cart"
            className="relative p-2 hover:bg-black/10 rounded-lg transition-colors"
          >
            <ShoppingBag size={20} className="text-black" />
            {cartCount > 0 && (
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

            {/* Mobile Auth Links */}
            <div className="border-t border-gray-300 pt-4">
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="text-sm font-medium text-black hover:text-gray-700 py-2 transition-colors px-4 rounded-lg hover:bg-black/10 w-full text-left"
                >
                  Logout
                </button>
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
                    className="text-sm font-medium text-black hover:text-gray-700 py-2 transition-colors px-4 rounded-lg hover:bg-black/10 block"
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