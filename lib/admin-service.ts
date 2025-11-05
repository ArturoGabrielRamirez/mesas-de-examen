import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  Timestamp,
  type Firestore,
} from "firebase/firestore"
import { getFirebaseDb } from "./firebase"
import type { User } from "@/types"
import { toast } from "sonner"

export class AdminService {
  private db: Firestore

  constructor() {
    this.db = getFirebaseDb()
  }

  async getPendingUsers(): Promise<User[]> {
    try {
      const q = query(collection(this.db, "users"), where("status", "==", "pending"))
      const snapshot = await getDocs(q)

      return snapshot.docs.map((doc) => {
        const data = doc.data() as Record<string, unknown>
        return {
          uid: doc.id,
          email: data.email as string,
          name: data.name as string,
          surname: (data.surname as string) || "",
          dni: data.dni as string,
          course: data.course as string,
          role: "student",
          status: "pending",
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
        } as User
      })
    } catch (err) {
      console.error("[v0] Error loading pending users:", err)
      return []
    }
  }

  async getAllUsers(role?: string, status?: string): Promise<User[]> {
    try {
      let q

      if (role && status) {
        q = query(collection(this.db, "users"), where("role", "==", role), where("status", "==", status))
      } else if (role) {
        q = query(collection(this.db, "users"), where("role", "==", role))
      } else if (status) {
        q = query(collection(this.db, "users"), where("status", "==", status))
      } else {
        q = collection(this.db, "users")
      }

      const snapshot = await getDocs(q)
      return snapshot.docs.map((doc) => {
        const data = doc.data() as Record<string, unknown>
        return {
          uid: doc.id,
          email: data.email as string,
          name: data.name as string,
          surname: (data.surname as string) || "",
          role: data.role as string,
          status: data.status as string,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
        } as User
      })
    } catch (err) {
      console.error("[v0] Error loading users:", err)
      return []
    }
  }

  async createTeacher(data: Partial<User>): Promise<void> {
    try {
      const teacherId = `teacher_${Date.now()}`
      await setDoc(doc(this.db, "users", teacherId), {
        ...data,
        role: "teacher",
        status: "validated",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      })
      toast.success("Profesor creado")
    } catch (err) {
      console.error("[v0] Error creating teacher:", err)
      toast.error("Error al crear profesor")
      throw err
    }
  }

  async updateUser(uid: string, data: Partial<User>): Promise<void> {
    try {
      await updateDoc(doc(this.db, "users", uid), {
        ...data,
        updatedAt: Timestamp.now(),
      })
      toast.success("Usuario actualizado")
    } catch (err) {
      console.error("[v0] Error updating user:", err)
      toast.error("Error al actualizar usuario")
      throw err
    }
  }

  async deleteUser(uid: string): Promise<void> {
    try {
      await updateDoc(doc(this.db, "users", uid), {
        status: "inactive",
        updatedAt: Timestamp.now(),
      })
      toast.success("Usuario desactivado")
    } catch (err) {
      console.error("[v0] Error deleting user:", err)
      toast.error("Error al desactivar usuario")
      throw err
    }
  }

  async getExamStatistics(): Promise<{ totalExams: number; totalGrades: number; averageScore: number }> {
    try {
      const examsSnapshot = await getDocs(collection(this.db, "exam_tables")).catch(() => ({
        docs: [],
      }))
      const gradesSnapshot = await getDocs(collection(this.db, "grades")).catch(() => ({
        docs: [],
      }))

      const averageScore =
        gradesSnapshot.docs.length > 0
          ? gradesSnapshot.docs.reduce((sum, doc) => {
              const score = ((doc.data() as Record<string, unknown>).score as number) || 0
              return sum + score
            }, 0) / gradesSnapshot.docs.length
          : 0

      return {
        totalExams: examsSnapshot.docs.length,
        totalGrades: gradesSnapshot.docs.length,
        averageScore: Math.round(averageScore * 100) / 100,
      }
    } catch (err) {
      console.error("[v0] Error loading statistics:", err)
      return { totalExams: 0, totalGrades: 0, averageScore: 0 }
    }
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return this.getAllUsers(role)
  }

  async createProfessor(data: { name: string; surname: string; email: string; password: string }): Promise<void> {
    try {
      const professorId = `teacher_${Date.now()}`
      await setDoc(doc(this.db, "users", professorId), {
        uid: professorId,
        email: data.email,
        name: data.name,
        surname: data.surname,
        role: "teacher",
        status: "validated",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      })
      toast.success("Profesor creado exitosamente")
    } catch (err: any) {
      console.error("[v0] Error creating professor:", err)
      toast.error(err.message || "Error al crear profesor")
      throw err
    }
  }

  async createPreceptor(data: { name: string; surname: string; email: string; password: string }): Promise<void> {
    try {
      const preceptorId = `preceptor_${Date.now()}`
      await setDoc(doc(this.db, "users", preceptorId), {
        uid: preceptorId,
        email: data.email,
        name: data.name,
        surname: data.surname,
        role: "preceptor",
        status: "validated",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      })
      toast.success("Preceptor creado exitosamente")
    } catch (err: any) {
      console.error("[v0] Error creating preceptor:", err)
      toast.error(err.message || "Error al crear preceptor")
      throw err
    }
  }
}

export const adminService = new AdminService()
