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

const userSchema = yup.object({
  name: yup.string().required("Nombre requerido"),
  surname: yup.string().required("Apellido requerido"),
  email: yup.string().email("Email inválido").required("Email requerido"),
})

type UserForm = yup.InferType<typeof userSchema>

interface EditUserModalProps {
  user: User
  onSuccess?: () => void
  onClose?: () => void
}

export function EditUserModal({ user, onSuccess, onClose }: EditUserModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserForm>({
    resolver: yupResolver(userSchema),
    defaultValues: {
      name: user.name,
      surname: user.surname,
      email: user.email,
    },
  })

  const onSubmit = async (data: UserForm) => {
    setIsLoading(true)
    try {
      await adminService.updateUser(user.uid, data)
      toast.success("Usuario actualizado exitosamente")
      onSuccess?.()
    } catch (err) {
      console.error("[v0] Error updating user:", err)
      toast.error("Error al actualizar usuario")
    } finally {
      setIsLoading(false)
    }
  }

  const roleLabel = user.role === "teacher" ? "Profesor" : user.role === "preceptor" ? "Preceptor" : "Usuario"

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 border-2 border-primary">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-primary-dark">Editar {roleLabel}</h2>
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

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-2 mt-6"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar Cambios"
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
