import { useState } from 'react'
import type { FormEvent } from 'react'
import { signInWithEmailAndPassword, signUpWithEmailAndPassword } from '../firebaseService'

interface AuthPanelProps {
  onAuthenticated: () => void
}

export function AuthPanel({ onAuthenticated }: AuthPanelProps) {
  const [isRegister, setIsRegister] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isRegister) {
        await signUpWithEmailAndPassword(email, password, name)
      } else {
        await signInWithEmailAndPassword(email, password)
      }

      onAuthenticated()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card border-0 shadow-sm rounded-4 p-4">
      <h2 className="h4 fw-bold mb-3">{isRegister ? 'Create your account' : 'Welcome back'}</h2>
      <p className="text-muted mb-4">
        {isRegister
          ? 'Register to access your profile, products, and orders from Firestore.'
          : 'Sign in to manage your account and place orders.'}
      </p>

      <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
        {isRegister ? (
          <input
            className="form-control"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Full name"
            required
          />
        ) : null}

        <input
          className="form-control"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email"
          type="email"
          required
        />

        <input
          className="form-control"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          type="password"
          required
        />

        {error ? <div className="alert alert-danger py-2 px-3 mb-0">{error}</div> : null}

        <button type="submit" className="btn btn-dark" disabled={loading}>
          {loading ? 'Please wait...' : isRegister ? 'Register' : 'Login'}
        </button>
      </form>

      <button
        type="button"
        className="btn btn-link px-0 mt-3"
        onClick={() => setIsRegister((value) => !value)}
      >
        {isRegister ? 'Already have an account? Sign in' : 'Need an account? Register'}
      </button>
    </div>
  )
}
