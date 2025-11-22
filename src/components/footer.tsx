import Link from "next/link"
import { Instagram, Twitter, Facebook } from "lucide-react"

// Add 'export default' here
export default function Footer() {
  return (
    <footer className="py-8 text-black" style={{ backgroundColor: 'rgb(249, 210, 229)' }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          {/* Brand */}
          <div className="mb-6">
            <h3 className="text-3xl font-bold mb-4" style={{ fontFamily: "'Segoe Script', cursive" }}>
              Alora Lipgloss
            </h3>
            <p className="text-black/80 max-w-md mx-auto">
              Discover the perfect lip gloss that enhances your natural beauty.
            </p>
          </div>

          {/* Social Media */}
          <div className="flex gap-4 mb-6">
            <a href="#" className="p-2 bg-white/80 rounded-full hover:bg-white transition-colors shadow-sm">
              <Instagram size={20} className="text-black" />
            </a>
            <a href="#" className="p-2 bg-white/80 rounded-full hover:bg-white transition-colors shadow-sm">
              <Facebook size={20} className="text-black" />
            </a>
            <a href="#" className="p-2 bg-white/80 rounded-full hover:bg-white transition-colors shadow-sm">
              <Twitter size={20} className="text-black" />
            </a>
          </div>

          {/* Copyright */}
          <div className="border-t border-black/30 w-full pt-6">
            <p className="text-black/80">
              © 2025 Alora Lipgloss. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}