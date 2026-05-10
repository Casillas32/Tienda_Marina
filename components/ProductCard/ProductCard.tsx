'use client'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingBag, Heart, Eye } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import styles from './ProductCard.module.css'
import { useState } from 'react'

type Product = {
  id: string
  name: string
  slug: string
  price: number
  images: string[]
  stock: number
  category?: { name: string; slug: string }
  featured?: boolean
  customizable?: boolean
}

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart()
  const [wishlisted, setWishlisted] = useState(false)
  const [imgError, setImgError] = useState(false)
  const image = !imgError && product.images?.[0] ? product.images[0] : null

  const handleAddToCart = () => {
    addItem({
      product_id: product.id,
      name: product.name,
      price: product.price,
      image: image || '',
      stock: product.stock,
      slug: product.slug,
    })
  }

  return (
    <div className={styles.card} id={`product-${product.slug}`}>
      {/* Image */}
      <div className={styles.imageWrapper}>
        <Link href={`/producto/${product.slug}`}>
          {image ? (
            <Image
              src={image}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              style={{ objectFit: 'cover' }}
              onError={() => setImgError(true)}
            />
          ) : (
            <div className={styles.imagePlaceholder}>
              <span>🎀</span>
            </div>
          )}
        </Link>

        {/* Badges */}
        <div className={styles.badges}>
          {product.featured && <span className={`${styles.badge} ${styles.badgeFeatured}`}>⭐ Destacado</span>}
          {product.customizable && <span className={`${styles.badge} ${styles.badgeCustom}`}>✏️ Personalizable</span>}
          {product.stock === 0 && <span className={`${styles.badge} ${styles.badgeSoldOut}`}>Agotado</span>}
        </div>

        {/* Quick actions */}
        <div className={styles.quickActions}>
          <button
            className={`${styles.actionBtn} ${wishlisted ? styles.actionBtnActive : ''}`}
            onClick={() => setWishlisted(!wishlisted)}
            aria-label="Favorito"
          >
            <Heart size={16} fill={wishlisted ? 'currentColor' : 'none'} />
          </button>
          <Link href={`/producto/${product.slug}`} className={styles.actionBtn} aria-label="Ver producto">
            <Eye size={16} />
          </Link>
        </div>
      </div>

      {/* Info */}
      <div className={styles.info}>
        {product.category && (
          <Link href={`/categoria/${product.category.slug}`} className={styles.category}>
            {product.category.name}
          </Link>
        )}
        <Link href={`/producto/${product.slug}`}>
          <h3 className={styles.name}>{product.name}</h3>
        </Link>
        <div className={styles.footer}>
          <span className={styles.price}>${product.price.toFixed(2)}</span>
          <button
            id={`add-to-cart-${product.slug}`}
            className={`btn btn-primary btn-sm ${styles.addBtn}`}
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            <ShoppingBag size={14} />
            {product.stock === 0 ? 'Agotado' : 'Agregar'}
          </button>
        </div>
      </div>
    </div>
  )
}
