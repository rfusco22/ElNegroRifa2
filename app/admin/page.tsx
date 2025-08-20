"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Users, Hash, DollarSign, Clock, TrendingUp, AlertCircle } from "lucide-react"

interface DashboardStats {
  total_users: number
  total_numbers_sold: number
  total_numbers_reserved: number
  total_revenue: number
  pending_payments: number
  active_raffles: number
  recent_payments: any[]
  recent_registrations: any[]
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (user?.role === "admin") {
      fetchDashboardStats()
    }
  }, [user])

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch("/api/admin/dashboard", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
    } finally {
      setLoading(false)
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

  if (!stats) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Error al cargar las estadísticas del dashboard</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard Administrativo</h1>
          <p className="text-muted-foreground">Resumen general del sistema de rifas</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuarios Registrados</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.total_users}</div>
              <p className="text-xs text-muted-foreground">Total de usuarios en el sistema</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Números Vendidos</CardTitle>
              <Hash className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.total_numbers_sold}</div>
              <p className="text-xs text-muted-foreground">Números confirmados y pagados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">{stats.total_revenue} Bs</div>
              <p className="text-xs text-muted-foreground">Ingresos de números vendidos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pagos Pendientes</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending_payments}</div>
              <p className="text-xs text-muted-foreground">Requieren validación</p>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Números Reservados</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.total_numbers_reserved}</div>
              <p className="text-xs text-muted-foreground">Reservados temporalmente</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rifas Activas</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.active_raffles}</div>
              <p className="text-xs text-muted-foreground">Rifas disponibles para participar</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Payments */}
          <Card>
            <CardHeader>
              <CardTitle>Pagos Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recent_payments.length > 0 ? (
                  stats.recent_payments.map((payment: any) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-semibold">Número {payment.number}</p>
                        <p className="text-sm text-muted-foreground">{payment.user_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(payment.created_at).toLocaleString("es-ES")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{payment.amount} Bs</p>
                        <Badge
                          variant={
                            payment.status === "validated"
                              ? "default"
                              : payment.status === "rejected"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {payment.status === "validated"
                            ? "Validado"
                            : payment.status === "rejected"
                              ? "Rechazado"
                              : "Pendiente"}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">No hay pagos recientes</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Registrations */}
          <Card>
            <CardHeader>
              <CardTitle>Registros Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recent_registrations.length > 0 ? (
                  stats.recent_registrations.map((user: any) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-semibold">{user.full_name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(user.created_at).toLocaleString("es-ES")}
                        </p>
                      </div>
                      <Badge variant="outline">{user.role === "admin" ? "Admin" : "Usuario"}</Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">No hay registros recientes</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
