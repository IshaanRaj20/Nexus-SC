import { useState, useRef } from 'react'
import {
  Camera,
  Mail,
  Fingerprint,
  Lock,
  CheckCircle2,
} from 'lucide-react'

import Card from '../components/ui/Card.jsx'
import Input from '../components/ui/Input.jsx'
import Button from '../components/ui/Button.jsx'
import PageHeader from '../components/layout/PageHeader.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { getInitials, getAvatarColor } from '../lib/userDisplay.js'

// Firestore has a 1 MiB document limit.
// We intentionally keep the image well below that so the rest of
// the user's profile document still has plenty of room.
const MAX_IMAGE_DATA_URL_CHARS = 700_000

export default function Profile() {
  const {
    currentUser,
    userProfile,
    updateUserProfile,
    resetPassword,
  } = useAuth()

  const fileInputRef = useRef(null)

  const initialName =
    userProfile?.name ||
    currentUser?.displayName ||
    ''

  const [name, setName] = useState(initialName)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [resetSent, setResetSent] = useState(false)

  const email = currentUser?.email || ''

  // Prefer the profile document's photoURL if available.
  // Fall back to Firebase Auth's photoURL.
  const photoURL =
    userProfile?.photoURL ||
    currentUser?.photoURL ||
    null

  const initials = getInitials(
    name || email,
    email
  )

  const avatarColor = getAvatarColor(
    currentUser?.uid || email
  )

  const handleSave = async (e) => {
    e.preventDefault()

    setSaving(true)
    setError(null)

    try {
      await updateUserProfile({ name })

      setSaved(true)

      setTimeout(() => {
        setSaved(false)
      }, 2500)
    } catch {
      setError(
        'Could not save your changes. Please try again.'
      )
    } finally {
      setSaving(false)
    }
  }

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0]

    if (!file || !currentUser) {
      return
    }

    setUploading(true)
    setError(null)

    try {
      // Automatically finds the largest/highest-quality version
      // that stays safely below our Firestore image limit.
      const optimizedImage = await resizeImage(file)

      await updateUserProfile({
        photoURL: optimizedImage,
      })
    } catch (err) {
      console.error('Profile photo error:', err)

      setError(
        err?.message ||
          'Photo upload failed. Try a different image.'
      )
    } finally {
      setUploading(false)

      // Allows selecting the same file again later.
      e.target.value = ''
    }
  }

  /**
   * Creates the largest/highest-quality JPEG that safely fits
   * inside the Firestore document budget.
   *
   * Strategy:
   * 1. Start at 1024px.
   * 2. Try very high quality.
   * 3. Lower JPEG quality if necessary.
   * 4. If quality gets too low, reduce dimensions.
   * 5. Never return an image larger than MAX_IMAGE_DATA_URL_CHARS.
   */
  function resizeImage(file) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const reader = new FileReader()

      reader.onload = (event) => {
        img.onload = () => {
          try {
            const result = createOptimizedImage(img)

            if (!result) {
              reject(
                new Error(
                  'This image is too large to safely store in your profile.'
                )
              )
              return
            }

            resolve(result)
          } catch (err) {
            reject(err)
          }
        }

        img.onerror = () => {
          reject(
            new Error(
              'Could not read this image. Try another picture.'
            )
          )
        }

        img.src = event.target.result
      }

      reader.onerror = () => {
        reject(
          new Error(
            'Could not read the selected file.'
          )
        )
      }

      reader.readAsDataURL(file)
    })
  }

  function createOptimizedImage(img) {
    let width = img.naturalWidth
    let height = img.naturalHeight

    if (!width || !height) {
      throw new Error('Invalid image dimensions.')
    }

    // Never create unnecessarily huge profile images.
    const MAX_DIMENSION = 1024

    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
      const scale =
        MAX_DIMENSION / Math.max(width, height)

      width = Math.round(width * scale)
      height = Math.round(height * scale)
    }

    // Try quality levels from high to lower.
    const qualityLevels = [
      0.92,
      0.88,
      0.84,
      0.80,
      0.76,
      0.72,
      0.68,
      0.64,
      0.60,
      0.56,
      0.52,
      0.48,
      0.44,
    ]

    // Keep reducing dimensions only when quality alone
    // isn't enough.
    for (let dimensionAttempt = 0; dimensionAttempt < 8; dimensionAttempt++) {
      const canvas = document.createElement('canvas')

      canvas.width = Math.max(1, Math.round(width))
      canvas.height = Math.max(1, Math.round(height))

      const ctx = canvas.getContext('2d')

      if (!ctx) {
        throw new Error(
          'Your browser could not process this image.'
        )
      }

      // Higher-quality image scaling.
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'

      ctx.drawImage(
        img,
        0,
        0,
        canvas.width,
        canvas.height
      )

      for (const quality of qualityLevels) {
        const dataURL = canvas.toDataURL(
          'image/jpeg',
          quality
        )

        if (
          dataURL.length <=
          MAX_IMAGE_DATA_URL_CHARS
        ) {
          return dataURL
        }
      }

      // Still too large.
      // Reduce dimensions by 15% while preserving
      // the original aspect ratio.
      width = Math.floor(width * 0.85)
      height = Math.floor(height * 0.85)

      if (width < 256 || height < 256) {
        break
      }
    }

    return null
  }

  const handleResetPassword = async () => {
    if (!email) {
      return
    }

    try {
      await resetPassword(email)

      setResetSent(true)

      setTimeout(() => {
        setResetSent(false)
      }, 4000)
    } catch {
      // Auth context can handle/display the error if needed.
    }
  }

  return (
    <div>
      <PageHeader
        title="Profile"
        subtitle="Manage your account and profile settings."
      />

      {/* Profile Picture */}
      <Card className="p-6 flex flex-col items-center gap-4 mb-6">
        <div className="relative">
          {photoURL ? (
            <img
              src={photoURL}
              alt="Profile"
              className="w-24 h-24 rounded-2xl object-cover"
            />
          ) : (
            <div
              className="w-24 h-24 rounded-2xl flex items-center justify-center text-white text-3xl font-semibold"
              style={{
                backgroundColor: avatarColor,
              }}
            >
              {initials}
            </div>
          )}

          <button
            type="button"
            onClick={() =>
              fileInputRef.current?.click()
            }
            disabled={uploading}
            aria-label="Change profile picture"
            className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-signal-600 hover:bg-signal-700 text-white flex items-center justify-center shadow-soft transition-colors disabled:opacity-60"
          >
            <Camera size={16} />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoSelect}
          />
        </div>

        {uploading && (
          <p className="text-xs text-[var(--text-secondary)]">
            Optimizing photo…
          </p>
        )}
      </Card>

      {/* Account Information */}
      <Card className="p-6 mb-6">
        <form
          onSubmit={handleSave}
          className="flex flex-col gap-4"
        >
          <Input
            label="Full name"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            placeholder="Your name"
          />

          <Input
            label="Email"
            value={email}
            icon={Mail}
            disabled
            hint="Contact support to change the email on your account."
          />

          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] bg-[var(--bg-surface-2)] rounded-xl px-3 py-2.5">
            <Fingerprint
              size={15}
              className="shrink-0"
            />

            <span className="truncate">
              User ID: {currentUser?.uid}
            </span>
          </div>

          {error && (
            <p className="text-sm text-danger bg-danger/10 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex items-center gap-3">
            <Button
              type="submit"
              disabled={
                saving ||
                name.trim() ===
                  initialName.trim()
              }
            >
              {saving
                ? 'Saving…'
                : 'Save changes'}
            </Button>

            {saved && (
              <span className="text-sm text-success flex items-center gap-1.5">
                <CheckCircle2 size={16} />
                Saved
              </span>
            )}
          </div>
        </form>
      </Card>

      {/* Password */}
      <Card className="p-6">
        <h3 className="font-display font-semibold text-sm mb-1">
          Password
        </h3>

        <p className="text-xs text-[var(--text-secondary)] mb-4">
          We'll email you a secure link to set a new password.
        </p>

        <Button
          variant="secondary"
          onClick={handleResetPassword}
        >
          <Lock size={16} />
          Send password reset email
        </Button>

        {resetSent && (
          <p className="text-sm text-success mt-3 flex items-center gap-1.5">
            <CheckCircle2 size={16} />
            Reset email sent to {email}
          </p>
        )}
      </Card>
    </div>
  )
}