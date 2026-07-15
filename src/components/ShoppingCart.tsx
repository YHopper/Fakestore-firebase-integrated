import { useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { clearCart, removeFromCart, updateQuantity } from '../features/cart/cartSlice'
import { createOrder } from '../firebaseService'
import { useAuth } from '../hooks/useAuth'
import type { AppDispatch, RootState } from '../store'

interface ShoppingCartProps {
  onContinueShopping: () => void
}

export function ShoppingCart({ onContinueShopping }: ShoppingCartProps) {
  const dispatch = useDispatch<AppDispatch>()
  const items = useSelector((state: RootState) => state.cart)
  const { user } = useAuth()
  const [checkoutComplete, setCheckoutComplete] = useState(false)
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  )

  const totalPrice = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  )

  const handleCheckout = async () => {
    if (!user?.uid) {
      setMessage('Please sign in before checking out')
      return
    }

    setSubmitting(true)
    try {
      await createOrder(user.uid, user.email ?? 'unknown@example.com', items.map((item) => ({ ...item, quantity: item.quantity })), totalPrice)
      dispatch(clearCart())
      setCheckoutComplete(true)
      setMessage('Order saved successfully')
      window.setTimeout(() => setCheckoutComplete(false), 2200)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to save your order')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRemoveItem = (itemId: string, title: string) => {
    dispatch(removeFromCart(itemId))
    setMessage(`${title} removed from cart`)
    window.setTimeout(() => setMessage(''), 5000)
  }

  return (
    <section className="cart-section">
      <div className="cart-header d-flex justify-content-between align-items-center mb-4">
        <div>
          <p className="eyebrow text-uppercase mb-1">Your bag</p>
          <h1 className="h3 fw-bold mb-0">Shopping cart</h1>
        </div>
        <div className="cart-summary-card rounded-4 border p-3 shadow-sm">
          <p className="mb-1">{totalItems} items</p>
          <strong>${totalPrice.toFixed(2)}</strong>
        </div>
      </div>

      {message ? (
        <div className="alert alert-warning py-2 px-3 mb-0" role="status">
          {message}
        </div>
      ) : null}

      {items.length === 0 ? (
        <div className="empty-state rounded-4 border p-4 shadow-sm text-center">
          {checkoutComplete ? (
            <p className="success-message fw-bold text-success mb-3">Checkout complete. Your cart is empty.</p>
          ) : (
            <p className="text-muted mb-3">Your cart is empty. Add a few favorites to get started.</p>
          )}
          <button type="button" className="btn btn-dark" onClick={onContinueShopping}>
            Continue shopping
          </button>
        </div>
      ) : (
        <div className="cart-layout row g-4">
          <ul className="cart-list col-lg-8 list-unstyled d-flex flex-column gap-3">
            {items.map((item) => (
              <li className="cart-item rounded-4 border p-3 shadow-sm" key={item.id}>
                <img src={item.image} alt={item.title} className="rounded-3" style={{ width: '100px', height: '100px', objectFit: 'contain' }} />
                <div className="cart-item-info">
                  <h2 className="h6 fw-semibold mb-1">{item.title}</h2>
                  <p className="text-muted small mb-2">{item.category}</p>
                  <div className="quantity-controls d-flex align-items-center gap-2">
                    <button
                      type="button"
                      className="btn btn-outline-dark btn-sm"
                      onClick={() =>
                        dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }))
                      }
                    >
                      −
                    </button>
                    <span className="fw-semibold">{item.quantity}</span>
                    <button
                      type="button"
                      className="btn btn-outline-dark btn-sm"
                      onClick={() =>
                        dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))
                      }
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="cart-item-actions d-flex flex-column align-items-end gap-2">
                  <strong>${(item.price * item.quantity).toFixed(2)}</strong>
                  <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => handleRemoveItem(item.id, item.title)}>
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <aside className="checkout-card rounded-4 border p-4 shadow-sm col-lg-4">
            <h2 className="h5 fw-semibold mb-3">Checkout</h2>
            <div className="checkout-row d-flex justify-content-between mb-2">
              <span>Items</span>
              <span>{totalItems}</span>
            </div>
            <div className="checkout-row d-flex justify-content-between mb-3">
              <span>Total</span>
              <strong>${totalPrice.toFixed(2)}</strong>
            </div>
            <button type="button" className="btn btn-dark" onClick={handleCheckout} disabled={submitting}>
              {submitting ? 'Saving order...' : 'Complete checkout'}
            </button>
          </aside>
        </div>
      )}
    </section>
  )
}
