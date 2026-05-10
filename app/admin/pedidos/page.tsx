'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Eye, CheckCircle, XCircle, Package } from 'lucide-react'
import toast from 'react-hot-toast'
import styles from './page.module.css'

const STATUS_OPTIONS = [
  { value: 'pending', label: '⏳ Pendiente', color: '#FF9800' },
  { value: 'payment_submitted', label: '📎 Comprobante enviado', color: '#2196F3' },
  { value: 'payment_verified', label: '✅ Pago verificado', color: '#4CAF50' },
  { value: 'shipped', label: '🚚 Enviado', color: '#9C27B0' },
  { value: 'delivered', label: '📦 Entregado', color: '#4CAF50' },
  { value: 'cancelled', label: '❌ Cancelado', color: '#F44336' },
]

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any | null>(null)
  const [filter, setFilter] = useState('all')

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
    setOrders(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchOrders() }, [])

  const updateStatus = async (orderId: string, status: string) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId)
    if (error) toast.error('Error al actualizar')
    else {
      toast.success('Estado actualizado')
      fetchOrders()
      if (selected?.id === orderId) setSelected((s: any) => ({ ...s, status }))
    }
  }

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  const getStatus = (status: string) => STATUS_OPTIONS.find(s => s.value === status)

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Pedidos</h1>
          <p className={styles.subtitle}>{orders.length} pedidos en total</p>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filterTabs}>
        <button className={`${styles.filterTab} ${filter === 'all' ? styles.filterTabActive : ''}`} onClick={() => setFilter('all')}>
          Todos ({orders.length})
        </button>
        {STATUS_OPTIONS.slice(0, 3).map(s => (
          <button
            key={s.value}
            className={`${styles.filterTab} ${filter === s.value ? styles.filterTabActive : ''}`}
            onClick={() => setFilter(s.value)}
          >
            {s.label} ({orders.filter(o => o.status === s.value).length})
          </button>
        ))}
      </div>

      <div className={styles.layout}>
        {/* Orders list */}
        <div className={styles.ordersList}>
          {loading ? (
            <div className={styles.loading}><div className={styles.spinner} /></div>
          ) : filtered.length === 0 ? (
            <div className={styles.empty}><Package size={40} /><p>No hay pedidos</p></div>
          ) : (
            filtered.map(order => {
              const status = getStatus(order.status)
              return (
                <div
                  key={order.id}
                  className={`${styles.orderCard} ${selected?.id === order.id ? styles.orderCardSelected : ''}`}
                  onClick={() => setSelected(order)}
                >
                  <div className={styles.orderCardHeader}>
                    <span className={styles.orderCustomer}>{order.customer_name}</span>
                    <span className={styles.orderPrice}>${parseFloat(order.total).toFixed(2)}</span>
                  </div>
                  <div className={styles.orderCardMeta}>
                    <span className={styles.orderStatusBadge} style={{ color: status?.color }}>
                      {status?.label}
                    </span>
                    <span className={styles.orderDate}>
                      {new Date(order.created_at).toLocaleDateString('es-MX')}
                    </span>
                  </div>
                  <p className={styles.orderEmail}>{order.customer_email}</p>
                </div>
              )
            })
          )}
        </div>

        {/* Order detail */}
        <div className={styles.orderDetail}>
          {selected ? (
            <div className={styles.detailCard}>
              <div className={styles.detailHeader}>
                <h2 className={styles.detailTitle}>Pedido #{selected.id.slice(-8).toUpperCase()}</h2>
                <span className={styles.detailDate}>{new Date(selected.created_at).toLocaleString('es-MX')}</span>
              </div>

              {/* Customer info */}
              <div className={styles.detailSection}>
                <h3 className={styles.detailSectionTitle}>👤 Cliente</h3>
                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailKey}>Nombre</span>
                    <span className={styles.detailValue}>{selected.customer_name}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailKey}>Email</span>
                    <span className={styles.detailValue}>{selected.customer_email}</span>
                  </div>
                  {selected.customer_phone && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailKey}>Teléfono</span>
                      <span className={styles.detailValue}>{selected.customer_phone}</span>
                    </div>
                  )}
                  {selected.shipping_address && (
                    <div className={`${styles.detailItem} ${styles.detailFull}`}>
                      <span className={styles.detailKey}>Dirección</span>
                      <span className={styles.detailValue}>{selected.shipping_address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Items */}
              <div className={styles.detailSection}>
                <h3 className={styles.detailSectionTitle}>📦 Productos</h3>
                {(selected.items || []).map((item: any, i: number) => (
                  <div key={i} className={styles.orderItem}>
                    <span className={styles.orderItemName}>{item.product_name}</span>
                    <span className={styles.orderItemQty}>x{item.quantity}</span>
                    <span className={styles.orderItemPrice}>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className={styles.orderTotals}>
                  <div className={styles.orderTotalRow}>
                    <span>Envío</span>
                    <span>${parseFloat(selected.shipping_cost || 0).toFixed(2)}</span>
                  </div>
                  <div className={`${styles.orderTotalRow} ${styles.orderTotalFinal}`}>
                    <span>Total</span>
                    <span>${parseFloat(selected.total).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Payment proof */}
              {selected.payment_proof_url && (
                <div className={styles.detailSection}>
                  <h3 className={styles.detailSectionTitle}>📎 Comprobante de pago</h3>
                  <a href={selected.payment_proof_url} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
                    <Eye size={14} /> Ver comprobante
                  </a>
                </div>
              )}

              {/* Status update */}
              <div className={styles.detailSection}>
                <h3 className={styles.detailSectionTitle}>⚡ Actualizar estado</h3>
                <div className={styles.statusButtons}>
                  {STATUS_OPTIONS.map(s => (
                    <button
                      key={s.value}
                      className={`${styles.statusBtn} ${selected.status === s.value ? styles.statusBtnActive : ''}`}
                      onClick={() => updateStatus(selected.id, s.value)}
                      style={selected.status === s.value ? { borderColor: s.color, color: s.color, background: `${s.color}18` } : {}}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {selected.notes && (
                <div className={styles.detailSection}>
                  <h3 className={styles.detailSectionTitle}>📝 Notas</h3>
                  <p className={styles.notes}>{selected.notes}</p>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.noSelection}>
              <Package size={40} />
              <p>Selecciona un pedido para ver los detalles</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
