import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import { CartProvider } from '@/context/CartContext'
import Header from '@/components/Header/Header'
import Footer from '@/components/Footer/Footer'
import AuthModal from '@/components/AuthModal/AuthModal'
import CartDrawer from '@/components/CartDrawer/CartDrawer'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: {
    template: '%s | Un Suspiro Navideño',
    default: 'Un Suspiro Navideño — Artesanías con Amor',
  },
  description: 'Tienda de productos artesanales: fieltro, bisutería, aceites esenciales y decoraciones de temporada. Hechos con amor en México.',
  keywords: ['fieltro', 'artesanías', 'bisutería', 'aceites esenciales', 'navidad', 'halloween', 'handmade'],
  openGraph: {
    title: 'Un Suspiro Navideño — Artesanías con Amor',
    description: 'Tienda de productos artesanales hechos con amor en México',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <CartProvider>
            <Header />
            <main style={{ paddingTop: 'var(--header-height)' }}>
              {children}
            </main>
            <Footer />
            <AuthModal />
            <CartDrawer />
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  fontFamily: 'Inter, sans-serif',
                  borderRadius: '12px',
                  fontSize: '0.9rem',
                },
                success: {
                  iconTheme: { primary: '#E8699A', secondary: '#fff' }
                }
              }}
            />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
