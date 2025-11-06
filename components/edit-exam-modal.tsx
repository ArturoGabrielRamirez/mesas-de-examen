"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { teacherService } from "@/lib/teacher-service"
import { toast } from "sonner"
import { Loader2, X } from "lucide-react"
import type { ExamTable } from "@/types"
import { getTeachers } from "@/lib/user-service"
import { authService } from "@/lib/auth-service"
import { getUserById } from "@/lib/user-service"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"

const examSchema = yup.object({
  subjectName: yup.string().required("Materia requerida"),
  date: yup.string().required("Fecha requerida"),
  startTime: yup.string().required("Hora de inicio requerida"),
  endTime: yup.string().required("Hora de finalización requerida"),
  room: yup.string().required("Aula requerida"),
  maxStudents: yup.number().positive("Debe ser positivo").required("Máximo requerido"),
})

type ExamForm = yup.InferType<typeof examSchema>

interface EditExamModalProps {
  exam: ExamTable
  onSuccess?: () => void
  onClose?: () => void
}

export function EditExamModal({ exam, onSuccess, onClose }: EditExamModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [teachers, setTeachers] = useState<any[]>([])
  const [role, setRole] = useState<"teacher" | "admin" | "preceptor" | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ExamForm>({
    resolver: yupResolver(examSchema),
    defaultValues: {
      subjectName: exam.subjectName,
      date: (
        exam.date instanceof Date
          ? exam.date
          : (exam.date as any)?.toDate ? (exam.date as any).toDate() : new Date(exam.date)
      ).toISOString().split("T")[0],
      startTime: exam.startTime,
      endTime: exam.endTime,
      room: exam.room,
      maxStudents: exam.maxStudents,
    },

  })

  /* ✅ Detectar rol y cargar profesores si es admin/preceptor */
  useEffect(() => {
    const load = async () => {
      const authUser = await authService.getCurrentUser()
      if (!authUser?.uid) return

      const u = await getUserById(authUser.uid)
      setRole(u?.role ?? null)
      setCurrentUser(u)

      if (u?.role !== "teacher") {
        setTeachers(await getTeachers())
      }
    }
    load()
  }, [])

  const onSubmit = async (data: ExamForm) => {
    setIsLoading(true)
    try {
      await teacherService.updateExamTable(exam.id, {
        ...data,
        date: new Date(`${data.date}T12:00:00`) // ✅ fecha correcta
      })

      toast.success("Mesa actualizada exitosamente")
      onSuccess?.()
    } catch (err) {
      console.error("[v0] Error updating exam:", err)
      toast.error("Error al actualizar mesa")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 border-2 border-primary">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-primary-dark">Editar Mesa</h2>
          <button onClick={onClose} className="p-2 hover:bg-accent rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          {/* ✅ Materia texto libre */}
          <div>
            <label className="block text-sm font-medium mb-1">Materia</label>
            <Input {...register("subjectName")} placeholder="Ej: Matemática" />
            {errors.subjectName && <p className="text-red-500 text-xs">{errors.subjectName.message}</p>}
          </div>

          {/* ✅ Profesor dinámico */}
          {role === "teacher" ? (
            <div>
              <label className="block text-sm font-medium mb-1">Profesor</label>
              <Input disabled value={currentUser?.displayName ?? ""} className="bg-muted" />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium mb-1">Profesor</label>
              <Select defaultValue={exam.teacherId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {teachers.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.displayName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Fecha */}
          <Input {...register("date")} type="date" />
          {/* Horarios */}
          <Input {...register("startTime")} type="time" />
          <Input {...register("endTime")} type="time" />
          {/* Aula */}
          <Input {...register("room")} placeholder="Ej: 101" />
          {/* Cupo */}
          <Input {...register("maxStudents")} type="number" placeholder="30" />

          <Button disabled={isLoading} className="w-full mt-4">
            {isLoading ? (<><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>) : "Actualizar Mesa"}
          </Button>
        </form>
      </div>
    </div>
  )
}
