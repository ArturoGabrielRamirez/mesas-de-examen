"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { examService } from "@/lib/exam-service"
import { toast } from "sonner"
import { Loader2, X, History } from "lucide-react"

interface GradeEntryModalProps {
  isOpen: boolean
  onClose: () => void
  examTableId: string
  studentId: string
  studentName: string
  subjectName?: string
  teacherId?: string
  currentGrade?: { score: number; observations: string }
  onSuccess?: () => void
}

export function GradeEntryModal({
  isOpen,
  onClose,
  examTableId,
  studentId,
  studentName,
  teacherId,
  subjectName,
  currentGrade,
  onSuccess,
}: GradeEntryModalProps) {
  const [score, setScore] = useState<string>(currentGrade?.score?.toString() || "0")
  const [observations, setObservations] = useState(currentGrade?.observations || "")
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<any[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [recordedBy, setRecordedBy] = useState<string>("")
  const [recordedAt, setRecordedAt] = useState<Date | null>(null)

  useEffect(() => {
    if (isOpen) {
      loadHistory()
    }
  }, [isOpen, examTableId, studentId])

  const loadHistory = async () => {
    const gradeData = await examService.getGradeWithHistory(examTableId, studentId)
    if (gradeData) {
      setHistory(gradeData.history || [])
      setRecordedBy(gradeData.recordedBy)
      setRecordedAt(gradeData.recordedAt)
      setScore(gradeData.score.toString())
      setObservations(gradeData.observations)
    }
  }

  if (!isOpen) return null

  const handleSubmit = async () => {
    if (!score || Number.parseInt(score) < 0 || Number.parseInt(score) > 10) {
      toast.error("La nota debe estar entre 0 y 10")
      return
    }

    setLoading(true)
    try {
      await examService.recordGrade(
        examTableId,
        studentId,
        Number.parseInt(score),
        observations,
        teacherId || "",
        subjectName,
      )
      onSuccess?.()
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg border-2 border-primary">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-primary-dark">Registrar Calificación</h2>
          <button onClick={onClose} className="p-1 hover:bg-accent rounded">
            <X className="w-6 h-6 text-primary-dark" />
          </button>
        </div>

        <p className="text-sm text-foreground/70 mb-4">{studentName}</p>
        {subjectName && <p className="text-sm font-semibold text-primary mb-4">Materia: {subjectName}</p>}

        {recordedBy && (
          <div className="mb-4 p-3 bg-accent/30 rounded-lg">
            <p className="text-xs text-foreground/60">
              Registrado por: <span className="font-semibold">{recordedBy}</span>
            </p>
            {recordedAt && (
              <p className="text-xs text-foreground/60">
                Fecha: {recordedAt.toLocaleDateString("es-AR")} {recordedAt.toLocaleTimeString("es-AR")}
              </p>
            )}
          </div>
        )}

        {history.length > 0 && (
          <div className="mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
              className="w-full flex items-center justify-center gap-2"
            >
              <History className="w-4 h-4" />
              {showHistory ? "Ocultar" : "Ver"} Historial ({history.length})
            </Button>

            {showHistory && (
              <div className="mt-2 p-3 bg-accent/20 rounded-lg max-h-40 overflow-y-auto">
                <p className="text-xs font-bold text-primary-dark mb-2">Cambios anteriores:</p>
                {history.map((entry, index) => (
                  <div key={index} className="text-xs mb-2 pb-2 border-b border-border last:border-0">
                    <p>
                      Nota: <span className="font-semibold">{entry.score}</span>
                    </p>
                    {entry.observations && <p>Obs: {entry.observations}</p>}
                    <p>Por: {entry.updatedBy}</p>
                    <p>{new Date(entry.updatedAt).toLocaleString("es-AR")}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-primary-dark mb-2">Nota (0-10)</label>
            <Input
              type="number"
              min="0"
              max="10"
              step="0.5"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              className="border-2 border-primary/20 focus:border-primary-dark"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-primary-dark mb-2">Observaciones (opcional)</label>
            <textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              className="w-full p-2 border-2 border-primary/20 rounded-lg focus:border-primary-dark focus:outline-none"
              rows={3}
              placeholder="Observaciones generales..."
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={onClose} variant="outline" className="flex-1 bg-transparent">
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-primary hover:bg-primary-dark text-white gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Guardar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
