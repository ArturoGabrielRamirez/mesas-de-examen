"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, type SubmitHandler, type FieldValues } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { loginSchema } from "@/lib/validation/schemas"
import { authService } from "@/lib/auth-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BookOpen, Loader2 } from "lucide-react"
import Link from "next/link"

interface LoginFormData extends FieldValues {
  email: string
  password: string
}

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
  })

  const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
    setIsLoading(true)
    try {
      await authService.login(data.email, data.password)
      router.push("/dashboard")
      router.refresh()
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
          <h1 className="text-3xl font-bold text-center text-primary-dark mb-2">Ingresar</h1>
          <p className="text-center text-foreground/60 mb-8">Sistema de Mesas de Examen</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email</label>
              <Input
                {...register("email")}
                type="email"
                placeholder="tu@email.com"
                className="w-full border-2 border-primary/20 focus:border-primary-dark"
              />
              {errors.email && <p className="text-destructive text-sm mt-1">{String(errors.email.message)}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Contraseña</label>
              <Input
                {...register("password")}
                type="password"
                placeholder="••••••••"
                className="w-full border-2 border-primary/20 focus:border-primary-dark"
              />
              {errors.password && <p className="text-destructive text-sm mt-1">{String(errors.password.message)}</p>}
              <div className="text-right mt-2">
                <Link href="/forgot-password" className="text-sm text-primary hover:text-primary-dark">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Ingresando...
                </>
              ) : (
                "Ingresar"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-foreground/60">
              ¿No tienes cuenta?{" "}
              <Link href="/register" className="text-primary hover:text-primary-dark font-semibold">
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
