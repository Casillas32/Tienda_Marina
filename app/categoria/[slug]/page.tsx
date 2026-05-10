import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import ProductCard from '@/components/ProductCard/ProductCard'
import styles from './page.module.css'

type Params = { slug: string }

const themeConfig: Record<string, {
  name: string; icon: string; description: string; emoji: string[];
  gradient: string; textLight: boolean;
}> = {
  navidad: {
    name: 'Navidad', icon: '🎄', description: 'Adornos navideños artesanales de fieltro llenos de magia y tradición',
    emoji: ['⭐', '❄️', '🎁', '🦌', '🕯️'],
    gradient: 'linear-gradient(135deg, #0D3B14 0%, #1B5E20 50%, #0A2B0C 100%)',
    textLight: true,
  },
  halloween: {
    name: 'Halloween', icon: '🎃', description: 'Decoraciones y accesorios escalofriantes para la noche más oscura del año',
    emoji: ['🦇', '🕷️', '💀', '🕸️', '🌙'],
    gradient: 'linear-gradient(135deg, #0A0A0F 0%, #1A0030 50%, #200A00 100%)',
    textLight: true,
  },
  bisuteria: {
    name: 'Bisutería', icon: '💎', description: 'Joyería artesanal única hecha a mano con materiales de alta calidad',
    emoji: ['💍', '📿', '✨', '💫', '🌸'],
    gradient: 'linear-gradient(135deg, #FFF0F5 0%, #FFE4EE 50%, #FFF8E1 100%)',
    textLight: false,
  },
  aceites: {
    name: 'Aceites Esenciales', icon: '🌿', description: 'Aromaterapia natural para tu bienestar y el de tu hogar',
    emoji: ['🌺', '🍃', '🌸', '🫙', '💧'],
    gradient: 'linear-gradient(135deg, #F1F8E9 0%, #E8F5E9 50%, #FFF8F0 100%)',
    textLight: false,
  },
  otros: {
    name: 'Otros', icon: '✨', description: 'Creaciones artesanales únicas para todas las ocasiones',
    emoji: ['🎀', '💕', '🌟', '🎨', '🦋'],
    gradient: 'linear-gradient(135deg, #F8F6FF 0%, #EDE7FF 50%, #F0F4FF 100%)',
    textLight: false,
  },
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params
  const config = themeConfig[slug]
  if (!config) return { title: 'Categoría no encontrada' }
  return {
    title: `${config.name} — Un Suspiro Navideño`,
    description: config.description,
  }
}

export default async function CategoryPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const config = themeConfig[slug]
  if (!config) notFound()

  const { data: category } = await supabase.from('categories').select('id').eq('slug', slug).single()
  
  let products: any[] = []
  if (category) {
    const { data } = await supabase
      .from('products')
      .select('*, category:categories(name, slug)')
      .eq('category_id', category.id)
      .eq('active', true)
      .order('created_at', { ascending: false })
    products = data || []
  }

  const light = config.textLight

  return (
    <div data-theme={slug} style={{ minHeight: '100vh' }}>
      {/* Banner */}
      <div className={styles.banner} style={{ background: config.gradient }}>
        <div className={styles.bannerDecorations}>
          {config.emoji.map((e, i) => (
            <span key={i} className={styles.decoration} style={{ '--i': i } as React.CSSProperties}>{e}</span>
          ))}
        </div>
        <div className={`container ${styles.bannerContent}`}>
          <div className={styles.bannerIcon}>{config.icon}</div>
          <h1 className={styles.bannerTitle} style={{ color: light ? 'white' : 'var(--color-text)' }}>
            {config.name}
          </h1>
          <p className={styles.bannerDesc} style={{ color: light ? 'rgba(255,255,255,0.8)' : 'var(--color-text-muted)' }}>
            {config.description}
          </p>
          <div className={styles.bannerMeta} style={{ color: light ? 'rgba(255,255,255,0.6)' : 'var(--neutral-400)' }}>
            {products.length} producto{products.length !== 1 ? 's' : ''} disponible{products.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className={styles.content}>
        <div className="container">
          {products.length > 0 ? (
            <div className={styles.grid}>
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className={styles.empty}>
              <span className={styles.emptyIcon}>{config.icon}</span>
              <h2 className={styles.emptyTitle}>Próximamente en {config.name}</h2>
              <p className={styles.emptyText}>
                Estamos preparando cosas increíbles para esta categoría. ¡Vuelve pronto!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
