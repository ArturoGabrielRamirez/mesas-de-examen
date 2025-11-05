import type React from "react"
import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import "./globals.css"
import { Toaster } from "sonner"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "Sistema de Mesas de Examen",
  description: "Gestión integral de mesas de exámenes - Colegio Dr. Juan E. Martínez",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${poppins.className} bg-background text-foreground`}>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
