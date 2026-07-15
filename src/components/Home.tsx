import { useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'
import { addToCart } from '../features/cart/cartSlice'
import { fetchProducts } from '../firebaseService'
import type { AppDispatch } from '../store'
import type { Product } from '../types'

const placeholderImage = 'https://via.placeholder.com/300x300?text=No+Image'

export function Home() {
  const dispatch = useDispatch<AppDispatch>()
  const [products, setProducts] = useState<Product[]>([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true)
        const items = await fetchProducts()
        setProducts(items)
      } catch {
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  const categories = useMemo(() => {
    return Array.from(new Set(products.map((product) => product.category)))
  }, [products])

  const visibleProducts = useMemo(() => {
    if (selectedCategory === 'all') {
      return products
    }

    return products.filter((product) => product.category === selectedCategory)
  }, [products, selectedCategory])

  if (loading) {
    return <div className="status-card">Loading your mock storefront catalog...</div>
  }

  const handleAddToCart = (product: Product) => {
    dispatch(addToCart(product))
    setMessage(`${product.title} added to cart`)

    window.setTimeout(() => setMessage(''), 5000)
  }

  return (
    <section className="catalog-section">
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start gap-3 mb-4">
        <div className="hero-copy">
          <p className="eyebrow text-uppercase mb-2">Featured picks</p>
          <h1 className="display-6 fw-bold mb-2">Shop a polished mock storefront</h1>
          <p className="text-muted">
            Browse products managed from Firestore, build a cart, and complete a mock checkout in minutes.
          </p>
        </div>
        <div className="rounded-4 border p-3 shadow-sm bg-white">
          <p className="eyebrow text-uppercase mb-1">Catalog</p>
          <h2 className="h5 fw-bold mb-1">{products.length} live products</h2>
          <p className="text-muted small mb-0">Ready for browsing, editing, and checkout.</p>
        </div>
      </div>

      <label className="category-filter d-flex flex-column gap-2 mb-4" htmlFor="category-select">
        <span className="fw-semibold">Category</span>
        <select
          id="category-select"
          className="form-select w-auto"
          value={selectedCategory}
          onChange={(event) => setSelectedCategory(event.target.value)}
        >
          <option value="all">All categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </label>

      {message ? (
        <div className="alert alert-success py-2 px-3 mb-4" role="status">
          {message}
        </div>
      ) : null}

      <div className="product-grid row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
        {visibleProducts.map((product) => (
          <article className="col" key={product.id}>
            <div className="product-card card h-100 border-0 shadow-sm rounded-4 overflow-hidden">
              <img
                className="card-img-top p-3 bg-light"
                src={product.image}
                alt={product.title}
                style={{ height: '240px', objectFit: 'contain' }}
                onError={(event) => {
                  event.currentTarget.src = placeholderImage
                }}
              />
              <div className="card-body d-flex flex-column gap-2">
                <p className="category text-uppercase small fw-semibold mb-0">{product.category}</p>
                <h2 className="h5 fw-semibold mb-0">{product.title}</h2>
                <p className="description text-muted small flex-grow-1">
                  {product.description.slice(0, 110)}...
                </p>
                <div className="product-meta d-flex justify-content-between align-items-center mt-2">
                  <span className="rating badge bg-secondary-subtle text-dark">★ {product.rating.rate}</span>
                  <span className="price fw-bold">${product.price.toFixed(2)}</span>
                </div>
                <button type="button" className="btn btn-dark mt-2" onClick={() => handleAddToCart(product)}>
                  Add to cart
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
