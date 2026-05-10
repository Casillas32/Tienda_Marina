'use client'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { X, Eye, EyeOff, Mail, Lock, User } from 'lucide-react'
import styles from './AuthModal.module.css'
import toast from 'react-hot-toast'

export default function AuthModal() {
  const { showAuthModal, setShowAuthModal, signIn, signUp } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  if (!showAuthModal) return null

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (mode === 'register' && !form.name.trim()) newErrors.name = 'El nombre es requerido'
    if (!form.email.includes('@')) newErrors.email = 'Email inválido'
    if (form.password.length < 6) newErrors.password = 'Mínimo 6 caracteres'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    
    try {
      if (mode === 'login') {
        const { error } = await signIn(form.email, form.password)
        if (error) {
          toast.error('Email o contraseña incorrectos')
        } else {
          toast.success('¡Bienvenida de vuelta! 💕')
          setShowAuthModal(false)
        }
      } else {
        const { error } = await signUp(form.email, form.password, form.name)
        if (error) {
          toast.error(error)
        } else {
          toast.success('¡Cuenta creada! Revisa tu email para confirmar 💌')
          setShowAuthModal(false)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="overlay" onClick={() => setShowAuthModal(false)} />
      <div className={styles.modal} role="dialog" aria-modal="true">
        <button className={styles.closeBtn} onClick={() => setShowAuthModal(false)}>
          <X size={20} />
        </button>

        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.modalLogo}>💕</div>
          <h2 className={styles.modalTitle}>
            {mode === 'login' ? '¡Bienvenida de vuelta!' : 'Crear cuenta'}
          </h2>
          <p className={styles.modalSubtitle}>
            {mode === 'login'
              ? 'Inicia sesión para continuar comprando'
              : 'Únete a nuestra comunidad artesanal'}
          </p>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${mode === 'login' ? styles.tabActive : ''}`}
            onClick={() => setMode('login')}
          >
            Iniciar sesión
          </button>
          <button
            className={`${styles.tab} ${mode === 'register' ? styles.tabActive : ''}`}
            onClick={() => setMode('register')}
          >
            Registrarse
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {mode === 'register' && (
            <div className="form-group">
              <label className="form-label">Nombre completo</label>
              <div className={styles.inputWrapper}>
                <User size={16} className={styles.inputIcon} />
                <input
                  id="auth-name"
                  type="text"
                  className={`form-input ${styles.inputWithIcon}`}
                  placeholder="Tu nombre"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>
              {errors.name && <span className={styles.error}>{errors.name}</span>}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Correo electrónico</label>
            <div className={styles.inputWrapper}>
              <Mail size={16} className={styles.inputIcon} />
              <input
                id="auth-email"
                type="email"
                className={`form-input ${styles.inputWithIcon}`}
                placeholder="tu@correo.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              />
            </div>
            {errors.email && <span className={styles.error}>{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <div className={styles.inputWrapper}>
              <Lock size={16} className={styles.inputIcon} />
              <input
                id="auth-password"
                type={showPass ? 'text' : 'password'}
                className={`form-input ${styles.inputWithIcon} ${styles.inputWithEndIcon}`}
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowPass(!showPass)}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <span className={styles.error}>{errors.password}</span>}
          </div>

          <button
            id="auth-submit"
            type="submit"
            className={`btn btn-primary btn-lg ${styles.submitBtn}`}
            disabled={loading}
          >
            {loading ? (
              <span className={styles.spinner} />
            ) : mode === 'login' ? 'Iniciar sesión' : 'Crear mi cuenta'}
          </button>
        </form>

        <p className={styles.switchMode}>
          {mode === 'login' ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
          <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
            {mode === 'login' ? 'Regístrate gratis' : 'Inicia sesión'}
          </button>
        </p>
      </div>
    </>
  )
}
