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

const professorSchema = yup.object({
  name: yup.string().required("Nombre requerido"),
  surname: yup.string().required("Apellido requerido"),
  email: yup.string().email("Email inválido").required("Email requerido"),
  password: yup.string().min(6, "Mínimo 6 caracteres").required("Contraseña requerida"),
})

type ProfessorForm = yup.InferType<typeof professorSchema>

interface CreateProfessorModalProps {
  role?: "teacher" | "preceptor"
  onSuccess?: () => void
  onClose?: () => void
}

export function CreateProfessorModal({ role = "teacher", onSuccess, onClose }: CreateProfessorModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfessorForm>({
    resolver: yupResolver(professorSchema),
  })

  const onSubmit = async (data: ProfessorForm) => {
    setIsLoading(true)
    try {
      if (role === "preceptor") {
        await adminService.createPreceptor(data)
        toast.success("Preceptor creado exitosamente")
      } else {
        await adminService.createProfessor(data)
        toast.success("Profesor creado exitosamente. El profesor puede iniciar sesión con sus credenciales.")
      }
      onSuccess?.()
    } catch (err) {
      console.error("[v0] Error creating user:", err)
      toast.error(`Error al crear ${role}`)
    } finally {
      setIsLoading(false)
    }
  }

  const titleLabel = role === "preceptor" ? "Crear Preceptor" : "Crear Profesor"
  const buttonLabel = role === "preceptor" ? "Crear Preceptor" : "Crear Profesor"

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 border-2 border-primary">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-primary-dark">{titleLabel}</h2>
          <button onClick={onClose} className="p-2 hover:bg-accent rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Nombre</label>
            <Input
              {...register("name")}
              placeholder="Juan"
              className="w-full border-2 border-primary/20 focus:border-primary-dark"
            />
            {errors.name && <p className="text-destructive text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Apellido</label>
            <Input
              {...register("surname")}
              placeholder="Pérez"
              className="w-full border-2 border-primary/20 focus:border-primary-dark"
            />
            {errors.surname && <p className="text-destructive text-xs mt-1">{errors.surname.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Email</label>
            <Input
              {...register("email")}
              type="email"
              placeholder="juan@colegio.com"
              className="w-full border-2 border-primary/20 focus:border-primary-dark"
            />
            {errors.email && <p className="text-destructive text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Contraseña</label>
            <Input
              {...register("password")}
              type="password"
              placeholder="Contraseña temporal"
              className="w-full border-2 border-primary/20 focus:border-primary-dark"
            />
            {errors.password && <p className="text-destructive text-xs mt-1">{errors.password.message}</p>}
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
              buttonLabel
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
