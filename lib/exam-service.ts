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
  getDoc,
} from "firebase/firestore"
import { getFirebaseDb } from "./firebase"
import type { ExamTable } from "@/types"
import { toast } from "sonner"

export class ExamService {
  private db: Firestore

  constructor() {
    this.db = getFirebaseDb()
  }

  private docToExam(doc: QueryDocumentSnapshot<DocumentData>): ExamTable {
    const data = doc.data()
    return {
      id: doc.id,
      subjectId: (data.subjectId as string) || "",
      subjectName: (data.subjectName as string) || "",
      teacherId: (data.teacherId as string) || "",
      date: data.date instanceof Timestamp ? data.date.toDate() : new Date(),
      startTime: (data.startTime as string) || "",
      endTime: (data.endTime as string) || "",
      room: (data.room as string) || "",
      status: (data.status as string) || "scheduled",
      maxStudents: (data.maxStudents as number) || 30,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(),
    } as ExamTable
  }

  private getExamStatus(exam: ExamTable): "scheduled" | "in_progress" | "completed" | "cancelled" {
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

  async getAllExams(): Promise<ExamTable[]> {
    try {
      const snapshot = await getDocs(collection(this.db, "exam_tables"))
      const exams = snapshot.docs.map((doc) => this.docToExam(doc))
      return exams.map((exam) => ({
        ...exam,
        status: this.getExamStatus(exam),
      }))
    } catch (err) {
      console.error("[v0] Error loading all exams:", err)
      toast.error("Error al cargar mesas")
      return []
    }
  }

  async getExamsByTeacher(teacherId: string): Promise<ExamTable[]> {
    try {
      const examsQuery = query(collection(this.db, "exam_tables"), where("teacherId", "==", teacherId))
      const snapshot = await getDocs(examsQuery)
      const exams = snapshot.docs.map((doc) => this.docToExam(doc))
      return exams.map((exam) => ({
        ...exam,
        status: this.getExamStatus(exam),
      }))
    } catch (err) {
      console.error("[v0] Error loading teacher exams:", err)
      toast.error("Error al cargar mesas")
      return []
    }
  }

  async getExamsByStudent(studentId: string): Promise<ExamTable[]> {
    try {
      const reservationsQuery = query(
        collection(this.db, "reservations"),
        where("studentId", "==", studentId),
        where("status", "==", "confirmed"),
      )
      const reservations = await getDocs(reservationsQuery)

      const exams = await Promise.all(
        reservations.docs.map(async (resDoc) => {
          const examTableId = (resDoc.data().examTableId as string) || ""
          const examDocRef = doc(this.db, "exam_tables", examTableId)
          const examSnapshot = await getDoc(examDocRef)
          return examSnapshot
        }),
      )

      const examsList = exams
        .filter((e) => e.exists())
        .map((docSnapshot) => this.docToExam(docSnapshot as QueryDocumentSnapshot<DocumentData>))

      return examsList.map((exam) => ({
        ...exam,
        status: this.getExamStatus(exam),
      }))
    } catch (err) {
      console.error("[v0] Error loading student exams:", err)
      toast.error("Error al cargar mesas")
      return []
    }
  }

  async getAvailableExams(course?: string): Promise<ExamTable[]> {
    try {
      const snapshot = await getDocs(collection(this.db, "exam_tables"))
      const exams = snapshot.docs.map((doc) => this.docToExam(doc))

      return exams
        .map((exam) => ({
          ...exam,
          status: this.getExamStatus(exam),
        }))
        .filter((exam) => exam.status === "scheduled" || exam.status === "in_progress")
    } catch (err) {
      console.error("[v0] Error loading available exams:", err)
      toast.error("Error al cargar mesas disponibles")
      return []
    }
  }

  async createExam(exam: Omit<ExamTable, "id" | "createdAt" | "updatedAt">): Promise<string> {
    try {
      const examId = `exam_${Date.now()}`
      await setDoc(doc(this.db, "exam_tables", examId), {
        ...exam,
        date: Timestamp.fromDate(new Date(exam.date)),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      })
      toast.success("Mesa de examen creada")
      return examId
    } catch (err) {
      console.error("[v0] Error creating exam:", err)
      toast.error("Error al crear mesa")
      throw err
    }
  }

  async reserveExam(examTableId: string, studentId: string): Promise<string> {
    try {
      const existingReservationQuery = query(
        collection(this.db, "reservations"),
        where("examTableId", "==", examTableId),
        where("studentId", "==", studentId),
        where("status", "==", "confirmed"),
      )
      const existingReservations = await getDocs(existingReservationQuery)

      if (!existingReservations.empty) {
        toast.error("Ya tienes una reserva confirmada para esta mesa")
        throw new Error("Duplicate reservation")
      }

      const reservationId = `res_${examTableId}_${studentId}`
      await setDoc(doc(this.db, "reservations", reservationId), {
        examTableId,
        studentId,
        status: "confirmed",
        createdAt: Timestamp.now(),
      })
      toast.success("Reserva confirmada")
      return reservationId
    } catch (err) {
      console.error("[v0] Error reserving exam:", err)
      if (err instanceof Error && err.message !== "Duplicate reservation") {
        toast.error("Error al reservar")
      }
      throw err
    }
  }

  async getStudentReservationIds(studentId: string): Promise<string[]> {
    try {
      const reservationsQuery = query(
        collection(this.db, "reservations"),
        where("studentId", "==", studentId),
        where("status", "==", "confirmed"),
      )
      const snapshot = await getDocs(reservationsQuery)
      return snapshot.docs.map((doc) => doc.id)
    } catch (err) {
      console.error("[v0] Error loading reservations:", err)
      return []
    }
  }

  async cancelReservation(reservationId: string): Promise<void> {
    try {
      await updateDoc(doc(this.db, "reservations", reservationId), {
        status: "cancelled",
        cancelledAt: Timestamp.now(),
      })
      toast.success("Reserva cancelada")
    } catch (err) {
      console.error("[v0] Error cancelling reservation:", err)
      toast.error("Error al cancelar reserva")
      throw err
    }
  }

  async getStudentGrades(studentId: string) {
    try {
      const gradesQuery = query(collection(this.db, "grades"), where("studentId", "==", studentId))
      const snapshot = await getDocs(gradesQuery)

      const gradesWithSubject = await Promise.all(
        snapshot.docs.map(async (gradeDoc) => {
          const data = gradeDoc.data()
          const examTableId = data.examTableId as string

          // Get exam details to retrieve subject name
          const examDoc = await getDoc(doc(this.db, "exam_tables", examTableId))
          const examData = examDoc.exists() ? examDoc.data() : null

          return {
            id: gradeDoc.id,
            examTableId,
            studentId: data.studentId as string,
            score: data.score as number,
            observations: (data.observations as string) || "",
            subjectName: examData?.subjectName || examData?.subjectId || "Materia",
            recordedAt: data.recordedAt instanceof Timestamp ? data.recordedAt.toDate() : new Date(),
          }
        }),
      )

      return gradesWithSubject
    } catch (err) {
      console.error("[v0] Error loading grades:", err)
      toast.error("Error al cargar notas")
      return []
    }
  }

  async getGradesByExam(examTableId: string) {
    try {
      const gradesQuery = query(collection(this.db, "grades"), where("examTableId", "==", examTableId))
      const snapshot = await getDocs(gradesQuery)
      return snapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          examTableId: (data.examTableId as string) || "",
          studentId: (data.studentId as string) || "",
          score: (data.score as number) || 0,
          observations: (data.observations as string) || "",
          recordedBy: (data.recordedBy as string) || "",
          recordedAt: data.recordedAt instanceof Timestamp ? data.recordedAt.toDate() : new Date(),
        }
      })
    } catch (err) {
      console.error("[v0] Error loading grades:", err)
      return []
    }
  }

  async recordGrade(
    examTableId: string,
    studentId: string,
    score: number,
    observations: string,
    teacherId: string,
    subjectName?: string,
  ): Promise<string> {
    try {
      const existingGradeQuery = query(
        collection(this.db, "grades"),
        where("examTableId", "==", examTableId),
        where("studentId", "==", studentId),
      )
      const existingGrades = await getDocs(existingGradeQuery)

      if (!existingGrades.empty) {
        const gradeId = existingGrades.docs[0].id
        const existingData = existingGrades.docs[0].data()

        // Create history entry from current data
        const historyEntry = {
          score: existingData.score as number,
          observations: (existingData.observations as string) || "",
          updatedBy: existingData.recordedBy as string,
          updatedAt: existingData.recordedAt instanceof Timestamp ? existingData.recordedAt.toDate() : new Date(),
        }

        // Get existing history or create new array
        const history = (existingData.history as any[]) || []
        history.push(historyEntry)

        await updateDoc(doc(this.db, "grades", gradeId), {
          score,
          observations,
          subjectName,
          updatedBy: teacherId,
          updatedAt: Timestamp.now(),
          history,
        })
        toast.success("Calificación actualizada")
        return gradeId
      }

      const gradeId = `grade_${examTableId}_${studentId}`
      await setDoc(doc(this.db, "grades", gradeId), {
        examTableId,
        studentId,
        score,
        observations,
        subjectName,
        recordedBy: teacherId,
        recordedAt: Timestamp.now(),
        history: [],
      })
      toast.success("Calificación registrada")
      return gradeId
    } catch (err) {
      console.error("[v0] Error recording grade:", err)
      toast.error("Error al guardar calificación")
      throw err
    }
  }

  async getStudentAttendance(studentId: string) {
    try {
      const attendanceQuery = query(collection(this.db, "attendance"), where("studentId", "==", studentId))
      const snapshot = await getDocs(attendanceQuery)
      return snapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          examTableId: (data.examTableId as string) || "",
          studentId: (data.studentId as string) || "",
          status: (data.status as string) || "present",
          recordedAt: data.recordedAt instanceof Timestamp ? data.recordedAt.toDate() : new Date(),
        }
      })
    } catch (err) {
      console.error("[v0] Error loading attendance:", err)
      toast.error("Error al cargar asistencia")
      return []
    }
  }

  async recordAttendance(
    examTableId: string,
    studentId: string,
    status: "present" | "absent" | "justified",
    teacherId: string,
  ): Promise<string> {
    try {
      const existingAttendanceQuery = query(
        collection(this.db, "attendance"),
        where("examTableId", "==", examTableId),
        where("studentId", "==", studentId),
      )
      const existingAttendance = await getDocs(existingAttendanceQuery)

      if (!existingAttendance.empty) {
        const attendanceId = existingAttendance.docs[0].id
        const existingData = existingAttendance.docs[0].data()

        // Create history entry from current data
        const historyEntry = {
          status: existingData.status as "present" | "absent" | "justified",
          updatedBy: existingData.recordedBy as string,
          updatedAt: existingData.recordedAt instanceof Timestamp ? existingData.recordedAt.toDate() : new Date(),
        }

        // Get existing history or create new array
        const history = (existingData.history as any[]) || []
        history.push(historyEntry)

        await updateDoc(doc(this.db, "attendance", attendanceId), {
          status,
          updatedBy: teacherId,
          updatedAt: Timestamp.now(),
          history,
        })
        toast.success("Asistencia actualizada")
        return attendanceId
      }

      const attendanceId = `att_${examTableId}_${studentId}`
      await setDoc(doc(this.db, "attendance", attendanceId), {
        examTableId,
        studentId,
        status,
        recordedBy: teacherId,
        recordedAt: Timestamp.now(),
        history: [],
      })
      toast.success("Asistencia registrada")
      return attendanceId
    } catch (err) {
      console.error("[v0] Error recording attendance:", err)
      toast.error("Error al guardar asistencia")
      throw err
    }
  }

  async getAttendanceByExam(examTableId: string) {
    try {
      const attendanceQuery = query(collection(this.db, "attendance"), where("examTableId", "==", examTableId))
      const snapshot = await getDocs(attendanceQuery)
      return snapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          examTableId: data.examTableId as string,
          studentId: data.studentId as string,
          status: data.status as "present" | "absent" | "justified",
          recordedBy: data.recordedBy as string,
          recordedAt: data.recordedAt instanceof Timestamp ? data.recordedAt.toDate() : new Date(),
        }
      })
    } catch (err) {
      console.error("[v0] Error loading attendance:", err)
      return []
    }
  }

  async getStudentsForExam(examTableId: string) {
    try {
      const reservationsQuery = query(
        collection(this.db, "reservations"),
        where("examTableId", "==", examTableId),
        where("status", "==", "confirmed"),
      )
      const snapshot = await getDocs(reservationsQuery)
      return snapshot.docs.map((doc) => doc.data().studentId as string)
    } catch (err) {
      console.error("[v0] Error loading exam students:", err)
      return []
    }
  }

  async getUserById(userId: string) {
    try {
      const userDoc = await getDoc(doc(this.db, "users", userId))
      if (!userDoc.exists()) return null

      const data = userDoc.data()
      return {
        uid: userDoc.id,
        name: data.name as string,
        surname: data.surname as string,
        email: data.email as string,
        dni: data.dni as string,
        course: data.course as string,
        role: data.role as string,
      }
    } catch (err) {
      console.error("[v0] Error loading user:", err)
      return null
    }
  }

  async getAllGrades() {
    try {
      const snapshot = await getDocs(collection(this.db, "grades"))
      return snapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          examId: (data.examTableId as string) || "",
          studentId: (data.studentId as string) || "",
          score: (data.score as number) || 0,
          observations: (data.observations as string) || "",
          recordedBy: (data.recordedBy as string) || "",
          createdAt: data.recordedAt instanceof Timestamp ? data.recordedAt.toDate() : new Date(),
        }
      })
    } catch (err) {
      console.error("[v0] Error loading all grades:", err)
      return []
    }
  }

  async getSubjectById(subjectId: string) {
    try {
      const subjectDoc = await getDoc(doc(this.db, "subjects", subjectId))
      if (!subjectDoc.exists()) return null

      const data = subjectDoc.data()
      return {
        id: subjectDoc.id,
        name: (data.name as string) || subjectId,
        course: (data.course as string) || "",
      }
    } catch (err) {
      console.error("[v0] Error loading subject:", err)
      return null
    }
  }

  async getReservationsForExam(examTableId: string) {
    try {
      const reservationsQuery = query(
        collection(this.db, "reservations"),
        where("examTableId", "==", examTableId),
        where("status", "==", "confirmed"),
      )
      const snapshot = await getDocs(reservationsQuery)
      return snapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          examTableId: (data.examTableId as string) || "",
          studentId: (data.studentId as string) || "",
          status: (data.status as string) || "confirmed",
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
        }
      })
    } catch (err) {
      console.error("[v0] Error loading reservations:", err)
      return []
    }
  }

  async getAllAttendance() {
    try {
      const snapshot = await getDocs(collection(this.db, "attendance"))
      return snapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          examId: (data.examTableId as string) || "",
          studentId: (data.studentId as string) || "",
          status: (data.status as string) || "present",
          recordedBy: (data.recordedBy as string) || "",
          createdAt: data.recordedAt instanceof Timestamp ? data.recordedAt.toDate() : new Date(),
        }
      })
    } catch (err) {
      console.error("[v0] Error loading all attendance:", err)
      return []
    }
  }

  async getExamById(examId: string): Promise<ExamTable | null> {
    try {
      const examDoc = await getDoc(doc(this.db, "exam_tables", examId))
      if (!examDoc.exists()) return null

      const exam = this.docToExam(examDoc as QueryDocumentSnapshot<DocumentData>)
      return {
        ...exam,
        status: this.getExamStatus(exam),
      }
    } catch (err) {
      console.error("[v0] Error loading exam:", err)
      return null
    }
  }

  async updateExam(examId: string, updates: Partial<ExamTable>): Promise<void> {
    try {
      const updateData: Record<string, unknown> = { ...updates }

      if (updates.date) {
        updateData.date = Timestamp.fromDate(new Date(updates.date))
      }

      updateData.updatedAt = Timestamp.now()

      await updateDoc(doc(this.db, "exam_tables", examId), updateData)
      toast.success("Mesa actualizada")
    } catch (err) {
      console.error("[v0] Error updating exam:", err)
      toast.error("Error al actualizar mesa")
      throw err
    }
  }

  async getGradeWithHistory(examTableId: string, studentId: string) {
    try {
      const gradeQuery = query(
        collection(this.db, "grades"),
        where("examTableId", "==", examTableId),
        where("studentId", "==", studentId),
      )
      const snapshot = await getDocs(gradeQuery)

      if (snapshot.empty) return null

      const doc = snapshot.docs[0]
      const data = doc.data()

      return {
        id: doc.id,
        examTableId: data.examTableId as string,
        studentId: data.studentId as string,
        score: data.score as number,
        observations: (data.observations as string) || "",
        subjectName: (data.subjectName as string) || "",
        recordedBy: data.recordedBy as string,
        recordedAt: data.recordedAt instanceof Timestamp ? data.recordedAt.toDate() : new Date(),
        updatedBy: (data.updatedBy as string) || undefined,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : undefined,
        history: (data.history as any[]) || [],
      }
    } catch (err) {
      console.error("[v0] Error loading grade with history:", err)
      return null
    }
  }

  async getAttendanceWithHistory(examTableId: string, studentId: string) {
    try {
      const attendanceQuery = query(
        collection(this.db, "attendance"),
        where("examTableId", "==", examTableId),
        where("studentId", "==", studentId),
      )
      const snapshot = await getDocs(attendanceQuery)

      if (snapshot.empty) return null

      const doc = snapshot.docs[0]
      const data = doc.data()

      return {
        id: doc.id,
        examTableId: data.examTableId as string,
        studentId: data.studentId as string,
        status: data.status as "present" | "absent" | "justified",
        recordedBy: data.recordedBy as string,
        recordedAt: data.recordedAt instanceof Timestamp ? data.recordedAt.toDate() : new Date(),
        updatedBy: (data.updatedBy as string) || undefined,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : undefined,
        history: (data.history as any[]) || [],
      }
    } catch (err) {
      console.error("[v0] Error loading attendance with history:", err)
      return null
    }
  }
}

export const examService = new ExamService()
