import { jsPDF } from "jspdf"
import type { User, ExamTable, Grade } from "@/types"

export class PDFService {
  private primaryColor = "#B48A60" // Marrón claro
  private darkColor = "#5A1E1E" // Bordó oscuro
  private accentColor = "#F3E9DC" // Beige claro

  /**
   * Genera comprobante de reserva de examen
   */
  generateReservationCertificate(student: User, exam: ExamTable & { subjectName?: string }): void {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()

    // Fondo beige
    doc.setFillColor(243, 233, 220)
    doc.rect(0, 0, pageWidth, pageHeight, "F")

    // Encabezado con borde
    doc.setDrawColor(90, 30, 30) // Bordó
    doc.setLineWidth(2)
    doc.rect(10, 10, pageWidth - 20, 30)

    // Título
    doc.setFont("helvetica", "bold")
    doc.setFontSize(20)
    doc.setTextColor(90, 30, 30)
    doc.text("COMPROBANTE DE RESERVA", pageWidth / 2, 30, { align: "center" })

    // Institución
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text("Colegio Dr. Juan E. Martínez - Bella Vista, Corrientes", pageWidth / 2, 36, { align: "center" })

    // Datos del estudiante
    let yPos = 55
    doc.setFillColor(180, 138, 96)
    doc.rect(15, yPos - 5, pageWidth - 30, 8, "F")
    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.setTextColor(255, 255, 255)
    doc.text("DATOS DEL ESTUDIANTE", 20, yPos)

    yPos += 12
    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)

    const studentData = [
      ["Nombre:", `${student.name} ${student.surname}`],
      ["DNI:", student.dni],
      ["Email:", student.email],
      ["Curso:", student.course || "N/A"],
    ]

    studentData.forEach(([label, value]) => {
      doc.setFont("helvetica", "bold")
      doc.text(label, 20, yPos)
      doc.setFont("helvetica", "normal")
      doc.text(value, 55, yPos)
      yPos += 7
    })

    // Datos del examen
    yPos += 8
    doc.setFillColor(180, 138, 96)
    doc.rect(15, yPos - 5, pageWidth - 30, 8, "F")
    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.setTextColor(255, 255, 255)
    doc.text("DATOS DEL EXAMEN", 20, yPos)

