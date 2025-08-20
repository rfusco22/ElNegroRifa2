"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Upload, Check, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PaymentMethod {
  id: number
  method_name: string
  account_info: any
  is_active: boolean
}

interface NumberDetails {
  id: number
  number: string
  ticket_price: number
  raffle_title: string
}

interface PaymentFormProps {
  paymentMethod: PaymentMethod
  numberDetails: NumberDetails
  onBack: () => void
  onPaymentSubmitted: () => void
}

export function PaymentForm({ paymentMethod, numberDetails, onBack, onPaymentSubmitted }: PaymentFormProps) {
  const [formData, setFormData] = useState({
    reference_number: "",
    amount: numberDetails.ticket_price.toString(),
    notes: "",
  })
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const { toast } = useToast()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"]
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Archivo no válido",
          description: "Solo se permiten imágenes (JPG, PNG, WebP) o archivos PDF",
          variant: "destructive",
        })
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Archivo muy grande",
          description: "El archivo debe ser menor a 5MB",
          variant: "destructive",
        })
        return
      }

      setProofFile(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Create FormData for file upload
      const submitData = new FormData()
      submitData.append("raffle_number_id", numberDetails.id.toString())
      submitData.append("payment_method", paymentMethod.method_name)
      submitData.append("amount", formData.amount)
      submitData.append("reference_number", formData.reference_number)
      submitData.append("notes", formData.notes)

      if (proofFile) {
        submitData.append("payment_proof", proofFile)
      }

      const response = await fetch("/api/payments/submit", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: submitData,
      })

      if (response.ok) {
        setSubmitted(true)
        toast({
          title: "Pago enviado",
          description: "Tu comprobante de pago ha sido enviado para validación",
        })

        // Redirect after a delay
        setTimeout(() => {
          onPaymentSubmitted()
        }, 2000)
      } else {
        const error = await response.json()
        toast({
          title: "Error al enviar pago",
          description: error.error || "Ocurrió un error inesperado",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error submitting payment:", error)
      toast({
        title: "Error de conexión",
        description: "No se pudo enviar el comprobante de pago",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getMethodName = (methodName: string) => {
    switch (methodName) {
      case "pago_movil":
        return "Pago Móvil"
      case "binance":
        return "Binance"
      case "zelle":
        return "Zelle"
      default:
        return methodName
    }
  }

  if (submitted) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">¡Pago Enviado!</h3>
          <p className="text-muted-foreground mb-4">
            Tu comprobante de pago ha sido enviado correctamente. Un administrador validará tu pago en breve.
          </p>
          <Badge className="bg-yellow-100 text-yellow-800">Pendiente de Validación</Badge>
        </CardContent>
      </Card>
    )
  }

  return (
    <div>
      <Button variant="ghost" className="mb-6" onClick={onBack}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Cambiar Método de Pago
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Payment Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Instrucciones de Pago - {getMethodName(paymentMethod.method_name)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Datos para la transferencia:</h4>
              {paymentMethod.method_name === "pago_movil" && (
                <div className="space-y-1 text-sm">
                  <p>
                    <strong>Banco:</strong> {paymentMethod.account_info.bank}
                  </p>
                  <p>
                    <strong>Teléfono:</strong> {paymentMethod.account_info.phone}
                  </p>
                  <p>
                    <strong>Cédula:</strong> {paymentMethod.account_info.cedula}
                  </p>
                  <p>
                    <strong>Nombre:</strong> {paymentMethod.account_info.name}
                  </p>
                </div>
              )}
              {paymentMethod.method_name === "binance" && (
                <div className="space-y-1 text-sm">
                  <p>
                    <strong>Email:</strong> {paymentMethod.account_info.email}
                  </p>
                  <p>
                    <strong>User ID:</strong> {paymentMethod.account_info.user_id}
                  </p>
                </div>
              )}
              {paymentMethod.method_name === "zelle" && (
                <div className="space-y-1 text-sm">
                  <p>
                    <strong>Email:</strong> {paymentMethod.account_info.email}
                  </p>
                  <p>
                    <strong>Nombre:</strong> {paymentMethod.account_info.name}
                  </p>
                </div>
              )}
            </div>

            <div className="bg-primary/10 p-4 rounded-lg">
              <h4 className="font-semibold text-primary mb-2">Monto a pagar:</h4>
              <p className="text-2xl font-bold text-primary">{numberDetails.ticket_price} Bs</p>
              <p className="text-sm text-muted-foreground">Número: {numberDetails.number}</p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-semibold mb-1">Importante:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Realiza la transferencia por el monto exacto</li>
                    <li>Guarda el comprobante de la transferencia</li>
                    <li>Sube una foto clara del comprobante</li>
                    <li>Tu número será confirmado una vez validado el pago</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Form */}
        <Card>
          <CardHeader>
            <CardTitle>Enviar Comprobante de Pago</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="reference_number">Número de Referencia *</Label>
                <Input
                  id="reference_number"
                  name="reference_number"
                  type="text"
                  placeholder="Ej: 123456789"
                  value={formData.reference_number}
                  onChange={handleInputChange}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Número de referencia de la transferencia o transacción
                </p>
              </div>

              <div>
                <Label htmlFor="amount">Monto Pagado (Bs) *</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="payment_proof">Comprobante de Pago *</Label>
                <Input id="payment_proof" type="file" accept="image/*,.pdf" onChange={handleFileChange} required />
                <p className="text-xs text-muted-foreground mt-1">
                  Sube una imagen clara del comprobante (JPG, PNG, WebP o PDF, máx. 5MB)
                </p>
                {proofFile && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded flex items-center gap-2">
                    <Upload className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-800">{proofFile.name}</span>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="notes">Notas Adicionales (Opcional)</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Cualquier información adicional sobre el pago..."
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Enviando..." : "Enviar Comprobante"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
