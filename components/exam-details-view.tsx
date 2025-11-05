"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { examService } from "@/lib/exam-service"
import { adminService } from "@/lib/admin-service"
import { authService } from "@/lib/auth-service"
import type { ExamTable, User } from "@/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Clock, MapPin, Users } from "lucide-react"
import { AttendanceEntryModal } from "@/components/attendance-entry-modal"
import { GradeEntryModal } from "@/components/grade-entry-modal"

interface ExamDetailsViewProps {
  examId: string
  userRole: "teacher" | "admin"
  backUrl: string
}

export function ExamDetailsView({ examId, userRole, backUrl }: ExamDetailsViewProps) {
  const router = useRouter()
  const [exam, setExam] = useState<ExamTable | null>(null)
  const [teacher, setTeacher] = useState<User | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [students, setStudents] = useState<User[]>([])
  const [attendance, setAttendance] = useState<Map<string, string>>(new Map())
  const [grades, setGrades] = useState<Map<string, number>>(new Map())
  const [isLoading, setIsLoading] = useState(true)
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null)
  const [showAttendanceModal, setShowAttendanceModal] = useState(false)
  const [showGradeModal, setShowGradeModal] = useState(false)

  const loadExamDetails = useCallback(async () => {
    try {
      const user = await authService.getCurrentUser()
      setCurrentUser(user)

      const examData = await examService.getExamById(examId)
      if (!examData) {
        router.push(backUrl)
        return
      }
      setExam(examData)

      const teachers = await adminService.getUsersByRole("teacher")
      const teacherData = teachers.find((t) => t.uid === examData.teacherId)
      setTeacher(teacherData || null)

      // Load students - CRITICAL: Asegurarse de cargar los datos completos
      const studentIds = await examService.getStudentsForExam(examId)
      const allStudents = await adminService.getAllUsers("student")
      const enrolledStudents = allStudents.filter((s) => studentIds.includes(s.uid))
      
      console.log("Enrolled students:", enrolledStudents) // Debug
      setStudents(enrolledStudents)

      // Load attendance
      const attendanceRecords = await examService.getAttendanceByExam(examId)
      const attendanceMap = new Map<string, string>()
      attendanceRecords.forEach((record) => {
        attendanceMap.set(record.studentId, record.status)
      })
      setAttendance(attendanceMap)

      // Load grades
      const gradeRecords = await examService.getGradesByExam(examId)
      const gradesMap = new Map<string, number>()
      gradeRecords.forEach((record) => {
        gradesMap.set(record.studentId, record.score)
      })
      setGrades(gradesMap)
    } catch (err) {
      console.error("[v0] Error loading exam details:", err)
    } finally {
      setIsLoading(false)
    }
  }, [examId, router, backUrl])

  useEffect(() => {
    loadExamDetails()
  }, [loadExamDetails])

  const handleAttendanceClick = (studentId: string) => {
    setSelectedStudent(studentId)
    setShowAttendanceModal(true)
    setShowGradeModal(false)
  }

  const handleGradeClick = (studentId: string) => {
    setSelectedStudent(studentId)
    setShowGradeModal(true)
    setShowAttendanceModal(false)
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      scheduled: { label: "Programada", variant: "outline" },
      in_progress: { label: "En Proceso", variant: "default" },
      completed: { label: "Finalizada", variant: "secondary" },
      cancelled: { label: "Cancelada", variant: "destructive" },
    }
    const config = variants[status] || variants.scheduled
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  if (isLoading) {
    return <div className="text-center py-8">Cargando detalles...</div>
  }

  if (!exam) {
    return <div className="text-center py-8">Mesa no encontrada</div>
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.push(backUrl)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold text-primary-dark">{exam.subjectName || exam.subjectId}</h1>
            {getStatusBadge(exam.status)}
          </div>
          <p className="text-foreground/60">Detalles de la mesa de examen</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-primary/10">
          <h2 className="text-xl font-bold text-primary-dark mb-4">Información General</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-foreground/60">Fecha</p>
                <p className="font-semibold">{exam.date.toLocaleDateString("es-AR")}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-foreground/60">Horario</p>
                <p className="font-semibold">
                  {exam.startTime} - {exam.endTime}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-foreground/60">Aula</p>
                <p className="font-semibold">{exam.room}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-foreground/60">Profesor</p>
                <p className="font-semibold">{teacher ? `${teacher.name} ${teacher.surname}` : "Cargando..."}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-primary/10">
          <h2 className="text-xl font-bold text-primary-dark mb-4">Estadísticas</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-foreground/60 mb-1">Estudiantes Inscritos</p>
              <p className="text-3xl font-bold text-primary-dark">
                {students.length} / {exam.maxStudents}
              </p>
            </div>
            <div>
              <p className="text-sm text-foreground/60 mb-1">Asistencia Registrada</p>
              <p className="text-3xl font-bold text-primary-dark">{attendance.size}</p>
            </div>
            <div>
              <p className="text-sm text-foreground/60 mb-1">Calificaciones Registradas</p>
              <p className="text-3xl font-bold text-primary-dark">{grades.size}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-primary/10">
        <h2 className="text-2xl font-bold text-primary-dark mb-6">Estudiantes Inscritos</h2>
        {students.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-foreground/60">No hay estudiantes inscritos</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-primary">
                  <th className="text-left py-3 px-4 font-bold text-primary-dark">Estudiante</th>
                  <th className="text-left py-3 px-4 font-bold text-primary-dark">Curso</th>
                  <th className="text-center py-3 px-4 font-bold text-primary-dark">Asistencia</th>
                  <th className="text-center py-3 px-4 font-bold text-primary-dark">Nota</th>
                  <th className="text-center py-3 px-4 font-bold text-primary-dark">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.uid} className="border-b border-border hover:bg-accent/50">
                    <td className="py-3 px-4 font-semibold">
                      {student.name} {student.surname}
                    </td>
                    <td className="py-3 px-4">{student.course || "Sin curso"}</td>
                    <td className="py-3 px-4 text-center">
                      {attendance.get(student.uid) ? (
                        <Badge variant={attendance.get(student.uid) === "present" ? "default" : "destructive"}>
                          {attendance.get(student.uid) === "present" ? "Presente" : "Ausente"}
                        </Badge>
                      ) : (
                        <span className="text-foreground/40">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {grades.get(student.uid) !== undefined ? (
                        <span className="font-bold text-primary-dark">{grades.get(student.uid)}</span>
                      ) : (
                        <span className="text-foreground/40">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleAttendanceClick(student.uid)}>
                          Asistencia
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleGradeClick(student.uid)}>
                          Nota
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedStudent && (
        <>
          <AttendanceEntryModal
            isOpen={showAttendanceModal}
            onClose={() => {
              setShowAttendanceModal(false)
              setSelectedStudent(null)
            }}
            examTableId={examId}
            studentId={selectedStudent}
            studentName={
              students.find((s) => s.uid === selectedStudent)
                ? `${students.find((s) => s.uid === selectedStudent)!.name} ${
                    students.find((s) => s.uid === selectedStudent)!.surname
                  }`
                : selectedStudent
            }
            teacherId={currentUser?.uid}
            onSuccess={loadExamDetails}
          />
          <GradeEntryModal
            isOpen={showGradeModal}
            onClose={() => {
              setShowGradeModal(false)
              setSelectedStudent(null)
            }}
            examTableId={examId}
            studentId={selectedStudent}
            studentName={
              students.find((s) => s.uid === selectedStudent)
                ? `${students.find((s) => s.uid === selectedStudent)!.name} ${
                    students.find((s) => s.uid === selectedStudent)!.surname
                  }`
                : selectedStudent
            }
            subjectName={exam.subjectName || exam.subjectId}
            teacherId={currentUser?.uid}
            onSuccess={loadExamDetails}
          />
        </>
      )}
    </div>
  )
}