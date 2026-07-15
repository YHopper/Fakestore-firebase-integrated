import { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import './App.css'
import { AuthPanel } from './components/AuthPanel'
import { Home } from './components/Home'
import { OrderHistory } from './components/OrderHistory'
import { ProductsManager } from './components/ProductsManager'
import { ProfilePanel } from './components/ProfilePanel'
import { ShoppingCart } from './components/ShoppingCart'
import { useAuth } from './hooks/useAuth'
import type { RootState } from './store'

function App() {
  const [view, setView] = useState<'home' | 'cart' | 'profile' | 'products' | 'orders'>('home')
  const { user, loading, logout } = useAuth()
  const cartItems = useSelector((state: RootState) => state.cart)

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems],
  )

  if (loading) {
    return <div className="app-shell py-4 px-3 px-md-4"><div className="status-card">Loading authentication...</div></div>
  }

  if (!user) {
    return (
      <div className="app-shell py-4 px-3 px-md-4">
        <header className="topbar rounded-4 border shadow-sm p-4 mb-4">
          <p className="eyebrow text-uppercase mb-1">Firebase Commerce</p>
          <h1 className="h3 fw-bold mb-0">Modern Market</h1>
          <p className="mb-0 mt-2 text-light-emphasis">Authenticate, manage products, and keep orders in Firestore.</p>
        </header>
        <AuthPanel onAuthenticated={() => setView('home')} />
      </div>
    )
  }

  return (
    <div className="app-shell py-4 px-3 px-md-4">
      <header className="topbar rounded-4 border shadow-sm p-4 mb-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div>
          <p className="eyebrow text-uppercase mb-1">Firebase Commerce</p>
          <h1 className="h3 fw-bold mb-0">Modern Market</h1>
          <p className="mb-0 mt-2 text-light-emphasis">{user.email}</p>
        </div>
        <nav className="topbar-nav d-flex flex-wrap gap-2">
          <button type="button" className="btn btn-outline-dark" onClick={() => setView('home')}>Home</button>
          <button type="button" className="btn btn-dark" onClick={() => setView('cart')}>Cart ({cartCount})</button>
          <button type="button" className="btn btn-outline-dark" onClick={() => setView('profile')}>Profile</button>
          <button type="button" className="btn btn-outline-dark" onClick={() => setView('products')}>Products</button>
          <button type="button" className="btn btn-outline-dark" onClick={() => setView('orders')}>Orders</button>
          <button type="button" className="btn btn-outline-light" onClick={() => logout()}>Logout</button>
        </nav>
      </header>

      {view === 'home' ? <Home /> : null}
      {view === 'cart' ? <ShoppingCart onContinueShopping={() => setView('home')} /> : null}
      {view === 'profile' ? <ProfilePanel onDeleteAccount={() => setView('home')} /> : null}
      {view === 'products' ? <ProductsManager /> : null}
      {view === 'orders' ? <OrderHistory /> : null}
    </div>
  )
}

export default App
