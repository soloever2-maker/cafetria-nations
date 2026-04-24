import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types based on the schema
export interface DBEmployee {
  id: string
  name: string
  department: string
}

export interface DBWorker {
  id: string
  name: string
}

export interface DBMenuItem {
  id: string
  name: string
  name_en: string
  category: string
  price: number
  is_available: boolean
}

export interface DBOrder {
  id: string
  employee_id: string
  employee_name: string
  department: string | null
  worker_id: string | null
  status: "pending" | "accepted" | "preparing" | "ready" | "delivered" | "cancelled"
  notes: string | null
  created_at: string
  accepted_at: string | null
  preparing_at: string | null
  delivered_at: string | null
  rating: number | null
}

export interface DBOrderItem {
  id: string
  order_id: string
  item_id: string
  item_name: string
  quantity: number
}

// Extended order type with items
export interface DBOrderWithItems extends DBOrder {
  order_items: DBOrderItem[]
}
