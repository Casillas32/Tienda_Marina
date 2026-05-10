'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Upload, X, ArrowLeft, Save, ImagePlus } from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import styles from '../nuevo/page.module.css' // Reusing styles

type Category = { id: string; name: string; slug: string; icon: string }

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [newImages, setNewImages] = useState<File[]>([])
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([])

  const [form, setForm] = useState({
    name: '', description: '', price: '', stock: '0',
    category_id: '', tags: '', featured: false, active: true, customizable: false,
  })

  useEffect(() => {
    async function loadData() {
      // Load categories
      const { data: catData } = await supabase.from('categories').select('id, name, slug, icon').order('sort_order')
      if (catData) setCategories(catData as Category[])

      // Load product
      const { data: prodData, error } = await supabase.from('products').select('*').eq('id', params.id).single()
      
      if (error || !prodData) {
        toast.error('Producto no encontrado')
        router.push('/admin/productos')
        return
      }

      setForm({
        name: prodData.name,
        description: prodData.description || '',
        price: prodData.price.toString(),
        stock: prodData.stock.toString(),
        category_id: prodData.category_id,
        tags: prodData.tags ? prodData.tags.join(', ') : '',
        featured: prodData.featured,
        active: prodData.active,
        customizable: prodData.customizable,
      })
      setExistingImages(prodData.images || [])
      setInitialLoading(false)
    }
    loadData()
  }, [params.id, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement
    const value = target.type === 'checkbox' ? target.checked : target.value
    setForm(f => ({ ...f, [e.target.name]: value }))
  }

  const handleNewImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const valid = files.filter(f => f.size <= 5 * 1024 * 1024)
    if (valid.length !== files.length) toast.error('Algunas imágenes superan 5MB')
    
    const availableSlots = 5 - existingImages.length - newImages.length
    const imagesToAdd = valid.slice(0, availableSlots)
    
    setNewImages([...newImages, ...imagesToAdd])
    setNewImagePreviews([...newImagePreviews, ...imagesToAdd.map(f => URL.createObjectURL(f))])
  }

  const removeExistingImage = (i: number) => {
    setExistingImages(existingImages.filter((_, idx) => idx !== i))
  }

  const removeNewImage = (i: number) => {
    setNewImages(newImages.filter((_, idx) => idx !== i))
    setNewImagePreviews(newImagePreviews.filter((_, idx) => idx !== i))
  }

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.price || !form.category_id) {
      toast.error('Completa los campos requeridos')
      return
    }
    setLoading(true)

    try {
      // Upload new images
      const newImageUrls: string[] = []
      for (const file of newImages) {
        const ext = file.name.split('.').pop()
        const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error: uploadError } = await supabase.storage.from('products').upload(path, file)
        if (uploadError) throw uploadError
        const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(path)
        newImageUrls.push(publicUrl)
      }

      const allImages = [...existingImages, ...newImageUrls]
      const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean)

      const { error } = await supabase.from('products').update({
        name: form.name,
        slug: generateSlug(form.name),
        description: form.description,
        price: parseFloat(form.price),
        stock: parseInt(form.stock, 10),
        category_id: form.category_id,
        images: allImages,
        featured: form.featured,
        active: form.active,
        customizable: form.customizable,
        tags,
      }).eq('id', params.id)

      if (error) throw error

      toast.success('¡Producto actualizado! ✨')
      router.push('/admin/productos')
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar')
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return <div className={styles.loading}><div className={styles.spinner}/></div>
  }

  const totalImages = existingImages.length + newImages.length

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => router.push('/admin/productos')}>
          <ArrowLeft size={18} /> Volver
        </button>
        <h1 className={styles.title}>Editar Producto</h1>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.layout}>
          <div className={styles.main}>
            {/* Images */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>📷 Imágenes (Max 5)</h2>
              <div className={styles.imagesGrid}>
                {existingImages.map((img, i) => (
                  <div key={`ext-${i}`} className={styles.imageThumb}>
                    <Image src={img} alt="Foto actual" fill style={{ objectFit: 'cover' }} />
                    {i === 0 && <span className={styles.mainBadge}>Principal</span>}
                    <button type="button" className={styles.removeImg} onClick={() => removeExistingImage(i)}><X size={14}/></button>
                  </div>
                ))}
                {newImagePreviews.map((preview, i) => (
                  <div key={`new-${i}`} className={styles.imageThumb}>
                    <Image src={preview} alt="Nueva foto" fill style={{ objectFit: 'cover' }} />
                    <button type="button" className={styles.removeImg} onClick={() => removeNewImage(i)}><X size={14}/></button>
                  </div>
                ))}
                {totalImages < 5 && (
                  <label className={styles.addImageBtn} htmlFor="product-images">
                    <ImagePlus size={24} />
                    <span>Agregar foto</span>
                    <input id="product-images" type="file" accept="image/*" multiple onChange={handleNewImages} style={{ display: 'none' }} />
                  </label>
                )}
              </div>
            </div>

            {/* Info */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>📝 Información básica</h2>
              <div className={styles.formGrid}>
                <div className={`form-group ${styles.fullWidth}`}>
                  <label className="form-label">Nombre</label>
                  <input name="name" className="form-input" required value={form.name} onChange={handleChange} />
                </div>
                <div className={`form-group ${styles.fullWidth}`}>
                  <label className="form-label">Descripción</label>
                  <textarea name="description" className="form-input" value={form.description} onChange={handleChange} rows={4} style={{ resize: 'vertical' }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Precio</label>
                  <input name="price" type="number" min="0" step="0.01" className="form-input" required value={form.price} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Stock</label>
                  <input name="stock" type="number" min="0" className="form-input" value={form.stock} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Categoría</label>
                  <select name="category_id" className="form-input" required value={form.category_id} onChange={handleChange}>
                    <option value="">Selecciona...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Etiquetas</label>
                  <input name="tags" className="form-input" value={form.tags} onChange={handleChange} />
                </div>
              </div>
            </div>
          </div>

          <div className={styles.sidebar}>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>⚙️ Opciones</h2>
              <div className={styles.toggleList}>
                <label className={styles.toggle}>
                  <div className={styles.toggleInfo}>
                    <span className={styles.toggleLabel}>Activo</span>
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
                  </div>
                  <div className={`${styles.toggleSwitch} ${form.featured ? styles.toggleOn : ''}`}>
                    <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} style={{ display: 'none' }} />
                    <span className={styles.toggleKnob} />
                  </div>
                </label>
                <label className={styles.toggle}>
                  <div className={styles.toggleInfo}>
                    <span className={styles.toggleLabel}>✏️ Personalizable</span>
                  </div>
                  <div className={`${styles.toggleSwitch} ${form.customizable ? styles.toggleOn : ''}`}>
                    <input type="checkbox" name="customizable" checked={form.customizable} onChange={handleChange} style={{ display: 'none' }} />
                    <span className={styles.toggleKnob} />
                  </div>
                </label>
              </div>
            </div>

            <button type="submit" className={`btn btn-primary btn-lg ${styles.saveBtn}`} disabled={loading}>
              {loading ? <span className={styles.spinner} /> : <><Save size={18} /> Actualizar producto</>}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
