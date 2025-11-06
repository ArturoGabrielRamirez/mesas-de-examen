import {
  collection,
  query,
  where,
  getDocs,
  writeBatch,
  doc,
  Timestamp,
  updateDoc,
} from "firebase/firestore"
import { getFirebaseDb } from "./firebase"
import { toast } from "sonner"

const COURSES = ["1° Año", "2° Año", "3° Año", "4° Año", "5° Año", "6° Año"]

export class PromotionService {
  private db = getFirebaseDb()

  getNextCourse(currentCourse: string): string {
    const index = COURSES.indexOf(currentCourse)
    if (index === -1 || index === COURSES.length - 1) {
      return "Egresado"
    }
    return COURSES[index + 1]
  }

  async calculateStudentAverage(studentId: string): Promise<number> {
    try {
      const gradesQuery = query(
        collection(this.db, "grades"),
        where("studentId", "==", studentId)
      )
      const snapshot = await getDocs(gradesQuery)
      
      if (snapshot.empty) return 0

      const grades = snapshot.docs.map(doc => doc.data().score as number)
      const average = grades.reduce((sum, grade) => sum + grade, 0) / grades.length
      
      return Math.round(average * 100) / 100
    } catch (err) {
      console.error("Error calculating average:", err)
      return 0
    }
  }

  async promoteStudents(options: {
    currentCourse: string
    academicYear: string
    mode: "automatic" | "manual"
    selectedStudentIds?: string[]
  }): Promise<{ promoted: number; failed: number }> {
    const batch = writeBatch(this.db)
    let promoted = 0
    let failed = 0

    try {
      const studentsQuery = query(
        collection(this.db, "users"),
        where("role", "==", "student"),
        where("course", "==", options.currentCourse),
        where("status", "==", "validated")
      )

      const snapshot = await getDocs(studentsQuery)

      for (const studentDoc of snapshot.docs) {
        const studentId = studentDoc.id

        // En modo manual, solo promover seleccionados
        if (options.mode === "manual" && !options.selectedStudentIds?.includes(studentId)) {
          continue
        }

        // En modo automático, verificar promedio
        if (options.mode === "automatic") {
          const average = await this.calculateStudentAverage(studentId)
          if (average < 6) {
            failed++
            continue
          }
        }

        const nextCourse = this.getNextCourse(options.currentCourse)

        batch.update(studentDoc.ref, {
          course: nextCourse,
          academicYear: options.academicYear,
          promotedAt: Timestamp.now(),
          previousCourse: options.currentCourse,
        })

        promoted++
      }

      await batch.commit()
      toast.success(`${promoted} estudiantes promovidos exitosamente`)
      
      if (failed > 0) {
        toast.info(`${failed} estudiantes no cumplieron el promedio mínimo`)
      }

      return { promoted, failed }
    } catch (err) {
      console.error("Error promoting students:", err)
      toast.error("Error al promover estudiantes")
      throw err
    }
  }

  async promoteStudent(studentId: string, newCourse: string, academicYear: string): Promise<void> {
    try {
      await updateDoc(doc(this.db, "users", studentId), {
        course: newCourse,
        academicYear,
        promotedAt: Timestamp.now(),
      })
      toast.success("Estudiante promovido")
    } catch (err) {
      console.error("Error promoting student:", err)
      toast.error("Error al promover estudiante")
      throw err
    }
  }

  async getStudentsByCourse(course: string) {
    try {
      const studentsQuery = query(
        collection(this.db, "users"),
        where("role", "==", "student"),
        where("course", "==", course),
        where("status", "==", "validated")
      )
      
      const snapshot = await getDocs(studentsQuery)
      
      return snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data(),
      }))
    } catch (err) {
      console.error("Error getting students:", err)
      return []
    }
  }
}

export const promotionService = new PromotionService()