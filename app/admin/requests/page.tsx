"use client"

import { AdminRequestsTable } from "@/components/admin-requests-table"

export default function RequestsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-primary-dark mb-2">Validar Registros</h1>
        <p className="text-foreground/60">Gestiona las solicitudes de registro pendientes de estudiantes</p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-primary/10">
        <AdminRequestsTable />
      </div>
    </div>
  )
}
