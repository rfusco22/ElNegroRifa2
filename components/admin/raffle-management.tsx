"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, Calendar, DollarSign, Trophy, Users } from "lucide-react"

interface Raffle {
  id: number
  name: string
  description: string
  ticket_price: number
  total_numbers: number
  draw_date: string
  status: "active" | "completed" | "cancelled"
  first_prize: number
  second_prize: number
  third_prize: number
  sold_numbers: number
}

export function RaffleManagement() {
  const [raffles, setRaffles] = useState<Raffle[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    ticket_price: "",
    draw_date: "",
    first_prize: "",
    second_prize: "",
    third_prize: "",
  })

  useEffect(() => {
    fetchRaffles()
  }, [])

  const fetchRaffles = async () => {
    try {
      const response = await fetch("/api/admin/raffles")
      if (response.ok) {
        const data = await response.json()
        setRaffles(data.raffles)
      }
    } catch (error) {
      console.error("Error fetching raffles:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRaffle = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/admin/raffles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          ticket_price: Number.parseFloat(formData.ticket_price),
          first_prize: Number.parseFloat(formData.first_prize),
          second_prize: Number.parseFloat(formData.second_prize),
          third_prize: Number.parseFloat(formData.third_prize),
        }),
      })

      if (response.ok) {
        setShowCreateForm(false)
        setFormData({
          name: "",
          description: "",
          ticket_price: "",
          draw_date: "",
          first_prize: "",
          second_prize: "",
          third_prize: "",
        })
        fetchRaffles()
      }
    } catch (error) {
      console.error("Error creating raffle:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "completed":
        return "bg-blue-500"
      case "cancelled":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  if (loading) {
    return <div className="flex justify-center p-8">Cargando rifas...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Rifas Activas</h2>
        <Button onClick={() => setShowCreateForm(true)} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Rifa
        </Button>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Crear Nueva Rifa</CardTitle>
            <CardDescription>Completa la información para crear una nueva rifa</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateRaffle} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nombre de la Rifa</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="ticket_price">Precio del Boleto (Bs)</Label>
                  <Input
                    id="ticket_price"
                    type="number"
                    step="0.01"
                    value={formData.ticket_price}
                    onChange={(e) => setFormData({ ...formData, ticket_price: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="draw_date">Fecha del Sorteo</Label>
                  <Input
                    id="draw_date"
                    type="datetime-local"
                    value={formData.draw_date}
                    onChange={(e) => setFormData({ ...formData, draw_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="first_prize">Primer Premio ($)</Label>
                  <Input
                    id="first_prize"
                    type="number"
                    step="0.01"
                    value={formData.first_prize}
                    onChange={(e) => setFormData({ ...formData, first_prize: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="second_prize">Segundo Premio ($)</Label>
                  <Input
                    id="second_prize"
                    type="number"
                    step="0.01"
                    value={formData.second_prize}
                    onChange={(e) => setFormData({ ...formData, second_prize: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="third_prize">Tercer Premio ($)</Label>
                  <Input
                    id="third_prize"
                    type="number"
                    step="0.01"
                    value={formData.third_prize}
                    onChange={(e) => setFormData({ ...formData, third_prize: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-primary hover:bg-primary/90">
                  Crear Rifa
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6">
        {raffles.map((raffle) => (
          <Card key={raffle.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {raffle.name}
                    <Badge className={getStatusColor(raffle.status)}>{raffle.status}</Badge>
                  </CardTitle>
                  <CardDescription>{raffle.description}</CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">{raffle.ticket_price} Bs</div>
                  <div className="text-sm text-muted-foreground">por boleto</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">Sorteo</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(raffle.draw_date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">1er Premio</div>
                    <div className="text-sm text-muted-foreground">${raffle.first_prize}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">Vendidos</div>
                    <div className="text-sm text-muted-foreground">
                      {raffle.sold_numbers}/{raffle.total_numbers}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">Total Premios</div>
                    <div className="text-sm text-muted-foreground">
                      ${raffle.first_prize + raffle.second_prize + raffle.third_prize}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
