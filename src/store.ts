import { configureStore } from '@reduxjs/toolkit'
import cartReducer from './features/cart/cartSlice'

export const store = configureStore({
  reducer: {
    cart: cartReducer,
  },
})

store.subscribe(() => {
  sessionStorage.setItem('fakestore-cart', JSON.stringify(store.getState().cart))
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
