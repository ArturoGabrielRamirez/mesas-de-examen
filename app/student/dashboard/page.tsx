"use client"

import { useAuth } from "@/hooks/use-auth"
import { useState, useEffect } from "react"
import { examService } from "@/lib/exam-service"
import { BookOpen, ClipboardList, Calendar, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function StudentDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    reservations: 0,
    grades: 0,
    attendance: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [user?.uid])

  const loadStats = async () => {
    if (!user?.uid) return
    try {
      const reservations = await examService.getExamsByStudent(user.uid)
      const grades = await examService.getStudentGrades(user.uid)
      const attendance = await examService.getStudentAttendance(user.uid)

      setStats({
        reservations: reservations.length,
        grades: grades.length,
        attendance: attendance.length,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-primary-dark mb-2">Bienvenido, {user?.name}</h1>
        <p className="text-foreground/60">Gestiona tus reservas de examen, consulta notas y asistencia</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white border-2 border-primary rounded-lg p-6 shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-foreground/60 text-sm mb-1">Mis Reservas</p>
              <p className="text-4xl font-bold text-primary-dark">{stats.reservations}</p>
            </div>
            <Calendar className="w-10 h-10 text-primary opacity-50" />
          </div>
        </div>

        <div className="bg-white border-2 border-primary rounded-lg p-6 shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-foreground/60 text-sm mb-1">Notas Registradas</p>
              <p className="text-4xl font-bold text-primary-dark">{stats.grades}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-primary opacity-50" />
          </div>
        </div>

        <div className="bg-white border-2 border-primary rounded-lg p-6 shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-foreground/60 text-sm mb-1">Registros de Asistencia</p>
              <p className="text-4xl font-bold text-primary-dark">{stats.attendance}</p>
            </div>
            <ClipboardList className="w-10 h-10 text-primary opacity-50" />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Link href="/student/exams">
          <div className="bg-gradient-to-br from-primary/10 to-primary-dark/10 border-2 border-primary rounded-lg p-8 cursor-pointer hover:shadow-lg transition-shadow">
            <BookOpen className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-xl font-bold text-primary-dark mb-2">Reservar Examen</h3>
            <p className="text-foreground/60">Ver mesas disponibles y realizar nuevas reservas</p>
          </div>
        </Link>

        <Link href="/student/grades">
          <div className="bg-gradient-to-br from-primary/10 to-primary-dark/10 border-2 border-primary rounded-lg p-8 cursor-pointer hover:shadow-lg transition-shadow">
            <TrendingUp className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-xl font-bold text-primary-dark mb-2">Mis Calificaciones</h3>
            <p className="text-foreground/60">Consulta todas tus notas registradas</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
