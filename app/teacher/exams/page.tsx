"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { examService } from "@/lib/exam-service"
import { authService } from "@/lib/auth-service"
import type { ExamTable } from "@/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Users } from "lucide-react"
import CreateExamModal from "@/components/create-exam-modal"
import { Pencil } from "lucide-react"
import { EditExamModal } from "@/components/edit-exam-modal" // (el que pegaste antes)


export default function TeacherExamsPage() {
  const router = useRouter()
  const [exams, setExams] = useState<ExamTable[]>([])
  const [subjects, setSubjects] = useState<Map<string, string>>(new Map())
  const [isLoading, setIsLoading] = useState(true)
  const [openCreate, setOpenCreate] = useState(false)
  const [editingExam, setEditingExam] = useState<ExamTable | null>(null)


  const loadExams = useCallback(async () => {
    try {
      const user = await authService.getCurrentUser()
      if (!user?.uid) return

      // Cargar solo las mesas del profesor actual
      const data = await examService.getExamsByTeacher(user.uid)
      setExams(data)

      // Cargar nombres de materias
      const subjectMap = new Map<string, string>()
      for (const exam of data) {
        if (exam.subjectName && !subjectMap.has(exam.subjectName)) {
          const subject = await examService.getSubjectById(exam.subjectName)
          if (subject) {
            subjectMap.set(exam.subjectName, subject.name)
          }
        }
      }
      setSubjects(subjectMap)
    } catch (err) {
      console.error("[v0] Error loading teacher exams:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadExams()
  }, [loadExams])

  const handleViewExam = (examId: string) => {
    router.push(`/teacher/exams/${examId}`)
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
    return <div className="text-center py-8">Cargando mesas...</div>
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-primary-dark mb-2">Mis Mesas de Examen</h1>
        <p className="text-foreground/60">Gestiona tus mesas y registra asistencia y calificaciones</p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-primary/10">
        <div className="flex justify-end">
          <Button onClick={() => setOpenCreate(true)} className="mb-4">
            Crear Mesa de Examen
          </Button>
        </div>

        {exams.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-foreground/60">No tienes mesas asignadas</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-primary">
                  <th className="text-left py-3 px-4 font-bold text-primary-dark">Materia</th>
                  <th className="text-left py-3 px-4 font-bold text-primary-dark">Fecha</th>
                  <th className="text-left py-3 px-4 font-bold text-primary-dark">Horario</th>
                  <th className="text-left py-3 px-4 font-bold text-primary-dark">Aula</th>
                  <th className="text-center py-3 px-4 font-bold text-primary-dark">Estado</th>
                  <th className="text-center py-3 px-4 font-bold text-primary-dark">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {exams.map((exam) => {
                  const subjectName = subjects.get(exam.subjectName)

                  return (
                    <tr key={exam.id} className="border-b border-border hover:bg-accent/50">
                      <td className="py-3 px-4 font-semibold">{subjectName}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-primary" />
                          {exam.date.toLocaleDateString("es-AR")}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-primary" />
                          {exam.startTime} - {exam.endTime}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-primary" />
                          {exam.room}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">{getStatusBadge(exam.status)}</td>
                      <td className="py-3 px-4 text-center flex justify-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleViewExam(exam.id)}>
                          Ver
                        </Button>

                        <Button size="sm" variant="outline" onClick={() => setEditingExam(exam)}>
                          <Pencil className="w-4 h-4" />
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

      {/* Vista de tarjetas para móvil */}
      <div className="lg:hidden space-y-4">
        {exams.map((exam) => {
          const subjectName = subjects.get(exam.subjectName)

          return (
            <div key={exam.id} className="bg-white rounded-lg shadow-lg p-6 border-2 border-primary/10">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold text-primary-dark">{subjectName}</h3>
                {getStatusBadge(exam.status)}
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>{exam.date.toLocaleDateString("es-AR")}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>
                    {exam.startTime} - {exam.endTime}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>{exam.room}</span>
                </div>
              </div>

              <Button className="w-full" variant="outline" onClick={() => handleViewExam(exam.id)}>
                Ver Detalles
              </Button>
            </div>
          )
        })}
      </div>
      {editingExam && (
        <EditExamModal
          exam={editingExam}
          onClose={() => setEditingExam(null)}
          onSuccess={() => {
            setEditingExam(null)
            loadExams() // recargar la lista después de editar
          }}
        />
      )}

      <CreateExamModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onCreated={() => {
          setOpenCreate(false)
          loadExams()
        }}
      />


    </div>
  )
}