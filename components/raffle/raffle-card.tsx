"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, DollarSign, Trophy, Users } from "lucide-react"

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

interface RaffleCardProps {
  raffle: Raffle
  onParticipate: () => void
}

export function RaffleCard({ raffle, onParticipate }: RaffleCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString()}`
  }

  const totalPrize = raffle.first_prize + raffle.second_prize + raffle.third_prize

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 border-border/50">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-bold text-foreground">{raffle.title}</CardTitle>
          <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
            {raffle.status === "active" ? "Activa" : "Cerrada"}
          </Badge>
        </div>
        <p className="text-muted-foreground text-sm">{raffle.description}</p>
      </CardHeader>

      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Prize Information */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground flex items-center">
                <Trophy className="mr-1 h-4 w-4" />
                Total en Premios
              </span>
              <span className="text-lg font-bold text-primary">{formatCurrency(totalPrize)}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center">
                <div className="font-semibold text-secondary">{formatCurrency(raffle.first_prize)}</div>
                <div className="text-muted-foreground">1er Premio</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-secondary">{formatCurrency(raffle.second_prize)}</div>
                <div className="text-muted-foreground">2do Premio</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-secondary">{formatCurrency(raffle.third_prize)}</div>
                <div className="text-muted-foreground">3er Premio</div>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center">
                <DollarSign className="mr-1 h-4 w-4" />
                Precio del Boleto
              </span>
              <span className="font-semibold">{raffle.ticket_price} Bs</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center">
                <Calendar className="mr-1 h-4 w-4" />
                Fecha del Sorteo
              </span>
              <span className="font-semibold">{formatDate(raffle.draw_date)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center">
                <Users className="mr-1 h-4 w-4" />
                Números Disponibles
              </span>
              <span className="font-semibold">000 - 999</span>
            </div>
          </div>

          <Button className="w-full" onClick={onParticipate} disabled={raffle.status !== "active"}>
            {raffle.status === "active" ? "Participar Ahora" : "Rifa Cerrada"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
