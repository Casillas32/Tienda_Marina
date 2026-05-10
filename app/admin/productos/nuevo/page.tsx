'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Upload, X, ArrowLeft, Save, ImagePlus } from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import styles from './page.module.css'

type Category = { id: string; name: string; slug: string; icon: string }

export default function NewProductPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  const [form, setForm] = useState({
    name: '', description: '', price: '', stock: '0',
    category_id: '', tags: '', featured: false, active: true, customizable: false,
  })

  useEffect(() => {
    supabase.from('categories').select('id, name, slug, icon').order('sort_order').then(({ data }) => {
      if (data) setCategories(data as Category[])
    })
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement
    const value = target.type === 'checkbox' ? target.checked : target.value
    setForm(f => ({ ...f, [e.target.name]: value }))
  }

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const valid = files.filter(f => f.size <= 5 * 1024 * 1024)
    if (valid.length !== files.length) toast.error('Algunas imágenes superan 5MB y fueron ignoradas')
    const newImages = [...images, ...valid].slice(0, 5)
    setImages(newImages)
    setImagePreviews(newImages.map(f => URL.createObjectURL(f)))
  }

  const removeImage = (i: number) => {
    const newImages = images.filter((_, idx) => idx !== i)
    const newPreviews = imagePreviews.filter((_, idx) => idx !== i)
    setImages(newImages)
    setImagePreviews(newPreviews)
  }

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.price || !form.category_id) {
      toast.error('Por favor completa todos los campos requeridos')
      return
    }
    setLoading(true)

    try {
      // Upload images to Supabase Storage
      const imageUrls: string[] = []
      for (const file of images) {
        const ext = file.name.split('.').pop()
        const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error: uploadError } = await supabase.storage.from('products').upload(path, file)
        if (uploadError) throw uploadError
        const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(path)
        imageUrls.push(publicUrl)
      }

      const slug = generateSlug(form.name)
      const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean)

      const { error } = await supabase.from('products').insert({
        name: form.name,
        slug,
        description: form.description,
        price: parseFloat(form.price),
        stock: parseInt(form.stock, 10),
        category_id: form.category_id,
        images: imageUrls,
        featured: form.featured,
        active: form.active,
        customizable: form.customizable,
        tags,
      })

      if (error) throw error

      toast.success('¡Producto creado exitosamente! 🎉')
      router.push('/admin/productos')
    } catch (err: any) {
      toast.error(err.message || 'Error al crear el producto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => router.push('/admin/productos')}>
          <ArrowLeft size={18} /> Volver a productos
        </button>
        <h1 className={styles.title}>Nuevo Producto</h1>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.layout}>
          {/* Left: Main info */}
          <div className={styles.main}>
            {/* Images */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>📷 Imágenes del producto</h2>
              <p className={styles.cardDesc}>Sube hasta 5 fotos. La primera será la imagen principal. Máx. 5MB por imagen.</p>

              <div className={styles.imagesGrid}>
                {imagePreviews.map((preview, i) => (
                  <div key={i} className={styles.imageThumb}>
                    <Image src={preview} alt={`Imagen ${i + 1}`} fill style={{ objectFit: 'cover' }} />
                    {i === 0 && <span className={styles.mainBadge}>Principal</span>}
                    <button type="button" className={styles.removeImg} onClick={() => removeImage(i)}>
                      <X size={14} />
                    </button>
                  </div>
                ))}
                {images.length < 5 && (
                  <label className={styles.addImageBtn} htmlFor="product-images">
                    <ImagePlus size={24} />
                    <span>Agregar foto</span>
                    <input
                      id="product-images"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImages}
                      style={{ display: 'none' }}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Basic info */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>📝 Información básica</h2>
              <div className={styles.formGrid}>
                <div className={`form-group ${styles.fullWidth}`}>
                  <label className="form-label">Nombre del producto *</label>
                  <input id="prod-name" name="name" className="form-input" required value={form.name} onChange={handleChange} placeholder="Ej: Árbol de Navidad de Fieltro" />
                  {form.name && <small className={styles.slugPreview}>URL: /producto/{generateSlug(form.name)}</small>}
                </div>
                <div className={`form-group ${styles.fullWidth}`}>
                  <label className="form-label">Descripción</label>
                  <textarea
                    id="prod-desc"
                    name="description"
                    className="form-input"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Describe el producto: materiales, tamaño, cuidados, etc."
                    rows={5}
                    style={{ resize: 'vertical' }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Precio (MXN) *</label>
                  <input id="prod-price" name="price" type="number" min="0" step="0.01" className="form-input" required value={form.price} onChange={handleChange} placeholder="0.00" />
                </div>
                <div className="form-group">
                  <label className="form-label">Stock disponible</label>
                  <input id="prod-stock" name="stock" type="number" min="0" className="form-input" value={form.stock} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Categoría *</label>
                  <select id="prod-category" name="category_id" className="form-input" required value={form.category_id} onChange={handleChange}>
                    <option value="">Selecciona una categoría</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Etiquetas (separadas por coma)</label>
                  <input id="prod-tags" name="tags" className="form-input" value={form.tags} onChange={handleChange} placeholder="Ej: navidad, fieltro, árbol, decoración" />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Options */}
          <div className={styles.sidebar}>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>⚙️ Opciones</h2>
              <div className={styles.toggleList}>
                <label className={styles.toggle}>
                  <div className={styles.toggleInfo}>
                    <span className={styles.toggleLabel}>Producto activo</span>
                    <span className={styles.toggleDesc}>Visible en la tienda</span>
                  </div>
                  <div className={`${styles.toggleSwitch} ${form.active ? styles.toggleOn : ''}`}>
                    <input type="checkbox" name="active" checked={form.active} onChange={handleChange} style={{ display: 'none' }} />
                    <span className={styles.toggleKnob} />
                  </div>
                </label>
                <label className={styles.toggle}>
                  <div className={styles.toggleInfo}>
                    <span className={styles.toggleLabel}>⭐ Destacado</span>
                    <span className={styles.toggleDesc}>Aparece en el inicio</span>
                  </div>
                  <div className={`${styles.toggleSwitch} ${form.featured ? styles.toggleOn : ''}`}>
                    <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} style={{ display: 'none' }} />
                    <span className={styles.toggleKnob} />
                  </div>
                </label>
                <label className={styles.toggle}>
                  <div className={styles.toggleInfo}>
                    <span className={styles.toggleLabel}>✏️ Personalizable</span>
                    <span className={styles.toggleDesc}>Acepta pedidos personalizados</span>
                  </div>
                  <div className={`${styles.toggleSwitch} ${form.customizable ? styles.toggleOn : ''}`}>
                    <input type="checkbox" name="customizable" checked={form.customizable} onChange={handleChange} style={{ display: 'none' }} />
                    <span className={styles.toggleKnob} />
                  </div>
                </label>
              </div>
            </div>

            <button
              id="save-product"
              type="submit"
              className={`btn btn-primary btn-lg ${styles.saveBtn}`}
              disabled={loading}
            >
              {loading ? <span className={styles.spinner} /> : <><Save size={18} /> Guardar producto</>}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
