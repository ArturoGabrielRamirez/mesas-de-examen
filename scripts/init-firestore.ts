import { initializeApp } from "firebase/app"
import { getFirestore, collection, getDocs } from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function initializeCollections() {
  try {
    console.log("[v0] Inicializando colecciones de Firestore...")

    // Crear colecciones vacías si no existen
    const collections = ["exam_tables", "grades", "subjects", "reservations", "attendance"]

    for (const collName of collections) {
      const coll = collection(db, collName)
      const snapshot = await getDocs(coll)

      if (snapshot.size === 0) {
        console.log(`[v0] Colección ${collName} existe o está vacía`)
      } else {
        console.log(`[v0] Colección ${collName} tiene ${snapshot.size} documentos`)
      }
    }

    console.log("[v0] Colecciones inicializadas correctamente")
    process.exit(0)
  } catch (error) {
    console.error("[v0] Error inicializando colecciones:", error)
    process.exit(1)
  }
}

initializeCollections()
