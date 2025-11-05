import type { User } from "@/types"

export function canAccessRoute(user: User | null, requiredRoles: string[]): boolean {
  if (!user) return false
  if (user.status !== "validated") return false
  return requiredRoles.includes(user.role)
}

export function getRedirectPath(role: string): string {
  const paths: Record<string, string> = {
    student: "/student/dashboard",
    teacher: "/teacher/dashboard",
    preceptor: "/admin/dashboard",
    admin: "/admin/dashboard",
  }
  return paths[role] || "/"
}