    yPos += 12
    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)

    const examData = [
      ["Materia:", exam.subjectName || exam.subjectId || "Materia"],
      ["Fecha:", new Date(exam.date).toLocaleDateString("es-AR")],
      ["Hora:", `${exam.startTime} - ${exam.endTime}`],
      ["Aula:", `${exam.room}`],
      ["Máximo Estudiantes:", `${exam.maxStudents}`],
    ]

    examData.forEach(([label, value]) => {
      doc.setFont("helvetica", "bold")
      doc.text(label, 20, yPos)
      doc.setFont("helvetica", "normal")
      doc.text(value, 55, yPos)
      yPos += 7
    })

    // Pie de página
    yPos = pageHeight - 30
    doc.setFontSize(9)
    doc.setTextColor(100, 100, 100)
    doc.text("Este comprobante confirma tu reserva para el examen indicado.", pageWidth / 2, yPos, { align: "center" })
    doc.text(`Emitido: ${new Date().toLocaleString("es-AR")}`, pageWidth / 2, yPos + 8, { align: "center" })

    doc.save(`comprobante_reserva_${student.dni}.pdf`)
  }

  /**
   * Genera acta de examen con calificaciones
   */
  generateExamReport(exam: ExamTable & { subjectName?: string; teacher?: User }, grades: Grade[], teacher: User): void {
    const doc = new jsPDF("l") // Landscape para tabla más ancha
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()

    // Fondo beige
    doc.setFillColor(243, 233, 220)
    doc.rect(0, 0, pageWidth, pageHeight, "F")

    // Encabezado con borde
    doc.setDrawColor(90, 30, 30)
    doc.setLineWidth(3)
    doc.rect(10, 8, pageWidth - 20, 20)

    doc.setFont("helvetica", "bold")
    doc.setFontSize(18)
    doc.setTextColor(90, 30, 30)
    doc.text("ACTA DE EXAMEN", pageWidth / 2, 18, { align: "center" })

    // Datos de la institución
    doc.setFontSize(9)
    doc.setTextColor(100, 100, 100)
    doc.text("Colegio Dr. Juan E. Martínez - Bella Vista, Corrientes", pageWidth / 2, 24, { align: "center" })

    // Información del examen
    let yPos = 35
    doc.setFont("helvetica", "bold")
    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)

    const examInfo = [
      `Materia: ${exam.subjectName || exam.subjectId || "Materia"} | Fecha: ${new Date(exam.date).toLocaleDateString("es-AR")} | Hora: ${exam.startTime}`,
      `Profesor: ${teacher.name} ${teacher.surname} | Aula: ${exam.room}`,
    ]

    examInfo.forEach((info) => {
      doc.text(info, 15, yPos)
      yPos += 6
    })

    // Tabla de estudiantes y calificaciones
    yPos += 5
    const columns = ["N°", "Estudiante", "DNI", "Nota", "Estado", "Observaciones"]
    const rows = grades.map((grade, index) => [
      `${index + 1}`,
      `Estudiante ${grade.studentId.substring(0, 6)}`,
      "—",
      `${grade.score}/10`,
      "Presente",
      grade.observations || "—",
    ])

    doc.setFontSize(10)
    let tableYPos = yPos
    const columnWidths = [12, 50, 25, 18, 25, 80]

    // Encabezados de tabla
    doc.setFont("helvetica", "bold")
    doc.setFillColor(180, 138, 96)
    doc.setTextColor(255, 255, 255)
    doc.rect(
      15,
      tableYPos,
      columnWidths.reduce((a, b) => a + b, 0),
      8,
      "F",
    )

    columns.forEach((col, i) => {
      const xPos = 15 + columnWidths.slice(0, i).reduce((a, b) => a + b, 0)
      doc.text(col, xPos + 2, tableYPos + 5)
    })

    // Filas de datos
    tableYPos += 8
    doc.setFont("helvetica", "normal")
    doc.setTextColor(0, 0, 0)

    rows.forEach((row, rowIndex) => {
      if (rowIndex % 2 === 0) {
        doc.setFillColor(250, 245, 235)
        doc.rect(
          15,
          tableYPos,
          columnWidths.reduce((a, b) => a + b, 0),
          7,
          "F",
        )
      }

      row.forEach((cell, i) => {
        const xPos = 15 + columnWidths.slice(0, i).reduce((a, b) => a + b, 0)
        doc.text(cell, xPos + 2, tableYPos + 5)
      })
      tableYPos += 7
    })

    // Firma
    const signatureY = pageHeight - 25
    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)
    doc.line(15, signatureY - 5, 80, signatureY - 5)
    doc.text("Firma del Docente", 15, signatureY)
    doc.line(pageWidth - 80, signatureY - 5, pageWidth - 15, signatureY - 5)
    doc.text("Firma del Preceptor", pageWidth - 80, signatureY)

    doc.save(`acta_examen_${exam.id}.pdf`)
  }

  /**
   * Genera reporte general por curso/materia
   */
  generateGeneralReport(title: string, data: Record<string, unknown>[], columns: string[]): void {
    const doc = new jsPDF("l")
    const pageWidth = doc.internal.pageSize.getWidth()

    // Encabezado
    doc.setFont("helvetica", "bold")
    doc.setFontSize(18)
    doc.setTextColor(90, 30, 30)
    doc.text(title.toUpperCase(), pageWidth / 2, 15, { align: "center" })

    doc.setFontSize(9)
    doc.setTextColor(100, 100, 100)
    doc.text(`Emitido: ${new Date().toLocaleString("es-AR")}`, pageWidth / 2, 22, { align: "center" })

    // Tabla de datos
    const columnWidths = Array(columns.length).fill((pageWidth - 30) / columns.length)
    let tableYPos = 32

    // Encabezados
    doc.setFont("helvetica", "bold")
    doc.setFillColor(180, 138, 96)
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(9)

    columns.forEach((col, i) => {
      const xPos = 15 + columnWidths.slice(0, i).reduce((a, b) => a + b, 0)
      doc.text(col, xPos + 2, tableYPos + 5)
    })

    // Filas de datos
    tableYPos += 8
    doc.setFont("helvetica", "normal")
    doc.setTextColor(0, 0, 0)
    doc.setFillColor(243, 233, 220)

    data.forEach((row, rowIndex) => {
      if (rowIndex % 2 === 0) {
        doc.rect(15, tableYPos + 2, pageWidth - 30, 7, "F")
      }

      Object.values(row).forEach((value, colIndex) => {
        const xPos = 15 + columnWidths.slice(0, colIndex).reduce((a, b) => a + b, 0)
        doc.text(String(value), xPos + 2, tableYPos + 5)
      })

      tableYPos += 8
    })

    doc.save(`reporte_${title.toLowerCase().replace(/\s+/g, "_")}.pdf`)
  }
}

export const pdfService = new PDFService()
