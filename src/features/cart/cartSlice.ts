import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { CartItem, Product } from '../../types'

const STORAGE_KEY = 'fakestore-cart'

const loadCartFromStorage = (): CartItem[] => {
  if (typeof window === 'undefined') {
    return []
  }

  const storedValue = sessionStorage.getItem(STORAGE_KEY)

  if (!storedValue) {
    return []
  }

  try {
    return JSON.parse(storedValue) as CartItem[]
  } catch {
    return []
  }
}

const initialState: CartItem[] = loadCartFromStorage()

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<Product>) => {
      const existingItem = state.find((item) => item.id === action.payload.id)

      if (existingItem) {
        existingItem.quantity += 1
      } else {
        state.push({ ...action.payload, quantity: 1 })
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      return state.filter((item) => item.id !== action.payload)
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ id: string; quantity: number }>,
    ) => {
      const existingItem = state.find((item) => item.id === action.payload.id)

      if (!existingItem) {
        return
      }

      if (action.payload.quantity <= 0) {
        return state.filter((item) => item.id !== action.payload.id)
      }

      existingItem.quantity = action.payload.quantity
    },
    clearCart: () => {
      return []
    },
  },
})

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions
export default cartSlice.reducer
