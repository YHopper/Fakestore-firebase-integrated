export interface Product {
  id: string
  title: string
  price: number
  category: string
  description: string
  image: string
  rating: {
    rate: number
    count: number
  }
}

export interface CartItem extends Product {
  quantity: number
}

export interface UserProfile {
  id: string
  email: string
  name: string
  address: string
  createdAt?: string
  updatedAt?: string
}

export interface OrderItem extends Product {
  quantity: number
}

export interface Order {
  id: string
  userId: string
  userEmail: string
  items: OrderItem[]
  total: number
  status: string
  createdAt?: string
}
