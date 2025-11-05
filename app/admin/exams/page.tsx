"use client"

import { useState, useEffect, useCallback } from "react"
import { examService } from "@/lib/exam-service"
import { adminService } from "@/lib/admin-service"
import type { ExamTable, User } from "@/types"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"

export default function AdminExamsPage() {
  const [exams, setExams] = useState<ExamTable[]>([])
  const [teachers, setTeachers] = useState<Map<string, User>>(new Map())
  const [subjects, setSubjects] = useState<Map<string, string>>(new Map())
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const loadExams = useCallback(async () => {
    try {
      const data = await examService.getAllExams()
      setExams(data)

      const teacherIds = [...new Set(data.map((e) => e.teacherId))]
      const teacherMap = new Map<string, User>()

      for (const teacherId of teacherIds) {
        const users = await adminService.getUsersByRole("teacher")
        const teacher = users.find((u) => u.uid === teacherId)
        if (teacher) {
          teacherMap.set(teacherId, teacher)
        }
      }
      setTeachers(teacherMap)

      // Load subject names
      const subjectMap = new Map<string, string>()
      for (const exam of data) {
        if (exam.subjectId && !subjectMap.has(exam.subjectId)) {
          const subject = await examService.getSubjectById(exam.subjectId)
          if (subject) {
            subjectMap.set(exam.subjectId, subject.name)
          }
        }
      }
      setSubjects(subjectMap)
    } catch (err) {
      console.error("[v0] Error loading exams:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadExams()
  }, [loadExams])

  const handleViewExam = (examId: string) => {
    router.push(`/admin/exams/${examId}`)
  }

  if (isLoading) {
    return <div className="text-center py-8">Cargando mesas...</div>
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-primary-dark mb-2">Mesas de Examen</h1>
          <p className="text-foreground/60">Gestiona todas las mesas del colegio</p>
        </div>
        <Button className="bg-primary hover:bg-primary-dark flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nueva Mesa
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-primary/10">
        {exams.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-foreground/60">No hay mesas registradas</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-primary">
                  <th className="text-left py-3 px-4 font-bold text-primary-dark">Materia</th>
                  <th className="text-left py-3 px-4 font-bold text-primary-dark">Profesor</th>
                  <th className="text-left py-3 px-4 font-bold text-primary-dark">Fecha</th>
                  <th className="text-left py-3 px-4 font-bold text-primary-dark">Hora</th>
                  <th className="text-left py-3 px-4 font-bold text-primary-dark">Aula</th>
                  <th className="text-center py-3 px-4 font-bold text-primary-dark">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {exams.map((exam) => {
                  const teacher = teachers.get(exam.teacherId)
                  const teacherName = teacher ? `${teacher.name} ${teacher.surname}` : exam.teacherId
                  const subjectName = subjects.get(exam.subjectId) || exam.subjectId

                  return (
                    <tr key={exam.id} className="border-b border-border hover:bg-accent/50">
                      <td className="py-3 px-4 font-semibold">{subjectName}</td>
                      <td className="py-3 px-4">{teacherName}</td>
                      <td className="py-3 px-4">{exam.date.toLocaleDateString("es-AR")}</td>
                      <td className="py-3 px-4">{exam.startTime}</td>
                      <td className="py-3 px-4">{exam.room}</td>
                      <td className="py-3 px-4 text-center">
                        <Button size="sm" variant="outline" onClick={() => handleViewExam(exam.id)}>
                          Ver
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
