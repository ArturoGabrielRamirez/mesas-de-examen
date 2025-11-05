"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { examService } from "@/lib/exam-service"
import type { ExamTable } from "@/types"
import { Button } from "@/components/ui/button"
import { PDFExportButton } from "@/components/pdf-export-button"
import { pdfService } from "@/lib/pdf-service"
import { Loader2, Calendar, Clock, MapPin } from "lucide-react"

interface StudentReservation extends ExamTable {
  reservationId: string
}

export default function StudentReservationsPage() {
  const { user } = useAuth()
  const [reservations, setReservations] = useState<StudentReservation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadReservations()
  }, [user?.uid])

  const loadReservations = async () => {
    if (!user?.uid) return
    try {
      const exams = await examService.getExamsByStudent(user.uid)
      setReservations(exams as any)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadCertificate = (exam: ExamTable) => {
    if (user) {
      pdfService.generateReservationCertificate(user, exam)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-primary-dark mb-2">Mis Reservas</h1>
        <p className="text-foreground/60">Consulta y descarga comprobantes de tus exámenes reservados</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : reservations.length === 0 ? (
        <div className="bg-accent rounded-lg p-12 text-center">
          <p className="text-foreground/60 mb-4">Aún no tienes reservas confirmadas</p>
          <Button className="bg-primary hover:bg-primary-dark">Realizar Reserva</Button>
        </div>
      ) : (
        <div className="grid gap-6">
          {reservations.map((exam, index) => (
            <div key={`${exam.id}-${index}`} className="bg-white border-2 border-primary rounded-lg p-6 shadow-md">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-primary-dark">{exam.subjectName || exam.subjectId}</h3>
                  <p className="text-sm text-foreground/60 mt-1">Reserva Confirmada</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                  {exam.status === "in_progress"
                    ? "En Proceso"
                    : exam.status === "completed"
                      ? "Finalizado"
                      : "Confirmado"}
                </span>
              </div>

              <div className="grid md:grid-cols-4 gap-4 mb-6 text-sm text-foreground/70">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  {new Date(exam.date).toLocaleDateString("es-AR")}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  {exam.startTime} - {exam.endTime}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Aula {exam.room}
                </div>
              </div>

              <div className="flex gap-2">
                <PDFExportButton onClick={() => handleDownloadCertificate(exam)} label="Descargar Comprobante" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
