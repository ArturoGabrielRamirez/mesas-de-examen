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
  type QueryDocumentSnapshot,
  type DocumentData,
} from "firebase/firestore"
import { getFirebaseDb } from "./firebase"
import type { ExamTable } from "@/types"
import { toast } from "sonner"

export class TeacherService {
  private db: Firestore

  constructor() {
    this.db = getFirebaseDb()
  }

  private docToExam(doc: QueryDocumentSnapshot<DocumentData>): ExamTable {
    const data = doc.data()
    return {
      id: doc.id,
      subjectId: (data.subjectId as string) || "",
      subjectName: (data.subjectName as string) || "", // Added subjectName field
      teacherId: (data.teacherId as string) || "",
      date: data.date instanceof Timestamp ? data.date.toDate() : new Date(),
      startTime: (data.startTime as string) || "",
      endTime: (data.endTime as string) || "", // Added endTime field
      room: (data.room as string) || "",
      status: (data.status as string) || "scheduled",
      maxStudents: (data.maxStudents as number) || 30,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(),
    } as ExamTable
  }

  async createExamTable(data: Omit<ExamTable, "id" | "createdAt" | "updatedAt">, teacherId: string): Promise<string> {
    try {
      const examId = `exam_${Date.now()}`
      await setDoc(doc(this.db, "exam_tables", examId), {
        ...data,
        teacherId,
        date: Timestamp.fromDate(new Date(data.date)),
        status: "scheduled",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      })
      toast.success("Mesa de examen creada")
      return examId
    } catch (error) {
      console.error("[v0] Error creating exam table:", error)
      toast.error("Error al crear mesa")
      throw error
    }
  }

  async getTeacherExams(teacherId: string): Promise<ExamTable[]> {
    try {
      const q = query(collection(this.db, "exam_tables"), where("teacherId", "==", teacherId))
      const snapshot = await getDocs(q)
      const exams = snapshot.docs.map((doc) => this.docToExam(doc))

      // Calculate real-time status for each exam
      return exams.map((exam) => ({
        ...exam,
        status: this.calculateExamStatus(exam),
      }))
    } catch (error) {
      console.error("[v0] Error loading teacher exams:", error)
      toast.error("Error al cargar mesas")
      return []
    }
  }

  private calculateExamStatus(exam: ExamTable): "scheduled" | "in_progress" | "completed" | "cancelled" {
    // If manually cancelled, keep that status
    if (exam.status === "cancelled") return "cancelled"

    const now = new Date()
    const examDate = new Date(exam.date)
    const [startHour, startMin] = exam.startTime.split(":").map(Number)
    const [endHour, endMin] = exam.endTime.split(":").map(Number)

    const startDateTime = new Date(examDate)
    startDateTime.setHours(startHour, startMin, 0, 0)

    const endDateTime = new Date(examDate)
    endDateTime.setHours(endHour, endMin, 0, 0)

    if (now < startDateTime) return "scheduled"
    if (now >= startDateTime && now <= endDateTime) return "in_progress"
    return "completed"
  }

  async recordGrade(
    examTableId: string,
    studentId: string,
    score: number,
    observations: string,
    teacherId: string,
  ): Promise<void> {
    try {
      const gradeId = `grade_${examTableId}_${studentId}`
      await setDoc(doc(this.db, "grades", gradeId), {
        examTableId,
        studentId,
        score,
        observations,
        recordedBy: teacherId,
        recordedAt: Timestamp.now(),
      })
      toast.success("Calificación registrada")
    } catch (error) {
      console.error("[v0] Error recording grade:", error)
      toast.error("Error al registrar calificación")
      throw error
    }
  }

  async recordAttendance(examTableId: string, studentId: string, status: string, teacherId: string): Promise<void> {
    try {
      const attendanceId = `attendance_${examTableId}_${studentId}`
      await setDoc(doc(this.db, "attendance", attendanceId), {
        examTableId,
        studentId,
        status,
        recordedBy: teacherId,
        recordedAt: Timestamp.now(),
      })
      toast.success("Asistencia registrada")
    } catch (error) {
      console.error("[v0] Error recording attendance:", error)
      toast.error("Error al registrar asistencia")
      throw error
    }
  }

