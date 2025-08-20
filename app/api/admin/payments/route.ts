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

    // Get all payments with user and raffle information
    const payments = await executeQuery(`
      SELECT 
        p.id,
        p.raffle_number_id,
        p.payment_method,
        p.amount,
        p.reference_number,
        p.payment_proof,
        p.status,
        p.created_at,
        rn.number,
        u.full_name as user_name,
        u.email as user_email,
        u.phone as user_phone,
        r.title as raffle_title
      FROM payments p
      JOIN raffle_numbers rn ON p.raffle_number_id = rn.id
      JOIN users u ON p.user_id = u.id
      JOIN raffles r ON rn.raffle_id = r.id
      ORDER BY p.created_at DESC
    `)

    return NextResponse.json(payments)
  } catch (error) {
    console.error("Error fetching payments:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
