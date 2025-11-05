"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BookOpen, Loader2, ArrowLeft, CheckCircle } from "lucide-react"
import Link from "next/link"
import { authService } from "@/lib/auth-service"
import { toast } from "sonner"

const forgotPasswordSchema = yup.object({
  email: yup.string().email("Email inválido").required("Email requerido"),
})

type ForgotPasswordForm = yup.InferType<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    resolver: yupResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsLoading(true)
    try {
      await authService.resetPassword(data.email)
      setEmailSent(true)
      toast.success("Email de recuperación enviado")
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

          {!emailSent ? (
            <>
              <h1 className="text-3xl font-bold text-center text-primary-dark mb-2">Recuperar Contraseña</h1>
              <p className="text-center text-foreground/60 mb-8">
                Ingresa tu email y te enviaremos instrucciones para restablecer tu contraseña
              </p>

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

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar Instrucciones"
                  )}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-primary-dark mb-2">Email Enviado</h2>
              <p className="text-foreground/70 mb-2">
                Revisa tu correo electrónico para las instrucciones de recuperación de contraseña.
              </p>
              <p className="text-foreground/60 text-sm mb-6">
                Si no encuentras el email en tu bandeja de entrada, revisa tu carpeta de spam o correo no deseado.
              </p>
              <p className="text-foreground/60 text-sm border-t pt-4">
                Si no recibiste el email o tu cuenta no existe, contacta con la administración del colegio para
                asistencia.
              </p>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-primary hover:text-primary-dark font-semibold inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
