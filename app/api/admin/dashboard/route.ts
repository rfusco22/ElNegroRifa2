import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/database"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token de autorización requerido" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)

    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    // Get dashboard statistics
    const [
      totalUsers,
      totalNumbersSold,
      totalNumbersReserved,
      totalRevenue,
      pendingPayments,
      activeRaffles,
      recentPayments,
      recentRegistrations,
    ] = await Promise.all([
      // Total users
      executeQuery("SELECT COUNT(*) as count FROM users WHERE role = 'user'"),

      // Total numbers sold
      executeQuery("SELECT COUNT(*) as count FROM raffle_numbers WHERE status = 'sold'"),

      // Total numbers reserved
      executeQuery("SELECT COUNT(*) as count FROM raffle_numbers WHERE status = 'reserved'"),

      // Total revenue from validated payments
      executeQuery(`
        SELECT COALESCE(SUM(p.amount), 0) as total 
        FROM payments p 
        WHERE p.status = 'validated'
      `),

      // Pending payments
      executeQuery("SELECT COUNT(*) as count FROM payments WHERE status = 'pending'"),

      // Active raffles
      executeQuery("SELECT COUNT(*) as count FROM raffles WHERE status = 'active'"),

      // Recent payments (last 10)
      executeQuery(`
        SELECT 
          p.id,
          p.amount,
          p.status,
          p.created_at,
          rn.number,
          u.full_name as user_name
        FROM payments p
        JOIN raffle_numbers rn ON p.raffle_number_id = rn.id
        JOIN users u ON p.user_id = u.id
        ORDER BY p.created_at DESC
        LIMIT 10
      `),

      // Recent registrations (last 10)
      executeQuery(`
        SELECT id, full_name, email, role, created_at
        FROM users
        ORDER BY created_at DESC
        LIMIT 10
      `),
    ])

    const stats = {
      total_users: (totalUsers as any[])[0].count,
      total_numbers_sold: (totalNumbersSold as any[])[0].count,
      total_numbers_reserved: (totalNumbersReserved as any[])[0].count,
      total_revenue: (totalRevenue as any[])[0].total,
      pending_payments: (pendingPayments as any[])[0].count,
      active_raffles: (activeRaffles as any[])[0].count,
      recent_payments: recentPayments,
      recent_registrations: recentRegistrations,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
