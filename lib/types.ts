export interface MenuItem {
  id: string
  name: string
  nameEn: string
  description: string
  price: number
  categoryId: string
  image?: string
  available: boolean
}

export interface Category {
  id: string
  name: string
  nameEn: string
  icon: string
}

export interface CartItem extends MenuItem {
  quantity: number
}

export interface Order {
  id: string
  items: CartItem[]
  total: number
  employeeId: string
  employeeName: string
  department?: string
  workerId?: string
  status: 'pending' | 'accepted' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
  createdAt: Date
  acceptedAt?: Date
  preparingAt?: Date
  deliveredAt?: Date
  notes?: string
  rating?: number
}
