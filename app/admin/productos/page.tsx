'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Edit2, Trash2, Eye, EyeOff, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import styles from './page.module.css'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const fetchProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*, category:categories(name, slug, icon)')
      .order('created_at', { ascending: false })
    setProducts(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchProducts() }, [])

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('products').update({ active: !current }).eq('id', id)
    toast.success(!current ? 'Producto activado' : 'Producto desactivado')
    fetchProducts()
  }

  const deleteProduct = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`)) return
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) toast.error('Error al eliminar')
    else { toast.success('Producto eliminado'); fetchProducts() }
  }

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || (filter === 'active' ? p.active : !p.active) ||
      (filter === 'featured' && p.featured) || p.category?.slug === filter
    return matchSearch && matchFilter
  })

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Productos</h1>
          <p className={styles.subtitle}>{products.length} productos en total</p>
        </div>
        <Link href="/admin/productos/nuevo" className="btn btn-primary" id="add-product-btn">
          <Plus size={16} /> Agregar producto
        </Link>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchWrapper}>
          <Search size={16} className={styles.searchIcon} />
          <input
            id="product-search"
            className={`form-input ${styles.searchInput}`}
            placeholder="Buscar producto..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className={styles.filterTabs}>
          {[
            { value: 'all', label: 'Todos' },
            { value: 'active', label: 'Activos' },
            { value: 'featured', label: 'Destacados' },
          ].map(tab => (
            <button
              key={tab.value}
              className={`${styles.filterTab} ${filter === tab.value ? styles.filterTabActive : ''}`}
              onClick={() => setFilter(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableWrapper}>
        {loading ? (
          <div className={styles.loading}><div className={styles.spinner} /></div>
        ) : filtered.length === 0 ? (
          <div className={styles.empty}>
            <span>📦</span>
            <p>No se encontraron productos</p>
            <Link href="/admin/productos/nuevo" className="btn btn-primary">Agregar primer producto</Link>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(product => (
                <tr key={product.id}>
                  <td>
                    <div className={styles.productCell}>
                      <div className={styles.productImage}>
                        {product.images?.[0] ? (
                          <Image src={product.images[0]} alt={product.name} fill style={{ objectFit: 'cover' }} />
                        ) : (
                          <span>🎀</span>
                        )}
                      </div>
                      <div>
                        <p className={styles.productName}>{product.name}</p>
                        {product.featured && <span className={styles.featuredBadge}>⭐ Destacado</span>}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={styles.categoryBadge}>
                      {product.category?.icon} {product.category?.name}
                    </span>
                  </td>
                  <td className={styles.price}>${parseFloat(product.price).toFixed(2)}</td>
                  <td>
                    <span className={`${styles.stockBadge} ${product.stock === 0 ? styles.stockOut : product.stock <= 3 ? styles.stockLow : styles.stockOk}`}>
                      {product.stock} uds.
                    </span>
                  </td>
                  <td>
                    <button
                      className={`${styles.statusBtn} ${product.active ? styles.statusActive : styles.statusInactive}`}
                      onClick={() => toggleActive(product.id, product.active)}
                    >
                      {product.active ? <><Eye size={13} /> Activo</> : <><EyeOff size={13} /> Oculto</>}
                    </button>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <Link
                        href={`/admin/productos/editar/${product.id}`}
                        className={styles.actionBtn}
                        title="Editar"
                      >
                        <Edit2 size={15} />
                      </Link>
                      <button
                        className={`${styles.actionBtn} ${styles.actionDelete}`}
                        onClick={() => deleteProduct(product.id, product.name)}
                        title="Eliminar"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
