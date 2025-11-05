"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import type { User } from "@/types"
import { LogOut, Menu, X } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { authService } from "@/lib/auth-service"

interface SidebarProps {
  user: User | null
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const navigation = user ? getNavigation(user.role) : []

  const handleLogout = async () => {
    await authService.logout()
    router.push("/login")
    router.refresh()
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-primary text-white rounded-lg"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-[#B48A60] text-white p-6 shadow-lg transition-transform md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:static z-40`}
      >
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Mesas</h1>
          <p className="text-sm opacity-90">Dr. J.E. Martínez</p>
        </div>

        <nav className="space-y-2 flex-1">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                pathname === item.href ? "bg-[#5A1E1E]" : "hover:bg-white/10"
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="border-t border-white/20 pt-4 space-y-3">
          <div className="text-sm px-4">
            <p className="opacity-75">Sesión iniciada como:</p>
            <p className="font-semibold">
              {user?.name} {user?.surname}
            </p>
            <p className="text-xs opacity-75 capitalize">{user?.role}</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full justify-start gap-2 border-white/20 hover:bg-white/10 bg-transparent"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </Button>
        </div>
      </aside>

      {isOpen && <div className="fixed inset-0 bg-black/50 md:hidden z-30" onClick={() => setIsOpen(false)} />}
    </>
  )
}

function getNavigation(role: string) {
  const baseNav = []

  if (role === "admin" || role === "preceptor") {
    baseNav.push(
      { href: "/admin/dashboard", label: "Dashboard", icon: "📊" },
      { href: "/admin/requests", label: "Validar Registros", icon: "✓" },
      { href: "/admin/professors", label: "Gestionar Profesores", icon: "👨‍🏫" },
      { href: "/admin/users", label: "Usuarios", icon: "👥" },
      { href: "/admin/exams", label: "Mesas", icon: "📋" },
      { href: "/admin/preceptors", label: "Preceptores", icon: "👔" },
      { href: "/admin/reports", label: "Reportes", icon: "📈" },
    )
  } else if (role === "teacher") {
    baseNav.push(
      { href: "/teacher/dashboard", label: "Dashboard", icon: "📊" },
      { href: "/teacher/exams", label: "Mis Mesas", icon: "📋" },
      { href: "/teacher/grades", label: "Calificaciones", icon: "✏️" },
      { href: "/teacher/attendance", label: "Asistencia", icon: "📝" },
    )
  } else if (role === "student") {
    baseNav.push(
      { href: "/student/dashboard", label: "Dashboard", icon: "📊" },
      { href: "/student/exams", label: "Mesas Disponibles", icon: "📋" },
      { href: "/student/reservations", label: "Mis Reservas", icon: "🔖" },
      { href: "/student/grades", label: "Mis Notas", icon: "📝" },
    )
  }

  return baseNav
}
