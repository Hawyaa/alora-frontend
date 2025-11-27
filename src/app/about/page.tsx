import Image from "next/image"
import { Instagram, Facebook, Twitter } from "lucide-react"

function Footer() {
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

export default function About() {
  return (
    <div className="min-h-screen bg-[rgb(249,210,229)]">
      {/* Hero - Reduced spacing */}
      <div className="bg-gradient-to-b from-[rgb(249,210,229)] to-[rgb(249,210,229)] py-8">
        <div className="container-custom text-center">
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 mb-4">About Luminous</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Crafting premium lip gloss with passion and purpose</p>
        </div>
      </div>

      {/* Story - Reduced spacing */}
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-12">
          <div>
            <h2 className="text-4xl font-serif font-bold text-gray-900 mb-4">Our Story</h2>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Luminous was founded with a simple mission: to create beauty products that make you feel confident,
              radiant, and beautiful.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Every product is handcrafted with premium, natural ingredients and tested to ensure the highest quality
              standards.
            </p>
          </div>
          <div className="relative h-80 rounded-lg overflow-hidden">
            <Image 
              src="https://i.pinimg.com/1200x/66/85/54/66855474f149bbf745f128b890104834.jpg" 
              alt="Our Story" 
              fill 
              className="object-cover" 
            />
          </div>
        </div>

        {/* Values - Reduced spacing */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Quality",
              description: "Premium ingredients and meticulous craftsmanship in every product",
            },
            {
              title: "Sustainability",
              description: "Eco-friendly packaging and ethical sourcing practices",
            },
            {
              title: "Inclusivity",
              description: "Beauty products for everyone, celebrating all skin tones",
            },
          ].map((value, idx) => (
            <div key={idx} className="text-center bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-2xl font-serif font-bold text-gray-900 mb-3">{value.title}</h3>
              <p className="text-gray-600">{value.description}</p>
            </div>
          ))}
        </div>
      </div>
     
    </div>
  )
}