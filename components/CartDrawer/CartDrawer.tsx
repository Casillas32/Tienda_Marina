'use client'
import { useCart } from '@/context/CartContext'
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import styles from './CartDrawer.module.css'

export default function CartDrawer() {
  const { items, isCartOpen, setIsCartOpen, removeItem, updateQuantity, totalPrice, totalItems, clearCart } = useCart()

  if (!isCartOpen) return null

  return (
    <>
      <div className="overlay" onClick={() => setIsCartOpen(false)} />
      <div className={styles.drawer} role="dialog" aria-label="Carrito de compras">
        {/* Header */}
        <div className={styles.drawerHeader}>
          <div className={styles.headerLeft}>
            <ShoppingBag size={20} />
            <h2 className={styles.drawerTitle}>Mi carrito</h2>
            {totalItems > 0 && <span className={styles.itemCount}>{totalItems}</span>}
          </div>
          <button className={styles.closeBtn} onClick={() => setIsCartOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className={styles.items}>
          {items.length === 0 ? (
            <div className={styles.empty}>
              <span className={styles.emptyIcon}>🛒</span>
              <p className={styles.emptyTitle}>Tu carrito está vacío</p>
              <p className={styles.emptySubtitle}>Agrega productos para comenzar</p>
              <button
                className="btn btn-primary"
                onClick={() => setIsCartOpen(false)}
              >
                Explorar productos
              </button>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className={styles.item}>
                <div className={styles.itemImage}>
                  {item.image ? (
                    <Image src={item.image} alt={item.name} width={72} height={72} style={{ objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />
                  ) : (
                    <div className={styles.imagePlaceholder}>🎀</div>
                  )}
                </div>
                <div className={styles.itemDetails}>
                  <p className={styles.itemName}>{item.name}</p>
                  <p className={styles.itemPrice}>${item.price.toFixed(2)}</p>
                  <div className={styles.qtyControl}>
                    <button
                      className={styles.qtyBtn}
                      onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                    >
                      <Minus size={12} />
                    </button>
                    <span className={styles.qty}>{item.quantity}</span>
                    <button
                      className={styles.qtyBtn}
                      onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
                <div className={styles.itemRight}>
                  <p className={styles.itemTotal}>${(item.price * item.quantity).toFixed(2)}</p>
                  <button
                    className={styles.removeBtn}
                    onClick={() => removeItem(item.product_id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className={styles.drawerFooter}>
            <div className={styles.subtotal}>
              <span>Subtotal</span>
              <span className={styles.subtotalPrice}>${totalPrice.toFixed(2)}</span>
            </div>
            <p className={styles.shippingNote}>🚚 Costo de envío calculado al finalizar</p>
            <Link
              href="/checkout"
              className={`btn btn-primary btn-lg ${styles.checkoutBtn}`}
              onClick={() => setIsCartOpen(false)}
              id="proceed-to-checkout"
            >
              Proceder al pago
            </Link>
            <button
              className={styles.clearBtn}
              onClick={clearCart}
            >
              Vaciar carrito
            </button>
          </div>
        )}
      </div>
    </>
  )
}
