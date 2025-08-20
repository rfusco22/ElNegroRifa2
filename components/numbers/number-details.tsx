"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, DollarSign, Hash, Clock, X } from "lucide-react"

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

interface NumberDetailsProps {
  selectedNumber: RaffleNumber | null
  raffle: Raffle
  onReserve: (numberId: number) => void
  onClose: () => void
}

export function NumberDetails({ selectedNumber, raffle, onReserve, onClose }: NumberDetailsProps) {
  if (!selectedNumber) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Selecciona un Número</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Haz clic en cualquier número disponible (verde) para ver los detalles y proceder con la reserva.
          </p>
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
              <span>Números disponibles para seleccionar</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded"></div>
              <span>Números reservados temporalmente</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
              <span>Números ya vendidos</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <Badge className="bg-green-100 text-green-800">Disponible</Badge>
      case "reserved":
        return <Badge className="bg-yellow-100 text-yellow-800">Reservado</Badge>
      case "sold":
        return <Badge className="bg-red-100 text-red-800">Vendido</Badge>
      default:
        return <Badge variant="secondary">Desconocido</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Número Seleccionado</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Number Display */}
        <div className="text-center">
          <div className="text-6xl font-bold text-primary mb-2">{selectedNumber.number}</div>
          {getStatusBadge(selectedNumber.status)}
        </div>

        <Separator />

        {/* Details */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex items-center">
              <Hash className="mr-1 h-4 w-4" />
              Número
            </span>
            <span className="font-semibold">{selectedNumber.number}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex items-center">
              <DollarSign className="mr-1 h-4 w-4" />
              Precio
            </span>
            <span className="font-semibold">{raffle.ticket_price} Bs</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex items-center">
              <Calendar className="mr-1 h-4 w-4" />
              Sorteo
            </span>
            <span className="font-semibold">{new Date(raffle.draw_date).toLocaleDateString("es-ES")}</span>
          </div>

          {selectedNumber.reserved_at && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center">
                <Clock className="mr-1 h-4 w-4" />
                Reservado
              </span>
              <span className="font-semibold text-xs">
                {new Date(selectedNumber.reserved_at).toLocaleString("es-ES")}
              </span>
            </div>
          )}
        </div>

        <Separator />

        {/* Action Button */}
        {selectedNumber.status === "available" ? (
          <div className="space-y-3">
            <Button className="w-full" onClick={() => onReserve(selectedNumber.id)}>
              Reservar Número
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Al reservar, tendrás 15 minutos para completar el pago antes de que el número vuelva a estar disponible.
            </p>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {selectedNumber.status === "reserved"
                ? "Este número está reservado temporalmente por otro usuario."
                : "Este número ya ha sido vendido."}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
