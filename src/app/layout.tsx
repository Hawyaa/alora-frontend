import { Playfair_Display, Inter } from "next/font/google"
import "./globals.css"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"

const playfair = Playfair_Display({ 
  subsets: ["latin"], 
  variable: "--font-serif",
})

const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-sans",
})

export const metadata = {
  title: "Luminous - Luxury Lip Gloss",
  description: "Handcrafted luxury lip gloss for the modern woman",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <head>
        {/* Preload Segoe Script for better performance */}
        <link
          rel="preload"
          href="/fonts/segoe-script.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className="font-sans" style={{ backgroundColor: 'rgb(255, 112, 183)' }}>
        {/* <div className="bg-rose-50 py-4"> */}
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-4xl">
            <p className="text-black text-base font-medium">
              ✨ Free Shipping on Orders Over $50 | 30-Day Money Back Guarantee ✨
            </p>
          </div>
        {/* </div> */}
        <Navigation />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}