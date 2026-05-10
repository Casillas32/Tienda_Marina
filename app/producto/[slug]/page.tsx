'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useCart } from '@/context/CartContext'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronRight, ArrowLeft, ShoppingBag, Truck, ShieldCheck, Heart } from 'lucide-react'
import toast from 'react-hot-toast'
import styles from './page.module.css'
import ProductCard from '@/components/ProductCard/ProductCard'

export default function ProductPage({ params }: { params: { slug: string } }) {
  const router = useRouter()
  const { addItem } = useCart()
  const [product, setProduct] = useState<any>(null)
  const [relatedProducts, setRelatedProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [mainImage, setMainImage] = useState<string>('')
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    async function loadProduct() {
      // Fetch main product
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(name, slug)')
        .eq('slug', params.slug)
        .eq('active', true)
        .single()

      if (error || !data) {
        toast.error('Producto no encontrado')
        router.push('/')
        return
      }

      setProduct(data)
      setMainImage(data.images?.[0] || '')

      // Fetch related products (same category, excluding current)
      const { data: related } = await supabase
        .from('products')
        .select('*, category:categories(name, slug)')
        .eq('category_id', data.category_id)
        .eq('active', true)
        .neq('id', data.id)
        .limit(4)

      if (related) setRelatedProducts(related)
      setLoading(false)
    }

    loadProduct()
  }, [params.slug, router])

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.spinner} />
        <p>Cargando detalles mágicos...</p>
      </div>
    )
  }

  if (!product) return null

  const isOutOfStock = product.stock <= 0

  const handleAddToCart = () => {
    if (isOutOfStock) return
    addItem({
      product_id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || '',
      stock: product.stock,
      slug: product.slug,
    }, quantity)
    toast.success('¡Agregado al carrito! 🛍️')
  }

  return (
    <div className={styles.page}>
      {/* Breadcrumbs */}
      <div className="container">
        <nav className={styles.breadcrumbs}>
          <Link href="/">Inicio</Link>
          <ChevronRight size={14} />
          <Link href={`/categoria/${product.category?.slug}`}>{product.category?.name}</Link>
          <ChevronRight size={14} />
          <span className={styles.currentCrumb}>{product.name}</span>
        </nav>
      </div>

      <div className="container">
        <div className={styles.productLayout}>
          {/* Left: Gallery */}
          <div className={styles.gallery}>
            <div className={styles.mainImageWrapper}>
              {mainImage ? (
                <Image src={mainImage} alt={product.name} fill style={{ objectFit: 'cover' }} priority />
              ) : (
                <div className={styles.placeholderImg}>🎀</div>
              )}
              {product.customizable && <span className={styles.customBadge}>✨ Personalizable</span>}
            </div>

            {product.images && product.images.length > 1 && (
              <div className={styles.thumbnails}>
                {product.images.map((img: string, i: number) => (
                  <button
                    key={i}
                    className={`${styles.thumbnail} ${mainImage === img ? styles.thumbnailActive : ''}`}
                    onClick={() => setMainImage(img)}
                  >
                    <Image src={img} alt={`Miniatura ${i + 1}`} fill style={{ objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info */}
          <div className={styles.info}>
            <h1 className={styles.title}>{product.name}</h1>
            <p className={styles.price}>${parseFloat(product.price).toFixed(2)} <span className={styles.currency}>MXN</span></p>

            <div className={styles.stockInfo}>
              <span className={`${styles.stockBadge} ${isOutOfStock ? styles.outOfStock : styles.inStock}`}>
                {isOutOfStock ? 'Agotado por ahora' : `${product.stock} unidades disponibles`}
              </span>
            </div>

            <p className={styles.description}>
              {product.description || 'Una hermosa creación hecha a mano con dedicación y cariño.'}
            </p>

            {/* Actions */}
            <div className={styles.actionArea}>
              <div className={styles.quantitySelector}>
                <button 
                  className={styles.qtyBtn} 
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={isOutOfStock}
                >-</button>
                <span className={styles.qtyValue}>{quantity}</span>
                <button 
                  className={styles.qtyBtn} 
                  onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                  disabled={isOutOfStock || quantity >= product.stock}
                >+</button>
              </div>

              <button 
                className={`btn btn-primary btn-lg ${styles.addToCartBtn}`}
                onClick={handleAddToCart}
                disabled={isOutOfStock}
              >
                <ShoppingBag size={18} />
                {isOutOfStock ? 'Agotado' : 'Agregar al carrito'}
              </button>
            </div>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className={styles.tags}>
                {product.tags.map((tag: string) => (
                  <span key={tag} className={styles.tag}>#{tag}</span>
                ))}
              </div>
            )}

            {/* Features */}
            <div className={styles.features}>
              <div className={styles.feature}>
                <div className={styles.featureIcon}><Heart size={18} /></div>
                <div>
                  <p className={styles.featureTitle}>Hecho a mano</p>
                  <p className={styles.featureDesc}>Con amor y cuidado en cada detalle</p>
                </div>
              </div>
              <div className={styles.feature}>
                <div className={styles.featureIcon}><Truck size={18} /></div>
                <div>
                  <p className={styles.featureTitle}>Envíos seguros</p>
                  <p className={styles.featureDesc}>A todo México mediante paquetería</p>
                </div>
              </div>
              <div className={styles.feature}>
                <div className={styles.featureIcon}><ShieldCheck size={18} /></div>
                <div>
                  <p className={styles.featureTitle}>Compra protegida</p>
                  <p className={styles.featureDesc}>Pago mediante transferencia bancaria</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className={styles.relatedSection}>
          <div className="container">
            <h2 className={styles.relatedTitle}>También te podría gustar</h2>
            <div className={styles.relatedGrid}>
              {relatedProducts.map(prod => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
