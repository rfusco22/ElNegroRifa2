import { AdminLayout } from "@/components/admin/admin-layout"
import { ReportsView } from "@/components/admin/reports-view"

export default function AdminReportsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reportes</h1>
          <p className="text-muted-foreground">Información detallada de ventas y usuarios</p>
        </div>
        <ReportsView />
      </div>
    </AdminLayout>
  )
}
