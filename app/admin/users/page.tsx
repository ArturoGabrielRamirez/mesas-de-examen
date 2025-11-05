"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AdminUsersTable } from "@/components/admin-users-table"

export default function AdminUsersPage() {
  const [roleFilter, setRoleFilter] = useState<string | null>(null)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-primary-dark mb-2">Gestionar Usuarios</h1>
          <p className="text-foreground/60">Administra todos los usuarios del sistema</p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button
          onClick={() => setRoleFilter(null)}
          variant={roleFilter === null ? "default" : "outline"}
          className={roleFilter === null ? "bg-primary hover:bg-primary-dark" : ""}
        >
          Todos
        </Button>
        <Button
          onClick={() => setRoleFilter("student")}
          variant={roleFilter === "student" ? "default" : "outline"}
          className={roleFilter === "student" ? "bg-primary hover:bg-primary-dark" : ""}
        >
          Estudiantes
        </Button>
        <Button
          onClick={() => setRoleFilter("teacher")}
          variant={roleFilter === "teacher" ? "default" : "outline"}
          className={roleFilter === "teacher" ? "bg-primary hover:bg-primary-dark" : ""}
        >
          Profesores
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-primary/10">
        <AdminUsersTable roleFilter={roleFilter || undefined} />
      </div>
    </div>
  )
}
