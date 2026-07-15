import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { createProduct, deleteProduct, fetchProducts, updateProduct } from '../firebaseService'
import type { Product } from '../types'

const emptyProduct = {
  title: '',
  price: 0,
  category: '',
  description: '',
  image: '',
  rating: { rate: 0, count: 0 },
}

export function ProductsManager() {
  const [products, setProducts] = useState<Product[]>([])
  const [form, setForm] = useState(emptyProduct)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  const loadProducts = async () => {
    try {
      setLoading(true)
      const items = await fetchProducts()
      setProducts(items)
    } catch (error) {
      setProducts([])
      setMessage(error instanceof Error ? error.message : 'Unable to load products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadProducts()
  }, [])

  const resetForm = () => {
    setEditingId(null)
    setForm(emptyProduct)
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()

    try {
      if (editingId) {
        await updateProduct(editingId, form)
        setMessage('Product updated successfully')
      } else {
        await createProduct(form)
        setMessage('Product created successfully')
      }

      resetForm()
      await loadProducts()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to save product')
    }
  }

  const handleEdit = (product: Product) => {
    setEditingId(product.id)
    setForm({
      title: product.title,
      price: product.price,
      category: product.category,
      description: product.description,
      image: product.image,
      rating: product.rating,
    })
  }

  const handleDelete = async (productId: string) => {
    try {
      await deleteProduct(productId)
      await loadProducts()
      setMessage('Product deleted')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to delete product')
    }
  }

  return (
    <div className="card border-0 shadow-sm rounded-4 p-4">
      <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
        <div>
          <p className="eyebrow text-uppercase mb-1">Inventory</p>
          <h2 className="h4 fw-bold mb-1">Manage products</h2>
          <p className="text-muted mb-0">Create, update, and delete products stored in Firestore.</p>
        </div>
      </div>

      {message ? <div className="alert alert-info py-2 px-3">{message}</div> : null}

      <form onSubmit={handleSubmit} className="d-flex flex-column gap-2 mb-4">
        <input className="form-control" placeholder="Title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
        <input className="form-control" type="number" placeholder="Price" value={form.price} onChange={(event) => setForm({ ...form, price: Number(event.target.value) })} required />
        <input className="form-control" placeholder="Category" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} required />
        <textarea className="form-control" placeholder="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required />
        <input className="form-control" placeholder="Image URL" value={form.image} onChange={(event) => setForm({ ...form, image: event.target.value })} required />
        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-dark">{editingId ? 'Update product' : 'Create product'}</button>
          {editingId ? <button type="button" className="btn btn-outline-dark" onClick={resetForm}>Cancel</button> : null}
        </div>
      </form>

      {loading ? <p className="text-muted">Loading inventory...</p> : null}

      <div className="d-flex flex-column gap-2">
        {products.map((product) => (
          <div key={product.id} className="border rounded-4 p-3 d-flex justify-content-between align-items-start gap-3">
            <div>
              <h3 className="h6 fw-semibold mb-1">{product.title}</h3>
              <p className="text-muted small mb-0">{product.category} • ${product.price.toFixed(2)}</p>
            </div>
            <div className="d-flex gap-2">
              <button type="button" className="btn btn-outline-dark btn-sm" onClick={() => handleEdit(product)}>Edit</button>
              <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(product.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
