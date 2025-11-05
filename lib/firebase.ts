import { initializeApp, getApps } from "firebase/app"
import { getAuth, type Auth } from "firebase/auth"
import { getFirestore, type Firestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "",
}

function validateFirebaseConfig(): boolean {
  const requiredKeys = ["apiKey", "authDomain", "projectId", "appId"]
  return requiredKeys.every((key) => {
    const value = firebaseConfig[key as keyof typeof firebaseConfig]
    if (!value) {
      console.error(`[Firebase] Missing required config: ${key}`)
      return false
    }
    return true
  })
}

let auth: Auth | null = null
let db: Firestore | null = null
let initialized = false

export function initializeFirebase() {
  if (initialized) return

  if (!validateFirebaseConfig()) {
    throw new Error("Firebase configuration is incomplete. Check your .env.local file.")
  }

  if (getApps().length === 0) {
    const app = initializeApp(firebaseConfig)
    auth = getAuth(app)
    db = getFirestore(app)
  } else {
    const app = getApps()[0]
    auth = getAuth(app)
    db = getFirestore(app)
  }

  initialized = true
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    initializeFirebase()
  }
  if (!auth) {
    throw new Error("Firebase Auth could not be initialized")
  }
  return auth
}

export function getFirebaseDb(): Firestore {
  if (!db) {
    initializeFirebase()
  }
  if (!db) {
    throw new Error("Firebase Firestore could not be initialized")
  }
  return db
}

export { auth, db }
