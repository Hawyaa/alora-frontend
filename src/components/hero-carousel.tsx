"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"

const slides = [
  {
    title: "Be Bold, Be Luminous",
    subtitle: "Premium lip gloss handmade with love",
    image: "/api/placeholder/1920/1080",
    cta: "Shop Now"
  },
  {
    title: "Radiant Shine",
    subtitle: "Long-lasting color that turns heads",
    image: "/api/placeholder/1920/1080", 
    cta: "Discover"
  },
  {
    title: "Natural Beauty",
    subtitle: "Made with premium, natural ingredients",
    image: "/api/placeholder/1920/1080",
    cta: "Explore"
  },
]

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const next = () => setCurrent((prev) => (prev + 1) % slides.length)
  const prev = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length)

  return (
    <div className="relative h-screen overflow-hidden">
      {/* Slides */}
      {slides.map((slide, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            idx === current ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Background with gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-black/30" />
          
          {/* Background pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-rose-400/20 to-pink-600/20" />
          
          {/* Text Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4">
            <div className="max-w-4xl">
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold mb-6 text-balance leading-tight">
                {slide.title}
              </h1>
              <p className="text-xl md:text-2xl lg:text-3xl font-light mb-8 max-w-2xl mx-auto">
                {slide.subtitle}
              </p>
              <button className="bg-white text-gray-900 px-8 py-4 rounded-lg font-medium hover:bg-gray-100 transition-colors text-lg">
                {slide.cta}
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Buttons */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/20 hover:bg-white/40 rounded-full transition-colors backdrop-blur-sm"
      >
        <ChevronLeft size={28} className="text-white" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/20 hover:bg-white/40 rounded-full transition-colors backdrop-blur-sm"
      >
        <ChevronRight size={28} className="text-white" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-3">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              idx === current ? "bg-white scale-125" : "bg-white/50 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </div>
  )
}