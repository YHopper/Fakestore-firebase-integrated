import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { fetchOrdersForUser } from '../firebaseService'
import type { Order } from '../types'

export function OrderHistory() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    const loadOrders = async () => {
      if (!user?.uid) {
        return
      }

      const userOrders = await fetchOrdersForUser(user.uid)
      setOrders(userOrders)
    }

    loadOrders()
  }, [user?.uid])

  return (
    <div className="card border-0 shadow-sm rounded-4 p-4">
      <p className="eyebrow text-uppercase mb-1">Orders</p>
      <h2 className="h4 fw-bold mb-3">Order history</h2>

      {orders.length === 0 ? (
        <p className="text-muted">No orders yet. Complete a checkout to see them here.</p>
      ) : (
        <div className="d-flex flex-column gap-3">
          {orders.map((order) => (
            <div key={order.id} className="border rounded-4 p-3">
              <div className="d-flex justify-content-between align-items-start gap-3">
                <div>
                  <h3 className="h6 fw-semibold mb-1">Order #{order.id.slice(0, 8)}</h3>
                  <p className="text-muted small mb-0">{order.createdAt ? new Date(order.createdAt).toLocaleString() : 'Unknown date'}</p>
                </div>
                <div className="text-end">
                  <p className="fw-semibold mb-1">${order.total.toFixed(2)}</p>
                  <button type="button" className="btn btn-outline-dark btn-sm" onClick={() => setSelectedOrder(order)}>View details</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedOrder ? (
        <div className="mt-4 border rounded-4 p-3 bg-light">
          <h3 className="h6 fw-semibold mb-2">Order details</h3>
          <p className="text-muted small mb-2">{selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : ''}</p>
          <ul className="list-unstyled mb-0 d-flex flex-column gap-2">
            {selectedOrder.items.map((item) => (
              <li key={item.id} className="d-flex justify-content-between gap-3">
                <span>{item.title} × {item.quantity}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 fw-semibold">Total: ${selectedOrder.total.toFixed(2)}</div>
        </div>
      ) : null}
    </div>
  )
}
