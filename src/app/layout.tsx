import { AuthProvider } from '@/contexts/AuthContext'
import { CartProvider } from '@/contexts/CartContext'
import { PaymentProvider } from '@/contexts/PaymentContext'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import './globals.css'

export const metadata = {
  title: 'Alora Lip Gloss',
  description: 'Beautiful lip glosses for everyone',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <AuthProvider>
          <CartProvider>
            <PaymentProvider>
              <Navigation />
              <main className="flex-grow">
                {children}
              </main>
              <Footer />
            </PaymentProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}