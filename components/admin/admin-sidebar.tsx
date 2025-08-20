"use client"

import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { LayoutDashboard, CreditCard, Ticket, BarChart3, Users, DollarSign } from "lucide-react"

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Validar Pagos",
    href: "/admin/payments",
    icon: CreditCard,
  },
  {
    title: "Gestionar Rifas",
    href: "/admin/raffles",
    icon: Ticket,
  },
  {
    title: "Reportes",
    href: "/admin/reports",
    icon: BarChart3,
  },
  {
    title: "Usuarios",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Métodos de Pago",
    href: "/admin/payment-methods",
    icon: DollarSign,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 min-h-screen p-4">
      <Card className="p-4">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-primary mb-2">Panel Admin</h2>
          <p className="text-sm text-muted-foreground">Gestión del sistema</p>
        </div>

        <nav className="space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Button
                key={item.href}
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  isActive && "bg-primary text-primary-foreground",
                  !isActive && "hover:bg-muted",
                )}
                onClick={() => (window.location.href = item.href)}
              >
                <Icon className="mr-2 h-4 w-4" />
                {item.title}
              </Button>
            )
          })}
        </nav>
      </Card>
    </div>
  )
}
