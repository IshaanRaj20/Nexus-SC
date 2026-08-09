import { useEffect, useState, useCallback } from 'react'
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '../lib/firebase.js'
import { useAuth } from '../context/AuthContext.jsx'

// Generic real-time CRUD hook for a signed-in user's data, stored at
// users/{uid}/{collectionName}/{docId}. Every write automatically satisfies
// firestore.rules, since that path is already scoped to isOwner(uid).
//
// Usage:
//   const { items, loading, addItem, updateItem, removeItem } = useUserCollection('tasks')
export function useUserCollection(collectionName, { orderByField, direction = 'desc' } = {}) {
  const { currentUser } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentUser) {
      setItems([])
      setLoading(false)
      return
    }
    setLoading(true)
    const colRef = collection(db, 'users', currentUser.uid, collectionName)
    const q = orderByField ? query(colRef, orderBy(orderByField, direction)) : colRef

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
        setLoading(false)
      },
      (err) => {
        console.error(`useUserCollection(${collectionName}) failed:`, err)
        setLoading(false)
      }
    )
    return unsubscribe
  }, [currentUser, collectionName, orderByField, direction])

  const addItem = useCallback(
    async (data) => {
      if (!currentUser) return
      const colRef = collection(db, 'users', currentUser.uid, collectionName)
      return addDoc(colRef, { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
    },
    [currentUser, collectionName]
  )

  const updateItem = useCallback(
    async (id, data) => {
      if (!currentUser) return
      const ref = doc(db, 'users', currentUser.uid, collectionName, id)
      return updateDoc(ref, { ...data, updatedAt: serverTimestamp() })
    },
    [currentUser, collectionName]
  )

  const removeItem = useCallback(
    async (id) => {
      if (!currentUser) return
      const ref = doc(db, 'users', currentUser.uid, collectionName, id)
      return deleteDoc(ref)
    },
    [currentUser, collectionName]
  )

  return { items, loading, addItem, updateItem, removeItem }
}
