import { useEffect, useState, useCallback } from 'react'
import { collection, doc, updateDoc, onSnapshot, query, orderBy, writeBatch } from 'firebase/firestore'
import { db } from '../lib/firebase.js'
import { useAuth } from '../context/AuthContext.jsx'

// Real-time notifications for the signed-in user, stored at
// users/{uid}/notifications/{id}. "Dismiss" only ever sets dismissed:true —
// it never deletes the document, per the requirement that dismissing must
// not destroy the underlying record.
export function useNotifications() {
  const { currentUser } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentUser) {
      setItems([])
      setLoading(false)
      return
    }
    const colRef = collection(db, 'users', currentUser.uid, 'notifications')
    const q = query(colRef, orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
        setLoading(false)
      },
      (err) => {
        console.error('useNotifications failed:', err)
        setLoading(false)
      }
    )
    return unsubscribe
  }, [currentUser])

  const visible = items.filter((n) => !n.dismissed)
  const unreadCount = visible.filter((n) => !n.read).length

  const markRead = useCallback(
    async (id) => {
      if (!currentUser) return
      await updateDoc(doc(db, 'users', currentUser.uid, 'notifications', id), { read: true })
    },
    [currentUser]
  )

  const dismiss = useCallback(
    async (id) => {
      if (!currentUser) return
      await updateDoc(doc(db, 'users', currentUser.uid, 'notifications', id), { dismissed: true })
    },
    [currentUser]
  )

  const dismissAll = useCallback(async () => {
    if (!currentUser || visible.length === 0) return
    const batch = writeBatch(db)
    visible.forEach((n) => {
      batch.update(doc(db, 'users', currentUser.uid, 'notifications', n.id), { dismissed: true })
    })
    await batch.commit()
  }, [currentUser, visible])

  return { notifications: visible, unreadCount, loading, markRead, dismiss, dismissAll }
}
