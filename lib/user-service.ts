import { getFirebaseDb } from "./firebase"
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore"
import type { AppUser } from "@/types"

export async function getUserById(uid: string): Promise<AppUser | null> {
  const db = getFirebaseDb()
  const ref = doc(db, "users", uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null

  const data = snap.data() as any

  return {
    id: uid,
    role: data.role,
    displayName: data.displayName ?? `${data.name ?? ""} ${data.surname ?? ""}`.trim(), // ✅ asegura displayName
  }
}

export async function getTeachers(): Promise<AppUser[]> {
  const db = getFirebaseDb()
  const q = query(collection(db, "users"), where("role", "==", "teacher"))
  const snap = await getDocs(q)
  return snap.docs.map((d) => {
    const data = d.data() as any
    return {
      id: d.id,
      role: data.role,
      displayName: data.displayName ?? `${data.name ?? ""} ${data.surname ?? ""}`.trim(), // ✅ idem
    }
  })
}
