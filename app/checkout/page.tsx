'use client'
import { useState, useEffect } from 'react'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Upload, CreditCard, ChevronRight, Package, Truck } from 'lucide-react'
import toast from 'react-hot-toast'
import styles from './page.module.css'

const BANK_INFO = {
  bank: 'Mercado Pago W',
  account: '722969010361137555',
  clabe: '722969010361137555',
  holder: 'Marina Isabel Molina Chavez',
}

const SHIPPING_COST = 60

type Step = 'summary' | 'payment' | 'submitted'

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart()
  const { user, profile } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState<Step>('summary')
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [proofPreview, setProofPreview] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState(profile?.phone || '')
  const [loading, setLoading] = useState(false)

  const total = totalPrice + SHIPPING_COST

  useEffect(() => {
    if (!user) router.push('/')
  }, [user, router])

  if (items.length === 0 && step !== 'submitted') {
    return (
      <div className={styles.emptyCheckout}>
        <span>🛒</span>
        <h2>Tu carrito está vacío</h2>
        <button className="btn btn-primary" onClick={() => router.push('/')}>Ir a la tienda</button>
      </div>
    )
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error('El archivo no puede pesar más de 5MB')
      return
    }
    setProofFile(file)
    setProofPreview(URL.createObjectURL(file))
  }

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!proofFile) {
      toast.error('Por favor adjunta el comprobante de pago')
      return
    }
    setLoading(true)

    try {
      // 1. Upload proof to Supabase Storage
      const fileExt = proofFile.name.split('.').pop()
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(fileName, proofFile)

      if (uploadError) throw new Error('Error al subir el comprobante: ' + uploadError.message)

      const { data: { publicUrl } } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(fileName)

      // 2. Create order in Database
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user?.id,
          total: total,
          shipping_cost: SHIPPING_COST,
          items: items,
          customer_name: profile?.full_name || 'Cliente',
          customer_email: user?.email || '',
          customer_phone: phone,
          shipping_address: address,
          payment_proof_url: publicUrl,
          status: 'payment_submitted',
          notes: notes
        })
        .select()
        .single()

      if (orderError) throw new Error('Error al guardar el pedido: ' + orderError.message)

      // 3. Notify via Web3Forms
      const formData = new FormData()
      formData.append('access_key', process.env.NEXT_PUBLIC_WEB3FORMS_KEY || '')
      formData.append('subject', `💳 Nuevo pedido #${orderData.id.slice(0,8)} de ${profile?.full_name || user?.email}`)
      formData.append('from_name', 'Un Suspiro Navideño')
      formData.append('email_to', 'tu-email-de-notificaciones@gmail.com') // Cambia esto por tu correo real si quieres
      formData.append('customer', profile?.full_name || 'Cliente')
      formData.append('order_id', orderData.id)
      formData.append('total', `$${total.toFixed(2)} MXN`)
      formData.append('attachment', proofFile)

      // Intentamos enviar el correo, pero si falla no bloqueamos el éxito del pedido en DB
      await fetch('https://api.web3forms.com/submit', { method: 'POST', body: formData })

      clearCart()
      setStep('submitted')
      toast.success('¡Pedido enviado! Te contactaremos pronto 💕')
      
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Error al procesar el pedido')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'submitted') {
    return (
      <div className={styles.successPage}>
        <div className={styles.successCard}>
          <div className={styles.successIcon}>🎉</div>
          <h1 className={styles.successTitle}>¡Pedido recibido!</h1>
          <p className={styles.successText}>
            Tu comprobante de pago fue enviado correctamente. 
            Recibirás una confirmación en <strong>{user?.email}</strong> una vez que validemos tu pago.
          </p>
          <div className={styles.successSteps}>
            <div className={styles.successStep}>
              <span>✅</span>
              <div>
                <strong>Comprobante recibido</strong>
                <p>Estamos verificando tu pago</p>
              </div>
            </div>
            <div className={styles.successStep}>
              <span>📦</span>
              <div>
                <strong>Preparamos tu pedido</strong>
                <p>Una vez confirmado el pago</p>
              </div>
            </div>
            <div className={styles.successStep}>
              <span>🚚</span>
              <div>
                <strong>Enviamos tu pedido</strong>
                <p>Te notificamos por email</p>
              </div>
            </div>
          </div>
          <button className="btn btn-primary btn-lg" onClick={() => router.push('/')}>
            Seguir comprando
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className="container">
        <h1 className={styles.pageTitle}>Finalizar compra</h1>

        {/* Steps indicator */}
        <div className={styles.steps}>
          {(['summary', 'payment'] as Step[]).map((s, i) => (
            <div key={s} className={`${styles.step} ${step === s ? styles.stepActive : ''} ${step === 'payment' && s === 'summary' ? styles.stepDone : ''}`}>
              <div className={styles.stepCircle}>{i + 1}</div>
              <span className={styles.stepLabel}>{s === 'summary' ? 'Resumen' : 'Pago'}</span>
              {i === 0 && <ChevronRight size={16} className={styles.stepArrow} />}
            </div>
          ))}
        </div>

        <div className={styles.layout}>
          {/* LEFT: Main content */}
          <div className={styles.main}>
            {step === 'summary' && (
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>
                  <Package size={18} /> Resumen del pedido
                </h2>
                <div className={styles.orderItems}>
                  {items.map(item => (
                    <div key={item.id} className={styles.orderItem}>
                      <div className={styles.orderItemImage}>
                        {item.image ? (
                          <Image src={item.image} alt={item.name} width={56} height={56} style={{ objectFit: 'cover', borderRadius: 8 }} />
                        ) : (
                          <div className={styles.imgPlaceholder}>🎀</div>
                        )}
                      </div>
                      <div className={styles.orderItemInfo}>
                        <p className={styles.orderItemName}>{item.name}</p>
                        <p className={styles.orderItemQty}>Cantidad: {item.quantity}</p>
                      </div>
                      <p className={styles.orderItemPrice}>${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                {/* Shipping address */}
                <div className={styles.formSection}>
                  <h3 className={styles.formSectionTitle}><Truck size={16} /> Datos de envío</h3>
                  <div className="form-group">
                    <label className="form-label">Dirección de envío</label>
                    <input className="form-input" placeholder="Calle, número, colonia, municipio, estado, CP" value={address} onChange={e => setAddress(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Teléfono / WhatsApp</label>
                    <input className="form-input" placeholder="+52 555 555 5555" value={phone} onChange={e => setPhone(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Notas del pedido (opcional)</label>
                    <textarea className={`form-input ${styles.textarea}`} placeholder="Instrucciones especiales, personalizaciones, etc." value={notes} onChange={e => setNotes(e.target.value)} rows={3} />
                  </div>
                </div>

                <button
                  className={`btn btn-primary btn-lg ${styles.nextBtn}`}
                  onClick={() => {
                    if (!address.trim()) { toast.error('Por favor ingresa tu dirección de envío'); return }
                    setStep('payment')
                  }}
                >
                  Continuar al pago <ChevronRight size={16} />
                </button>
              </div>
            )}

            {step === 'payment' && (
              <form onSubmit={handleSubmitPayment}>
                <div className={styles.card}>
                  <h2 className={styles.cardTitle}>
                    <CreditCard size={18} /> Datos bancarios para transferencia
                  </h2>

                  <div className={styles.bankCard}>
                    <div className={styles.bankHeader}>
                      <span className={styles.bankIcon}>🏦</span>
                      <div>
                        <p className={styles.bankName}>{BANK_INFO.bank}</p>
                        <p className={styles.bankLabel}>Banco receptor</p>
                      </div>
                    </div>
                    <div className={styles.bankDetails}>
                      <div className={styles.bankRow}>
                        <span className={styles.bankKey}>Titular</span>
                        <span className={styles.bankValue}>{BANK_INFO.holder}</span>
                      </div>
                      {/* Only showing CLABE for Mercado Pago since account number usually IS the CLABE, and to avoid confusion */}
                      <div className={styles.bankRow}>
                        <span className={styles.bankKey}>CLABE</span>
                        <span className={styles.bankValue}>{BANK_INFO.clabe}</span>
                      </div>
                      <div className={`${styles.bankRow} ${styles.bankTotal}`}>
                        <span className={styles.bankKey}>Total a transferir</span>
                        <span className={styles.bankValueLarge}>${total.toFixed(2)} MXN</span>
                      </div>
                    </div>
                  </div>

                  {/* Upload proof */}
                  <div className={styles.uploadSection}>
                    <h3 className={styles.uploadTitle}>Adjunta tu comprobante de pago</h3>
                    <p className={styles.uploadDesc}>
                      Una vez realizada la transferencia, sube una captura de pantalla o foto del comprobante.
                    </p>
                    <label className={styles.uploadArea} htmlFor="proof-upload">
                      {proofPreview ? (
                        <div className={styles.previewWrapper}>
                          <Image src={proofPreview} alt="Comprobante" fill style={{ objectFit: 'contain' }} />
                          <span className={styles.previewChange}>Cambiar imagen</span>
                        </div>
                      ) : (
                        <>
                          <Upload size={32} className={styles.uploadIcon} />
                          <p className={styles.uploadText}>Haz clic o arrastra tu comprobante aquí</p>
                          <p className={styles.uploadHint}>PNG, JPG, PDF — Máx. 5MB</p>
                        </>
                      )}
                      <input
                        id="proof-upload"
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>

                  <button
                    type="submit"
                    id="submit-payment"
                    className={`btn btn-primary btn-lg ${styles.nextBtn}`}
                    disabled={loading || !proofFile}
                  >
                    {loading ? <span className={styles.spinner} /> : '✅ Enviar comprobante y confirmar pedido'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* RIGHT: Order summary sidebar */}
          <div className={styles.sidebar}>
            <div className={styles.summaryCard}>
              <h3 className={styles.summaryTitle}>Resumen</h3>
              <div className={styles.summaryRows}>
                <div className={styles.summaryRow}>
                  <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} artículos)</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>🚚 Envío</span>
                  <span>${SHIPPING_COST}.00</span>
                </div>
                <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
                  <span>Total</span>
                  <span>${total.toFixed(2)} MXN</span>
                </div>
              </div>
              <div className={styles.paymentBadge}>
                🏦 Pago por transferencia bancaria
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
