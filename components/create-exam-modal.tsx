"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { adminService } from "@/lib/admin-service"
import { examService } from "@/lib/exam-service"
import { useToast } from "@/components/ui/use-toast"
import { getUserById, getTeachers } from "@/lib/user-service"
import { authService } from "@/lib/auth-service"

export default function CreateExamModal({ open, onClose, onCreated }: {
    open: boolean
    onClose: () => void
    onCreated: () => void
}) {
    const { toast } = useToast()
    const [teachers, setTeachers] = useState<any[]>([])
    const [role, setRole] = useState<"teacher" | "admin" | "preceptor" | null>(null)
    const [currentUser, setCurrentUser] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    const [form, setForm] = useState({
        subjectName: "",
        teacherId: "",
        date: "",
        startTime: "",
        endTime: "",
        room: "",
        maxStudents: 30,
    })

    useEffect(() => {
        const load = async () => {
            const authUser = await authService.getCurrentUser()
            if (!authUser?.uid) return

            const userData = await getUserById(authUser.uid)
            setCurrentUser(userData)
            setRole(userData?.role ?? null)

            if (userData?.role === "teacher") {
                setForm((prev) => ({
                    ...prev,
                    teacherId: userData.id,
                }))
            } else {
                const list = await getTeachers()
                setTeachers(list)
            }
        }
        load()
    }, [])

    const handleChange = (field: string, value: any) =>
        setForm(prev => ({ ...prev, [field]: value }))

    const handleSubmit = async () => {
        if (!form.subjectName || !form.teacherId || !form.date || !form.startTime || !form.endTime || !form.room) {
            toast({ title: "Faltan campos por completar", variant: "destructive" })
            return
        }

        try {
            setLoading(true)

            // ✅ FIX DEFINITIVO DEL DÍA QUE SE RESTABA
            const date = new Date(`${form.date}T12:00:00`)
            date.setHours(12, 0, 0, 0) // EVITA el shift a UTC que restaba 1 día

            await examService.createExam({
                subjectName: form.subjectName,
                teacherId: form.teacherId,
                teacherName:
                    role === "teacher"
                        ? currentUser.displayName
                        : teachers.find((t) => t.id === form.teacherId)?.displayName ?? "Sin nombre",
                date, // ✅ fecha corregida
                startTime: form.startTime,
                endTime: form.endTime,
                room: form.room,
                maxStudents: form.maxStudents,
                status: "scheduled",
            })

            toast({ title: "Mesa creada correctamente ✅" })
            onCreated()
        } catch (err) {
            console.error(err)
            toast({ title: "Error al crear mesa", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Nueva Mesa de Examen</DialogTitle>
                </DialogHeader>

                <div className="space-y-1">
                    <label className="text-sm font-medium">Materia</label>
                    <Input
                        placeholder="Ej: Matemática, Historia Argentina..."
                        value={form.subjectName}
                        onChange={(e) => handleChange("subjectName", e.target.value)}
                    />
                </div>

                {role === "teacher" ? (
                    <div className="space-y-1 mt-3">
                        <label className="text-sm font-medium">Profesor</label>
                        <Input disabled value={currentUser?.displayName ?? ""} className="bg-muted" />
                    </div>
                ) : (
                    <div className="space-y-1 mt-3">
                        <label className="text-sm font-medium">Profesor</label>
                        <Select onValueChange={(v) => handleChange("teacherId", v)}>
                            <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                            <SelectContent>
                                {teachers.map(t => (
                                    <SelectItem key={t.id} value={t.id}>{t.displayName}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                <div className="space-y-1 mt-3">
                    <label className="text-sm font-medium">Fecha</label>
                    <Input type="date" onChange={(e) => handleChange("date", e.target.value)} />
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3">
                    <div>
                        <label className="text-sm font-medium">Hora Inicio</label>
                        <Input type="time" onChange={(e) => handleChange("startTime", e.target.value)} />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Hora Final</label>
                        <Input type="time" onChange={(e) => handleChange("endTime", e.target.value)} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3">
                    <div>
                        <label className="text-sm font-medium">Aula</label>
                        <Input onChange={(e) => handleChange("room", e.target.value)} />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Cupo Máximo</label>
                        <Input type="number" defaultValue={30} onChange={(e) => handleChange("maxStudents", Number(e.target.value))} />
                    </div>
                </div>

                <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={onClose}>Cancelar</Button>
                    <Button disabled={loading} onClick={handleSubmit}>
                        {loading ? "Guardando..." : "Crear Mesa"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
