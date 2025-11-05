"use client"

import type React from "react"

import { useAuth } from "@/hooks/use-auth"
import { canAccessRoute, getRedirectPath } from "@/lib/route-guard"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  requiredRoles: string[]
  children: React.ReactNode
}

export function ProtectedRoute({ requiredRoles, children }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.push("/login")
      return
    }

    if (!canAccessRoute(user, requiredRoles)) {
      const redirectPath = getRedirectPath(user.role)
      router.push(redirectPath)
    }
  }, [user, loading, requiredRoles, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user || !canAccessRoute(user, requiredRoles)) {
    return null
  }

  return <>{children}</>
}
