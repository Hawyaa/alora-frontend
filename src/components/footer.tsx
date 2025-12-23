import Link from "next/link"
import { Instagram, Facebook } from "lucide-react"

// TikTok Icon Component
const TikTokIcon = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
  </svg>
)

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
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 bg-white/80 rounded-full hover:bg-white transition-colors shadow-sm hover:scale-110 transition-transform duration-200"
              aria-label="Visit our Instagram"
            >
              <Instagram size={20} className="text-black" />
            </a>
            <a 
              href="https://facebook.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 bg-white/80 rounded-full hover:bg-white transition-colors shadow-sm hover:scale-110 transition-transform duration-200"
              aria-label="Visit our Facebook"
            >
              <Facebook size={20} className="text-black" />
            </a>
            <a 
              href="https://tiktok.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 bg-white/80 rounded-full hover:bg-white transition-colors shadow-sm hover:scale-110 transition-transform duration-200"
              aria-label="Visit our TikTok"
            >
              <TikTokIcon size={20} className="text-black" />
            </a>
          </div>
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