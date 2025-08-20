"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { NumberGrid } from "@/components/numbers/number-grid"
import { NumberDetails } from "@/components/numbers/number-details"
import { AuthModal } from "@/components/auth/auth-modal"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface RaffleNumber {
  id: number
  number: string
  status: "available" | "reserved" | "sold"
  user_id?: number
  reserved_at?: string
  sold_at?: string
}

interface Raffle {
  id: number
  title: string
  ticket_price: number
  draw_date: string
}

export default function SelectNumbersPage() {
  const [numbers, setNumbers] = useState<RaffleNumber[]>([])
  const [raffle, setRaffle] = useState<Raffle | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedNumber, setSelectedNumber] = useState<RaffleNumber | null>(null)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const router = useRouter()

  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        setAuthModalOpen(true)
      } else {
        fetchRaffleData()
      }
    }
  }, [user, authLoading])

  const fetchRaffleData = async () => {
    try {
      // Fetch active raffle and its numbers
      const raffleResponse = await fetch("/api/raffles/active")
      const raffles = await raffleResponse.json()

      if (raffles.length > 0) {
        const activeRaffle = raffles[0]
        setRaffle(activeRaffle)

        // Fetch numbers for this raffle
        const numbersResponse = await fetch(`/api/raffles/${activeRaffle.id}/numbers`)
        const numbersData = await numbersResponse.json()
        setNumbers(numbersData)
      }
    } catch (error) {
      console.error("Error fetching raffle data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleNumberSelect = (number: RaffleNumber) => {
    if (number.status === "available") {
      setSelectedNumber(number)
    }
  }

  const handleReserveNumber = async (numberId: number) => {
    try {
      const response = await fetch(`/api/numbers/${numberId}/reserve`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      })

      if (response.ok) {
        router.push(`/payment/${numberId}`)
      } else {
        console.error("Error reserving number")
      }
    } catch (error) {
      console.error("Error reserving number:", error)
    }
  }

  const filteredNumbers = numbers.filter((number) => {
    const matchesSearch = number.number.includes(searchTerm)
    const matchesStatus = statusFilter === "all" || number.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusCounts = () => {
    const available = numbers.filter((n) => n.status === "available").length
    const reserved = numbers.filter((n) => n.status === "reserved").length
    const sold = numbers.filter((n) => n.status === "sold").length
    return { available, reserved, sold }
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
              <p className="text-muted-foreground mb-4">Debes iniciar sesión para seleccionar números de la rifa.</p>
              <Button onClick={() => setAuthModalOpen(true)}>Iniciar Sesión</Button>
            </CardContent>
          </Card>
        </div>
        <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      </div>
    )
  }

  if (!raffle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted">
        <Header onLogin={() => setAuthModalOpen(true)} onRegister={() => setAuthModalOpen(true)} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle className="text-center text-primary">No hay rifas activas</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">Actualmente no hay rifas disponibles para participar.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const statusCounts = getStatusCounts()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted">
      <Header onLogin={() => setAuthModalOpen(true)} onRegister={() => setAuthModalOpen(true)} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Raffle Info */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold text-primary mb-2">{raffle.title}</CardTitle>
                  <p className="text-muted-foreground">
                    Precio del boleto: <span className="font-semibold">{raffle.ticket_price} Bs</span> | Sorteo:{" "}
                    <span className="font-semibold">{new Date(raffle.draw_date).toLocaleDateString("es-ES")}</span>
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {statusCounts.available} Disponibles
                  </Badge>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    {statusCounts.reserved} Reservados
                  </Badge>
                  <Badge variant="secondary" className="bg-red-100 text-red-800">
                    {statusCounts.sold} Vendidos
                  </Badge>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar número específico (ej: 123)"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="md:w-48">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Filtrar por estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="available">Disponibles</SelectItem>
                      <SelectItem value="reserved">Reservados</SelectItem>
                      <SelectItem value="sold">Vendidos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Numbers Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <NumberGrid numbers={filteredNumbers} onNumberSelect={handleNumberSelect} selectedNumber={selectedNumber} />
          </div>

          {/* Number Details Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <NumberDetails
                selectedNumber={selectedNumber}
                raffle={raffle}
                onReserve={handleReserveNumber}
                onClose={() => setSelectedNumber(null)}
              />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
