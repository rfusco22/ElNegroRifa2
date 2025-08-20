"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { PaymentMethods } from "@/components/payment/payment-methods"
import { AuthModal } from "@/components/auth/auth-modal"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft, Hash, Calendar, DollarSign, Clock } from "lucide-react"
import { useParams, useRouter } from "next/navigation"

interface NumberDetails {
  id: number
  number: string
  status: string
  reserved_at: string
  raffle_title: string
  raffle_draw_date: string
  ticket_price: number
  expires_at: string
}

interface PaymentMethod {
  id: number
  method_name: string
  account_info: any
  is_active: boolean
}

export default function PaymentPage() {
  const [numberDetails, setNumberDetails] = useState<NumberDetails | null>(null)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [timeLeft, setTimeLeft] = useState<number>(0)

  const { user, loading: authLoading } = useAuth()
  const params = useParams()
  const router = useRouter()
  const numberId = params.numberId as string

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        setAuthModalOpen(true)
      } else {
        fetchPaymentData()
      }
    }
  }, [user, authLoading, numberId])

  useEffect(() => {
    if (numberDetails?.expires_at) {
      const interval = setInterval(() => {
        const now = new Date().getTime()
        const expiry = new Date(numberDetails.expires_at).getTime()
        const difference = expiry - now

        if (difference > 0) {
          setTimeLeft(Math.floor(difference / 1000))
        } else {
          setTimeLeft(0)
          // Redirect back if expired
          router.push("/select-numbers")
        }
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [numberDetails, router])

  const fetchPaymentData = async () => {
    try {
      // Fetch number details
      const numberResponse = await fetch(`/api/numbers/${numberId}/details`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      })

      if (numberResponse.ok) {
        const numberData = await numberResponse.json()
        setNumberDetails(numberData)
      } else {
        router.push("/select-numbers")
        return
      }

      // Fetch payment methods
      const methodsResponse = await fetch("/api/payment-methods")
      if (methodsResponse.ok) {
        const methodsData = await methodsResponse.json()
        setPaymentMethods(methodsData.filter((method: PaymentMethod) => method.is_active))
      }
    } catch (error) {
      console.error("Error fetching payment data:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
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
              <p className="text-muted-foreground mb-4">Debes iniciar sesión para proceder con el pago.</p>
              <Button onClick={() => setAuthModalOpen(true)}>Iniciar Sesión</Button>
            </CardContent>
          </Card>
        </div>
        <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      </div>
    )
  }

  if (!numberDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted">
        <Header onLogin={() => setAuthModalOpen(true)} onRegister={() => setAuthModalOpen(true)} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle className="text-center text-primary">Número no encontrado</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">El número solicitado no existe o no tienes acceso a él.</p>
              <Button onClick={() => router.push("/select-numbers")}>Volver a Selección</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted">
      <Header onLogin={() => setAuthModalOpen(true)} onRegister={() => setAuthModalOpen(true)} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>

        {/* Number Summary */}
        <div className="mb-8">
          <Card>
            <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold text-primary mb-2">
                    Pago para Número #{numberDetails.number}
                  </CardTitle>
                  <p className="text-muted-foreground">{numberDetails.raffle_title}</p>
                </div>
                <div className="mt-4 md:mt-0">
                  <Badge className="bg-yellow-100 text-yellow-800">Reservado</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center justify-between md:justify-start md:flex-col md:items-start">
                  <span className="text-sm text-muted-foreground flex items-center md:mb-1">
                    <Hash className="mr-1 h-4 w-4" />
                    Número
                  </span>
                  <span className="text-2xl font-bold text-primary">{numberDetails.number}</span>
                </div>
                <div className="flex items-center justify-between md:justify-start md:flex-col md:items-start">
                  <span className="text-sm text-muted-foreground flex items-center md:mb-1">
                    <DollarSign className="mr-1 h-4 w-4" />
                    Precio
                  </span>
                  <span className="text-2xl font-bold text-secondary">{numberDetails.ticket_price} Bs</span>
                </div>
                <div className="flex items-center justify-between md:justify-start md:flex-col md:items-start">
                  <span className="text-sm text-muted-foreground flex items-center md:mb-1">
                    <Calendar className="mr-1 h-4 w-4" />
                    Sorteo
                  </span>
                  <span className="font-semibold">
                    {new Date(numberDetails.raffle_draw_date).toLocaleDateString("es-ES")}
                  </span>
                </div>
              </div>

              {/* Timer */}
              {timeLeft > 0 && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center justify-center">
                    <Clock className="mr-2 h-5 w-5 text-yellow-600" />
                    <span className="text-yellow-800 font-semibold">
                      Tiempo restante para completar el pago: {formatTime(timeLeft)}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Payment Methods */}
        <PaymentMethods
          paymentMethods={paymentMethods}
          numberDetails={numberDetails}
          onPaymentSubmitted={() => {
            router.push("/my-numbers")
          }}
        />
      </div>

      <Footer />
    </div>
  )
}
