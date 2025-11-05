export type UserRole = "student" | "teacher" | "preceptor" | "admin"
export type UserStatus = "pending" | "validated" | "rejected" | "inactive"
export type AttendanceStatus = "present" | "absent" | "justified"

export interface User {
  uid: string
  email: string
  name: string
  surname: string
  role: UserRole
  status: UserStatus
  dni: string
  course?: string
  createdAt: Date
  updatedAt: Date
  validatedBy?: string
  validatedAt?: Date
  profileImage?: string
}

export interface Subject {
  id: string
  name: string
  code: string
  year: number
  division: string
  createdAt: Date
}

export interface ExamTable {
  id: string
  subjectId: string
  subjectName?: string
  teacherId: string
  date: Date
  startTime: string
  endTime: string
  room: string
  maxStudents: number
  status: "scheduled" | "in_progress" | "completed" | "cancelled"
  createdAt: Date
  updatedAt: Date
}

export interface Reservation {
  id: string
  examTableId: string
  studentId: string
  status: "confirmed" | "cancelled"
  createdAt: Date
  cancelledAt?: Date
}

export interface Grade {
  id: string
  examTableId: string
  studentId: string
  score: number
  observations: string
  subjectName?: string
  recordedBy: string
  recordedAt: Date
  updatedBy?: string
  updatedAt?: Date
  history?: GradeHistoryEntry[]
}

export interface GradeHistoryEntry {
  score: number
  observations: string
  updatedBy: string
  updatedAt: Date
}

export interface Attendance {
  id: string
  examTableId: string
  studentId: string
  status: AttendanceStatus
  recordedBy: string
  recordedAt: Date
  updatedBy?: string
  updatedAt?: Date
  history?: AttendanceHistoryEntry[]
}

export interface AttendanceHistoryEntry {
  status: AttendanceStatus
  updatedBy: string
  updatedAt: Date
}

export interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  signup: (data: SignupData) => Promise<void>
}

export interface SignupData {
  name: string
  surname: string
  dni: string
  email: string
  course: string
  password: string
  confirmPassword: string
}
