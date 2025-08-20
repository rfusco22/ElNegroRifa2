import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/database"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token de autorización requerido" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)

    if (!decoded) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    // Get user's numbers with raffle information
    const userNumbers = await executeQuery(
      `SELECT 
        rn.id,
        rn.number,
        rn.status,
        rn.reserved_at,
        rn.sold_at,
        r.title as raffle_title,
        r.draw_date as raffle_draw_date,
        r.ticket_price,
        p.status as payment_status
      FROM raffle_numbers rn
      JOIN raffles r ON rn.raffle_id = r.id
      LEFT JOIN payments p ON rn.id = p.raffle_number_id
      WHERE rn.user_id = ?
      ORDER BY rn.reserved_at DESC, rn.sold_at DESC`,
      [decoded.id],
    )

    return NextResponse.json(userNumbers)
  } catch (error) {
    console.error("Error fetching user numbers:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
