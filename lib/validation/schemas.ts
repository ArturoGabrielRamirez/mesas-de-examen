import * as Yup from "yup"

export const loginSchema = Yup.object({
  email: Yup.string().email("Email inválido").required("Email requerido"),
  password: Yup.string().min(6, "Mínimo 6 caracteres").required("Contraseña requerida"),
})

export const signupSchema = Yup.object({
  name: Yup.string().min(2, "Mínimo 2 caracteres").required("Nombre requerido"),
  surname: Yup.string().min(2, "Mínimo 2 caracteres").required("Apellido requerido"),
  dni: Yup.string()
    .matches(/^\d{7,8}$/, "DNI inválido (7-8 dígitos)")
    .required("DNI requerido"),
  email: Yup.string().email("Email inválido").required("Email requerido"),
  course: Yup.string().required("Curso requerido"),
  password: Yup.string().min(6, "Mínimo 6 caracteres").required("Contraseña requerida"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Las contraseñas deben coincidir")
    .required("Confirmación requerida"),
})

export const examTableSchema = Yup.object({
  subjectId: Yup.string().required("Materia requerida"),
  date: Yup.date().required("Fecha requerida"),
  startTime: Yup.string().required("Hora de inicio requerida"),
  endTime: Yup.string().required("Hora de fin requerida"),
  room: Yup.string().required("Aula requerida"),
  maxStudents: Yup.number().min(1, "Mínimo 1 estudiante").required("Cantidad máxima requerida"),
})

export const gradeSchema = Yup.object({
  score: Yup.number().min(0).max(10, "Nota entre 0 y 10").required("Nota requerida"),
  observations: Yup.string(),
})

export const professorSchema = Yup.object({
  name: Yup.string().min(2, "Mínimo 2 caracteres").required("Nombre requerido"),
  surname: Yup.string().min(2, "Mínimo 2 caracteres").required("Apellido requerido"),
  email: Yup.string().email("Email inválido").required("Email requerido"),
  password: Yup.string().min(6, "Mínimo 6 caracteres").required("Contraseña requerida"),
})
