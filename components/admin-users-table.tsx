"use client"

import { useState, useEffect } from "react"
import type { User } from "@/types"
import { adminService } from "@/lib/admin-service"
import { EditStudentModal } from "@/components/edit-student-modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Trash2, Edit2 } from "lucide-react"

interface AdminUsersTableProps {
  roleFilter?: string
}

export function AdminUsersTable({ roleFilter }: AdminUsersTableProps) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  useEffect(() => {
    loadUsers()
  }, [roleFilter, statusFilter])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const allUsers = await adminService.getAllUsers(roleFilter, statusFilter || undefined)
      setUsers(allUsers)
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter((u) =>
    `${u.name} ${u.surname} ${u.email}`.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleDelete = async (uid: string) => {
    if (!confirm("¿Estás seguro de que deseas desactivar este usuario?")) return
    setActionLoading(uid)
    try {
      await adminService.deleteUser(uid)
      setUsers(users.filter((u) => u.uid !== uid))
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Cargando usuarios...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4 flex-wrap">
        <Input
          placeholder="Buscar por nombre o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 min-w-64 border-2 border-primary/20"
        />
        <select
          value={statusFilter || ""}
          onChange={(e) => setStatusFilter(e.target.value || null)}
          className="px-4 py-2 border-2 border-primary/20 rounded-md"
        >
          <option value="">Todos los estados</option>
          <option value="pending">Pendiente</option>
          <option value="validated">Validado</option>
          <option value="rejected">Rechazado</option>
          <option value="inactive">Inactivo</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-primary">
              <th className="text-left py-3 px-4 font-bold text-primary-dark">Nombre</th>
              <th className="text-left py-3 px-4 font-bold text-primary-dark">Email</th>
              <th className="text-left py-3 px-4 font-bold text-primary-dark">Rol</th>
              <th className="text-left py-3 px-4 font-bold text-primary-dark">Estado</th>
              <th className="text-left py-3 px-4 font-bold text-primary-dark">Creado</th>
              <th className="text-center py-3 px-4 font-bold text-primary-dark">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-foreground/60">
                  No se encontraron usuarios
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.uid} className="border-b border-border hover:bg-accent/50">
                  <td className="py-3 px-4">
                    <div className="font-semibold">
                      {user.name} {user.surname}
                    </div>
                    {user.course && <div className="text-xs text-foreground/60">{user.course}</div>}
                  </td>
                  <td className="py-3 px-4 text-sm text-foreground/70">{user.email}</td>
                  <td className="py-3 px-4 text-sm capitalize">{user.role}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        user.status === "validated"
                          ? "bg-green-100 text-green-800"
                          : user.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : user.status === "rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs text-foreground/60">{user.createdAt.toLocaleDateString("es-AR")}</td>
                  <td className="py-3 px-4">
                    <div className="flex justify-center gap-2">
                      {/* CHANGE: Add edit button for users */}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-primary hover:bg-primary/10"
                        onClick={() => setEditingUser(user)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                        onClick={() => handleDelete(user.uid)}
                        disabled={actionLoading === user.uid}
                      >
                        {actionLoading === user.uid ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* CHANGE: Add edit modal for students */}
      {editingUser && (
        <EditStudentModal
          user={editingUser}
          onSuccess={() => {
            setEditingUser(null)
            loadUsers()
          }}
          onClose={() => setEditingUser(null)}
        />
      )}
    </div>
  )
}
