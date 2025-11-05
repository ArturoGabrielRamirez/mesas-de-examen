"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { adminService } from "@/lib/admin-service"
import { toast } from "sonner"
import { Loader2, X } from "lucide-react"
import type { User } from "@/types"

const studentSchema = yup.object({
  name: yup.string().required("Nombre requerido"),
  surname: yup.string().required("Apellido requerido"),
  status: yup.string().oneOf(["pending", "validated", "rejected", "inactive"]).required("Estado requerido"),
})

type StudentForm = yup.InferType<typeof studentSchema>

interface EditStudentModalProps {
  user: User
  onSuccess?: () => void
  onClose?: () => void
}

export function EditStudentModal({ user, onSuccess, onClose }: EditStudentModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StudentForm>({
    resolver: yupResolver(studentSchema),
    defaultValues: {
      name: user.name,
      surname: user.surname,
      status: user.status,
    },
  })

  const onSubmit = async (data: StudentForm) => {
    setIsLoading(true)
    try {
      await adminService.updateUser(user.uid, data)
      toast.success("Usuario actualizado exitosamente")
      onSuccess?.()
    } catch (err) {
      console.error("[v0] Error updating student:", err)
      toast.error("Error al actualizar usuario")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 border-2 border-primary">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-primary-dark">Editar Estudiante</h2>
          <button onClick={onClose} className="p-2 hover:bg-accent rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Nombre</label>
            <Input {...register("name")} className="w-full border-2 border-primary/20 focus:border-primary-dark" />
            {errors.name && <p className="text-destructive text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Apellido</label>
            <Input {...register("surname")} className="w-full border-2 border-primary/20 focus:border-primary-dark" />
            {errors.surname && <p className="text-destructive text-xs mt-1">{errors.surname.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Curso (No editable)</label>
            <div className="w-full p-2 bg-accent/20 rounded-lg text-foreground font-medium">{user.course}</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Estado</label>
            <select
              {...register("status")}
              className="w-full p-2 border-2 border-primary/20 rounded-lg focus:border-primary-dark"
            >
              <option value="pending">Pendiente</option>
              <option value="validated">Validado</option>
              <option value="rejected">Rechazado</option>
              <option value="inactive">Inactivo</option>
            </select>
            {errors.status && <p className="text-destructive text-xs mt-1">{errors.status.message}</p>}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-2 mt-6"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Actualizando...
              </>
            ) : (
              "Actualizar Estudiante"
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
