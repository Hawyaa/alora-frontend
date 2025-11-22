"use client"

import { useState } from "react"
import { Mail, Phone, MapPin, Send, Instagram, Facebook, Twitter } from "lucide-react"

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

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
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
    alert("Thank you for your message! We'll get back to you soon.")
    setFormData({ name: "", email: "", subject: "", message: "" })
  }

  return (
    <div className="min-h-screen bg-[rgb(249,210,229)]">
      {/* Hero */}
      <div className="bg-gradient-to-b from-[rgb(249,210,229)] to-[rgb(249,210,229)] py-16">
        <div className="container-custom text-center">
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get in touch with us - we'd love to hear from you!
          </p>
        </div>
      </div>

      {/* Contact Section */}
      <div className="container-custom py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-serif font-bold text-gray-900 mb-6">Let's Connect</h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                Have questions about our products? Need help with your order? 
                We're here to help! Reach out to us and we'll get back to you as soon as possible.
              </p>
            </div>

            {/* Contact Methods */}
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-white p-3 rounded-full shadow-lg">
                  <Mail size={24} className="text-pink-500" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">Email Us</h3>
                  <p className="text-gray-600">hello@aloralipgloss.com</p>
                  <p className="text-gray-500 text-sm">We'll respond within 24 hours</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-white p-3 rounded-full shadow-lg">
                  <Phone size={24} className="text-pink-500" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">Call Us</h3>
                  <p className="text-gray-600">+1 (555) 123-ALORA</p>
                  <p className="text-gray-500 text-sm">Mon-Fri from 9am to 6pm EST</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-white p-3 rounded-full shadow-lg">
                  <MapPin size={24} className="text-pink-500" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">Visit Us</h3>
                  <p className="text-gray-600">123 Beauty Avenue</p>
                  <p className="text-gray-600">Cosmetic City, CC 12345</p>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Follow Us</h3>
              <div className="flex gap-4">
                {[
                  { icon: Instagram, href: "#", label: "Instagram" },
                  { icon: Facebook, href: "#", label: "Facebook" },
                  { icon: Twitter, href: "#", label: "Twitter" },
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
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <h3 className="text-2xl font-serif font-bold text-gray-900 mb-6">Send us a Message</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                  placeholder="What's this regarding?"
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
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="Tell us how we can help you..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-pink-500 text-white py-4 px-6 rounded-lg font-semibold hover:bg-pink-600 transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <Send size={20} />
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}