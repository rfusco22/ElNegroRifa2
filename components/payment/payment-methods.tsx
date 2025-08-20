"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PaymentForm } from "./payment-form"
import { Smartphone, Bitcoin, DollarSign, Banknote } from "lucide-react"

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

interface PaymentMethodsProps {
  paymentMethods: PaymentMethod[]
  numberDetails: NumberDetails
  onPaymentSubmitted: () => void
}

export function PaymentMethods({ paymentMethods, numberDetails, onPaymentSubmitted }: PaymentMethodsProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null)

  const getMethodIcon = (methodName: string) => {
    switch (methodName) {
      case "pago_movil":
        return <Smartphone className="h-6 w-6" />
      case "binance":
        return <Bitcoin className="h-6 w-6" />
      case "zelle":
        return <DollarSign className="h-6 w-6" />
      case "efectivo":
        return <Banknote className="h-6 w-6" />
      default:
        return <DollarSign className="h-6 w-6" />
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
      case "efectivo":
        return "Efectivo (Presencial)"
      default:
        return methodName
    }
  }

  const getMethodColor = (methodName: string) => {
    switch (methodName) {
      case "pago_movil":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "binance":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "zelle":
        return "bg-purple-100 text-purple-800 border-purple-300"
      case "efectivo":
        return "bg-green-100 text-green-800 border-green-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  if (selectedMethod) {
    return (
      <PaymentForm
        paymentMethod={selectedMethod}
        numberDetails={numberDetails}
        onBack={() => setSelectedMethod(null)}
        onPaymentSubmitted={onPaymentSubmitted}
      />
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-6">Selecciona tu Método de Pago</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {paymentMethods.map((method) => (
          <Card
            key={method.id}
            className="cursor-pointer hover:shadow-lg transition-shadow duration-300 border-2 hover:border-primary/50"
            onClick={() => setSelectedMethod(method)}
          >
            <CardHeader className="text-center">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${getMethodColor(method.method_name)}`}
              >
                {getMethodIcon(method.method_name)}
              </div>
              <CardTitle className="text-xl">{getMethodName(method.method_name)}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-2 mb-4">
                {method.method_name === "pago_movil" && (
                  <>
                    <p className="text-sm text-muted-foreground">
                      <strong>Banco:</strong> {method.account_info.bank}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <strong>Teléfono:</strong> {method.account_info.phone}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <strong>Cédula:</strong> {method.account_info.cedula}
                    </p>
                  </>
                )}
                {method.method_name === "binance" && (
                  <>
                    <p className="text-sm text-muted-foreground">
                      <strong>User ID:</strong> {method.account_info.user_id}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <strong>Email:</strong> {method.account_info.email}
                    </p>
                  </>
                )}
                {method.method_name === "zelle" && (
                  <>
                    <p className="text-sm text-muted-foreground">
                      <strong>Email:</strong> {method.account_info.email}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <strong>Nombre:</strong> {method.account_info.name}
                    </p>
                  </>
                )}
                {method.method_name === "efectivo" && (
                  <>
                    <p className="text-sm text-muted-foreground">
                      <strong>WhatsApp:</strong> {method.account_info.whatsapp}
                    </p>
                    <p className="text-xs text-muted-foreground">Contactar para coordinar encuentro</p>
                  </>
                )}
              </div>
              <Badge className="bg-green-100 text-green-800">Disponible</Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {paymentMethods.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No hay métodos de pago disponibles en este momento.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
