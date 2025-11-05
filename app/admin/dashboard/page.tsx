"use client"

import { useState, useEffect, useCallback } from "react"
import { adminService } from "@/lib/admin-service"
import { BarChart3, BookOpen, TrendingUp } from "lucide-react"

interface AdminStats {
  totalExams: number
  totalGrades: number
  averageScore: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalExams: 0,
    totalGrades: 0,
    averageScore: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  const loadStats = useCallback(async () => {
    try {
      const examStats = await adminService.getExamStatistics()
      setStats(examStats)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-primary-dark mb-2">Dashboard Administrativo</h1>
        <p className="text-foreground/60">Resumen de actividad general del sistema</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white border-2 border-primary rounded-lg p-6 shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-foreground/60 text-sm mb-1">Mesas de Examen</p>
              <p className="text-4xl font-bold text-primary-dark">{stats.totalExams}</p>
            </div>
            <BookOpen className="w-10 h-10 text-primary opacity-50" />
          </div>
        </div>

        <div className="bg-white border-2 border-primary rounded-lg p-6 shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-foreground/60 text-sm mb-1">Calificaciones</p>
              <p className="text-4xl font-bold text-primary-dark">{stats.totalGrades}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-primary opacity-50" />
          </div>
        </div>

        <div className="bg-white border-2 border-primary rounded-lg p-6 shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-foreground/60 text-sm mb-1">Promedio General</p>
              <p className="text-4xl font-bold text-primary-dark">{stats.averageScore.toFixed(1)}</p>
            </div>
            <BarChart3 className="w-10 h-10 text-primary opacity-50" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-primary/10">
        <h2 className="text-2xl font-bold text-primary-dark mb-6">Acceso Rápido</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <a
            href="/admin/requests"
            className="p-6 bg-accent rounded-lg hover:shadow-lg transition-shadow cursor-pointer"
          >
            <h3 className="font-bold text-primary-dark mb-1">Validar Registros</h3>
            <p className="text-sm text-foreground/60">Gestiona solicitudes pendientes</p>
          </a>
          <a href="/admin/users" className="p-6 bg-accent rounded-lg hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="font-bold text-primary-dark mb-1">Usuarios</h3>
            <p className="text-sm text-foreground/60">Administra todos los usuarios</p>
          </a>
          <a href="/admin/exams" className="p-6 bg-accent rounded-lg hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="font-bold text-primary-dark mb-1">Mesas</h3>
            <p className="text-sm text-foreground/60">Gestiona todas las mesas</p>
          </a>
        </div>
      </div>
    </div>
  )
}
