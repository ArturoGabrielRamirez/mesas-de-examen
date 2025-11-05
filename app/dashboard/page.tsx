"use client"

import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"
import { getRedirectPath } from "@/lib/route-guard"

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.push("/login")
      return
    }

    // Redirigir según el rol
    const redirectPath = getRedirectPath(user.role)
    router.push(redirectPath)
  }, [user, loading, router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  )
}
