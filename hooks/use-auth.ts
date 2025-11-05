"use client"

import { useEffect, useState } from "react"
import { type User as FirebaseUser, onAuthStateChanged } from "firebase/auth"
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import type { User } from "@/types"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const auth = getFirebaseAuth()
    const db = getFirebaseDb()

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      try {
        if (firebaseUser) {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
          if (userDoc.exists()) {
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              ...userDoc.data(),
              createdAt: new Date(userDoc.data().createdAt?.seconds * 1000),
              updatedAt: new Date(userDoc.data().updatedAt?.seconds * 1000),
            } as User)
          }
        } else {
          setUser(null)
        }
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar usuario")
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  return { user, loading, error }
}
