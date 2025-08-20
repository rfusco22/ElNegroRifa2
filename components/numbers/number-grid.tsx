"use client"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface RaffleNumber {
  id: number
  number: string
  status: "available" | "reserved" | "sold"
  user_id?: number
}

interface NumberGridProps {
  numbers: RaffleNumber[]
  onNumberSelect: (number: RaffleNumber) => void
  selectedNumber: RaffleNumber | null
}

export function NumberGrid({ numbers, onNumberSelect, selectedNumber }: NumberGridProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 hover:bg-green-200 text-green-800 border-green-300"
      case "reserved":
        return "bg-yellow-100 text-yellow-800 border-yellow-300 cursor-not-allowed"
      case "sold":
        return "bg-red-100 text-red-800 border-red-300 cursor-not-allowed"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "available":
        return "Disponible"
      case "reserved":
        return "Reservado"
      case "sold":
        return "Vendido"
      default:
        return "Desconocido"
    }
  }

  if (numbers.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No se encontraron números con los filtros aplicados.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
          {numbers.map((number) => (
            <button
              key={number.id}
              onClick={() => onNumberSelect(number)}
              disabled={number.status !== "available"}
              className={cn(
                "aspect-square flex flex-col items-center justify-center rounded-lg border-2 transition-all duration-200 text-xs font-semibold",
                getStatusColor(number.status),
                selectedNumber?.id === number.id && "ring-2 ring-primary ring-offset-2",
                number.status === "available" && "hover:scale-105 hover:shadow-md",
              )}
              title={`Número ${number.number} - ${getStatusText(number.status)}`}
            >
              <span className="text-lg font-bold">{number.number}</span>
              <span className="text-[10px] opacity-75">
                {number.status === "available" ? "Libre" : number.status === "reserved" ? "Reserv." : "Vendido"}
              </span>
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-4 justify-center text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
            <span className="text-muted-foreground">Disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
            <span className="text-muted-foreground">Reservado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
            <span className="text-muted-foreground">Vendido</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
