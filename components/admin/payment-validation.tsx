"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Check, X, Download, User, Hash, DollarSign, Calendar, CreditCard } from "lucide-react"

interface Payment {
  id: number
  raffle_number_id: number
  number: string
  user_name: string
  user_email: string
  user_phone: string
  payment_method: string
  amount: number
  reference_number: string
  payment_proof: string
  status: "pending" | "validated" | "rejected"
  created_at: string
  raffle_title: string
}

interface PaymentValidationProps {
  payment: Payment
  onClose: () => void
  onValidate: (action: "validate" | "reject", notes?: string) => void
}

export function PaymentValidation({ payment, onClose, onValidate }: PaymentValidationProps) {
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)

  const handleValidate = async (action: "validate" | "reject") => {
    setLoading(true)
    await onValidate(action, notes)
    setLoading(false)
  }

  const getMethodName = (method: string) => {
    switch (method) {
      case "pago_movil":
        return "Pago Móvil"
      case "binance":
        return "Binance"
      case "zelle":
        return "Zelle"
      default:
        return method
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "validated":
        return <Badge className="bg-green-100 text-green-800">Validado</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rechazado</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
      default:
        return <Badge variant="secondary">Desconocido</Badge>
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Validación de Pago - Número {payment.number}
            {getStatusBadge(payment.status)}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Details */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-3">Información del Pago</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center">
                    <Hash className="mr-1 h-4 w-4" />
                    Número
                  </span>
                  <span className="font-semibold text-lg text-primary">{payment.number}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center">
                    <DollarSign className="mr-1 h-4 w-4" />
                    Monto
                  </span>
                  <span className="font-semibold text-lg text-secondary">{payment.amount} Bs</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center">
                    <CreditCard className="mr-1 h-4 w-4" />
                    Método
                  </span>
                  <span className="font-semibold">{getMethodName(payment.payment_method)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Referencia</span>
                  <span className="font-semibold">{payment.reference_number}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center">
                    <Calendar className="mr-1 h-4 w-4" />
                    Fecha
                  </span>
                  <span className="font-semibold">{new Date(payment.created_at).toLocaleString("es-ES")}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* User Details */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Información del Usuario</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center">
                    <User className="mr-1 h-4 w-4" />
                    Nombre
                  </span>
                  <span className="font-semibold">{payment.user_name}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Email</span>
                  <span className="font-semibold">{payment.user_email}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Teléfono</span>
                  <span className="font-semibold">{payment.user_phone || "No proporcionado"}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Rifa</span>
                  <span className="font-semibold">{payment.raffle_title}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Proof */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-3">Comprobante de Pago</h3>
              {payment.payment_proof ? (
                <div className="space-y-3">
                  <div className="border rounded-lg p-4 bg-muted/50">
                    <img
                      src={payment.payment_proof || "/placeholder.svg"}
                      alt="Comprobante de pago"
                      className="w-full h-auto max-h-96 object-contain rounded"
                    />
                  </div>
                  <Button variant="outline" className="w-full bg-transparent">
                    <Download className="mr-2 h-4 w-4" />
                    Descargar Comprobante
                  </Button>
                </div>
              ) : (
                <div className="border rounded-lg p-8 text-center text-muted-foreground">
                  No se proporcionó comprobante de pago
                </div>
              )}
            </div>

            {/* Validation Actions */}
            {payment.status === "pending" && (
              <div className="space-y-4">
                <Separator />
                <div>
                  <Label htmlFor="notes">Notas de Validación (Opcional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Agregar notas sobre la validación..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleValidate("validate")}
                    disabled={loading}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    {loading ? "Validando..." : "Validar Pago"}
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleValidate("reject")}
                    disabled={loading}
                  >
                    <X className="mr-2 h-4 w-4" />
                    {loading ? "Rechazando..." : "Rechazar Pago"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
