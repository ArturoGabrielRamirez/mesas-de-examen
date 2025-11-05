"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { examTableSchema } from "@/lib/validation/schemas"
import { teacherService } from "@/lib/teacher-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/hooks/use-auth"
import { Loader2, X } from "lucide-react"
import { toast } from "sonner"

interface CreateExamFormProps {
  onSuccess?: () => void
  onClose?: () => void
}

export function CreateExamForm({ onSuccess, onClose }: CreateExamFormProps) {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(examTableSchema),
  })

  const onSubmit = async (data: any) => {
    if (!user?.uid) return
    setIsLoading(true)
    try {
      await teacherService.createExamTable(data, user.uid)
      toast.success("Mesa de examen creada exitosamente")
      onSuccess?.()
    } catch (err) {
      console.error("[v0] Error creating exam:", err)
      toast.error("Error al crear mesa de examen")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 border-2 border-primary">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-primary-dark">Crear Mesa de Examen</h2>
          <button onClick={onClose} className="p-2 hover:bg-accent rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Materia (ID)</label>
            <Input
              {...register("subjectId")}
              placeholder="ID de la materia"
              className="w-full border-2 border-primary/20 focus:border-primary-dark text-sm"
            />
            {errors.subjectId && <p className="text-destructive text-xs mt-1">{errors.subjectId.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Fecha</label>
            <Input
              {...register("date")}
              type="date"
              className="w-full border-2 border-primary/20 focus:border-primary-dark text-sm"
            />
            {errors.date && <p className="text-destructive text-xs mt-1">{errors.date.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Hora Inicio</label>
              <Input
                {...register("startTime")}
                type="time"
                className="w-full border-2 border-primary/20 focus:border-primary-dark text-sm"
              />
              {errors.startTime && <p className="text-destructive text-xs mt-1">{errors.startTime.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Hora Fin</label>
              <Input
                {...register("endTime")}
                type="time"
                className="w-full border-2 border-primary/20 focus:border-primary-dark text-sm"
              />
              {errors.endTime && <p className="text-destructive text-xs mt-1">{errors.endTime.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Aula</label>
              <Input
                {...register("room")}
                placeholder="Ej: 101"
                className="w-full border-2 border-primary/20 focus:border-primary-dark text-sm"
              />
              {errors.room && <p className="text-destructive text-xs mt-1">{errors.room.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Máx Estudiantes</label>
              <Input
                {...register("maxStudents")}
                type="number"
                placeholder="30"
                className="w-full border-2 border-primary/20 focus:border-primary-dark text-sm"
              />
              {errors.maxStudents && <p className="text-destructive text-xs mt-1">{errors.maxStudents.message}</p>}
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-2 mt-6"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creando...
              </>
            ) : (
              "Crear Mesa"
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
