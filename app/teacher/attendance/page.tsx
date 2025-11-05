"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { teacherService } from "@/lib/teacher-service"
import { examService } from "@/lib/exam-service"
import { Loader2, Plus } from "lucide-react"
import { toast } from "sonner"
import type { ExamTable } from "@/types"
import { Button } from "@/components/ui/button"
import { AttendanceEntryModal } from "@/components/attendance-entry-modal"

interface StudentAttendance {
  uid: string
  name: string
  surname: string
  attendance?: { status: "present" | "absent" | "justified" }
}

export default function TeacherAttendancePage() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const examIdFromUrl = searchParams.get("examId")

  const [exams, setExams] = useState<ExamTable[]>([])
  const [selectedExam, setSelectedExam] = useState<string>("")
  const [students, setStudents] = useState<StudentAttendance[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<StudentAttendance | null>(null)

  const loadExams = useCallback(async () => {
    if (!user?.uid) return
    try {
      const data = await teacherService.getTeacherExams(user.uid)
      setExams(data.filter((e) => e.status !== "cancelled"))

      if (examIdFromUrl && data.some((e) => e.id === examIdFromUrl)) {
        setSelectedExam(examIdFromUrl)
      }
    } catch (err) {
      console.error("[v0] Error loading exams:", err)
      toast.error("Error al cargar mesas")
    } finally {
      setLoading(false)
    }
  }, [user?.uid, examIdFromUrl])

  const loadStudents = useCallback(async () => {
    if (!selectedExam) {
      setStudents([])
      return
    }
    try {
      const studentIds = await examService.getStudentsForExam(selectedExam)
      const attendance = await examService.getAttendanceByExam(selectedExam)

      const attendanceMap = new Map(attendance?.map((a: any) => [a.studentId, a]) || [])

      const studentsData = await Promise.all(
        studentIds.map(async (id) => {
          const userData = await examService.getUserById(id)
          return {
            uid: id,
            name: userData?.name || "Estudiante",
            surname: userData?.surname || id.substring(0, 8),
            attendance: attendanceMap.get(id),
          }
        }),
      )

      setStudents(studentsData)
    } catch (err) {
      console.error("[v0] Error loading students:", err)
      toast.error("Error al cargar estudiantes")
    }
  }, [selectedExam])

  useEffect(() => {
    loadExams()
  }, [loadExams])

  useEffect(() => {
    loadStudents()
  }, [loadStudents])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-primary-dark mb-2">Asistencia</h1>
        <p className="text-foreground/60">Registra y gestiona la asistencia de tus mesas</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-primary/10">
            <label className="block text-sm font-bold text-primary-dark mb-2">Seleccionar Mesa</label>
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="w-full p-2 border-2 border-primary/20 rounded-lg focus:border-primary-dark"
            >
              <option value="">-- Selecciona una mesa --</option>
              {exams.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.subjectName || exam.subjectId} - {new Date(exam.date).toLocaleDateString("es-AR")} a las{" "}
                  {exam.startTime}
                </option>
              ))}
            </select>
          </div>

          {selectedExam && (
            <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-primary/10">
              <h2 className="text-2xl font-bold text-primary-dark mb-4">Registro de Asistencia</h2>
              {students.length === 0 ? (
                <p className="text-foreground/60">No hay estudiantes inscritos en esta mesa</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-primary">
                        <th className="text-left py-3 px-4 font-bold text-primary-dark">Estudiante</th>
                        <th className="text-left py-3 px-4 font-bold text-primary-dark">Estado</th>
                        <th className="text-center py-3 px-4 font-bold text-primary-dark">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student, index) => (
                        <tr key={`${student.uid}-${index}`} className="border-b border-border hover:bg-accent/50">
                          <td className="py-3 px-4">
                            {student.name} {student.surname}
                          </td>
                          <td className="py-3 px-4">
                            {student.attendance ? (
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  student.attendance.status === "present"
                                    ? "bg-green-100 text-green-800"
                                    : student.attendance.status === "absent"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {student.attendance.status === "present"
                                  ? "Presente"
                                  : student.attendance.status === "absent"
                                    ? "Ausente"
                                    : "Justificado"}
                              </span>
                            ) : (
                              <span className="text-foreground/50">Sin registrar</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedStudent(student)
                                setShowModal(true)
                              }}
                              className="bg-primary hover:bg-primary-dark text-white gap-2"
                            >
                              <Plus className="w-4 h-4" />
                              {student.attendance ? "Editar" : "Registrar"}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {showModal && selectedStudent && user && (
        <AttendanceEntryModal
          examTableId={selectedExam}
          studentId={selectedStudent.uid}
          studentName={`${selectedStudent.name} ${selectedStudent.surname}`}
          teacherId={user.uid}
          currentStatus={selectedStudent.attendance?.status}
          onSuccess={loadStudents}
          onClose={() => {
            setShowModal(false)
            setSelectedStudent(null)
          }}
        />
      )}
    </div>
  )
}
