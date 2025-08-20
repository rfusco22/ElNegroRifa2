"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { RaffleCard } from "@/components/raffle/raffle-card"
import { AuthModal } from "@/components/auth/auth-modal"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Sparkles, Trophy, Calendar, DollarSign } from "lucide-react"

interface Raffle {
  id: number
  title: string
  description: string
  ticket_price: number
  first_prize: number
  second_prize: number
  third_prize: number
  draw_date: string
  status: string
}

export default function HomePage() {
  const [raffles, setRaffles] = useState<Raffle[]>([])
  const [loading, setLoading] = useState(true)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "register">("login")
  const { user } = useAuth()

  useEffect(() => {
    fetchActiveRaffles()
  }, [])

  const fetchActiveRaffles = async () => {
    try {
      const response = await fetch("/api/raffles/active")
      if (response.ok) {
        const data = await response.json()
        setRaffles(data)
      }
    } catch (error) {
      console.error("Error fetching raffles:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleParticipate = () => {
    if (!user) {
      setAuthMode("login")
      setAuthModalOpen(true)
    } else {
      // Redirect to number selection
      window.location.href = "/select-numbers"
    }
  }

  const handleRegister = () => {
    setAuthMode("register")
    setAuthModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted">
      <Header onLogin={() => setAuthModalOpen(true)} onRegister={handleRegister} />

      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 animate-pulse" />
        <div className="relative max-w-6xl mx-auto">
          <div className="mb-8">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/RIFAS%20EL%20NEGRO-NkvLSGBl9o0j5vqLLpNeFUxJ3Cd8Sn.png"
              alt="Rifas El Negro Logo"
              className="h-32 md:h-48 mx-auto mb-6 drop-shadow-2xl"
            />
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 font-serif">
            <span className="text-primary">Rifas</span> <span className="text-secondary">El Negro</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Participa en nuestras rifas y gana increíbles premios. Números del 000 al 999 disponibles.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button size="lg" className="text-lg px-8 py-4 shadow-lg" onClick={handleParticipate}>
              <Sparkles className="mr-2 h-5 w-5" />
              {user ? "Seleccionar Números" : "Participar Ahora"}
            </Button>
            {!user && (
              <Button variant="outline" size="lg" className="text-lg px-8 py-4 bg-transparent" onClick={handleRegister}>
                Crear Cuenta
              </Button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-card/80 backdrop-blur-sm rounded-lg p-6 border border-border/50">
              <Trophy className="h-8 w-8 text-secondary mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-primary">$1000</h3>
              <p className="text-muted-foreground">Total en Premios</p>
            </div>
            <div className="bg-card/80 backdrop-blur-sm rounded-lg p-6 border border-border/50">
              <Calendar className="h-8 w-8 text-secondary mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-primary">31/10/2025</h3>
              <p className="text-muted-foreground">Fecha del Sorteo</p>
            </div>
            <div className="bg-card/80 backdrop-blur-sm rounded-lg p-6 border border-border/50">
              <DollarSign className="h-8 w-8 text-secondary mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-primary">400 Bs</h3>
              <p className="text-muted-foreground">Precio del Boleto</p>
            </div>
          </div>
        </div>
      </section>

      {/* Raffle Flyer Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 font-serif">Rifa Actual</h2>
          <div className="bg-card rounded-2xl p-8 shadow-2xl border border-border/50">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202025-08-20%20at%2012.32.21%20PM-6flSlOGoPfNaFWQ4dm2J2Ys9YNMqNZ.jpeg"
              alt="Flyer Rifa El Negro"
              className="w-full max-w-md mx-auto rounded-lg shadow-lg mb-6"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="bg-primary/10 rounded-lg p-4">
                <h3 className="text-xl font-bold text-primary mb-2">1er Premio</h3>
                <p className="text-3xl font-bold text-secondary">$700</p>
              </div>
              <div className="bg-primary/10 rounded-lg p-4">
                <h3 className="text-xl font-bold text-primary mb-2">2do Premio</h3>
                <p className="text-3xl font-bold text-secondary">$200</p>
              </div>
              <div className="bg-primary/10 rounded-lg p-4">
                <h3 className="text-xl font-bold text-primary mb-2">3er Premio</h3>
                <p className="text-3xl font-bold text-secondary">$100</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Active Raffles */}
      {!loading && raffles.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12 font-serif">
              Rifas Activas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {raffles.map((raffle) => (
                <RaffleCard key={raffle.id} raffle={raffle} onParticipate={handleParticipate} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How it Works */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 font-serif">¿Cómo Funciona?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card rounded-lg p-6 shadow-lg">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Regístrate</h3>
              <p className="text-muted-foreground">Crea tu cuenta con tus datos personales</p>
            </div>
            <div className="bg-card rounded-lg p-6 shadow-lg">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Elige tu Número</h3>
              <p className="text-muted-foreground">Selecciona tu número de la suerte del 000 al 999</p>
            </div>
            <div className="bg-card rounded-lg p-6 shadow-lg">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Paga y Gana</h3>
              <p className="text-muted-foreground">Realiza tu pago y espera el sorteo para ganar</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} defaultMode={authMode} />
    </div>
  )
}
