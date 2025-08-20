import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { query } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    // Obtener usuarios con sus compras
    const users = await query(`
      SELECT 
        u.id,
        u.full_name,
        u.email,
        u.phone,
        u.cedula,
        COUNT(DISTINCT rn.id) as numbers_purchased,
        COALESCE(SUM(CASE WHEN p.status = 'validated' THEN r.ticket_price ELSE 0 END), 0) as total_spent,
        MAX(p.created_at) as last_purchase
      FROM users u
      LEFT JOIN raffle_numbers rn ON u.id = rn.user_id
      LEFT JOIN raffles r ON rn.raffle_id = r.id
      LEFT JOIN payments p ON rn.id = p.raffle_number_id AND p.status = 'validated'
      WHERE u.role = 'user'
      GROUP BY u.id
      HAVING numbers_purchased > 0
      ORDER BY total_spent DESC, last_purchase DESC
    `)

    // Obtener números detallados para cada usuario
    for (const user of users) {
      const numbers = await query(
        `
        SELECT 
          rn.number,
          r.name as raffle_name,
          COALESCE(p.status, 'pending') as payment_status,
          rn.reserved_at as purchase_date
        FROM raffle_numbers rn
        JOIN raffles r ON rn.raffle_id = r.id
        LEFT JOIN payments p ON rn.id = p.raffle_number_id
        WHERE rn.user_id = ?
        ORDER BY rn.reserved_at DESC
      `,
        [user.id],
      )

      user.numbers = numbers
    }

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Error fetching user reports:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
