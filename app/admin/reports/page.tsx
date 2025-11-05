"use client"

import { useState } from "react"
import { pdfService } from "@/lib/pdf-service"
import { adminService } from "@/lib/admin-service"
import { examService } from "@/lib/exam-service"
import { PDFExportButton } from "@/components/pdf-export-button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"

export default function ReportsPage() {
  const [isLoading, setIsLoading] = useState(false)

  const generateGradesReport = async () => {
    setIsLoading(true)
    try {
      const grades = await examService.getAllGrades()
      const students = await adminService.getAllUsers("student")
      const exams = await examService.getAllExams()

      const reportData = await Promise.all(
        grades.map(async (grade) => {
          const student = students.find((s) => s.uid === grade.studentId)
          const exam = exams.find((e) => e.id === grade.examId)
          const subject = exam ? await examService.getSubjectById(exam.subjectId) : null

          return {
            alumno: student ? `${student.name} ${student.surname}` : grade.studentId,
            curso: student?.course || "N/A",
            materia: subject?.name || "N/A",
            nota: grade.score?.toString() || "N/A",
            observaciones: grade.observations || "-",
            fecha: grade.createdAt.toLocaleDateString("es-AR"),
          }
        }),
      )

      if (reportData.length === 0) {
        toast.error("No hay calificaciones registradas")
        return
      }

      pdfService.generateGeneralReport("Reporte de Calificaciones", reportData, [
        "Alumno",
        "Curso",
        "Materia",
        "Nota",
        "Observaciones",
        "Fecha",
      ])
    } catch (err) {
      console.error("[v0] Error generating grades report:", err)
      toast.error("Error al generar reporte")
    } finally {
      setIsLoading(false)
    }
  }

  const generateStudentsReport = async () => {
    setIsLoading(true)
    try {
      const students = await adminService.getAllUsers("student")

      if (students.length === 0) {
        toast.error("No hay estudiantes registrados")
        return
      }

      const studentsData = students.map((student) => ({
        nombre: `${student.name} ${student.surname}`,
        dni: student.dni || "N/A",
        curso: student.course || "N/A",
        email: student.email,
        estado: student.status === "validated" ? "Validado" : "Pendiente",
      }))

      pdfService.generateGeneralReport("Reporte de Estudiantes", studentsData, [
        "Nombre",
        "DNI",
        "Curso",
        "Email",
        "Estado",
      ])
    } catch (err) {
      console.error("[v0] Error generating students report:", err)
      toast.error("Error al generar reporte")
    } finally {
      setIsLoading(false)
    }
  }

  const generateExamsReport = async () => {
    setIsLoading(true)
    try {
      const exams = await examService.getAllExams()
      const teachers = await adminService.getAllUsers("teacher")

      if (exams.length === 0) {
        toast.error("No hay mesas registradas")
        return
      }

      const examsData = await Promise.all(
        exams.map(async (exam) => {
          const teacher = teachers.find((t) => t.uid === exam.teacherId)
          const subject = await examService.getSubjectById(exam.subjectId)
          const reservations = await examService.getReservationsForExam(exam.id)

          return {
            materia: subject?.name || exam.subjectId,
            profesor: teacher ? `${teacher.name} ${teacher.surname}` : exam.teacherId,
            fecha: exam.date.toLocaleDateString("es-AR"),
            hora: `${exam.startTime} - ${exam.endTime}`,
            aula: exam.room,
            inscritos: reservations.length.toString(),
            estado: exam.status || "programada",
          }
        }),
      )

      pdfService.generateGeneralReport("Reporte de Mesas de Examen", examsData, [
        "Materia",
        "Profesor",
        "Fecha",
        "Hora",
        "Aula",
        "Inscritos",
        "Estado",
      ])
    } catch (err) {
      console.error("[v0] Error generating exams report:", err)
      toast.error("Error al generar reporte")
    } finally {
      setIsLoading(false)
    }
  }

  const generateAttendanceReport = async () => {
    setIsLoading(true)
    try {
      const attendance = await examService.getAllAttendance()
      const students = await adminService.getAllUsers("student")
      const exams = await examService.getAllExams()

      if (attendance.length === 0) {
        toast.error("No hay registros de asistencia")
        return
      }

      const attendanceData = await Promise.all(
        attendance.map(async (record) => {
          const student = students.find((s) => s.uid === record.studentId)
          const exam = exams.find((e) => e.id === record.examId)
          const subject = exam ? await examService.getSubjectById(exam.subjectId) : null

          return {
            alumno: student ? `${student.name} ${student.surname}` : record.studentId,
            materia: subject?.name || "N/A",
            fecha: exam?.date.toLocaleDateString("es-AR") || "N/A",
            asistencia: record.status === "present" ? "Presente" : "Ausente",
          }
        }),
      )

      pdfService.generateGeneralReport("Reporte de Asistencia", attendanceData, [
        "Alumno",
        "Materia",
        "Fecha",
        "Asistencia",
      ])
    } catch (err) {
      console.error("[v0] Error generating attendance report:", err)
      toast.error("Error al generar reporte")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-primary-dark mb-2">Generar Reportes</h1>
        <p className="text-foreground/60">Exporta reportes en PDF con datos reales de la base de datos</p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-primary/10">
        <Tabs defaultValue="grades" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="grades">Calificaciones</TabsTrigger>
            <TabsTrigger value="students">Estudiantes</TabsTrigger>
            <TabsTrigger value="exams">Mesas</TabsTrigger>
            <TabsTrigger value="attendance">Asistencia</TabsTrigger>
          </TabsList>

          <TabsContent value="grades" className="space-y-6 mt-6">
            <div>
              <h3 className="text-lg font-bold text-primary-dark mb-4">Reporte de Calificaciones</h3>
              <p className="text-foreground/60 mb-4">
                Genera un reporte con todas las calificaciones registradas en el sistema
              </p>
              <PDFExportButton onClick={generateGradesReport} label="Descargar Reporte" disabled={isLoading} />
            </div>
          </TabsContent>

          <TabsContent value="students" className="space-y-6 mt-6">
            <div>
              <h3 className="text-lg font-bold text-primary-dark mb-4">Listado de Estudiantes</h3>
              <p className="text-foreground/60 mb-4">Genera un reporte con todos los estudiantes del sistema</p>
              <PDFExportButton onClick={generateStudentsReport} label="Descargar Listado" disabled={isLoading} />
            </div>
          </TabsContent>

          <TabsContent value="exams" className="space-y-6 mt-6">
            <div>
              <h3 className="text-lg font-bold text-primary-dark mb-4">Reporte de Mesas</h3>
              <p className="text-foreground/60 mb-4">Descarga un reporte completo de todas las mesas de examen</p>
              <PDFExportButton onClick={generateExamsReport} label="Descargar Reporte" disabled={isLoading} />
            </div>
          </TabsContent>

          <TabsContent value="attendance" className="space-y-6 mt-6">
            <div>
              <h3 className="text-lg font-bold text-primary-dark mb-4">Reporte de Asistencia</h3>
              <p className="text-foreground/60 mb-4">Genera un reporte con todos los registros de asistencia</p>
              <PDFExportButton onClick={generateAttendanceReport} label="Descargar Reporte" disabled={isLoading} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