  async getExamReservations(examTableId: string) {
    try {
      const q = query(
        collection(this.db, "reservations"),
        where("examTableId", "==", examTableId),
        where("status", "==", "confirmed"),
      )
      const snapshot = await getDocs(q)
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        examTableId: (doc.data().examTableId as string) || "",
        studentId: (doc.data().studentId as string) || "",
        status: (doc.data().status as string) || "",
        createdAt: doc.data().createdAt instanceof Timestamp ? doc.data().createdAt.toDate() : new Date(),
      }))
    } catch (error) {
      console.error("[v0] Error loading exam reservations:", error)
      toast.error("Error al cargar reservas")
      return []
    }
  }

  async updateExamStatus(examTableId: string, status: string): Promise<void> {
    try {
      await updateDoc(doc(this.db, "exam_tables", examTableId), {
        status,
        updatedAt: Timestamp.now(),
      })
      toast.success("Estado actualizado")
    } catch (error) {
      console.error("[v0] Error updating exam status:", error)
      toast.error("Error al actualizar estado")
      throw error
    }
  }

  async updateExamTable(examTableId: string, data: Partial<ExamTable>): Promise<void> {
    try {
      const updateData: Record<string, unknown> = {
        updatedAt: Timestamp.now(),
      }

      if (data.subjectId) updateData.subjectId = data.subjectId
      if (data.subjectName) updateData.subjectName = data.subjectName
      if (data.startTime) updateData.startTime = data.startTime
      if (data.endTime) updateData.endTime = data.endTime // Added endTime update
      if (data.room) updateData.room = data.room
      if (data.date) updateData.date = Timestamp.fromDate(new Date(data.date))
      if (data.maxStudents) updateData.maxStudents = data.maxStudents
      if (data.status) updateData.status = data.status

      await updateDoc(doc(this.db, "exam_tables", examTableId), updateData)
      toast.success("Mesa de examen actualizada")
    } catch (error) {
      console.error("[v0] Error updating exam table:", error)
      toast.error("Error al actualizar mesa")
      throw error
    }
  }

  async deleteExamTable(examTableId: string): Promise<void> {
    try {
      await updateDoc(doc(this.db, "exam_tables", examTableId), {
        status: "cancelled",
        updatedAt: Timestamp.now(),
      })
      toast.success("Mesa de examen cancelada")
    } catch (error) {
      console.error("[v0] Error deleting exam table:", error)
      toast.error("Error al cancelar mesa")
      throw error
    }
  }

  async getGradesByExam(examTableId: string) {
    try {
      const q = query(collection(this.db, "grades"), where("examTableId", "==", examTableId))
      const snapshot = await getDocs(q)
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        examTableId: (doc.data().examTableId as string) || "",
        studentId: (doc.data().studentId as string) || "",
        score: (doc.data().score as number) || 0,
        observations: (doc.data().observations as string) || "",
        recordedBy: (doc.data().recordedBy as string) || "",
        recordedAt: doc.data().recordedAt instanceof Timestamp ? doc.data().recordedAt.toDate() : new Date(),
      }))
    } catch (error) {
      console.error("[v0] Error loading grades:", error)
      toast.error("Error al cargar calificaciones")
      return []
    }
  }

  async getAttendanceByExam(examTableId: string) {
    try {
      const q = query(collection(this.db, "attendance"), where("examTableId", "==", examTableId))
      const snapshot = await getDocs(q)
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        examTableId: (doc.data().examTableId as string) || "",
        studentId: (doc.data().studentId as string) || "",
        status: (doc.data().status as string) || "",
        recordedBy: (doc.data().recordedBy as string) || "",
        recordedAt: doc.data().recordedAt instanceof Timestamp ? doc.data().recordedAt.toDate() : new Date(),
      }))
    } catch (error) {
      console.error("[v0] Error loading attendance:", error)
      toast.error("Error al cargar asistencia")
      return []
    }
  }
}

export const teacherService = new TeacherService()
