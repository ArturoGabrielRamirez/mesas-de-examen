"use client"

import { useState, useEffect, useCallback } from "react"
import type { User } from "@/types"
import { Button } from "@/components/ui/button"
import { authService } from "@/lib/auth-service"
import { adminService } from "@/lib/admin-service"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"

export function AdminRequestsTable() {
  const { user: currentUser } = useAuth()
  const [pendingUsers, setPendingUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const loadPendingUsers = useCallback(async () => {
    try {
      const users = await adminService.getPendingUsers()
      console.log("[v0] Loaded pending users:", users)
      setPendingUsers(users)
    } catch (err) {
      console.error("[v0] Error loading pending users:", err)
      toast.error("Error al cargar registros pendientes")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPendingUsers()
  }, [loadPendingUsers])

  const handleApprove = async (uid: string) => {
    setActionLoading(uid)
    try {
      if (!currentUser) throw new Error("Not authorized")
      await authService.validateStudent(uid, currentUser.uid)
      setPendingUsers(pendingUsers.filter((u) => u.uid !== uid))
      toast.success("Registro aprobado")
    } catch (err) {
      console.error("[v0] Error approving user:", err)
      toast.error("Error al aprobar registro")
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (uid: string) => {
    setActionLoading(uid)
    try {
      await authService.rejectStudent(uid)
      setPendingUsers(pendingUsers.filter((u) => u.uid !== uid))
      toast.success("Registro rechazado")
    } catch (err) {
      console.error("[v0] Error rejecting user:", err)
      toast.error("Error al rechazar registro")
    } finally {
      setActionLoading(null)
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">Cargando registros pendientes...</div>
  }

  if (pendingUsers.length === 0) {
    return (
      <div className="text-center py-12 bg-accent rounded-lg">
        <p className="text-foreground/60">No hay registros pendientes de validación</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-primary">
            <th className="text-left py-3 px-4 font-bold text-primary-dark">Nombre</th>
            <th className="text-left py-3 px-4 font-bold text-primary-dark">DNI</th>
            <th className="text-left py-3 px-4 font-bold text-primary-dark">Email</th>
            <th className="text-left py-3 px-4 font-bold text-primary-dark">Curso</th>
            <th className="text-left py-3 px-4 font-bold text-primary-dark">Solicitud</th>
            <th className="text-center py-3 px-4 font-bold text-primary-dark">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {pendingUsers.map((user) => (
            <tr key={user.uid} className="border-b border-border hover:bg-accent/50">
              <td className="py-3 px-4">
                <span className="font-semibold">
                  {user.name} {user.surname}
                </span>
              </td>
              <td className="py-3 px-4">{user.dni}</td>
              <td className="py-3 px-4 text-sm text-foreground/70">{user.email}</td>
              <td className="py-3 px-4">{user.course}</td>
              <td className="py-3 px-4 text-xs text-foreground/60">{user.createdAt.toLocaleDateString("es-AR")}</td>
              <td className="py-3 px-4">
                <div className="flex justify-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleApprove(user.uid)}
                    disabled={actionLoading === user.uid}
                    className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1"
                  >
                    {actionLoading === user.uid ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    Aprobar
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleReject(user.uid)}
                    disabled={actionLoading === user.uid}
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50 flex items-center gap-1"
                  >
                    {actionLoading === user.uid ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    Rechazar
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
