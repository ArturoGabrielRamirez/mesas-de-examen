"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, type SubmitHandler, type FieldValues } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { signupSchema } from "@/lib/validation/schemas"
import { authService } from "@/lib/auth-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BookOpen, Loader2 } from "lucide-react"
import Link from "next/link"

interface SignupFormData extends FieldValues {
  name: string
  surname: string
  dni: string
  course: string
  email: string
  password: string
  confirmPassword: string
}

const COURSES = [
  "1° A",
  "1° B",
  "1° C",
  "2° A",
  "2° B",
  "2° C",
  "3° A",
  "3° B",
  "3° C",
  "4° A",
  "4° B",
  "4° C",
  "5° A",
  "5° B",
  "5° C",
]

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: yupResolver(signupSchema),
  })

  const onSubmit: SubmitHandler<SignupFormData> = async (data) => {
    setIsLoading(true)
    try {
      await authService.signup(data)
      try {
        await authService.sendEmailVerification()
      } catch (verificationError) {
        // Continue even if verification email fails
        console.error("[v0] Email verification error:", verificationError)
      }
      router.push("/login?registered=true")
    } catch (err) {
      // Error handled by toast in auth service
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-accent via-background to-background p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-primary">
          <div className="flex items-center justify-center mb-8">
            <BookOpen className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-center text-primary-dark mb-2">Registrarse</h1>
          <p className="text-center text-foreground/60 mb-8">Crea tu cuenta como estudiante</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Nombre</label>
                <Input
                  {...register("name")}
                  placeholder="Juan"
                  className="w-full border-2 border-primary/20 focus:border-primary-dark text-sm"
                />
                {errors.name && <p className="text-destructive text-xs mt-1">{String(errors.name.message)}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Apellido</label>
                <Input
                  {...register("surname")}
                  placeholder="Pérez"
                  className="w-full border-2 border-primary/20 focus:border-primary-dark text-sm"
                />
                {errors.surname && <p className="text-destructive text-xs mt-1">{String(errors.surname.message)}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">DNI</label>
              <Input
                {...register("dni")}
                placeholder="12345678"
                className="w-full border-2 border-primary/20 focus:border-primary-dark text-sm"
              />
              {errors.dni && <p className="text-destructive text-xs mt-1">{String(errors.dni.message)}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Curso</label>
              <select
                {...register("course")}
                className="w-full px-3 py-2 border-2 border-primary/20 focus:border-primary-dark rounded-md text-sm"
              >
                <option value="">Selecciona tu curso</option>
                {COURSES.map((course) => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </select>
              {errors.course && <p className="text-destructive text-xs mt-1">{String(errors.course.message)}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Email Institucional</label>
              <Input
                {...register("email")}
                type="email"
                placeholder="tu@colegio.edu.ar"
                className="w-full border-2 border-primary/20 focus:border-primary-dark text-sm"
              />
              {errors.email && <p className="text-destructive text-xs mt-1">{String(errors.email.message)}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Contraseña</label>
                <Input
                  {...register("password")}
                  type="password"
                  placeholder="••••••••"
                  className="w-full border-2 border-primary/20 focus:border-primary-dark text-sm"
                />
                {errors.password && <p className="text-destructive text-xs mt-1">{String(errors.password.message)}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Confirmar</label>
                <Input
                  {...register("confirmPassword")}
                  type="password"
                  placeholder="••••••••"
                  className="w-full border-2 border-primary/20 focus:border-primary-dark text-sm"
                />
                {errors.confirmPassword && (
                  <p className="text-destructive text-xs mt-1">{String(errors.confirmPassword.message)}</p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 mt-6"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Registrando...
                </>
              ) : (
                "Registrarse"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-foreground/60 text-sm">
              ¿Ya tienes cuenta?{" "}
              <Link href="/login" className="text-primary hover:text-primary-dark font-semibold">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
