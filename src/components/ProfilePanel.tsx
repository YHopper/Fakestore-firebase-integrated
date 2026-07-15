import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { deleteUserAccount, fetchUserProfile, updateUserProfile } from '../firebaseService'
import type { UserProfile } from '../types'

interface ProfilePanelProps {
  onDeleteAccount: () => void
}

export function ProfilePanel({ onDeleteAccount }: ProfilePanelProps) {
  const { user, logout } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.uid) {
        return
      }

      const loadedProfile = await fetchUserProfile(user.uid)
      if (loadedProfile) {
        setProfile(loadedProfile)
        setName(loadedProfile.name)
        setAddress(loadedProfile.address)
      }
    }

    loadProfile()
  }, [user?.uid])

  const handleSave = async () => {
    if (!user?.uid) {
      return
    }

    setSaving(true)
    try {
      await updateUserProfile(user.uid, { name, address })
      setMessage('Profile updated successfully')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!user?.uid) {
      return
    }

    setDeleting(true)
    try {
      await deleteUserAccount(user.uid)
      await logout()
      onDeleteAccount()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to delete account')
    } finally {
      setDeleting(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="card border-0 shadow-sm rounded-4 p-4">
      <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
        <div>
          <p className="eyebrow text-uppercase mb-1">Account</p>
          <h2 className="h4 fw-bold mb-1">Your profile</h2>
          <p className="text-muted mb-0">{user.email}</p>
        </div>
        <button type="button" className="btn btn-outline-danger btn-sm" onClick={handleDelete} disabled={deleting}>
          {deleting ? 'Deleting...' : 'Delete account'}
        </button>
      </div>

      {message ? <div className="alert alert-info py-2 px-3">{message}</div> : null}

      <div className="d-flex flex-column gap-3">
        <input className="form-control" value={name} onChange={(event) => setName(event.target.value)} placeholder="Full name" />
        <textarea className="form-control" value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Address" rows={3} />
        <div className="d-flex gap-2">
          <button type="button" className="btn btn-dark" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save profile'}
          </button>
          <button type="button" className="btn btn-outline-dark" onClick={() => logout()}>
            Logout
          </button>
        </div>
      </div>

      {profile ? (
        <div className="mt-4 small text-muted">
          <div>Member since: {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Unknown'}</div>
        </div>
      ) : null}
    </div>
  )
}
