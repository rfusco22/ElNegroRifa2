"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { PaymentValidation } from "@/components/admin/payment-validation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Search, Filter, Eye, Check, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [methodFilter, setMethodFilter] = useState("all")

  const { toast } = useToast()

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      const response = await fetch("/api/admin/payments", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setPayments(data)
      }
    } catch (error) {
      console.error("Error fetching payments:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleValidatePayment = async (paymentId: number, action: "validate" | "reject", notes?: string) => {
    try {
      const response = await fetch(`/api/admin/payments/${paymentId}/${action}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({ notes }),
      })

      if (response.ok) {
        toast({
          title: action === "validate" ? "Pago validado" : "Pago rechazado",
          description: `El pago ha sido ${action === "validate" ? "validado" : "rechazado"} exitosamente`,
        })
        fetchPayments()
        setSelectedPayment(null)
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Ocurrió un error inesperado",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error validating payment:", error)
      toast({
        title: "Error de conexión",
        description: "No se pudo procesar la validación",
        variant: "destructive",
      })
    }
  }

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.number.includes(searchTerm) ||
      payment.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.reference_number.includes(searchTerm)
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter
    const matchesMethod = methodFilter === "all" || payment.payment_method === methodFilter
    return matchesSearch && matchesStatus && matchesMethod
  })

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

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Validación de Pagos</h1>
          <p className="text-muted-foreground">Revisa y valida los comprobantes de pago enviados por los usuarios</p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por número, usuario o referencia..."
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
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="pending">Pendientes</SelectItem>
                    <SelectItem value="validated">Validados</SelectItem>
                    <SelectItem value="rejected">Rechazados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:w-48">
                <Select value={methodFilter} onValueChange={setMethodFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Método" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="pago_movil">Pago Móvil</SelectItem>
                    <SelectItem value="binance">Binance</SelectItem>
                    <SelectItem value="zelle">Zelle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payments List */}
        <div className="grid grid-cols-1 gap-4">
          {filteredPayments.length > 0 ? (
            filteredPayments.map((payment) => (
              <Card key={payment.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">Número {payment.number}</h3>
                        {getStatusBadge(payment.status)}
                        <Badge variant="outline">{getMethodName(payment.payment_method)}</Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <p>
                          <strong>Usuario:</strong> {payment.user_name}
                        </p>
                        <p>
                          <strong>Email:</strong> {payment.user_email}
                        </p>
                        <p>
                          <strong>Teléfono:</strong> {payment.user_phone || "No proporcionado"}
                        </p>
                        <p>
                          <strong>Referencia:</strong> {payment.reference_number}
                        </p>
                        <p>
                          <strong>Monto:</strong> {payment.amount} Bs
                        </p>
                        <p>
                          <strong>Fecha:</strong> {new Date(payment.created_at).toLocaleString("es-ES")}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" size="sm" onClick={() => setSelectedPayment(payment)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver Detalles
                      </Button>
                      {payment.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleValidatePayment(payment.id, "validate")}
                          >
                            <Check className="mr-2 h-4 w-4" />
                            Validar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleValidatePayment(payment.id, "reject")}
                          >
                            <X className="mr-2 h-4 w-4" />
                            Rechazar
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No se encontraron pagos con los filtros aplicados.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Payment Validation Modal */}
      {selectedPayment && (
        <PaymentValidation
          payment={selectedPayment}
          onClose={() => setSelectedPayment(null)}
          onValidate={(action, notes) => handleValidatePayment(selectedPayment.id, action, notes)}
        />
      )}
    </AdminLayout>
  )
}
