"use client"

import { useState } from "react"
import { Phone, Send, Instagram, Facebook, MessageCircle } from "lucide-react"

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
              <MessageCircle size={20} className="text-black" />
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

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    message: ""
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here
    console.log("Form submitted:", formData)
    alert("Thank you for your message! We'll contact you soon.")
    setFormData({ name: "", phone: "", message: "" })
  }

  return (
    <div className="min-h-screen bg-[rgb(249,210,229)]">
      {/* Hero */}
      <div className="bg-gradient-to-b from-[rgb(249,210,229)] to-[rgb(249,210,229)] py-8">
        <div className="container-custom text-center">
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get in touch - we're here to help!
          </p>
        </div>
      </div>

      {/* Contact Section */}
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div className="space-y-6">
            <div>
              <h2 className="text-4xl font-serif font-bold text-gray-900 mb-4">Let's Connect</h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                Questions about our products? Need help with your order? 
                Contact us directly!
              </p>
            </div>

            {/* Contact Methods */}
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="bg-white p-3 rounded-full shadow-lg">
                  <Phone size={24} className="text-pink-500" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">Call Us</h3>
                  <a href="tel:+1234567890" className="text-gray-600 hover:text-gray-900 text-lg">
                    +251900357453
                  </a>
                  <p className="text-gray-500 text-sm">Available 9am-6pm</p>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Follow & DM Us</h3>
              <div className="flex gap-4">
                {[
                  { icon: MessageCircle, href: "#", label: "TikTok" },
                  { icon: Instagram, href: "#", label: "Instagram" },
                  { icon: Facebook, href: "#", label: "Facebook" },
                ].map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    className="bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                    aria-label={social.label}
                  >
                    <social.icon size={20} className="text-gray-700" />
                  </a>
                ))}
              </div>
              <p className="text-gray-600 mt-3">
                Send us a DM - we respond quickly!
              </p>
            </div>
          </div>

          {/* Simple Contact Form */}
          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <h3 className="text-2xl font-serif font-bold text-gray-900 mb-4">Quick Message</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                  placeholder="Your phone number"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="How can we help you?"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-rose-400 to-pink-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-pink-600 transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <Send size={20} />
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}