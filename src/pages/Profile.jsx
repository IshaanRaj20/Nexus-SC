import { useState, useRef } from 'react'
import { Camera, Mail, Fingerprint, Lock, CheckCircle2 } from 'lucide-react'
import Card from '../components/ui/Card.jsx'
import Input from '../components/ui/Input.jsx'
import Button from '../components/ui/Button.jsx'
import PageHeader from '../components/layout/PageHeader.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { getInitials, getAvatarColor } from '../lib/userDisplay.js'

export default function Profile() {
  const { currentUser, userProfile, updateUserProfile, resetPassword } = useAuth()
  const fileInputRef = useRef(null)

  const initialName = userProfile?.name || currentUser?.displayName || ''
  const [name, setName] = useState(initialName)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [resetSent, setResetSent] = useState(false)

  const email = currentUser?.email || ''
  const photoURL = currentUser?.photoURL
  const initials = getInitials(name || email, email)
  const avatarColor = getAvatarColor(currentUser?.uid || email)

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await updateUserProfile({ name })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch {
      setError('Could not save your changes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !currentUser) return
    setUploading(true)
    setError(null)
    try {
      const resizedBase64 = await resizeImage(file, 256, 256, 0.8)
      await updateUserProfile({ photoURL: resizedBase64 })
    } catch {
      setError('Photo upload failed. Try a different image.')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  // Resizes/compresses the image client-side so it fits comfortably inside a
  // Firestore document (1MB limit) — this avoids needing Firebase Storage
  // (a paid product) entirely; the image is just stored as a data URL string
  // on the user's profile document.
  function resizeImage(file, maxWidth, maxHeight, quality) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const reader = new FileReader()

      reader.onload = (e) => {
        img.onload = () => {
          let { width, height } = img
          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width
              width = maxWidth
            }
          } else if (height > maxHeight) {
            width *= maxHeight / height
            height = maxHeight
          }

          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, width, height)

          resolve(canvas.toDataURL('image/jpeg', quality))
        }
        img.onerror = reject
        img.src = e.target.result
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleResetPassword = async () => {
    if (!email) return
    try {
      await resetPassword(email)
      setResetSent(true)
      setTimeout(() => setResetSent(false), 4000)
    } catch {
      // authError is surfaced via context if needed; keep this button forgiving
    }
  }

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <PageHeader title="Profile" subtitle="This is what other parts of Nexus will show for you." />

      <Card className="p-6 flex flex-col items-center gap-4 mb-6">
        <div className="relative">
          {photoURL ? (
            <img src={photoURL} alt="" className="w-24 h-24 rounded-2xl object-cover" />
          ) : (
            <div
              className="w-24 h-24 rounded-2xl flex items-center justify-center text-white text-3xl font-semibold"
              style={{ backgroundColor: avatarColor }}
            >
              {initials}
            </div>
          )}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            aria-label="Change profile picture"
            className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-signal-600 hover:bg-signal-700 text-white flex items-center justify-center shadow-soft transition-colors disabled:opacity-60"
          >
            <Camera size={16} />
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoSelect} />
        </div>
        {uploading && <p className="text-xs text-[var(--text-secondary)]">Uploading photo…</p>}
      </Card>

      <Card className="p-6 mb-6">
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />

          <Input label="Email" value={email} icon={Mail} disabled hint="Contact support to change the email on your account." />

          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] bg-[var(--bg-surface-2)] rounded-xl px-3 py-2.5">
            <Fingerprint size={15} className="shrink-0" />
            <span className="truncate">User ID: {currentUser?.uid}</span>
          </div>

          {error && <p className="text-sm text-danger bg-danger/10 rounded-lg px-3 py-2">{error}</p>}

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={saving || name.trim() === initialName.trim()}>
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
            {saved && (
              <span className="text-sm text-success flex items-center gap-1.5">
                <CheckCircle2 size={16} /> Saved
              </span>
            )}
          </div>
        </form>
      </Card>

      <Card className="p-6">
        <h3 className="font-display font-semibold text-sm mb-1">Password</h3>
        <p className="text-xs text-[var(--text-secondary)] mb-4">
          We'll email you a secure link to set a new password.
        </p>
        <Button variant="secondary" onClick={handleResetPassword}>
          <Lock size={16} /> Send password reset email
        </Button>
        {resetSent && (
          <p className="text-sm text-success mt-3 flex items-center gap-1.5">
            <CheckCircle2 size={16} /> Reset email sent to {email}
          </p>
        )}
      </Card>
    </div>
  )
}
