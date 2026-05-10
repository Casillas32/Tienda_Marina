'use client'
import { useState } from 'react'
import { MessageCircle, Mail, Phone, Send, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'
import styles from './page.module.css'

export default function ContactPage() {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', phone: '', type: '', description: '', date: '', budget: '',
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('access_key', process.env.NEXT_PUBLIC_WEB3FORMS_KEY || '')
      formData.append('subject', `✏️ Pedido personalizado de ${form.name}`)
      formData.append('from_name', form.name)
      formData.append('email', form.email)
      formData.append('phone', form.phone)
      formData.append('type', form.type)
      formData.append('description', form.description)
      formData.append('date', form.date)
      formData.append('budget', form.budget || 'No especificado')
      if (imageFile) formData.append('attachment', imageFile)

      const res = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.success) {
        setSubmitted(true)
        toast.success('¡Mensaje enviado! Te contactaremos pronto 💕')
      } else {
        toast.error('Hubo un error. Intenta de nuevo.')
      }
    } catch {
      toast.error('Error de conexión.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroOrb1} /><div className={styles.heroOrb2} />
        <div className="container">
          <div className={styles.heroContent}>
            <span className={styles.heroEmoji}>✉️</span>
            <h1 className={styles.heroTitle}>¿Tienes algo en mente?</h1>
            <p className={styles.heroSubtitle}>
              Cuéntanos sobre tu pedido personalizado. Creamos piezas únicas según tu visión y estilo.
            </p>
          </div>
        </div>
      </div>

      <div className="container">
        <div className={styles.layout}>
          {/* Contact Info */}
          <aside className={styles.aside}>
            <div className={styles.infoCard}>
              <h2 className={styles.infoTitle}>Contáctanos directamente</h2>
              <div className={styles.infoItems}>
                <a href="https://wa.me/521234567890" className={styles.infoItem} target="_blank" rel="noopener noreferrer">
                  <div className={styles.infoIcon} style={{ background: 'rgba(37,211,102,0.1)', color: '#25D366' }}>
                    <MessageCircle size={20} />
                  </div>
                  <div>
                    <p className={styles.infoLabel}>WhatsApp</p>
                    <p className={styles.infoValue}>+52 123 456 7890</p>
                  </div>
                </a>
                <a href="mailto:contacto@unsuspironavideno.com" className={styles.infoItem}>
                  <div className={styles.infoIcon}>
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className={styles.infoLabel}>Email</p>
                    <p className={styles.infoValue}>contacto@unsuspironavideno.com</p>
                  </div>
                </a>
                <a href="https://instagram.com" className={styles.infoItem} target="_blank" rel="noopener noreferrer">
                  <div className={styles.infoIcon} style={{ background: 'rgba(193,53,132,0.1)', color: '#C13584' }}>
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className={styles.infoLabel}>Instagram</p>
                    <p className={styles.infoValue}>@unsuspironavideno</p>
                  </div>
                </a>
                <div className={styles.infoItem}>
                  <div className={styles.infoIcon}>
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className={styles.infoLabel}>Ubicación</p>
                    <p className={styles.infoValue}>México 🇲🇽</p>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>💡</span>
              <h3 className={styles.tipTitle}>¿Cómo funciona?</h3>
              <ol className={styles.tipList}>
                <li>Llena el formulario con tu idea</li>
                <li>Te contactamos en 24-48 hrs</li>
                <li>Acordamos diseño y precio</li>
                <li>¡Creamos tu pieza única! 🎨</li>
              </ol>
            </div>
          </aside>

          {/* Form */}
          <div className={styles.formWrapper}>
            {submitted ? (
              <div className={styles.success}>
                <span className={styles.successEmoji}>🎉</span>
                <h2 className={styles.successTitle}>¡Mensaje recibido!</h2>
                <p className={styles.successText}>
                  Gracias por contactarnos. Te responderemos en menos de 48 horas. 
                  ¡Estamos emocionadas de crear algo especial para ti!
                </p>
                <button className="btn btn-primary" onClick={() => setSubmitted(false)}>
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className={styles.form}>
                <h2 className={styles.formTitle}>Pedido Personalizado</h2>

                <div className={styles.row2}>
                  <div className="form-group">
                    <label className="form-label">Nombre completo *</label>
                    <input id="contact-name" name="name" className="form-input" required value={form.name} onChange={handleChange} placeholder="Tu nombre" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email *</label>
                    <input id="contact-email" name="email" type="email" className="form-input" required value={form.email} onChange={handleChange} placeholder="tu@correo.com" />
                  </div>
                </div>

                <div className={styles.row2}>
                  <div className="form-group">
                    <label className="form-label">Teléfono / WhatsApp</label>
                    <input id="contact-phone" name="phone" className="form-input" value={form.phone} onChange={handleChange} placeholder="+52 555 555 5555" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tipo de pedido *</label>
                    <select id="contact-type" name="type" className="form-input" required value={form.type} onChange={handleChange}>
                      <option value="">Selecciona una opción</option>
                      <option value="Fieltro">🎄 Fieltro artesanal</option>
                      <option value="Bisutería">💎 Bisutería</option>
                      <option value="Aceites esenciales">🌿 Aceites esenciales</option>
                      <option value="Decoración Halloween">🎃 Decoración Halloween</option>
                      <option value="Otro">✨ Otro</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Descripción del pedido *</label>
                  <textarea
                    id="contact-description"
                    name="description"
                    className="form-input"
                    style={{ minHeight: '120px', resize: 'vertical' }}
                    required
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Describe lo que tienes en mente: colores, tamaño, diseño, cantidad, para qué ocasión, etc."
                  />
                </div>

                <div className={styles.row2}>
                  <div className="form-group">
                    <label className="form-label">¿Para cuándo lo necesitas?</label>
                    <input id="contact-date" name="date" type="date" className="form-input" value={form.date} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Presupuesto aproximado (opcional)</label>
                    <input id="contact-budget" name="budget" className="form-input" value={form.budget} onChange={handleChange} placeholder="Ej: $500 MXN" />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Imagen de referencia (opcional)</label>
                  <label className={styles.fileLabel} htmlFor="ref-image">
                    <span>📎 {imageFile ? imageFile.name : 'Adjuntar imagen de referencia'}</span>
                    <input id="ref-image" type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setImageFile(e.target.files?.[0] || null)} />
                  </label>
                </div>

                <button
                  id="contact-submit"
                  type="submit"
                  className={`btn btn-primary btn-lg ${styles.submitBtn}`}
                  disabled={loading}
                >
                  {loading ? <span className={styles.spinner} /> : <><Send size={16} /> Enviar pedido personalizado</>}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
