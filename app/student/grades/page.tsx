"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { examService } from "@/lib/exam-service"
import { Loader2 } from "lucide-react"

interface Grade {
  id: string
  examTableId: string
  subjectName: string
  score: number
  observations: string
  recordedAt: Date
}

export default function StudentGradesPage() {
  const { user } = useAuth()
  const [grades, setGrades] = useState<Grade[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadGrades()
  }, [user?.uid])

  const loadGrades = async () => {
    if (!user?.uid) return
    try {
      const studentGrades = await examService.getStudentGrades(user.uid)
      setGrades(studentGrades)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-primary-dark mb-2">Mis Calificaciones</h1>
        <p className="text-foreground/60">Revisa todas tus notas registradas</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : grades.length === 0 ? (
        <div className="bg-accent rounded-lg p-12 text-center">
          <p className="text-foreground/60">Aún no tienes calificaciones registradas</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-primary bg-accent">
                <th className="text-left py-3 px-6 font-bold text-primary-dark">Materia</th>
                <th className="text-left py-3 px-6 font-bold text-primary-dark">Nota</th>
                <th className="text-left py-3 px-6 font-bold text-primary-dark">Observaciones</th>
                <th className="text-left py-3 px-6 font-bold text-primary-dark">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((grade) => (
                <tr key={grade.id} className="border-b border-border hover:bg-accent/50">
                  <td className="py-3 px-6 font-semibold">{grade.subjectName}</td>
                  <td className="py-3 px-6">
                    <span className="text-xl font-bold text-primary-dark">{grade.score}</span>
                    <span className="text-foreground/60">/10</span>
                  </td>
                  <td className="py-3 px-6 text-sm text-foreground/70">{grade.observations || "—"}</td>
                  <td className="py-3 px-6 text-sm text-foreground/60">
                    {grade.recordedAt.toLocaleDateString("es-AR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
