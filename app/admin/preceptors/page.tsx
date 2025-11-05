"use client"

import { useState, useEffect, useCallback } from "react"
import type { User } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { adminService } from "@/lib/admin-service"
import { toast } from "sonner"
import { Plus, Trash2, Loader2, Edit2 } from "lucide-react"
import { CreateProfessorModal } from "@/components/create-professor-modal"
import { EditUserModal } from "@/components/edit-user-modal"

export default function PreceptorsPage() {
  const [preceptors, setPreceptors] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedPreceptor, setSelectedPreceptor] = useState<User | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [modalRole, setModalRole] = useState<"preceptor" | "teacher">("preceptor")

  const loadPreceptors = useCallback(async () => {
    try {
      setLoading(true)
      const users = await adminService.getUsersByRole("preceptor")
      setPreceptors(users)
    } catch (err) {
      console.error("[v0] Error loading preceptors:", err)
      toast.error("Error al cargar preceptores")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPreceptors()
  }, [loadPreceptors])

  const handleDelete = async (uid: string) => {
    if (!confirm("¿Eliminar este preceptor?")) return
    try {
      await adminService.deleteUser(uid)
      setPreceptors(preceptors.filter((p) => p.uid !== uid))
      toast.success("Preceptor eliminado")
    } catch (err) {
      toast.error("Error al eliminar preceptor")
    }
  }

  const handleEdit = (preceptor: User) => {
    setSelectedPreceptor(preceptor)
    setShowEditModal(true)
  }

  const filteredPreceptors = preceptors.filter((p) =>
    `${p.name} ${p.surname} ${p.email}`.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-primary-dark mb-2">Gestionar Preceptores</h1>
          <p className="text-foreground/60">Crea y administra cuentas de preceptores</p>
        </div>
        <Button
          onClick={() => {
            setModalRole("preceptor")
            setShowModal(true)
          }}
          className="bg-primary hover:bg-primary-dark text-white gap-2"
        >
          <Plus className="w-5 h-5" />
          Nuevo Preceptor
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-primary/10">
        <div className="mb-6">
          <Input
            placeholder="Buscar por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-2 border-primary/20 focus:border-primary-dark"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredPreceptors.length === 0 ? (
          <div className="text-center py-12 text-foreground/60">
            <p>No hay preceptores registrados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-primary">
                  <th className="text-left py-3 px-4 font-bold text-primary-dark">Nombre</th>
                  <th className="text-left py-3 px-4 font-bold text-primary-dark">Email</th>
                  <th className="text-left py-3 px-4 font-bold text-primary-dark">Estado</th>
                  <th className="text-left py-3 px-4 font-bold text-primary-dark">Creado</th>
                  <th className="text-center py-3 px-4 font-bold text-primary-dark">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredPreceptors.map((preceptor) => (
                  <tr key={preceptor.uid} className="border-b border-border hover:bg-accent/50">
                    <td className="py-3 px-4 font-semibold">
                      {preceptor.name} {preceptor.surname}
                    </td>
                    <td className="py-3 px-4 text-sm text-foreground/70">{preceptor.email}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          preceptor.status === "validated"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {preceptor.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-foreground/60">
                      {preceptor.createdAt.toLocaleDateString("es-AR")}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-primary hover:bg-primary/10"
                          onClick={() => handleEdit(preceptor)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(preceptor.uid)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <CreateProfessorModal
          role={modalRole}
          onSuccess={() => {
            setShowModal(false)
            loadPreceptors()
          }}
          onClose={() => setShowModal(false)}
        />
      )}

      {showEditModal && selectedPreceptor && (
        <EditUserModal
          user={selectedPreceptor}
          onSuccess={() => {
            setShowEditModal(false)
            setSelectedPreceptor(null)
            loadPreceptors()
          }}
          onClose={() => {
            setShowEditModal(false)
            setSelectedPreceptor(null)
          }}
        />
      )}
    </div>
  )
}
