import { AdminLayout } from "@/components/admin/admin-layout"
import { RaffleManagement } from "@/components/admin/raffle-management"

export default function AdminRafflesPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestión de Rifas</h1>
          <p className="text-muted-foreground">Crea y administra las rifas del sistema</p>
        </div>
        <RaffleManagement />
      </div>
    </AdminLayout>
  )
}
