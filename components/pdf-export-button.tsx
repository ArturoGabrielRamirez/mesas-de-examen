"use client"

import { Button } from "@/components/ui/button"
import { FileDown, Loader2 } from "lucide-react"
import { useState } from "react"

interface PDFExportButtonProps {
  onClick: () => void | Promise<void>
  disabled?: boolean
  label?: string
}

export function PDFExportButton({ onClick, disabled, label = "Descargar PDF" }: PDFExportButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    setIsLoading(true)
    try {
      await onClick()
    } catch (error) {
      console.error("Error generating PDF:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || isLoading}
      className="bg-primary hover:bg-primary-dark text-white gap-2"
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
      {label}
    </Button>
  )
}
