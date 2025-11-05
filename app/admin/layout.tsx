"use client"

import type React from "react"

import { useAuth } from "@/hooks/use-auth"
import { ProtectedRoute } from "@/components/protected-route"
import { Sidebar } from "@/components/sidebar"
import { Loader2 } from "lucide-react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <ProtectedRoute requiredRoles={["admin", "preceptor"]}>
      <div className="flex h-screen">
        <Sidebar user={user} />
        <main className="flex-1 overflow-auto bg-background">
          <div className="p-4 md:p-8">{children}</div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
