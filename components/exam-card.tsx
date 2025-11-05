"use client"

import type { ExamTable } from "@/types"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Users, MapPin } from "lucide-react"

interface ExamCardProps {
  exam: ExamTable & { subjectName?: string }
  onReserve?: () => void
  onCancel?: () => void
  isReserved?: boolean
  loading?: boolean
}

export function ExamCard({ exam, onReserve, onCancel, isReserved, loading }: ExamCardProps) {
  return (
    <div className="bg-white border-2 border-primary/10 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-xl font-bold text-primary-dark">{exam.subjectName || exam.subjectId}</h3>
        {isReserved && (
          <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">Reservado</span>
        )}
        {exam.status === "in_progress" && (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">En Proceso</span>
        )}
        {exam.status === "completed" && (
          <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded-full">Finalizado</span>
        )}
      </div>

      <div className="space-y-3 mb-6 text-sm text-foreground/70">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-primary" />
          <span>{new Date(exam.date).toLocaleDateString("es-AR")}</span>
        </div>
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-primary" />
          <span>
            {exam.startTime} - {exam.endTime}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <MapPin className="w-5 h-5 text-primary" />
          <span>Aula {exam.room}</span>
        </div>
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-primary" />
          <span>Máximo {exam.maxStudents} estudiantes</span>
        </div>
      </div>

      <div className="flex gap-2">
        {exam.status === "completed" ? (
          <Button disabled className="flex-1 bg-gray-300 text-gray-600 cursor-not-allowed">
            Examen Finalizado
          </Button>
        ) : isReserved ? (
          <Button
            onClick={onCancel}
            disabled={loading}
            variant="outline"
            className="flex-1 text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
          >
            Cancelar Reserva
          </Button>
        ) : (
          <Button onClick={onReserve} disabled={loading} className="flex-1 bg-primary hover:bg-primary-dark text-white">
            Reservar
          </Button>
        )}
      </div>
    </div>
  )
}
