"use client"

import { useAuth } from "@/hooks/use-auth"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { teacherService } from "@/lib/teacher-service"
import { BookOpen, Users, ClipboardList, Clock, ArrowRight, Eye } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import type { ExamTable } from "@/types"

export default function TeacherDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({
    totalExams: 0,
    enrolledStudents: 0,
    completedExams: 0,
    inProgressExams: 0,
  })
  const [inProgressExams, setInProgressExams] = useState<ExamTable[]>([])
  const [completedExams, setCompletedExams] = useState<ExamTable[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
    const interval = setInterval(loadStats, 30000)
    return () => clearInterval(interval)
  }, [user?.uid])

  const loadStats = async () => {
    if (!user?.uid) return
    try {
      if (inProgressExams.length === 0 && completedExams.length === 0) {
        setLoading(true)
      }

      const exams = await teacherService.getTeacherExams(user.uid)

      const activeExams = exams.filter((e) => e.status !== "cancelled")
      const inProgress = activeExams.filter((e) => e.status === "in_progress")
      const completed = activeExams.filter((e) => e.status === "completed")

      let totalStudents = 0
      for (const exam of activeExams) {
        const reservations = await teacherService.getExamReservations(exam.id)
        totalStudents += reservations.length
      }

      setInProgressExams(inProgress)
      setCompletedExams(completed)

      setStats({
        totalExams: activeExams.length,
        enrolledStudents: totalStudents,
        completedExams: completed.length,
        inProgressExams: inProgress.length,
      })
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleGoToExam = (examId: string) => {
    router.push(`/teacher/exams/${examId}`)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-primary-dark mb-2">Bienvenido, Prof. {user?.name}</h1>
        <p className="text-foreground/60">Gestiona tus mesas, calificaciones y asistencia</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white border-2 border-primary rounded-lg p-6 shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-foreground/60 text-sm mb-1">Mesas Activas</p>
              <p className="text-4xl font-bold text-primary-dark">{stats.totalExams}</p>
            </div>
            <BookOpen className="w-10 h-10 text-primary opacity-50" />
          </div>
        </div>

        <div className="bg-white border-2 border-yellow-500 rounded-lg p-6 shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-foreground/60 text-sm mb-1">En Proceso</p>
              <p className="text-4xl font-bold text-yellow-600">{stats.inProgressExams}</p>
            </div>
            <Clock className="w-10 h-10 text-yellow-500 opacity-50" />
          </div>
        </div>

        <div className="bg-white border-2 border-primary rounded-lg p-6 shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-foreground/60 text-sm mb-1">Estudiantes Inscritos</p>
              <p className="text-4xl font-bold text-primary-dark">{stats.enrolledStudents}</p>
            </div>
            <Users className="w-10 h-10 text-primary opacity-50" />
          </div>
        </div>

        <div className="bg-white border-2 border-green-500 rounded-lg p-6 shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-foreground/60 text-sm mb-1">Exámenes Finalizados</p>
              <p className="text-4xl font-bold text-green-600">{stats.completedExams}</p>
            </div>
            <ClipboardList className="w-10 h-10 text-green-500 opacity-50" />
          </div>
        </div>
      </div>

      {inProgressExams.length > 0 && (
        <div className="bg-yellow-50 border-2 border-yellow-500 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-yellow-700 mb-4 flex items-center gap-2">
            <Clock className="w-6 h-6" />
            Exámenes en Proceso
          </h2>
          <div className="space-y-3">
            {inProgressExams.map((exam) => (
              <div key={exam.id} className="bg-white p-4 rounded-lg border border-yellow-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-primary-dark">{exam.subjectName || exam.subjectId}</h3>
                    <p className="text-sm text-foreground/60">
                      {new Date(exam.date).toLocaleDateString("es-AR")} - {exam.startTime} a {exam.endTime} - Aula{" "}
                      {exam.room}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                      En Proceso
                    </span>
                    <Button
                      size="sm"
                      className="bg-yellow-600 hover:bg-yellow-700 text-white gap-2"
                      onClick={() => handleGoToExam(exam.id)}
                    >
                      <Eye className="w-4 h-4" />
                      Ver Mesa
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {completedExams.length > 0 && (
        <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-green-700 flex items-center gap-2">
              <ClipboardList className="w-6 h-6" />
              Exámenes Finalizados
            </h2>
            {completedExams.length > 5 && (
              <Link href="/teacher/exams">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-green-700 border-green-300 hover:bg-green-100 bg-transparent"
                >
                  Ver Todos
                </Button>
              </Link>
            )}
          </div>
          <div className="space-y-3">
            {completedExams.slice(0, 5).map((exam) => (
              <div key={exam.id} className="bg-white p-4 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-primary-dark">{exam.subjectName || exam.subjectId}</h3>
                    <p className="text-sm text-foreground/60">
                      {new Date(exam.date).toLocaleDateString("es-AR")} - {exam.startTime} a {exam.endTime} - Aula{" "}
                      {exam.room}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                      Finalizado
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-700 border-green-300 hover:bg-green-100 gap-2 bg-transparent"
                      onClick={() => handleGoToExam(exam.id)}
                    >
                      <Eye className="w-4 h-4" />
                      Ver Detalles
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <Link href="/teacher/exams">
          <div className="bg-gradient-to-br from-primary/10 to-primary-dark/10 border-2 border-primary rounded-lg p-8 cursor-pointer hover:shadow-lg transition-shadow">
            <BookOpen className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-xl font-bold text-primary-dark mb-2">Gestionar Mesas</h3>
            <p className="text-foreground/60">Crear, editar o cancelar mesas de examen</p>
          </div>
        </Link>

        <Link href="/teacher/grades">
          <div className="bg-gradient-to-br from-primary/10 to-primary-dark/10 border-2 border-primary rounded-lg p-8 cursor-pointer hover:shadow-lg transition-shadow">
            <ClipboardList className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-xl font-bold text-primary-dark mb-2">Calificaciones</h3>
            <p className="text-foreground/60">Registrar y gestionar calificaciones</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
