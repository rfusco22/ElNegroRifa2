"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { AdminSidebar } from "./admin-sidebar"
import { Header } from "@/components/layout/header"
import { AuthModal } from "@/components/auth/auth-modal"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Shield } from "lucide-react"

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      if (!user) {
        setAuthModalOpen(true)
      } else {
        router.push("/")
      }
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted">
        <Header onLogin={() => setAuthModalOpen(true)} onRegister={() => setAuthModalOpen(true)} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted">
        <Header onLogin={() => setAuthModalOpen(true)} onRegister={() => setAuthModalOpen(true)} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle className="text-center text-primary flex items-center justify-center gap-2">
                <Shield className="h-5 w-5" />
                Acceso Administrativo
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">Debes iniciar sesión como administrador para acceder.</p>
              <Button onClick={() => setAuthModalOpen(true)}>Iniciar Sesión</Button>
            </CardContent>
          </Card>
        </div>
        <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      </div>
    )
  }

  if (user.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted">
        <Header onLogin={() => setAuthModalOpen(true)} onRegister={() => setAuthModalOpen(true)} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle className="text-center text-destructive flex items-center justify-center gap-2">
                <Shield className="h-5 w-5" />
                Acceso Denegado
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">No tienes permisos para acceder al panel administrativo.</p>
              <Button onClick={() => router.push("/")}>Volver al Inicio</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted">
      <Header onLogin={() => setAuthModalOpen(true)} onRegister={() => setAuthModalOpen(true)} />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
