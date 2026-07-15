import { useEffect, useState } from 'react'
import type { User } from 'firebase/auth'
import { listenToAuthState, logOut } from '../firebaseService'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = listenToAuthState((nextUser) => {
      setUser(nextUser)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return {
    user,
    loading,
    logout: logOut,
  }
}
