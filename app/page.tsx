import type { Metadata } from 'next'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import ProductCard from '@/components/ProductCard/ProductCard'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Inicio — Un Suspiro Navideño',
}

async function getFeaturedProducts() {
  const { data } = await supabase
    .from('products')
    .select('*, category:categories(name, slug)')
    .eq('active', true)
    .eq('featured', true)
    .limit(8)
  return data || []
}

const categories = [
  {
    slug: 'navidad',
    name: 'Navidad',
    icon: '🎄',
    desc: 'Adornos y decoraciones navideñas artesanales',
    color: 'from-[#1B5E20] to-[#0D3B14]',
    accent: '#FFD700',
    bg: 'var(--cat-bg, #0D1B0E)',
  },
  {
    slug: 'halloween',
    name: 'Halloween',
    icon: '🎃',
    desc: 'Accesorios y decoraciones para la noche de brujas',
    color: 'from-[#1A0030] to-[#0A0010]',
    accent: '#FF6B00',
    bg: '#1A0030',
  },
  {
    slug: 'bisuteria',
    name: 'Bisutería',
    icon: '💎',
    desc: 'Joyería artesanal única hecha a mano',
    color: 'from-[#FFF0F5] to-[#FFE0EE]',
    accent: '#C4416C',
    bg: '#FFF0F5',
  },
  {
    slug: 'aceites',
    name: 'Aceites Esenciales',
    icon: '🌿',
    desc: 'Aromaterapia y bienestar natural',
    color: 'from-[#E8F5E9] to-[#F1F8E9]',
    accent: '#2E7D32',
    bg: '#E8F5E9',
  },
  {
    slug: 'otros',
    name: 'Otros',
    icon: '✨',
    desc: 'Creaciones artesanales variadas y únicas',
    color: 'from-[#EDE7FF] to-[#F0F4FF]',
    accent: '#7C4DFF',
    bg: '#EDE7FF',
  },
]

export default async function HomePage() {
  const featured = await getFeaturedProducts()

  return (
    <>
      {/* ---- HERO ---- */}
      <section className={styles.hero} id="hero">
        <div className={styles.heroBg}>
          <div className={styles.heroOrb1} />
          <div className={styles.heroOrb2} />
          <div className={styles.heroOrb3} />
          <div className={styles.heroParticles}>
            {Array.from({ length: 20 }).map((_, i) => (
              <span key={i} className={styles.particle} style={{ '--i': i } as React.CSSProperties} />
            ))}
          </div>
        </div>
        <div className={`container ${styles.heroContent}`}>
          <div className={styles.heroText}>
            <span className={styles.heroPill}>✨ Artesanías hechas con amor</span>
            <h1 className={styles.heroTitle}>
              Un Suspiro
              <span className={styles.heroTitleScript}> Navideño</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Descubre nuestra colección de productos artesanales únicos: fieltro, bisutería, 
              aceites esenciales y mucho más. Cada pieza cuenta una historia especial. 💕
            </p>
            <div className={styles.heroCta}>
              <Link href="/categoria/navidad" className="btn btn-primary btn-lg">
                🎄 Ver Colección Navidad
              </Link>
              <Link href="/contacto" className="btn btn-outline btn-lg">
                Pedidos personalizados
              </Link>
            </div>
          </div>
          <div className={styles.heroVisual}>
            <div className={styles.heroCard}>
              <div className={styles.heroCardInner}>
                <span className={styles.heroEmoji}>🎀</span>
                <p className={styles.heroCardText}>Fieltro Artesanal</p>
              </div>
            </div>
            <div className={`${styles.heroCard} ${styles.heroCard2}`}>
              <div className={styles.heroCardInner}>
                <span className={styles.heroEmoji}>💎</span>
                <p className={styles.heroCardText}>Bisutería</p>
              </div>
            </div>
            <div className={`${styles.heroCard} ${styles.heroCard3}`}>
              <div className={styles.heroCardInner}>
                <span className={styles.heroEmoji}>🌿</span>
                <p className={styles.heroCardText}>Aceites</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---- FEATURES ---- */}
      <section className={styles.features}>
        <div className="container">
          <div className={styles.featuresGrid}>
            {[
              { icon: '🎨', title: 'Hecho a mano', desc: 'Cada pieza creada con dedicación y amor' },
              { icon: '✨', title: 'Diseño único', desc: 'No hay dos piezas iguales' },
              { icon: '🚚', title: 'Envío a todo México', desc: 'Llevamos tu pedido hasta tu puerta' },
              { icon: '💳', title: 'Pago seguro', desc: 'Transferencia bancaria confiable' },
            ].map(f => (
              <div key={f.title} className={styles.featureCard}>
                <span className={styles.featureIcon}>{f.icon}</span>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- CATEGORIES ---- */}
      <section className={`${styles.categoriesSection} section`} id="categories">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionPill}>Explora</span>
            <h2 className={styles.sectionTitle}>Nuestras Categorías</h2>
            <p className={styles.sectionSubtitle}>Encuentra el producto perfecto para cada ocasión</p>
          </div>
          <div className={styles.categoriesGrid}>
            {categories.map((cat, i) => (
              <Link
                key={cat.slug}
                href={`/categoria/${cat.slug}`}
                className={`${styles.categoryCard} ${i === 0 ? styles.categoryCardLarge : ''}`}
                id={`category-${cat.slug}`}
              >
                <div className={styles.categoryOverlay} />
                <div className={styles.categoryContent}>
                  <span className={styles.categoryIcon}>{cat.icon}</span>
                  <h3 className={styles.categoryName}>{cat.name}</h3>
                  <p className={styles.categoryDesc}>{cat.desc}</p>
                  <span className={styles.categoryArrow}>Ver productos →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---- FEATURED PRODUCTS ---- */}
      {featured.length > 0 && (
        <section className={`${styles.productsSection} section`} id="featured-products">
          <div className="container">
            <div className={styles.sectionHeader}>
              <span className={styles.sectionPill}>⭐ Lo mejor</span>
              <h2 className={styles.sectionTitle}>Productos Destacados</h2>
              <p className={styles.sectionSubtitle}>Selección especial de nuestras creaciones más amadas</p>
            </div>
            <div className={styles.productsGrid}>
              {(featured as any[]).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---- CTA CUSTOM ORDERS ---- */}
      <section className={styles.ctaSection} id="custom-orders">
        <div className="container">
          <div className={styles.ctaCard}>
            <div className={styles.ctaContent}>
              <span className={styles.ctaEmoji}>✏️</span>
              <h2 className={styles.ctaTitle}>¿Quieres algo único y especial?</h2>
              <p className={styles.ctaText}>
                Hacemos pedidos personalizados con tu diseño, colores y estilo. 
                Contáctanos y creamos algo mágico juntas.
              </p>
              <Link href="/contacto" className="btn btn-primary btn-lg" id="cta-contact">
                Solicitar pedido personalizado
              </Link>
            </div>
            <div className={styles.ctaVisual}>
              <span>🎀</span><span>🌟</span><span>💕</span><span>✨</span>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
