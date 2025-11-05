"use client"

import { useState, useEffect, useCallback } from "react"
import type { User } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { adminService } from "@/lib/admin-service"
import { toast } from "sonner"
import { Plus, Trash2, Edit2, Loader2 } from "lucide-react"
import { CreateProfessorModal } from "@/components/create-professor-modal"
import { EditUserModal } from "@/components/edit-user-modal"

export default function ProfessorsPage() {
  const [professors, setProfessors] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedProfessor, setSelectedProfessor] = useState<User | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const loadProfessors = useCallback(async () => {
    try {
      setLoading(true)
      const users = await adminService.getUsersByRole("teacher")
      setProfessors(users)
    } catch (err) {
      console.error("[v0] Error loading professors:", err)
      toast.error("Error al cargar profesores")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProfessors()
  }, [loadProfessors])

  const handleDelete = async (uid: string) => {
    if (!confirm("¿Eliminar este profesor?")) return
    try {
      await adminService.deleteUser(uid)
      setProfessors(professors.filter((p) => p.uid !== uid))
      toast.success("Profesor eliminado")
    } catch (err) {
      toast.error("Error al eliminar profesor")
    }
  }

  const handleEdit = (professor: User) => {
    setSelectedProfessor(professor)
    setShowEditModal(true)
  }

  const filteredProfessors = professors.filter((p) =>
    `${p.name} ${p.surname} ${p.email}`.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-primary-dark mb-2">Gestionar Profesores</h1>
          <p className="text-foreground/60">Crea y administra cuentas de docentes</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="bg-primary hover:bg-primary-dark text-white gap-2">
          <Plus className="w-5 h-5" />
          Nuevo Profesor
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
        ) : filteredProfessors.length === 0 ? (
          <div className="text-center py-12 text-foreground/60">
            <p>No hay profesores registrados</p>
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
                {filteredProfessors.map((prof) => (
                  <tr key={prof.uid} className="border-b border-border hover:bg-accent/50">
                    <td className="py-3 px-4 font-semibold">
                      {prof.name} {prof.surname}
                    </td>
                    <td className="py-3 px-4 text-sm text-foreground/70">{prof.email}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          prof.status === "validated"
                            ? "bg-green-100 text-green-800"
                            : prof.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {prof.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-foreground/60">
                      {prof.createdAt.toLocaleDateString("es-AR")}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-primary hover:bg-primary/10"
                          onClick={() => handleEdit(prof)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(prof.uid)}
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
          onSuccess={() => {
            setShowModal(false)
            loadProfessors()
          }}
          onClose={() => setShowModal(false)}
        />
      )}

      {showEditModal && selectedProfessor && (
        <EditUserModal
          user={selectedProfessor}
          onSuccess={() => {
            setShowEditModal(false)
            setSelectedProfessor(null)
            loadProfessors()
          }}
          onClose={() => {
            setShowEditModal(false)
            setSelectedProfessor(null)
          }}
        />
      )}
    </div>
  )
}
