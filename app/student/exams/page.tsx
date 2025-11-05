"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { examService } from "@/lib/exam-service"
import type { ExamTable } from "@/types"
import { ExamCard } from "@/components/exam-card"
import { Loader2 } from "lucide-react"

export default function StudentExamsPage() {
  const { user } = useAuth()
  const [exams, setExams] = useState<ExamTable[]>([])
  const [reserved, setReserved] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    loadExams()
    loadReservations()
  }, [user?.uid])

  const loadExams = async () => {
    if (!user?.uid) return
    try {
      const availableExams = await examService.getAvailableExams(user.course)
      setExams(availableExams)
    } finally {
      setLoading(false)
    }
  }

  const loadReservations = async () => {
    if (!user?.uid) return
    const myReservationIds = await examService.getStudentReservationIds(user.uid)
    setReserved(
      myReservationIds.map((resId) => {
        const parts = resId.split("_")
        return parts[1]
      }),
    )
  }

  const handleReserve = async (examId: string) => {
    setActionLoading(examId)
    try {
      if (!user?.uid) return
      await examService.reserveExam(examId, user.uid)
      await loadReservations()
      await loadExams()
    } finally {
      setActionLoading(null)
    }
  }

  const handleCancel = async (examId: string) => {
    setActionLoading(examId)
    try {
      // Implementar lógica de cancelación
      setReserved(reserved.filter((id) => id !== examId))
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-primary-dark mb-2">Mesas Disponibles</h1>
        <p className="text-foreground/60">Consulta y reserva tus turnos de examen</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : exams.length === 0 ? (
        <div className="bg-accent rounded-lg p-12 text-center">
          <p className="text-foreground/60">No hay mesas disponibles en este momento</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <ExamCard
              key={exam.id}
              exam={exam}
              isReserved={reserved.includes(exam.id)}
              loading={actionLoading === exam.id}
              onReserve={() => handleReserve(exam.id)}
              onCancel={() => handleCancel(exam.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
