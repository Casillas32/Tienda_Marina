'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { ShoppingBag, Menu, X, User, ChevronDown, LogOut, Shield } from 'lucide-react'
import styles from './Header.module.css'

const categories = [
  { name: '🎄 Navidad', slug: 'navidad' },
  { name: '🎃 Halloween', slug: 'halloween' },
  { name: '💎 Bisutería', slug: 'bisuteria' },
  { name: '🌿 Aceites', slug: 'aceites' },
  { name: '✨ Otros', slug: 'otros' },
]

export default function Header() {
  const { user, profile, signOut, setShowAuthModal, isAdmin } = useAuth()
  const { totalItems, setIsCartOpen } = useCart()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <div className={`container ${styles.inner}`}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <span className={styles.logoScript}>Un Suspiro</span>
          <span className={styles.logoDisplay}>Navideño</span>
        </Link>

        {/* Desktop Nav */}
        <nav className={styles.nav}>
          <Link href="/" className={styles.navLink}>Inicio</Link>
          <div className={styles.dropdown}>
            <button className={styles.navLink}>
              Categorías <ChevronDown size={14} />
            </button>
            <div className={styles.dropdownMenu}>
              {categories.map(cat => (
                <Link key={cat.slug} href={`/categoria/${cat.slug}`} className={styles.dropdownItem}>
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
          <Link href="/contacto" className={styles.navLink}>Contacto</Link>
        </nav>

        {/* Actions */}
        <div className={styles.actions}>
          {/* Cart Button */}
          <button
            id="cart-button"
            className={styles.iconBtn}
            onClick={() => setIsCartOpen(true)}
            aria-label="Carrito de compras"
          >
            <ShoppingBag size={22} />
            {totalItems > 0 && (
              <span className={styles.cartBadge}>{totalItems}</span>
            )}
          </button>

          {/* User */}
          {user ? (
            <div className={styles.userMenu}>
              <button
                className={styles.userBtn}
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <div className={styles.avatar}>
                  {profile?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                </div>
                <ChevronDown size={14} />
              </button>
              {userMenuOpen && (
                <div className={styles.userDropdown}>
                  <div className={styles.userInfo}>
                    <span className={styles.userName}>{profile?.full_name || 'Usuario'}</span>
                    <span className={styles.userEmail}>{user.email}</span>
                  </div>
                  {isAdmin && (
                    <Link href="/admin" className={styles.dropdownItem} onClick={() => setUserMenuOpen(false)}>
                      <Shield size={15} /> Panel Admin
                    </Link>
                  )}
                  <button
                    className={`${styles.dropdownItem} ${styles.signOutBtn}`}
                    onClick={() => { signOut(); setUserMenuOpen(false) }}
                  >
                    <LogOut size={15} /> Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              id="login-button"
              className="btn btn-primary btn-sm"
              onClick={() => setShowAuthModal(true)}
            >
              <User size={15} /> Ingresar
            </button>
          )}

          {/* Mobile toggle */}
          <button
            className={styles.mobileToggle}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menú"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className={styles.mobileMenu}>
          <Link href="/" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>Inicio</Link>
          <div className={styles.mobileCategoryTitle}>Categorías</div>
          {categories.map(cat => (
            <Link key={cat.slug} href={`/categoria/${cat.slug}`} className={styles.mobileLink} onClick={() => setMobileOpen(false)}>
              {cat.name}
            </Link>
          ))}
          <Link href="/contacto" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>Contacto</Link>
          {!user && (
            <button className={`btn btn-primary ${styles.mobileAuthBtn}`} onClick={() => { setShowAuthModal(true); setMobileOpen(false) }}>
              Iniciar sesión / Registrarse
            </button>
          )}
        </div>
      )}
    </header>
  )
}
