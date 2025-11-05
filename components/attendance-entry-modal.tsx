"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { examService } from "@/lib/exam-service"
import { Loader2, X, History } from "lucide-react"

interface AttendanceEntryModalProps {
  isOpen: boolean
  onClose: () => void
  examTableId: string
  studentId: string
  studentName: string
  teacherId?: string
  currentStatus?: string
  onSuccess?: () => void
}

export function AttendanceEntryModal({
  isOpen,
  onClose,
  examTableId,
  studentId,
  studentName,
  teacherId,
  currentStatus,
  onSuccess,
}: AttendanceEntryModalProps) {
  const [status, setStatus] = useState<"present" | "absent" | "justified">((currentStatus as any) || "present")
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
    const attendanceData = await examService.getAttendanceWithHistory(examTableId, studentId)
    if (attendanceData) {
      setHistory(attendanceData.history || [])
      setRecordedBy(attendanceData.recordedBy)
      setRecordedAt(attendanceData.recordedAt)
      setStatus(attendanceData.status)
    }
  }

  if (!isOpen) return null

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await examService.recordAttendance(examTableId, studentId, status, teacherId || "")
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
          <h2 className="text-2xl font-bold text-primary-dark">Registrar Asistencia</h2>
          <button onClick={onClose} className="p-1 hover:bg-accent rounded">
            <X className="w-6 h-6 text-primary-dark" />
          </button>
        </div>

        <p className="text-sm text-foreground/70 mb-6">{studentName}</p>

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
                      Estado:{" "}
                      <span className="font-semibold capitalize">
                        {entry.status === "present"
                          ? "Presente"
                          : entry.status === "absent"
                            ? "Ausente"
                            : "Justificado"}
                      </span>
                    </p>
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
            <label className="block text-sm font-bold text-primary-dark mb-3">Estado de Asistencia</label>
            <div className="space-y-2">
              {(["present", "absent", "justified"] as const).map((s) => (
                <label
                  key={s}
                  className="flex items-center gap-3 p-3 border-2 border-primary/20 rounded-lg cursor-pointer hover:bg-accent/50"
                >
                  <input
                    type="radio"
                    name="status"
                    value={s}
                    checked={status === s}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-4 h-4"
                  />
                  <span className="capitalize font-medium">
                    {s === "present" ? "Presente" : s === "absent" ? "Ausente" : "Justificado"}
                  </span>
                </label>
              ))}
            </div>
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
