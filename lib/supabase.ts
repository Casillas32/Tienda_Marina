import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xxxxxxxxxxxxxxxxxxxx.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'public-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          role: 'customer' | 'admin'
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          role?: 'customer' | 'admin'
        }
        Update: {
          full_name?: string | null
          phone?: string | null
        }
      }
      products: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          price: number
          stock: number
          category_id: string
          images: string[]
          featured: boolean
          active: boolean
          customizable: boolean
          tags: string[]
          created_at: string
        }
        Insert: {
          name: string
          slug: string
          description?: string | null
          price: number
          stock?: number
          category_id: string
          images?: string[]
          featured?: boolean
          active?: boolean
          customizable?: boolean
          tags?: string[]
        }
        Update: {
          name?: string
          description?: string | null
          price?: number
          stock?: number
          category_id?: string
          images?: string[]
          featured?: boolean
          active?: boolean
          customizable?: boolean
          tags?: string[]
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          theme: string
          banner_image: string | null
          icon: string | null
          created_at: string
        }
        Insert: {
          name: string
          slug: string
          description?: string | null
          theme: string
          banner_image?: string | null
          icon?: string | null
        }
        Update: {
          name?: string
          description?: string | null
          theme?: string
          banner_image?: string | null
          icon?: string | null
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          status: 'pending' | 'payment_submitted' | 'payment_verified' | 'shipped' | 'delivered' | 'cancelled'
          total: number
          shipping_cost: number
          items: OrderItem[]
          customer_name: string
          customer_email: string
          customer_phone: string | null
          shipping_address: string | null
          payment_proof_url: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          user_id: string
          total: number
          shipping_cost: number
          items: OrderItem[]
          customer_name: string
          customer_email: string
          customer_phone?: string | null
          shipping_address?: string | null
          notes?: string | null
        }
        Update: {
          status?: 'pending' | 'payment_submitted' | 'payment_verified' | 'shipped' | 'delivered' | 'cancelled'
          payment_proof_url?: string | null
          notes?: string | null
        }
      }
    }
  }
}

export type OrderItem = {
  product_id: string
  product_name: string
  product_image: string
  price: number
  quantity: number
}
