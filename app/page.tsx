import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BookOpen, BarChart3, Users } from "lucide-react"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-accent via-background to-background">
      <nav className="flex items-center justify-between p-6 border-b border-border">
        <div className="flex items-center gap-2">
          <BookOpen className="w-8 h-8 text-primary" />
          <span className="text-xl font-bold text-primary-dark">{process.env.NEXT_PUBLIC_APP_NAME}</span>
        </div>
        <div className="flex gap-4">
          <Link href="/login">
            <Button variant="outline">Ingresar</Button>
          </Link>
          <Link href="/register">
            <Button className="bg-primary hover:bg-primary-dark">Registrarse</Button>
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl font-bold text-primary-dark mb-6">Gestión Integral de Mesas de Exámenes</h1>
            <p className="text-lg text-foreground/80 mb-8">
              Plataforma moderna para administrar reservas, notas y asistencia de exámenes. Simplificado para
              estudiantes, profesores y preceptores.
            </p>
            <div className="flex gap-4">
              <Link href="/register">
                <Button size="lg" className="bg-primary hover:bg-primary-dark">
                  Registrarse Ahora
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">
                  Ya tengo cuenta
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="p-6 bg-white border-2 border-primary rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <Users className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-bold text-primary-dark mb-2">Para Estudiantes</h3>
              <p className="text-foreground/70">Reserva turnos, consulta notas y descarga comprobantes en PDF.</p>
            </div>
            <div className="p-6 bg-white border-2 border-primary rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <BarChart3 className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-bold text-primary-dark mb-2">Para Profesores</h3>
              <p className="text-foreground/70">Crea mesas, registra notas y asistencia. Genera actas en PDF.</p>
            </div>
            <div className="p-6 bg-white border-2 border-primary rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <BookOpen className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-bold text-primary-dark mb-2">Para Preceptores</h3>
              <p className="text-foreground/70">Administra usuarios, mesas y genera reportes globales.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
