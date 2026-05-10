'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Package, ShoppingBag, Plus, TrendingUp } from 'lucide-react'
import styles from './page.module.css'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, pending: 0, revenue: 0 })
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      const [{ count: products }, { data: orders }] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('active', true),
        supabase.from('orders').select('id, status, total, customer_name, created_at').order('created_at', { ascending: false }).limit(5),
      ])

      const allOrders = orders || []
      const pending = allOrders.filter((o: any) => o.status === 'pending' || o.status === 'payment_submitted').length
      const revenue = allOrders.reduce((s: number, o: any) => s + parseFloat(o.total || 0), 0)

      setStats({ products: products || 0, orders: allOrders.length, pending, revenue })
      setRecentOrders(allOrders)
      setLoading(false)
    }
    loadStats()
  }, [])

  const statusLabel: Record<string, { label: string; color: string }> = {
    pending: { label: 'Pendiente', color: '#FF9800' },
    payment_submitted: { label: 'Comprobante enviado', color: '#2196F3' },
    payment_verified: { label: 'Pago verificado', color: '#4CAF50' },
    shipped: { label: 'Enviado', color: '#9C27B0' },
    delivered: { label: 'Entregado', color: '#4CAF50' },
    cancelled: { label: 'Cancelado', color: '#F44336' },
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>Bienvenida a tu panel de administración 💕</p>
        </div>
        <Link href="/admin/productos/nuevo" className="btn btn-primary">
          <Plus size={16} /> Nuevo producto
        </Link>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        {[
          { icon: Package, label: 'Productos activos', value: stats.products, color: '#E8699A', bg: 'rgba(232,105,154,0.1)' },
          { icon: ShoppingBag, label: 'Pedidos totales', value: stats.orders, color: '#5BBFB5', bg: 'rgba(91,191,181,0.1)' },
          { icon: TrendingUp, label: 'Pedidos pendientes', value: stats.pending, color: '#FF9800', bg: 'rgba(255,152,0,0.1)' },
          { icon: TrendingUp, label: 'Ingresos (recientes)', value: `$${stats.revenue.toFixed(0)}`, color: '#7C4DFF', bg: 'rgba(124,77,255,0.1)' },
        ].map(stat => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className={styles.statCard}>
              <div className={styles.statIcon} style={{ background: stat.bg, color: stat.color }}>
                <Icon size={22} />
              </div>
              <div>
                <p className={styles.statValue}>{loading ? '—' : stat.value}</p>
                <p className={styles.statLabel}>{stat.label}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Acciones rápidas</h2>
        <div className={styles.actionsGrid}>
          <Link href="/admin/productos/nuevo" className={styles.actionCard}>
            <span className={styles.actionIcon}>📦</span>
            <div>
              <p className={styles.actionTitle}>Subir nuevo producto</p>
              <p className={styles.actionDesc}>Agrega un producto con fotos, precio y stock</p>
            </div>
          </Link>
          <Link href="/admin/pedidos" className={styles.actionCard}>
            <span className={styles.actionIcon}>📋</span>
            <div>
              <p className={styles.actionTitle}>Ver pedidos</p>
              <p className={styles.actionDesc}>Gestiona y actualiza el estado de los pedidos</p>
            </div>
          </Link>
          <Link href="/admin/productos" className={styles.actionCard}>
            <span className={styles.actionIcon}>✏️</span>
            <div>
              <p className={styles.actionTitle}>Gestionar productos</p>
              <p className={styles.actionDesc}>Edita precios, stock y visibilidad</p>
            </div>
          </Link>
          <Link href="/admin/configuracion" className={styles.actionCard}>
            <span className={styles.actionIcon}>⚙️</span>
            <div>
              <p className={styles.actionTitle}>Configuración</p>
              <p className={styles.actionDesc}>Datos bancarios, costo de envío, etc.</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Orders */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Pedidos recientes</h2>
          <Link href="/admin/pedidos" className={styles.seeAll}>Ver todos →</Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className={styles.emptyOrders}>
            <span>📦</span>
            <p>Aún no hay pedidos</p>
          </div>
        ) : (
          <div className={styles.ordersTable}>
            <div className={styles.tableHeader}>
              <span>Cliente</span>
              <span>Total</span>
              <span>Estado</span>
              <span>Fecha</span>
            </div>
            {recentOrders.map(order => (
              <div key={order.id} className={styles.tableRow}>
                <span className={styles.customerName}>{order.customer_name}</span>
                <span className={styles.orderTotal}>${parseFloat(order.total).toFixed(2)}</span>
                <span className={styles.orderStatus} style={{ color: statusLabel[order.status]?.color }}>
                  {statusLabel[order.status]?.label || order.status}
                </span>
                <span className={styles.orderDate}>
                  {new Date(order.created_at).toLocaleDateString('es-MX')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
