'use client'
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'

export type CartItem = {
  id: string
  product_id: string
  name: string
  price: number
  quantity: number
  image: string
  stock: number
  slug: string
}

type CartContextType = {
  items: CartItem[]
  addItem: (product: Omit<CartItem, 'id' | 'quantity'>, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
  isCartOpen: boolean
  setIsCartOpen: (open: boolean) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)
const CART_KEY = 'marina_cart'

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const { user, setShowAuthModal, setAuthRedirectAction } = useAuth()

  // Load cart from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(CART_KEY)
    if (saved) {
      try {
        setItems(JSON.parse(saved))
      } catch {
        localStorage.removeItem(CART_KEY)
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items))
  }, [items])

  const addItem = useCallback((product: Omit<CartItem, 'id' | 'quantity'>, quantity: number = 1) => {
    // If user is not logged in, show auth modal
    if (!user) {
      setAuthRedirectAction('cart')
      setShowAuthModal(true)
      return
    }

    setItems(prev => {
      const existing = prev.find(i => i.product_id === product.product_id)
      if (existing) {
        if (existing.quantity >= product.stock) {
          toast.error('No hay más stock disponible')
          return prev
        }
        toast.success('Cantidad actualizada en el carrito')
        return prev.map(i =>
          i.product_id === product.product_id
            ? { ...i, quantity: Math.min(i.quantity + quantity, product.stock) }
            : i
        )
      }
      toast.success('¡Producto agregado al carrito! 🛒')
      return [...prev, { ...product, id: crypto.randomUUID(), quantity }]
    })
    setIsCartOpen(true)
  }, [user, setShowAuthModal, setAuthRedirectAction])

  const removeItem = useCallback((productId: string) => {
    setItems(prev => prev.filter(i => i.product_id !== productId))
    toast.success('Producto eliminado del carrito')
  }, [])

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId)
      return
    }
    setItems(prev => prev.map(i =>
      i.product_id === productId
        ? { ...i, quantity: Math.min(quantity, i.stock) }
        : i
    ))
  }, [removeItem])

  const clearCart = useCallback(() => {
    setItems([])
    localStorage.removeItem(CART_KEY)
  }, [])

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <CartContext.Provider value={{
      items, addItem, removeItem, updateQuantity, clearCart,
      totalItems, totalPrice, isCartOpen, setIsCartOpen
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
