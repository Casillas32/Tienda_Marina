'use client'
import { useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Package, ShoppingBag, BarChart3, Settings, ArrowLeft } from 'lucide-react'
import styles from './layout.module.css'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && (!user || profile?.role !== 'admin')) {
      router.push('/')
    }
  }, [user, profile, loading, router])

  if (loading || !user || profile?.role !== 'admin') {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p>Verificando acceso...</p>
      </div>
    )
  }

  const navLinks = [
    { href: '/admin', label: 'Dashboard', icon: BarChart3 },
    { href: '/admin/productos', label: 'Productos', icon: Package },
    { href: '/admin/pedidos', label: 'Pedidos', icon: ShoppingBag },
    { href: '/admin/configuracion', label: 'Configuración', icon: Settings },
  ]

  return (
    <div className={styles.adminLayout}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.sidebarLogo}>
            <span className={styles.logoScript}>Admin</span>
            <span className={styles.logoDisplay}>Panel</span>
          </div>
          <Link href="/" className={styles.backLink}>
            <ArrowLeft size={14} /> Ir a la tienda
          </Link>
        </div>

        <nav className={styles.sidebarNav}>
          {navLinks.map(link => {
            const Icon = link.icon
            const isActive = pathname === link.href || (link.href !== '/admin' && pathname.startsWith(link.href))
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
              >
                <Icon size={18} />
                <span>{link.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className={styles.sidebarUser}>
          <div className={styles.userAvatar}>
            {profile?.full_name?.[0]?.toUpperCase() || 'A'}
          </div>
          <div>
            <p className={styles.userName}>{profile?.full_name || 'Admin'}</p>
            <p className={styles.userRole}>Administradora</p>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className={styles.adminMain}>
        {children}
      </main>
    </div>
  )
}
