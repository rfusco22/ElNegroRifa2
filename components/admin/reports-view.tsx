"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Download, Search, User, Phone, Mail, CreditCard } from "lucide-react"

interface UserReport {
  id: number
  full_name: string
  email: string
  phone: string
  cedula: string
  numbers_purchased: number
  total_spent: number
  last_purchase: string
  numbers: Array<{
    number: string
    raffle_name: string
    payment_status: string
    purchase_date: string
  }>
}

export function ReportsView() {
  const [users, setUsers] = useState<UserReport[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserReport[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserReports()
  }, [])

  useEffect(() => {
    const filtered = users.filter(
      (user) =>
        user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.cedula.includes(searchTerm),
    )
    setFilteredUsers(filtered)
  }, [searchTerm, users])

  const fetchUserReports = async () => {
    try {
      const response = await fetch("/api/admin/reports/users")
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
        setFilteredUsers(data.users)
      }
    } catch (error) {
      console.error("Error fetching user reports:", error)
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    const csvContent = [
      ["Nombre", "Email", "Teléfono", "Cédula", "Números Comprados", "Total Gastado", "Última Compra"],
      ...filteredUsers.map((user) => [
        user.full_name,
        user.email,
        user.phone,
        user.cedula,
        user.numbers_purchased.toString(),
        user.total_spent.toString(),
        new Date(user.last_purchase).toLocaleDateString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "reporte_usuarios.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "validated":
        return "bg-green-500"
      case "pending":
        return "bg-yellow-500"
      case "rejected":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  if (loading) {
    return <div className="flex justify-center p-8">Cargando reportes...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar por nombre, email o cédula..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      <div className="grid gap-6">
        {filteredUsers.map((user) => (
          <Card key={user.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    {user.full_name}
                  </CardTitle>
                  <CardDescription>
                    {user.numbers_purchased} números comprados • Total: {user.total_spent} Bs
                  </CardDescription>
                </div>
                <Badge variant="secondary">Última compra: {new Date(user.last_purchase).toLocaleDateString()}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{user.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{user.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">C.I: {user.cedula}</span>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Números Comprados:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {user.numbers.map((number, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                      <div>
                        <span className="font-mono font-bold">{number.number}</span>
                        <div className="text-xs text-muted-foreground">{number.raffle_name}</div>
                      </div>
                      <Badge className={getPaymentStatusColor(number.payment_status)}>{number.payment_status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No se encontraron usuarios con los criterios de búsqueda.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
