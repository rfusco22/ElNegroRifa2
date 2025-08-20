"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Loader2, Users, Hash, DollarSign, Clock, Search, UserPlus, CheckCircle, XCircle, Eye } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface UserWithNumbers {
  id: number
  full_name: string
  email: string
  phone: string
  cedula: string
  created_at: string
  numbers: {
    id: number
    number: string
    status: string
    reserved_at: string
    payment_status: string
    payment_method: string
    payment_amount: number
    payment_reference: string
    payment_proof: string
  }[]
}

interface DashboardStats {
  total_users: number
  total_numbers_sold: number
  total_numbers_reserved: number
  total_revenue: number
  pending_payments: number
  active_raffles: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [users, setUsers] = useState<UserWithNumbers[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedUser, setSelectedUser] = useState<UserWithNumbers | null>(null)
  const [reserveDialogOpen, setReserveDialogOpen] = useState(false)
  const [reserveForm, setReserveForm] = useState({
    user_id: "",
    number: "",
    raffle_id: "1",
  })
  const { user } = useAuth()

  useEffect(() => {
    if (user?.role === "admin") {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, usersResponse] = await Promise.all([
        fetch("/api/admin/dashboard", {
          headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
        }),
        fetch("/api/admin/users-with-numbers", {
          headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
        }),
      ])

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        setUsers(usersData)
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleValidatePayment = async (numberId: number, action: "validate" | "reject") => {
    try {
      const response = await fetch(`/api/admin/payments/${numberId}/${action}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
      })

      if (response.ok) {
        toast({
          title: action === "validate" ? "Pago validado" : "Pago rechazado",
          description: `El pago ha sido ${action === "validate" ? "validado" : "rechazado"} exitosamente.`,
        })
        fetchDashboardData()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al procesar la validación del pago.",
        variant: "destructive",
      })
    }
  }

  const handleReserveNumber = async () => {
    try {
      const response = await fetch("/api/admin/reserve-number", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify(reserveForm),
      })

      if (response.ok) {
        toast({
          title: "Número reservado",
          description: "El número ha sido reservado exitosamente para el usuario.",
        })
        setReserveDialogOpen(false)
        setReserveForm({ user_id: "", number: "", raffle_id: "1" })
        fetchDashboardData()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.message || "Error al reservar el número.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al reservar el número.",
        variant: "destructive",
      })
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.cedula.includes(searchTerm)

    if (statusFilter === "all") return matchesSearch

    const hasStatus = user.numbers.some((number) => {
      if (statusFilter === "pending") return number.payment_status === "pending"
      if (statusFilter === "validated") return number.payment_status === "validated"
      if (statusFilter === "reserved") return number.status === "reserved"
      return false
    })

    return matchesSearch && hasStatus
  })

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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Panel de Administración</h1>
            <p className="text-muted-foreground">Gestión completa de usuarios y números</p>
          </div>

          <Dialog open={reserveDialogOpen} onOpenChange={setReserveDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <UserPlus className="h-4 w-4 mr-2" />
                Reservar Número
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reservar Número para Usuario</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="user_select">Usuario</Label>
                  <Select
                    value={reserveForm.user_id}
                    onValueChange={(value) => setReserveForm({ ...reserveForm, user_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar usuario" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.full_name} - {user.cedula}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="number">Número (000-999)</Label>
                  <Input
                    id="number"
                    value={reserveForm.number}
                    onChange={(e) => setReserveForm({ ...reserveForm, number: e.target.value })}
                    placeholder="Ej: 123"
                    maxLength={3}
                  />
                </div>
                <Button onClick={handleReserveNumber} className="w-full">
                  Reservar Número
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usuarios</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{stats.total_users}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Vendidos</CardTitle>
                <Hash className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.total_numbers_sold}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-secondary">{stats.total_revenue} Bs</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.pending_payments}</div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por nombre, email o cédula..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="pending">Pagos pendientes</SelectItem>
              <SelectItem value="validated">Pagos validados</SelectItem>
              <SelectItem value="reserved">Solo reservados</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Usuarios y sus Números</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div key={user.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{user.full_name}</h3>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <p className="text-sm text-muted-foreground">
                        Cédula: {user.cedula} | Teléfono: {user.phone}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Registrado: {new Date(user.created_at).toLocaleDateString("es-ES")}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setSelectedUser(user)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalles
                    </Button>
                  </div>

                  {user.numbers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {user.numbers.map((number) => (
                        <div key={number.id} className="bg-muted/50 rounded-lg p-3">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-lg">#{number.number}</span>
                            <Badge
                              variant={
                                number.payment_status === "validated"
                                  ? "default"
                                  : number.payment_status === "rejected"
                                    ? "destructive"
                                    : number.status === "reserved"
                                      ? "secondary"
                                      : "outline"
                              }
                            >
                              {number.payment_status === "validated"
                                ? "Pagado"
                                : number.payment_status === "rejected"
                                  ? "Rechazado"
                                  : number.payment_status === "pending"
                                    ? "Pendiente"
                                    : "Reservado"}
                            </Badge>
                          </div>

                          {number.payment_method && (
                            <div className="text-sm space-y-1">
                              <p>
                                <strong>Método:</strong> {number.payment_method}
                              </p>
                              <p>
                                <strong>Monto:</strong> {number.payment_amount} Bs
                              </p>
                              {number.payment_reference && (
                                <p>
                                  <strong>Referencia:</strong> {number.payment_reference}
                                </p>
                              )}
                            </div>
                          )}

                          {number.payment_status === "pending" && (
                            <div className="flex gap-2 mt-3">
                              <Button
                                size="sm"
                                onClick={() => handleValidatePayment(number.id, "validate")}
                                className="flex-1"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Validar
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleValidatePayment(number.id, "reject")}
                                className="flex-1"
                              >
                                <XCircle className="h-3 w-3 mr-1" />
                                Rechazar
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">No tiene números reservados o comprados</p>
                  )}
                </div>
              ))}

              {filteredUsers.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No se encontraron usuarios que coincidan con los filtros
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
