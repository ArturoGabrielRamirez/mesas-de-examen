import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  type Auth,
} from "firebase/auth"
import { doc, setDoc, getDoc, Timestamp, type Firestore } from "firebase/firestore"
import { getFirebaseAuth, getFirebaseDb } from "./firebase"
import type { User, SignupData, UserRole } from "@/types"
import { toast } from "sonner"

export class AuthService {
  private auth: Auth
  private db: Firestore

  constructor() {
    this.auth = getFirebaseAuth()
    this.db = getFirebaseDb()
  }

  async signup(data: SignupData): Promise<User> {
    try {
      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(this.auth, data.email, data.password)

      // Crear documento en Firestore con estado pending
      const newUser: User = {
        uid: userCredential.user.uid,
        email: data.email,
        name: data.name,
        surname: data.surname,
        role: "student" as UserRole,
        status: "pending",
        dni: data.dni,
        course: data.course,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      await setDoc(doc(this.db, "users", userCredential.user.uid), {
        ...newUser,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      })

      toast.success("Registro enviado. Aguardando validación administrativa.")
      return newUser
    } catch (error: any) {
      const message = error.code === "auth/email-already-in-use" ? "Email ya registrado" : error.message
      toast.error(message)
      throw error
    }
  }

  async login(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password)
      const userDoc = await getDoc(doc(this.db, "users", userCredential.user.uid))

      if (!userDoc.exists()) {
        throw new Error("Usuario no encontrado en base de datos")
      }

      const userData = userDoc.data()

      // Validar estado del usuario
      if (userData.status === "pending") {
        toast.error("Tu cuenta está pendiente de validación. Por favor, aguarda.")
        throw new Error("Account pending validation")
      }

      if (userData.status === "rejected") {
        toast.error("Tu solicitud de registro fue rechazada.")
        throw new Error("Account rejected")
      }

      return {
        uid: userCredential.user.uid,
        email: userCredential.user.email || "",
        ...userData,
        createdAt: new Date(userData.createdAt?.seconds * 1000),
        updatedAt: new Date(userData.updatedAt?.seconds * 1000),
      } as User
    } catch (error: any) {
      const message = error.code === "auth/invalid-credential" ? "Email o contraseña incorrectos" : error.message
      toast.error(message)
      throw error
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.auth)
      toast.success("Sesión cerrada")
    } catch (error: any) {
      toast.error("Error al cerrar sesión")
      throw error
    }
  }

  async validateStudent(uid: string, validatedBy: string): Promise<void> {
    try {
      const userRef = doc(this.db, "users", uid)
      await setDoc(
        userRef,
        {
          status: "validated",
          validatedBy,
          validatedAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        },
        { merge: true },
      )
      toast.success("Estudiante validado")
    } catch (error: any) {
      toast.error("Error al validar estudiante")
      throw error
    }
  }

  async rejectStudent(uid: string): Promise<void> {
    try {
      const userRef = doc(this.db, "users", uid)
      await setDoc(
        userRef,
        {
          status: "rejected",
          updatedAt: Timestamp.now(),
        },
        { merge: true },
      )
      toast.success("Solicitud rechazada")
    } catch (error: any) {
      toast.error("Error al rechazar solicitud")
      throw error
    }
  }

  async deleteUser(uid: string): Promise<void> {
    try {
      const userRef = doc(this.db, "users", uid)
      await setDoc(
        userRef,
        {
          status: "inactive",
          updatedAt: Timestamp.now(),
        },
        { merge: true },
      )
      toast.success("Usuario desactivado")
    } catch (error: any) {
      toast.error("Error al desactivar usuario")
      throw error
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(this.auth, email)
      toast.success("Email de recuperación enviado. Revisa tu bandeja de entrada y carpeta de spam.")
    } catch (error: any) {
      const message =
        error.code === "auth/user-not-found"
          ? "No existe una cuenta con este email. Contacta con la administración del colegio para asistencia."
          : "Error al enviar email de recuperación"
      toast.error(message)
      throw error
    }
  }

  async sendEmailVerification(): Promise<void> {
    try {
      const user = this.auth.currentUser
      if (!user) {
        throw new Error("No hay usuario autenticado")
      }

      const { sendEmailVerification: sendVerification } = await import("firebase/auth")
      await sendVerification(user)
      toast.success("Email de verificación enviado")
    } catch (error: any) {
      toast.error("Error al enviar email de verificación")
      throw error
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const currentUser = this.auth.currentUser
      if (!currentUser) return null

      const userDoc = await getDoc(doc(this.db, "users", currentUser.uid))
      if (!userDoc.exists()) return null

      const userData = userDoc.data()
      return {
        uid: currentUser.uid,
        email: currentUser.email || "",
        ...userData,
        createdAt: new Date(userData.createdAt?.seconds * 1000),
        updatedAt: new Date(userData.updatedAt?.seconds * 1000),
      } as User
    } catch (error) {
      console.error("[v0] Error getting current user:", error)
      return null
    }
  }
}

export const authService = new AuthService()
