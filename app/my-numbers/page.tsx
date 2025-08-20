"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AuthModal } from "@/components/auth/auth-modal"
import { Loader2, Hash, Calendar, DollarSign, Clock, CreditCard } from "lucide-react"

interface MyNumber {
  id: number
  number: string
  status: "reserved" | "sold"
  reserved_at?: string
  sold_at?: string
  raffle_title: string
  raffle_draw_date: string
  ticket_price: number
  payment_status?: "pending" | "validated" | "rejected"
}

export default function MyNumbersPage() {
  const [myNumbers, setMyNumbers] = useState<MyNumber[]>([])
  const [loading, setLoading] = useState(true)
  const [authModalOpen, setAuthModalOpen] = useState(false)

  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        setAuthModalOpen(true)
      } else {
        fetchMyNumbers()
      }
    }
  }, [user, authLoading])

  const fetchMyNumbers = async () => {
    try {
      const response = await fetch("/api/user/numbers", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setMyNumbers(data)
      }
    } catch (error) {
      console.error("Error fetching my numbers:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = (numberId: number) => {
    // Redirect to payment page
    window.location.href = `/payment/${numberId}`
  }

  if (authLoading || loading) {
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
              <CardTitle className="text-center text-primary">Acceso Requerido</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">Debes iniciar sesión para ver tus números.</p>
              <Button onClick={() => setAuthModalOpen(true)}>Iniciar Sesión</Button>
            </CardContent>
          </Card>
        </div>
        <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted">
      <Header onLogin={() => setAuthModalOpen(true)} onRegister={() => setAuthModalOpen(true)} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Mis Números</h1>
          <p className="text-muted-foreground">Aquí puedes ver todos los números que has reservado o comprado.</p>
        </div>

        {myNumbers.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Hash className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No tienes números</h3>
              <p className="text-muted-foreground mb-4">
                Aún no has reservado ningún número. ¡Ve a seleccionar tu número de la suerte!
              </p>
              <Button onClick={() => (window.location.href = "/select-numbers")}>Seleccionar Números</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myNumbers.map((myNumber) => (
              <Card key={myNumber.id} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl font-bold text-primary">#{myNumber.number}</CardTitle>
                      <p className="text-sm text-muted-foreground">{myNumber.raffle_title}</p>
                    </div>
                    <Badge
                      className={
                        myNumber.status === "sold" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }
                    >
                      {myNumber.status === "sold" ? "Comprado" : "Reservado"}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center">
                        <DollarSign className="mr-1 h-4 w-4" />
                        Precio
                      </span>
                      <span className="font-semibold">{myNumber.ticket_price} Bs</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center">
                        <Calendar className="mr-1 h-4 w-4" />
                        Sorteo
                      </span>
                      <span className="font-semibold">
                        {new Date(myNumber.raffle_draw_date).toLocaleDateString("es-ES")}
                      </span>
                    </div>

                    {myNumber.reserved_at && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground flex items-center">
                          <Clock className="mr-1 h-4 w-4" />
                          Reservado
                        </span>
                        <span className="font-semibold text-xs">
                          {new Date(myNumber.reserved_at).toLocaleString("es-ES")}
                        </span>
                      </div>
                    )}

                    {myNumber.payment_status && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground flex items-center">
                          <CreditCard className="mr-1 h-4 w-4" />
                          Pago
                        </span>
                        <Badge
                          variant={
                            myNumber.payment_status === "validated"
                              ? "default"
                              : myNumber.payment_status === "rejected"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {myNumber.payment_status === "validated"
                            ? "Validado"
                            : myNumber.payment_status === "rejected"
                              ? "Rechazado"
                              : "Pendiente"}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {myNumber.status === "reserved" && (
                    <div className="mt-4">
                      <Button className="w-full" onClick={() => handlePayment(myNumber.id)}>
                        Proceder al Pago
                      </Button>
                      <p className="text-xs text-muted-foreground text-center mt-2">
                        Tienes 6 horas para completar el pago antes de que expire la reserva
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
